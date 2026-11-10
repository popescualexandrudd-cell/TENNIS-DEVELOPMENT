import { describe, expect, it } from 'vitest'
import { contactSchema, fieldErrors } from '@/features/contact/schema'
import { hashIp, clientIp } from '@/features/contact/rate-limit'

const valid = { name: 'Ana Pop', email: ' Ana@Example.com ', requestType: 'coaching', message: 'Aș vrea să încep antrenamentele.', locale: 'ro' }

describe('validarea formularului de contact', () => {
  it('acceptă și normalizează o solicitare validă', () => {
    const r = contactSchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.email).toBe('ana@example.com')
  })
  it('raportează câmpurile invalide', () => {
    const r = contactSchema.safeParse({ ...valid, name: 'A', email: 'nu-e-email', message: 'scurt', requestType: 'x' })
    expect(r.success).toBe(false)
    if (!r.success) expect(fieldErrors(r.error).sort()).toEqual(['email', 'message', 'name', 'requestType'])
  })
  it('respinge honeypot-ul completat fără a indica un câmp vizibil', () => {
    const r = contactSchema.safeParse({ ...valid, website: 'http://spam.example' })
    expect(r.success).toBe(false)
    if (!r.success) expect(fieldErrors(r.error)).toEqual([])
  })
  it('limitează lungimea mesajului', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'x'.repeat(4001) }).success).toBe(false)
  })
})

describe('rate limit helpers', () => {
  it('hash-ul IP este determinist, dependent de secret și nu conține IP-ul', () => {
    const a = hashIp('203.0.113.7', 's1')
    expect(a).toBe(hashIp('203.0.113.7', 's1'))
    expect(a).not.toBe(hashIp('203.0.113.7', 's2'))
    expect(a).not.toContain('203')
  })
  it('folosește primul IP din x-forwarded-for', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '198.51.100.1, 10.0.0.1' }))).toBe('198.51.100.1')
  })
})
