// Gardă: secțiunea „Cum lucrez / How I work” nu mai apare pe homepage.
// Câmpul CMS `pages.home.method` rămâne în schemă (fără migrație), doar marcat în admin ca neafișat.
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

test('HomeView nu mai randează „Cum lucrez”; secțiunile vecine rămân în ordine', () => {
  const code = stripComments(read('src/features/site/HomeView.tsx'))
  assert.doesNotMatch(code, /h-method/)
  assert.doesNotMatch(code, /home\??\.method/)
  assert.doesNotMatch(code, /t\.home\.(method|step)\b/)
  const order = ['h-hero', 'h-about', 'h-facts', 'h-testimonials', 'h-journal', 'h-contact']
  const pos = order.map((id) => code.indexOf(`aria-labelledby="${id}"`))
  assert.ok(pos.every((p) => p >= 0), `lipsesc secțiuni: ${order.filter((_, i) => pos[i] < 0)}`)
  assert.deepEqual([...pos].sort((a, b) => a - b), pos)
  // SectionMedia e încă folosit de secțiunile rămase (despre, testimoniale), deci importul e justificat.
  assert.match(code, /<SectionMedia /)
})

test('dicționarele RO/EN nu mai au home.method / home.step', () => {
  const dict = read('src/lib/i18n/dictionaries.ts')
  const blocks = [...dict.matchAll(/home: \{([\s\S]*?)\n {2}\}/g)]
  assert.equal(blocks.length, 2)
  for (const b of blocks) assert.doesNotMatch(b[1], /\b(method|step):/)
  assert.doesNotMatch(dict, /'Cum lucrez'|'How I work'/)
})

test('nicio referință activă la secțiune în src (ancore, meniu, footer, sitemap)', () => {
  const hits = walk('src')
    .filter((f) => !f.includes('migrations') && !f.endsWith('payload-types.ts'))
    .filter((f) => {
      const code = stripComments(read(f))
      return /h-method|#method|#cum-lucrez|#how-i-work|t\.home\.(method|step)\b/.test(code) ||
        (/Cum lucrez|How I work/i.test(code) && !f.endsWith('cms/collections/Pages.ts'))
    })
  assert.deepEqual(hits, [])
})

test('schema CMS păstrează câmpul method (fără migrație), marcat ca neafișat', () => {
  const pages = read('src/cms/collections/Pages.ts')
  const field = pages.match(/name: 'method',[\s\S]*?fields: \[/)
  assert.ok(field, 'câmpul method lipsește din Pages.ts')
  assert.match(field[0], /Momentan nu apare pe site/)
})

test('e2e verifică pagina randată /ro și /en', () => {
  const spec = read('tests/e2e/site.spec.ts')
  assert.match(spec, /cum lucrez\|how i work/)
  assert.match(spec, /h-method/)
})
