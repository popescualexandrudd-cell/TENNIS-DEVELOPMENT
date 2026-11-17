// Gardă: secțiunea „Lucrează cu mine / Work with me” nu mai apare pe homepage,
// iar ofertele de antrenament rămân pe pagina dedicată (Antrenamente).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

function walk(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name)
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out)
    else if (/\.(tsx?|css|mjs|js)$/.test(name)) out.push(rel)
  }
  return out
}

test('homepage nu mai randează secțiunea „Work with me” / ofertele', () => {
  const home = read('src/features/site/HomeView.tsx')
  // Ignoră comentariile: verificăm doar codul activ.
  const code = home.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  assert.doesNotMatch(code, /workWithMe/)
  assert.doesNotMatch(code, /h-coaching/)
  assert.doesNotMatch(code, /ServiceCard/)
  assert.doesNotMatch(code, /getConfirmedServices/)
  assert.doesNotMatch(code, /coachingHeading/)
  // Secțiunile vecine rămân, iar ordinea lor e neschimbată.
  const order = ['h-hero', 'h-about', 'h-facts', 'h-method', 'h-testimonials', 'h-journal', 'h-contact']
  const pos = order.map((id) => code.indexOf(`"${id}"`))
  assert.ok(pos.every((p) => p >= 0), `lipsesc secțiuni: ${order.filter((_, i) => pos[i] < 0)}`)
  assert.deepEqual([...pos].sort((a, b) => a - b), pos)
})

test('nicio referință activă la „work with me” în src (cod, ancore, stiluri)', () => {
  const hits = walk('src')
    .filter((f) => !f.includes('migrations'))
    .filter((f) => {
      const code = read(f).replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      return /workWithMe|work-with-me|#work|Work with me/i.test(code) || /Lucrează cu mine'/.test(code)
    })
  assert.deepEqual(hits, [])
})

test('dicționarele RO/EN nu mai au cheile secțiunii; restul cheilor home rămân', () => {
  const dict = read('src/lib/i18n/dictionaries.ts')
  assert.doesNotMatch(dict, /workWithMe/)
  for (const block of dict.matchAll(/home: \{([\s\S]*?)\n {2}\}/g)) {
    assert.doesNotMatch(block[1], /\bcoaching:/)
    for (const k of ['about', 'method', 'journal', 'journalAll', 'contact', 'facts', 'testimonials', 'step']) {
      assert.match(block[1], new RegExp(`\\b${k}:`), `lipsește home.${k}`)
    }
  }
  assert.equal([...dict.matchAll(/home: \{/g)].length, 2)
})

test('ofertele rămân pe pagina Antrenamente și în meniu', () => {
  const views = read('src/features/site/views.tsx')
  assert.match(views, /getConfirmedServices\(locale\)/)
  assert.match(views, /<ServiceCard /)
  const header = read('src/components/SiteHeader.tsx')
  assert.match(header, /pagePath\(locale, 'contact'\)/)
})
