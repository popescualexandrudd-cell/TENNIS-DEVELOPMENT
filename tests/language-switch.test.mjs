// Gardă pentru selectorul de limbă din header (decizia 0016). Fără dependențe: citește sursele și
// importă direct `config.ts` (Node 24 elimină tipurile; fișierul nu are importuri).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
// Fără import `.ts`: sub limita de memorie a sandboxului, type-stripping-ul (Wasm) pică cu OOM.
// Extragem constantele direct din sursă (literali simpli, fără tipuri).
const configSrc = read('src/lib/i18n/config.ts')
const block = (name) => {
  const m = configSrc.match(new RegExp(`export const ${name} = (\\[[\\s\\S]*?\\]) as const`))
  assert.ok(m, `${name} lipsește din config.ts`)
  return m[1]
}
const config = {
  locales: [...block('locales').matchAll(/'([a-z]{2})'/g)].map((m) => m[1]),
  siteLanguages: [...block('siteLanguages').matchAll(/\{\s*code: '([a-z]{2})', label: '([^']+)'\s*\}/g)].map((m) => ({
    code: m[1],
    label: m[2],
  })),
}

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

test('LanguageSwitch: numele și codurile limbilor nu sunt traduse automat de browser', () => {
  const src = read('src/components/LanguageSwitch.tsx')
  // Traducerea automată (ex. Chrome) transforma „Română” în „English” și „în pregătire” în „in preparation”.
  assert.match(src, /<span lang=\{code\} translate="no">\s*\{label\}\s*<\/span>/)
  assert.match(src, /translate="no">\s*\{code\.toUpperCase\(\)\}/)
  assert.match(src, /lang=\{locale\} translate="no">\s*\{locale\.toUpperCase\(\)\}/)
  // Toate rândurile (curent, link, dezactivat) folosesc numele protejat; fără `{label}` neprotejat.
  assert.equal((src.match(/\{label\}/g) ?? []).length, 1)
  assert.equal((src.match(/\{name\}/g) ?? []).length, 3)
})

test('EN devine link doar prin Setări site → englishEnabled; descrierea admin spune asta', () => {
  const layout = read('src/components/SiteLayout.tsx')
  assert.match(layout, /const other = enabled && otherEnabled \?/)
  const settings = read('src/cms/globals/SiteSettings.ts')
  const field = settings.slice(settings.indexOf("name: 'englishEnabled'"), settings.indexOf('}', settings.indexOf("description:")))
  assert.match(field, /defaultValue: false/)
  assert.doesNotMatch(field, /selectorul de limbă e ascuns/, 'descriere veche: selectorul e mereu vizibil (0016)')
  assert.match(field, /în pregătire/)
})

test('dicționarele RO/EN au etichetele selectorului', () => {
  const dict = read('src/lib/i18n/dictionaries.ts')
  for (const key of ['languageSwitch', 'languageCurrent', 'languageSoon']) {
    assert.equal((dict.match(new RegExp(`\\b${key}:`, 'g')) ?? []).length, 2, `${key} trebuie să existe în ro și en`)
  }
  assert.match(dict, /languageSoon: 'în pregătire'/)
})
