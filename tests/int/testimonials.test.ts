import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { handleTestimonialSubmission } from '@/features/testimonials/handle'
import { createEditor, ctx, resetDb, testPayload } from './helpers'

let payload: Payload

beforeAll(async () => {
  payload = await testPayload()
})
beforeEach(async () => {
  await resetDb(payload)
  await payload.updateGlobal({ slug: 'site-settings', context: ctx, data: { acceptTestimonials: true } })
})

const body = {
  name: 'Ion Test',
  role: 'Jucător amator',
  quote: 'Antrenamentele m-au ajutat să joc mai liniștit la meciuri.',
  email: 'ion@example.com',
  consent: true,
  locale: 'ro',
}

function request(data: unknown, ip = '203.0.113.50', headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, origin: 'http://localhost:3000', ...headers },
    body: typeof data === 'string' ? data : JSON.stringify(data),
  })
}

async function publicList() {
  // Acces public (fără utilizator), ca API-ul REST.
  return payload.find({ collection: 'testimonials', overrideAccess: false, depth: 0 })
}

describe('POST /api/feedback', () => {
  it('salvează părerea „în așteptare”, cu acordul și textul lui, fără să o publice', async () => {
    const res = await handleTestimonialSubmission(payload, request(body))
    expect(res.status).toBe(201)
    const saved = await payload.find({ collection: 'testimonials', overrideAccess: true })
    expect(saved.docs[0]).toMatchObject({ name: 'Ion Test', status: 'pending', consent: true, language: 'ro' })
    expect(saved.docs[0]!.consentText).toMatch(/Sunt de acord/)
    expect((await publicList()).totalDocs).toBe(0)
  })

  it('fără acord de publicare: respinsă, nesalvată', async () => {
    const res = await handleTestimonialSubmission(payload, request({ ...body, consent: false }))
    expect(res).toMatchObject({ status: 400, body: { error: 'validation', fields: ['consent'] } })
    expect((await payload.count({ collection: 'testimonials', overrideAccess: true })).totalDocs).toBe(0)
  })

  it('validare, honeypot, origine străină', async () => {
    expect((await handleTestimonialSubmission(payload, request({ ...body, quote: 'scurt' }))).body).toMatchObject({ fields: ['quote'] })
    expect((await handleTestimonialSubmission(payload, request({ ...body, website: 'spam' }))).status).toBe(400)
    expect((await handleTestimonialSubmission(payload, request(body, undefined, { origin: 'https://evil.example' }))).status).toBe(403)
    expect((await payload.count({ collection: 'testimonials', overrideAccess: true })).totalDocs).toBe(0)
  })

  it('limitează la 2 păreri pe oră de la același IP și nu salvează IP-ul brut', async () => {
    for (const _ of [1, 2]) expect((await handleTestimonialSubmission(payload, request(body, '198.51.100.7'))).status).toBe(201)
    expect((await handleTestimonialSubmission(payload, request(body, '198.51.100.7'))).status).toBe(429)
    expect((await handleTestimonialSubmission(payload, request(body, '198.51.100.8'))).status).toBe(201)
    const db = payload.db as unknown as { drizzle: { execute: (q: string) => Promise<{ rows: Record<string, unknown>[] }> } }
    const { rows } = await db.drizzle.execute('SELECT * FROM testimonials')
    expect(JSON.stringify(rows)).not.toContain('198.51.100.7')
  })

  it('formularul închis din Setări site: 404, nesalvată', async () => {
    await payload.updateGlobal({ slug: 'site-settings', context: ctx, data: { acceptTestimonials: false } })
    expect((await handleTestimonialSubmission(payload, request(body))).status).toBe(404)
    expect((await payload.count({ collection: 'testimonials', overrideAccess: true })).totalDocs).toBe(0)
  })
})

describe('moderare și acces public', () => {
  it('după aprobare apare public, fără email, cu data aprobării; respinsă dispare din nou', async () => {
    await handleTestimonialSubmission(payload, request(body))
    const doc = (await payload.find({ collection: 'testimonials', overrideAccess: true })).docs[0]!
    const editor = await createEditor(payload)
    const approved = await payload.update({ collection: 'testimonials', id: doc.id, user: editor, overrideAccess: false, context: ctx, data: { status: 'approved' } })
    expect(approved.approvedAt).toBeTruthy()

    const pub = await publicList()
    expect(pub.totalDocs).toBe(1)
    expect(pub.docs[0]).toMatchObject({ name: 'Ion Test', quote: body.quote })
    expect(pub.docs[0]).not.toHaveProperty('email')
    expect(pub.docs[0]).not.toHaveProperty('ipHash')
    expect(pub.docs[0]).not.toHaveProperty('consentText')

    await payload.update({ collection: 'testimonials', id: doc.id, user: editor, overrideAccess: false, context: ctx, data: { status: 'rejected' } })
    expect((await publicList()).totalDocs).toBe(0)
  })

  it('publicul nu poate crea păreri direct prin API (ocolind formularul)', async () => {
    await expect(
      payload.create({ collection: 'testimonials', overrideAccess: false, data: { ...body, status: 'approved', consent: true } as never }),
    ).rejects.toThrow()
  })
})

describe('păstrare limitată (politica de confidențialitate)', () => {
  it('șterge solicitările și părerile neaprobate vechi; păstrează părerile aprobate și datele recente', async () => {
    const { applyRetention, monthsAgo } = await import('@/features/legal/retention')
    const db = payload.db as unknown as { drizzle: { execute: (q: string) => Promise<unknown> } }
    const mk = (status: 'pending' | 'approved' | 'rejected', name: string) =>
      payload.create({ collection: 'testimonials', overrideAccess: true, context: ctx, data: { name, quote: 'Text suficient de lung pentru test.', consent: true, status } })
    const oldPending = await mk('pending', 'Vechi asteptare')
    const oldApproved = await mk('approved', 'Vechi aprobat')
    const freshPending = await mk('pending', 'Nou asteptare')
    const oldContact = await payload.create({
      collection: 'contact-requests',
      overrideAccess: true,
      data: { name: 'Vechi', email: 'vechi@example.com', requestType: 'other', message: 'Mesaj vechi de test.', status: 'new' },
    })
    const old = monthsAgo(13).toISOString()
    await db.drizzle.execute(`UPDATE testimonials SET updated_at = '${old}' WHERE id IN (${oldPending.id}, ${oldApproved.id})`)
    await db.drizzle.execute(`UPDATE contact_requests SET updated_at = '${old}' WHERE id = ${oldContact.id}`)

    const result = await applyRetention(payload)
    expect(result).toMatchObject({ contactRequests: 1, testimonials: 1 })
    const left = (await payload.find({ collection: 'testimonials', overrideAccess: true })).docs.map((d) => d.id).sort()
    expect(left).toEqual([oldApproved.id, freshPending.id].sort())
  })
})
