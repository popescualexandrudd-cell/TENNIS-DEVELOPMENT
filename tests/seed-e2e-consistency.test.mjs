// Gardă: CI rulează `pnpm migrate && pnpm seed:dev` înainte de `pnpm test:e2e`, deci e2e trebuie să fie
// compatibil cu setările din seed. Seed-ul publică engleza (englishEnabled: true), iar un test e2e care cerea
// necondiționat 404 pe /en a făcut CI să pice. Testele e2e despre EN trebuie să citească starea reală.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

test('CI rulează seed:dev înainte de e2e (e2e vede setările din seed)', () => {
  const ci = read('.github/workflows/ci.yml')
  const seed = ci.indexOf('pnpm seed:dev')
  const e2e = ci.indexOf('pnpm test:e2e')
  assert.ok(seed > 0 && e2e > seed)
  assert.match(read('scripts/seed-dev.ts'), /englishEnabled: true/)
})

test('e2e nu cere 404 necondiționat pe /en când seed-ul publică engleza', () => {
  const spec = read('tests/e2e/site.spec.ts')
  // Vechiul test: buclă fixă peste /en, /en/about, /en/contact cu toBe(404), fără verificarea stării.
  const start = spec.indexOf("test('engleza:")
  assert.ok(start > 0, 'testul despre engleză lipsește')
  const body = spec.slice(start, spec.indexOf('\n  })', start))
  assert.match(body, /getAttribute\('hreflang'\)\) === 'en'/, 'starea EN trebuie citită din selector')
  assert.match(body, /if \(!published\)[\s\S]*toBe\(404\)[\s\S]*return/, 'ramura nepublicată păstrează 404')
  assert.match(body, /\['\/en', '\/en\/contact'\][\s\S]*toBe\(200\)/, 'ramura publicată cere 200')
  assert.match(body, /lang="en"/)
  assert.match(body, /<h1/, 'fără pagini goale')
  assert.doesNotMatch(spec, /test\('engleza nepublicată răspunde 404/)
})
