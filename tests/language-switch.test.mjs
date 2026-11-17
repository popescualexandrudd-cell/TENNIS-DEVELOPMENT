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

test('LanguageSwitch: UK/DE/FR traduc pagina pe loc (Translator API), cu rezervă și alegere păstrată', () => {
  const src = read('src/components/LanguageSwitch.tsx')
  // Clicul pe o limbă fără versiune proprie aplică traducerea, nu doar închide lista („nu traduce când selectez”).
  assert.match(src, /onClick=\{\(e\) => void onAutoSelect\(e, code\)\}/)
  assert.match(src, /translateTree\(document\.body, locale, code, factory\)/)
  assert.match(src, /document\.documentElement\.lang = ok \? code : locale/)
  // Fără API sau fără perechea de limbi: linkul de rezervă rămâne funcțional.
  assert.match(src, /if \(!factory\) return\s*e\.preventDefault\(\)/)
  assert.match(src, /window\.location\.assign\(fallbackHref\)/)
  // Alegerea rezistă la navigare și refresh; Română revine la textul original.
  assert.match(src, /storage\(\)\?\.setItem\(STORAGE_KEY, code\)/)
  assert.match(src, /savedLanguage\(storage\(\), autoKey\.split\(','\)\)/)
  assert.match(src, /resetTranslation\(\)/)
  const dict = read('src/lib/i18n/dictionaries.ts')
  assert.match(dict, /languageAuto: 'traducere automată'/)
  assert.match(dict, /languageAuto: 'automatic translation'/)
  assert.match(read('src/components/SiteHeader.tsx'), /auto: t\.nav\.languageAuto/)
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
  // Elementele focusabile: linkurile limbilor + butonul „revino la limba paginii” (când pagina e tradusă automat).
  assert.match(src, /querySelectorAll<HTMLElement>\('a\[href\], button'\)/)
  for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) assert.ok(src.includes(`'${key}'`), `tasta ${key}`)
  assert.match(src, /onBlur=\{/)
  assert.match(src, /relatedTarget/)
  // Linkul celeilalte limbi publice închide lista, renunță la traducerea automată și păstrează pagina echivalentă (0002).
  assert.match(src, /if \(translated\) resetTranslation\(\)\s*setOpen\(false\)/)
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

test('seed-ul are versiunea EN a homepage-ului, ca selectarea English să traducă și conținutul din CMS', () => {
  // Câmpurile paginii sunt localizate, `getPage` folosește `fallbackLocale: false`, iar `available` e implicit fals:
  // fără versiunea EN, `/en` se deschidea fără titlu, intro, „Despre” și cifre („nu traduce când selectez”).
  const seed = read('scripts/seed-dev.ts')
  const en = seed.match(/collection: 'pages',\s*id: homeId,\s*locale: 'en',[\s\S]*?_status: 'published'/)
  assert.ok(en, 'update pe homepage cu locale: en')
  for (const field of ['available: true', "title: 'Tennis. Progress built on court.'", 'intro:', 'aboutText:', 'facts:', 'approach:', 'contactInvite:']) {
    assert.ok(en[0].includes(field), `EN trebuie să aibă ${field}`)
  }
  // Substituenții rămân marcați; nicio diacritică românească în textele EN.
  // Substituentul vine din constanta `EXEN` (interpolată), nu din literal.
  assert.match(seed, /const EXEN = '\[EXAMPLE\]'/)
  assert.match(en[0], /\$\{EXEN\}/)
  assert.doesNotMatch(en[0], /[ăâîșțĂÂÎȘȚ]/)
  const content = read('src/lib/content.ts')
  assert.match(content, /page && page\.available \? page : null/)
  const spec = read('tests/e2e/site.spec.ts')
  assert.match(spec, /toContainText\('Tennis\. Progress built on court\.'\)/)
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
