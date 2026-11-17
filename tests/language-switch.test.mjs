// Gardă pentru selectorul de limbă din header (decizia 0016). Fără dependențe: citește sursele și
// importă direct `config.ts` (Node 24 elimină tipurile; fișierul nu are importuri).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { importTs } from './helpers/import-ts.mjs'

const root = join(import.meta.dirname, '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const config = await importTs(join(root, 'src/lib/i18n/config.ts'))

test('siteLanguages: RO, EN, UK, DE, FR în ordine, cu nume native', () => {
  assert.deepEqual(
    config.siteLanguages.map((l) => [l.code, l.label]),
    [
      ['ro', 'Română'],
      ['en', 'English'],
      ['uk', 'Українська'],
      ['de', 'Deutsch'],
      ['fr', 'Français'],
    ],
  )
})

test('rutele publice rămân RO/EN; toate locale-le apar în selector', () => {
  assert.deepEqual([...config.locales], ['ro', 'en'])
  const codes = config.siteLanguages.map((l) => l.code)
  for (const l of config.locales) assert.ok(codes.includes(l), `${l} lipsește din selector`)
  assert.equal(new Set(codes).size, codes.length, 'coduri duplicate')
})

test('selectorul stă în header lângă „Meniu”, nu în panoul meniului', () => {
  const header = read('src/components/SiteHeader.tsx')
  const at = header.indexOf('{switcher}')
  assert.ok(at > 0, 'switcher-ul nu este randat')
  assert.ok(at < header.indexOf('<SiteMenu'), 'switcher-ul trebuie să fie înaintea butonului Meniu')
  const extra = header.slice(header.indexOf('extra={'), header.indexOf('/>', header.indexOf('extra={')))
  assert.ok(!extra.includes('switcher'), 'switcher-ul nu trebuie să mai fie în panoul meniului')
  assert.doesNotMatch(header, /const switcher = other \?/, 'selectorul trebuie să fie mereu vizibil')
})

test('LanguageSwitch: dropdown accesibil peste siteLanguages, limbile fără rute dezactivate', () => {
  const src = read('src/components/LanguageSwitch.tsx')
  assert.match(src, /siteLanguages\.map/)
  assert.match(src, /aria-expanded=\{open\}/)
  assert.match(src, /aria-controls=\{id\}/)
  assert.match(src, /e\.key === 'Escape'/)
  assert.match(src, /aria-current="true"/)
  assert.match(src, /aria-disabled="true"/)
  assert.match(src, /hrefLang=\{code\}/)
  // Linkuri doar către cealaltă limbă publică (fără rute /uk, /de, /fr inexistente).
  assert.equal((src.match(/<Link\b/g) ?? []).length, 1)
})

test('dicționarele RO/EN au etichetele selectorului', () => {
  const dict = read('src/lib/i18n/dictionaries.ts')
  for (const key of ['languageSwitch', 'languageCurrent', 'languageSoon']) {
    assert.equal((dict.match(new RegExp(`\\b${key}:`, 'g')) ?? []).length, 2, `${key} trebuie să existe în ro și en`)
  }
  assert.match(dict, /languageSoon: 'în pregătire'/)
})
