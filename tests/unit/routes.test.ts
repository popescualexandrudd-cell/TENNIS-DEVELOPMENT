import { describe, expect, it } from 'vitest'
import { articlePath, pageKeyFromPath, pagePath } from '@/lib/i18n/routes'

describe('rute localizate', () => {
  it('generează căile RO și EN', () => {
    expect(pagePath('ro', 'home')).toBe('/ro')
    expect(pagePath('ro', 'about')).toBe('/ro/despre')
    expect(pagePath('en', 'about')).toBe('/en/about')
    expect(pagePath('ro', 'privacy')).toBe('/ro/confidentialitate')
    expect(articlePath('en', 'serve-basics')).toBe('/en/journal/serve-basics')
  })
  it('identifică pagina echivalentă pentru selectorul de limbă', () => {
    expect(pageKeyFromPath('/ro/antrenamente')).toEqual({ locale: 'ro', key: 'coaching' })
    expect(pageKeyFromPath('/en')).toEqual({ locale: 'en', key: 'home' })
    expect(pageKeyFromPath('/ro/jurnal/ceva')).toBeNull()
  })
})
