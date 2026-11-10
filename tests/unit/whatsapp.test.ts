import { describe, expect, it } from 'vitest'
import { formatPhoneRo, whatsappLink, whatsappNumber } from '@/lib/whatsapp'

describe('WhatsApp', () => {
  it('normalizează numerele românești la formatul internațional', () => {
    expect(whatsappNumber('0726409988')).toBe('40726409988')
    expect(whatsappNumber('0726 409 988')).toBe('40726409988')
    expect(whatsappNumber('+40 726 409 988')).toBe('40726409988')
    expect(whatsappNumber('0040726409988')).toBe('40726409988')
  })
  it('respinge valori care nu sunt numere', () => {
    expect(whatsappNumber('')).toBeNull()
    expect(whatsappNumber('abc')).toBeNull()
    expect(whatsappNumber('123')).toBeNull()
  })
  it('construiește linkul wa.me cu mesaj codificat', () => {
    expect(whatsappLink('0726409988')).toBe('https://wa.me/40726409988')
    expect(whatsappLink('0726409988', 'Bună, ș & ț?')).toBe('https://wa.me/40726409988?text=Bun%C4%83%2C%20%C8%99%20%26%20%C8%9B%3F')
  })
  it('afișează numărul lizibil', () => {
    expect(formatPhoneRo('0726409988')).toBe('0726 409 988')
  })
})
