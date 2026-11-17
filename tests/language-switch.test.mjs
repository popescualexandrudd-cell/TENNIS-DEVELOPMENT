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

test('LanguageSwitch: funcțional cu tastatura și protejat de traducerea automată a browserului', () => {
  const src = read('src/components/LanguageSwitch.tsx')
  // Captura „ENGLISH / EN” + „in preparation” pe /ro = pagina tradusă de browser; selectorul trebuie exclus.
  assert.match(src, /translate="no"/)
  // Navigare: focus pe prima limbă selectabilă la deschidere, săgeți/Home/End, închidere la Tab în afară.
  assert.match(src, /querySelectorAll<HTMLAnchorElement>\('a\[href\]'\)/)
  for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) assert.ok(src.includes(`'${key}'`), `tasta ${key}`)
  assert.match(src, /onBlur=\{/)
  assert.match(src, /relatedTarget/)
  // Linkul închide lista și păstrează pagina echivalentă (decizia 0002).
  assert.match(src, /onClick=\{\(\) => setOpen\(false\)\}/)
  assert.match(src, /href=\{hrefFor\(other\.locale, other\.availability\)\}/)
})

test('setarea englishEnabled descrie corect efectul asupra selectorului', () => {
  const s = read('src/cms/globals/SiteSettings.ts')
  assert.doesNotMatch(s, /selectorul de limbă e ascuns/)
  assert.match(s, /„în pregătire”/)
})

test('dicționarele RO/EN au etichetele selectorului', () => {
  const dict = read('src/lib/i18n/dictionaries.ts')
  for (const key of ['languageSwitch', 'languageCurrent', 'languageSoon']) {
    assert.equal((dict.match(new RegExp(`\\b${key}:`, 'g')) ?? []).length, 2, `${key} trebuie să existe în ro și en`)
  }
  assert.match(dict, /languageSoon: 'în pregătire'/)
})

test('e2e exercită selectorul în browser (deschidere, stări, Escape, navigare spre /en)', () => {
  const spec = read('tests/e2e/site.spec.ts')
  assert.match(spec, /test\.describe\('selector de limbă/)
  assert.match(spec, /name: \/\^Schimbă limba: RO\$\//)
  assert.match(spec, /aria-current="true"/)
  assert.match(spec, /aria-disabled="true"/)
  assert.match(spec, /toHaveURL\(\/\\\/en\$\/\)/)
})
