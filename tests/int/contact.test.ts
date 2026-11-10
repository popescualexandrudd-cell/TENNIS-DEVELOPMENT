import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { handleContactRequest } from '@/features/contact/handle'
import { createEditor, resetDb, testPayload } from './helpers'

let payload: Payload

beforeAll(async () => {
  payload = await testPayload()
})
beforeEach(async () => {
  await resetDb(payload)
})

const body = { name: 'Ana Pop', email: 'ana@example.com', requestType: 'coaching', message: 'Aș vrea să încep antrenamentele.', locale: 'ro' }

function request(data: unknown, ip = '203.0.113.10', headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, origin: 'http://localhost:3000', ...headers },
    body: typeof data === 'string' ? data : JSON.stringify(data),
  })
}

describe('POST /api/contact', () => {
  it('salvează solicitarea și raportează succes chiar dacă emailul nu este configurat', async () => {
    const res = await handleContactRequest(payload, request(body))
    expect(res.status).toBe(201)
    const saved = await payload.find({ collection: 'contact-requests', overrideAccess: true })
    expect(saved.totalDocs).toBe(1)
    expect(saved.docs[0]).toMatchObject({ name: 'Ana Pop', status: 'new', notificationStatus: 'failed' })
    expect(saved.docs[0]!.notificationError).toMatch(/configurat/)
  })

  it('nu salvează IP-ul brut', async () => {
    await handleContactRequest(payload, request(body, '198.51.100.23'))
    const db = payload.db as unknown as { drizzle: { execute: (q: string) => Promise<{ rows: Record<string, unknown>[] }> } }
    const { rows } = await db.drizzle.execute('SELECT * FROM contact_requests')
    expect(JSON.stringify(rows)).not.toContain('198.51.100.23')
  })

  it('respinge date invalide cu lista câmpurilor, fără salvare', async () => {
    const res = await handleContactRequest(payload, request({ ...body, email: 'gresit' }))
    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ error: 'validation', fields: ['email'] })
    expect((await payload.count({ collection: 'contact-requests', overrideAccess: true })).totalDocs).toBe(0)
  })

  it('honeypot completat: respins, nesalvat', async () => {
    const res = await handleContactRequest(payload, request({ ...body, website: 'spam' }))
    expect(res.status).toBe(400)
    expect((await payload.count({ collection: 'contact-requests', overrideAccess: true })).totalDocs).toBe(0)
  })

  it('JSON invalid, tip de conținut greșit, corp prea mare, origine străină', async () => {
    expect((await handleContactRequest(payload, request('{nu e json'))).status).toBe(400)
    expect((await handleContactRequest(payload, request(body, undefined, { 'content-type': 'text/plain' }))).status).toBe(415)
    expect((await handleContactRequest(payload, request({ ...body, message: 'x'.repeat(20_000) }))).status).toBe(413)
    expect((await handleContactRequest(payload, request(body, undefined, { origin: 'https://evil.example' }))).status).toBe(403)
  })

  it('limitează la 3 solicitări / 10 minute per IP, folosind baza de date comună', async () => {
    for (let i = 0; i < 3; i++) expect((await handleContactRequest(payload, request(body, '192.0.2.5'))).status).toBe(201)
    expect((await handleContactRequest(payload, request(body, '192.0.2.5'))).status).toBe(429)
    expect((await handleContactRequest(payload, request(body, '192.0.2.6'))).status).toBe(201)
  })

  it('solicitările nu pot fi citite sau create public, nici de un editor', async () => {
    await handleContactRequest(payload, request(body))
    await expect(payload.find({ collection: 'contact-requests', overrideAccess: false })).rejects.toThrow()
    await expect(payload.create({ collection: 'contact-requests', overrideAccess: false, data: { ...body, requestType: 'coaching' } as never })).rejects.toThrow()
    const firstUser = await createEditor(payload) // primul cont devine automat admin
    expect(firstUser.roles).toEqual(['admin'])
    const editor = await createEditor(payload)
    expect(editor.roles).toEqual(['editor'])
    await expect(payload.find({ collection: 'contact-requests', overrideAccess: false, user: editor })).rejects.toThrow()
    const admin = await payload.find({ collection: 'contact-requests', overrideAccess: false, user: firstUser })
    expect(admin.totalDocs).toBe(1)
  })
})
