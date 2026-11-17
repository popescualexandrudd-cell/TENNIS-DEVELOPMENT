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
  assert.match(src, /hrefLang=\{code\}/)
})

test('LanguageSwitch: nicio limbă „în pregătire”; toate sunt linkuri selectabile', () => {
  const src = read('src/components/LanguageSwitch.tsx')
  assert.doesNotMatch(src, /aria-disabled/)
  assert.doesNotMatch(src, /cursor-not-allowed/)
  assert.doesNotMatch(src, /labels\.soon/)
  // Două linkuri: cealaltă limbă publică + limbile fără versiune proprie (spre limba de rezervă).
  assert.equal((src.match(/<Link\b/g) ?? []).length, 2)
  assert.match(src, /fallbackLocale\(locale, other\)/)
  assert.match(src, /labels\.fallback\[target\]/)
  // Fără rute inventate /uk, /de, /fr.
  assert.doesNotMatch(src, /['`]\/(uk|de|fr)\b/)
})

test('fallbackLocale: engleza când e publică, altfel româna', () => {
  assert.equal(config.fallbackLocale('ro', null), 'ro')
  assert.equal(config.fallbackLocale('ro', { locale: 'en' }), 'en')
  assert.equal(config.fallbackLocale('en', { locale: 'ro' }), 'en')
  assert.equal(config.fallbackLocale('en', null), 'en')
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
  assert.doesNotMatch(s, /„în pregătire”/)
  assert.match(s, /rămâne selectabilă/)
})

test('seed-ul de dezvoltare publică engleza, ca selectorul să aibă o a doua limbă reală', () => {
  // Cu englishEnabled fals nu există `other`: EN/UK/DE/FR duceau la aceeași pagină în română (selectorul „nu mergea”).
  const seed = read('scripts/seed-dev.ts')
  assert.match(seed, /slug: 'site-settings'[\s\S]*?englishEnabled: true/)
  assert.doesNotMatch(seed, /englishEnabled: false/)
  // Seed-ul rămâne interzis în producție: bifarea pe site-ul public e decizia lui Daniel.
  assert.match(seed, /NODE_ENV === 'production'[\s\S]*?process\.exit\(1\)/)
  // Fără `other`, linkurile de rezervă rămân pe pagina curentă — de aceea a doua limbă trebuie să fie publică.
  const sw = read('src/components/LanguageSwitch.tsx')
  assert.match(sw, /other && target === other\.locale \? hrefFor\(other\.locale, other\.availability\) : pathname/)
})

test('dicționarele RO/EN au etichetele selectorului', () => {
  const dict = read('src/lib/i18n/dictionaries.ts')
  for (const key of ['languageSwitch', 'languageCurrent', 'languageFallback']) {
    assert.equal((dict.match(new RegExp(`\\b${key}:`, 'g')) ?? []).length, 2, `${key} trebuie să existe în ro și en`)
  }
  assert.doesNotMatch(dict, /languageSoon/)
  assert.match(dict, /languageFallback: \{ ro: 'în română', en: 'în engleză' \}/)
  assert.match(dict, /languageFallback: \{ ro: 'in Romanian', en: 'in English' \}/)
  const header = read('src/components/SiteHeader.tsx')
  assert.match(header, /fallback: t\.nav\.languageFallback/)
})

test('e2e exercită selectorul în browser (deschidere, stări, Escape, navigare spre /en)', () => {
  const spec = read('tests/e2e/site.spec.ts')
  assert.match(spec, /test\.describe\('selector de limbă/)
  assert.match(spec, /name: \/\^Schimbă limba: RO\$\//)
  assert.match(spec, /aria-current="true"/)
  assert.match(spec, /\[aria-disabled="true"\]'\)\)\.toHaveCount\(0\)/)
  assert.match(spec, /getByRole\('link', \{ name: \/Deutsch\/ \}\)/)
  assert.match(spec, /toHaveURL\(\/\\\/en\$\/\)/)
})
