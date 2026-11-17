// Gardă statică pentru regula `react-hooks/set-state-in-effect` (eslint-config-next 16, `pnpm lint` în CI):
// un setter `useState` apelat sincron în corpul unui `useEffect` pică lint-ul. CI-ul a eșuat astfel după
// `setAutoAvailable(getTranslator(window) !== null)` din `LanguageSwitch.tsx`. Doar `node:fs`/`node:path`.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = join(import.meta.dirname, '..')

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(p)
  }
  return out
}

/** Elimină comentariile și conținutul șirurilor, păstrând acoladele din cod. */
function stripNoise(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/g, "''")
}

/** Apelurile de setter făcute direct (adâncime 1) în corpul fiecărui `useEffect(() => { … })`. */
export function syncSetStateInEffects(source) {
  const src = stripNoise(source)
  const setters = [...src.matchAll(/const\s*\[\s*\w+\s*,\s*(set[A-Z]\w*)\s*\]\s*=\s*useState\b/g)].map((m) => m[1])
  if (setters.length === 0) return []
  const call = new RegExp(`\\b(${setters.join('|')})\\s*\\(`, 'y')
  const found = []
  for (const m of src.matchAll(/useEffect\(\s*\(\s*\)\s*=>\s*\{/g)) {
    let depth = 1
    for (let i = m.index + m[0].length; i < src.length && depth > 0; i++) {
      const ch = src[i]
      if (ch === '{') depth++
      else if (ch === '}') depth--
      else if (depth === 1) {
        call.lastIndex = i
        const hit = call.exec(src)
        if (hit && !/[\w.]/.test(src[i - 1] ?? '')) found.push(hit[1])
      }
    }
  }
  return found
}

test('detectorul recunoaște tiparul care a picat lint-ul și ignoră apelurile amânate', () => {
  const bad = `const [a, setA] = useState(false)\nuseEffect(() => {\n  setA(true)\n}, [])`
  assert.deepEqual(syncSetStateInEffects(bad), ['setA'])
  const conditional = `const [o, setO] = useState(false)\nuseEffect(() => {\n  if (x) setO(false)\n}, [x])`
  assert.deepEqual(syncSetStateInEffects(conditional), ['setO'])
  const deferred = `const [a, setA] = useState(false)\nuseEffect(() => {\n  const t = window.setTimeout(() => { setA(true) }, 0)\n  const onKey = (e) => { setA(false) }\n  // setA(true) în comentariu\n  return () => window.clearTimeout(t)\n}, [])`
  assert.deepEqual(syncSetStateInEffects(deferred), [])
})

test('niciun setState sincron în useEffect în src/ (react-hooks/set-state-in-effect)', () => {
  const offenders = []
  for (const file of walk(join(root, 'src'))) {
    const hits = syncSetStateInEffects(readFileSync(file, 'utf8'))
    if (hits.length) offenders.push(`${relative(root, file)}: ${hits.join(', ')}`)
  }
  assert.deepEqual(offenders, [])
})

test('LanguageSwitch: disponibilitatea Translator API vine din useSyncExternalStore, nu din efect', () => {
  const src = readFileSync(join(root, 'src/components/LanguageSwitch.tsx'), 'utf8')
  assert.match(src, /useSyncExternalStore\(noSubscribe, hasTranslator, noTranslatorOnServer\)/)
  assert.match(src, /const noTranslatorOnServer = \(\) => false/)
  assert.doesNotMatch(src, /setAutoAvailable/)
})
