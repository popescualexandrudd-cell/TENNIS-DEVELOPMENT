// Traducerea automată din selectorul de limbă (UK/DE/FR fără versiune proprie, decizia 0016).
// Testează `src/lib/i18n/page-translate.ts` pe un arbore DOM simulat și un Translator API fals (determinist).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { importTs } from './helpers/import-ts.mjs'

const root = join(import.meta.dirname, '..')
const pt = await importTs(join(root, 'src/lib/i18n/page-translate.ts'))

const text = (value) => ({ nodeType: 3, nodeName: '#text', nodeValue: value, childNodes: [] })
const el = (name, children, attrs = {}) => ({
  nodeType: 1,
  nodeName: name,
  nodeValue: null,
  childNodes: children,
  getAttribute: (n) => attrs[n] ?? null,
})
const fakeFactory = (availability = 'available') => ({
  availability: async () => availability,
  create: async ({ targetLanguage }) => ({ translate: async (t) => `[${targetLanguage}] ${t}` }),
})

function page() {
  const title = text('  Progres construit pe teren ')
  const nav = text('Română')
  const script = text('console.log("x")')
  const blank = text('   ')
  const body = el('BODY', [
    el('H1', [title]),
    el('DIV', [nav], { translate: 'no' }),
    el('SCRIPT', [script]),
    blank,
  ])
  return { body, title, nav, script, blank }
}

test('collectTextNodes: doar text cu litere, fără translate="no", scripturi și spații', () => {
  const p = page()
  assert.deepEqual(pt.collectTextNodes(p.body), [p.title])
})

test('getTranslator: detectează Translator API, altfel null (Firefox/Safari)', () => {
  assert.equal(pt.getTranslator({}), null)
  assert.equal(pt.getTranslator(null), null)
  assert.equal(pt.getTranslator({ Translator: { create() {} } }), null)
  const f = fakeFactory()
  assert.equal(pt.getTranslator({ Translator: f }), f)
})

test('canTranslate: false fără API, pe „unavailable” sau la eroare', async () => {
  assert.equal(await pt.canTranslate(null, 'ro', 'de'), false)
  assert.equal(await pt.canTranslate(fakeFactory('unavailable'), 'ro', 'de'), false)
  assert.equal(await pt.canTranslate(fakeFactory('downloadable'), 'ro', 'de'), true)
  const broken = { availability: async () => { throw new Error('x') }, create: async () => ({}) }
  assert.equal(await pt.canTranslate(broken, 'ro', 'de'), false)
})

test('translateTree: traduce textul, păstrează spațiile, nu traduce o traducere, restaurează originalul', async () => {
  const p = page()
  assert.equal(await pt.translateTree(p.body, 'ro', 'de', fakeFactory()), true)
  assert.equal(p.title.nodeValue, '  [de] Progres construit pe teren ')
  assert.equal(p.nav.nodeValue, 'Română')
  assert.equal(p.script.nodeValue, 'console.log("x")')
  // A doua limbă pornește de la textul original.
  assert.equal(await pt.translateTree(p.body, 'ro', 'fr', fakeFactory()), true)
  assert.equal(p.title.nodeValue, '  [fr] Progres construit pe teren ')
  pt.restoreTree()
  assert.equal(p.title.nodeValue, '  Progres construit pe teren ')
})

test('translateTree: perechea indisponibilă lasă pagina neschimbată', async () => {
  const p = page()
  assert.equal(await pt.translateTree(p.body, 'ro', 'uk', fakeFactory('unavailable')), false)
  assert.equal(p.title.nodeValue, '  Progres construit pe teren ')
})

test('restoreTree: nu suprascrie textul rescris între timp de React', async () => {
  const p = page()
  await pt.translateTree(p.body, 'ro', 'de', fakeFactory())
  p.title.nodeValue = 'Text nou din React'
  pt.restoreTree()
  assert.equal(p.title.nodeValue, 'Text nou din React')
})

test('savedLanguage: doar codurile permise; storage lipsă sau blocat → null', () => {
  const store = (v) => ({ getItem: (k) => (k === pt.STORAGE_KEY ? v : null) })
  assert.equal(pt.savedLanguage(store('de'), ['uk', 'de', 'fr']), 'de')
  assert.equal(pt.savedLanguage(store('en'), ['uk', 'de', 'fr']), null)
  assert.equal(pt.savedLanguage(null, ['de']), null)
  assert.equal(pt.savedLanguage({ getItem() { throw new Error('blocked') } }, ['de']), null)
})
