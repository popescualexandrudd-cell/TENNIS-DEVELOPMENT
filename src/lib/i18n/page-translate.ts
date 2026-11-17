/**
 * Traducere automată în browser pentru limbile din selector fără versiune proprie (UK/DE/FR, decizia 0016).
 * Folosește Translator API (Chrome, model local pe dispozitiv: textul nu pleacă spre un serviciu extern).
 * Nu modifică HTML-ul servit, rutele, `hreflang` sau CMS-ul; textul original se restaurează la revenirea pe limba
 * paginii. Unde API-ul lipsește, selectorul păstrează linkul către limba de rezervă (`fallbackLocale`).
 * Fără importuri, ca să poată fi testat direct cu node:test (`tests/page-translate.test.mjs`).
 */

export type TranslatorLike = { translate(text: string): Promise<string> }
export type TranslatorFactory = {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<string>
  create(options: { sourceLanguage: string; targetLanguage: string }): Promise<TranslatorLike>
}
/** Subsetul de DOM folosit (Node/Element), ca funcțiile să poată primi și un arbore simulat în teste. */
export type NodeLike = {
  nodeType: number
  nodeName: string
  nodeValue: string | null
  childNodes: ArrayLike<NodeLike>
  getAttribute?(name: string): string | null
}

const TEXT_NODE = 3
const ELEMENT_NODE = 1
/** Elemente al căror text nu se traduce (cod, scripturi, câmpuri editabile, grafică). */
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'CODE', 'PRE', 'TEXTAREA', 'SVG'])

/** Nodurile de text cu litere, fără zonele marcate `translate="no"` (selectorul, numele proprii). */
export function collectTextNodes(root: NodeLike, out: NodeLike[] = []): NodeLike[] {
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === TEXT_NODE) {
      if (child.nodeValue && /\p{L}/u.test(child.nodeValue)) out.push(child)
    } else if (child.nodeType === ELEMENT_NODE) {
      if (SKIP.has(child.nodeName.toUpperCase())) continue
      if (child.getAttribute?.('translate') === 'no') continue
      collectTextNodes(child, out)
    }
  }
  return out
}

/** Translator API din browser, dacă există. */
export function getTranslator(scope: unknown = globalThis): TranslatorFactory | null {
  const t = (scope as { Translator?: TranslatorFactory } | null)?.Translator
  return t && typeof t.create === 'function' && typeof t.availability === 'function' ? t : null
}

/** Poate browserul traduce din `source` în `target`? (`downloadable` = modelul se descarcă la prima folosire.) */
export async function canTranslate(factory: TranslatorFactory | null, source: string, target: string): Promise<boolean> {
  if (!factory) return false
  try {
    return (await factory.availability({ sourceLanguage: source, targetLanguage: target })) !== 'unavailable'
  } catch {
    return false
  }
}

let originals = new WeakMap<NodeLike, string>()
/** Textul pus de noi; dacă React a rescris între timp nodul (ex. „Oprește/Pornește clipul”), nu îl suprascriem. */
let written = new WeakMap<NodeLike, string>()
let touched: NodeLike[] = []

/**
 * Traduce în loc textul din `root`. Pornește mereu de la textul original (o a doua limbă nu traduce o traducere).
 * Întoarce `false` dacă perechea de limbi nu este disponibilă; atunci pagina rămâne neschimbată.
 */
export async function translateTree(root: NodeLike, source: string, target: string, factory: TranslatorFactory): Promise<boolean> {
  if (!(await canTranslate(factory, source, target))) return false
  const translator = await factory.create({ sourceLanguage: source, targetLanguage: target })
  const nodes = collectTextNodes(root)
  const results = await Promise.all(
    nodes.map(async (node) => {
      const original = originals.get(node) ?? node.nodeValue ?? ''
      const [, lead = '', text = '', trail = ''] = /^(\s*)([\s\S]*?)(\s*)$/.exec(original) ?? []
      return { node, original, value: lead + (await translator.translate(text)) + trail }
    }),
  )
  for (const { node, original, value } of results) {
    if (!originals.has(node)) {
      originals.set(node, original)
      touched.push(node)
    }
    node.nodeValue = value
    written.set(node, value)
  }
  return true
}

/** Cheia din localStorage pentru limba tradusă automat aleasă (UK/DE/FR); se păstrează la navigare și refresh. */
export const STORAGE_KEY = 'site-language'
type StorageLike = Pick<Storage, 'getItem'> | null | undefined

/** Limba tradusă automat salvată, doar dacă este una din `allowed` (codurile fără versiune proprie). */
export function savedLanguage(storage: StorageLike, allowed: readonly string[]): string | null {
  try {
    const value = storage?.getItem(STORAGE_KEY) ?? null
    return value && allowed.includes(value) ? value : null
  } catch {
    return null
  }
}

/** Readuce textul original al paginii (revenire pe limba paginii). */
export function restoreTree(): void {
  for (const node of touched) {
    const original = originals.get(node)
    if (original !== undefined && node.nodeValue === written.get(node)) node.nodeValue = original
  }
  originals = new WeakMap()
  written = new WeakMap()
  touched = []
}
