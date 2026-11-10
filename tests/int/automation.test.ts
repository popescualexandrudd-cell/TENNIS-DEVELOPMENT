import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { runAutomations } from '@/features/automation/tasks'
import { handleContactRequest } from '@/features/contact/handle'
import { articleData, ctx, resetDb, testPayload } from './helpers'

let payload: Payload
const env = { ...process.env }

beforeAll(async () => {
  payload = await testPayload()
})
beforeEach(async () => {
  await resetDb(payload)
  await payload.updateGlobal({ slug: 'site-settings', context: ctx, data: { automation: { lastDailyRunOn: null, lastDigestOn: null, autoReply: true, reminders: true, reminderHours: 48 } } })
  process.env.SMTP_HOST = 'smtp.test.invalid'
  process.env.CONTACT_NOTIFY_TO = 'daniel@example.test'
})
afterEach(() => {
  vi.restoreAllMocks()
  process.env = { ...env }
})

const db = () => payload.db as unknown as { drizzle: { execute: (q: string) => Promise<unknown> } }

describe('publicare programată', () => {
  it('publică draftul cu data trecută; nu atinge viitorul sau arhivatul', async () => {
    const past = new Date(Date.now() - 60_000).toISOString()
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const due = await payload.create({ collection: 'articles', overrideAccess: true, context: ctx, data: { ...articleData({ title: 'Programat' }), scheduledAt: past, _status: 'draft' } })
    const later = await payload.create({ collection: 'articles', overrideAccess: true, context: ctx, data: { ...articleData({ title: 'Mai târziu' }), scheduledAt: future, _status: 'draft' } })
    const archived = await payload.create({ collection: 'articles', overrideAccess: true, context: ctx, data: { ...articleData({ title: 'Arhivat', workflow: 'archived' }), scheduledAt: past, _status: 'draft' } })
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined as never)

    const result = await runAutomations(payload)
    expect(result.published).toBe(1)
    const get = (id: number | string) => payload.findByID({ collection: 'articles', id, overrideAccess: true })
    expect(await get(due.id)).toMatchObject({ _status: 'published', scheduledAt: null })
    expect((await get(due.id)).publishedAt).toBeTruthy()
    expect((await get(later.id))._status).toBe('draft')
    expect((await get(archived.id))._status).toBe('draft')
  })
})

describe('reminder și rulare zilnică', () => {
  it('trimite un singur reminder pentru solicitările vechi fără răspuns; sarcinile zilnice rulează o dată pe zi', async () => {
    const send = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined as never)
    const old = await payload.create({
      collection: 'contact-requests',
      overrideAccess: true,
      data: { name: 'Vechi Fără Răspuns', email: 'v@example.com', requestType: 'coaching', message: 'Mesaj de test vechi.', status: 'new' },
    })
    await payload.create({ collection: 'contact-requests', overrideAccess: true, data: { name: 'Nou', email: 'n@example.com', requestType: 'coaching', message: 'Mesaj de test nou.', status: 'new' } })
    await db().drizzle.execute(`UPDATE contact_requests SET created_at = now() - interval '3 days' WHERE id = ${old.id}`)

    const first = await runAutomations(payload)
    expect(first).toMatchObject({ daily: true, reminders: 1 })
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'daniel@example.test', subject: expect.stringMatching(/1 solicitări fără răspuns/) }))
    expect((await payload.findByID({ collection: 'contact-requests', id: old.id, overrideAccess: true })).reminderSentAt).toBeTruthy()

    const second = await runAutomations(payload)
    expect(second.daily).toBe(false)
    const forced = await runAutomations(payload, new Date(), { forceDaily: true })
    expect(forced.reminders).toBe(0) // deja anunțată
  })

  it('fără SMTP nu trimite nimic și nu marchează reminderul', async () => {
    delete process.env.SMTP_HOST
    const send = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined as never)
    const old = await payload.create({ collection: 'contact-requests', overrideAccess: true, data: { name: 'X', email: 'x@example.com', requestType: 'other', message: 'Mesaj de test vechi.', status: 'new' } })
    await db().drizzle.execute(`UPDATE contact_requests SET created_at = now() - interval '3 days' WHERE id = ${old.id}`)
    expect((await runAutomations(payload)).reminders).toBe(0)
    expect(send).not.toHaveBeenCalled()
  })
})

describe('confirmare automată', () => {
  it('după un mesaj de contact: notificare pentru Daniel + confirmare pentru vizitator', async () => {
    const send = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined as never)
    const req = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000', 'x-forwarded-for': '203.0.113.90' },
      body: JSON.stringify({ name: 'Ana Pop', email: 'ana@example.com', requestType: 'coaching', message: 'Aș vrea să încep antrenamentele.', locale: 'ro' }),
    })
    const res = await handleContactRequest(payload, req)
    expect(res.status).toBe(201)
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'ana@example.com', subject: 'Am primit mesajul tău' }))
    const saved = (await payload.find({ collection: 'contact-requests', overrideAccess: true })).docs[0]!
    expect(saved.autoReply).toBe('sent')
  })
})

describe('POST /api/cron', () => {
  it('oprit fără secret, 401 cu secret greșit, rulează cu secretul corect', async () => {
    const { POST } = await import('@/app/api/cron/route')
    vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined as never)
    const call = (auth?: string) => POST(new Request('http://localhost:3000/api/cron', { method: 'POST', headers: auth ? { authorization: auth } : {} }))
    delete process.env.CRON_SECRET
    expect((await call('Bearer x')).status).toBe(404)
    process.env.CRON_SECRET = 'a'.repeat(32)
    expect((await call('Bearer gresit')).status).toBe(401)
    expect((await call()).status).toBe(401)
    const ok = await call(`Bearer ${'a'.repeat(32)}`)
    expect(ok.status).toBe(200)
    expect(await ok.json()).toMatchObject({ ok: true, result: { published: 0 } })
  })
})
