// Gardă: secțiunea „Cum lucrez / How I work” (pașii home.method) nu mai apare pe homepage.
// Câmpul CMS rămâne în schemă (fără migrație), marcat în admin ca neafișat.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const stripComments = (s) =>
  s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

function walk(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name)
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out)
    else if (/\.(tsx?|css|mjs|js)$/.test(name)) out.push(rel)
  }
  return out
}

test('HomeView nu mai randează „Cum lucrez”; secțiunile rămase își păstrează ordinea', () => {
  const code = stripComments(read('src/features/site/HomeView.tsx'))
  assert.doesNotMatch(code, /h-method/)
  assert.doesNotMatch(code, /home\??\.method/)
  assert.doesNotMatch(code, /t\.home\.(method|step)\b/)
  // SectionMedia / hasPublicMedia sunt încă folosite de „Despre” și testimoniale.
  assert.match(code, /hasPublicMedia\(home\.aboutImage\)/)
  const order = ['h-hero', 'h-about', 'h-facts', 'h-testimonials', 'h-journal', 'h-contact']
  const pos = order.map((id) => code.indexOf(`"${id}"`))
  assert.ok(pos.every((p) => p >= 0), `lipsesc secțiuni: ${order.filter((_, i) => pos[i] < 0)}`)
  assert.deepEqual([...pos].sort((a, b) => a - b), pos)
})

test('dicționarele RO/EN nu mai au cheile home.method / home.step', () => {
  const dict = read('src/lib/i18n/dictionaries.ts')
  const blocks = [...dict.matchAll(/home: \{([\s\S]*?)\n {2}\}/g)]
  assert.equal(blocks.length, 2)
  for (const b of blocks) {
    assert.doesNotMatch(b[1], /\b(method|step):/)
  }
  assert.doesNotMatch(dict, /'Cum lucrez'|'How I work'/)
})

test('nicio referință activă la secțiune în src (în afara schemei CMS și a migrațiilor)', () => {
  const hits = walk('src')
    .filter((f) => !f.includes('migrations') && !f.endsWith('payload-types.ts') && !f.includes(join('cms', 'collections')))
    .filter((f) => /h-method|#method|Cum lucrez|How I work/i.test(stripComments(read(f))))
  assert.deepEqual(hits, [])
})

test('câmpul CMS method rămâne (fără migrație), marcat ca neafișat; seed neschimbat', () => {
  const pages = read('src/cms/collections/Pages.ts')
  const m = pages.match(/name: 'method',[\s\S]*?fields: \[/)
  assert.ok(m, 'câmpul method lipsește din schemă')
  assert.match(m[0], /description: 'Momentan nu apare pe site/)
  assert.match(read('scripts/seed-dev.ts'), /method: \[/)
})

test('e2e verifică pagina randată fără „Cum lucrez” (ro + en)', () => {
  const spec = read('tests/e2e/site.spec.ts')
  assert.match(spec, /not\.toContain\('cum lucrez'\)/)
  assert.match(spec, /not\.toContain\('how i work'\)/)
  assert.match(spec, /#h-method/)
})
