import { describe, expect, it } from 'vitest'
import { slugify, slugPattern } from '@/lib/slug'

describe('slugify', () => {
  it('elimină diacriticele românești (inclusiv variantele cu sedilă)', () => {
    expect(slugify('Pregătire și progres')).toBe('pregatire-si-progres')
    expect(slugify('Ţintă, Şut, Înălțime, Ață')).toBe('tinta-sut-inaltime-ata')
  })
  it('produce sluguri valide', () => {
    for (const s of ['  Forehand: priza „Eastern”! ', 'Echipament & tehnologie', '2026 — sezonul pe zgură']) {
      expect(slugify(s)).toMatch(slugPattern)
    }
  })
})
