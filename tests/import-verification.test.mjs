// Verificare statică a copiei importate, fără dependențe (doar node:fs/node:path).
// Rulare: node --test "tests/**/*.test.mjs"
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { importTs } from './helpers/import-ts.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

test('fișierele cheie de pornire există', () => {
  const files = [
    'package.json', 'pnpm-lock.yaml', 'next.config.ts', 'tsconfig.json', 'vitest.config.mts',
    'playwright.config.ts', 'Dockerfile', 'docker-compose.yml', '.env.example',
    'src/payload.config.ts', 'src/migrations/index.ts',
    'src/app/(frontend)/ro/layout.tsx', 'src/app/(frontend)/en/layout.tsx',
    'src/app/api/contact/route.ts', 'src/app/api/feedback/route.ts',
    'src/app/api/preview/route.ts', 'src/app/api/exit-preview/route.ts',
    'src/app/sitemap.ts', 'src/app/robots.ts',
    'docs/RUNBOOK.md', 'docs/PROJECT_STATE.md', 'docs/ARCHITECTURE.md',
  ]
  const missing = files.filter((f) => !existsSync(join(root, f)))
  assert.deepEqual(missing, [])
})

test('package.json are scripturile necesare și versiuni fixate exact', () => {
  const pkg = JSON.parse(read('package.json'))
  for (const s of ['dev', 'build', 'start', 'lint', 'typecheck', 'migrate', 'test', 'test:unit', 'test:int', 'test:e2e']) {
    assert.ok(pkg.scripts[s], `lipsește scriptul ${s}`)
  }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  const loose = Object.entries(deps).filter(([, v]) => !/^\d+\.\d+\.\d+$/.test(v))
  assert.deepEqual(loose, [], 'toate versiunile trebuie fixate exact')
  assert.match(pkg.packageManager, /^pnpm@10\./)
})

test('fiecare migrație este înregistrată în index și are snapshot JSON', () => {
  const dir = join(root, 'src/migrations')
  const index = read('src/migrations/index.ts')
  const names = readdirSync(dir).filter((f) => /^\d{8}_\d{6}_.+\.ts$/.test(f)).map((f) => f.slice(0, -3))
  assert.ok(names.length >= 1)
  for (const n of names) {
    assert.ok(index.includes(`name: '${n}'`), `migrația ${n} nu e în index.ts`)
    assert.ok(existsSync(join(dir, `${n}.json`)), `lipsește snapshotul ${n}.json`)
  }
  const registered = [...index.matchAll(/name: '([^']+)'/g)].map((m) => m[1])
  assert.deepEqual(registered, [...names].sort())
})

test('fără .env în copie; cheile secrete din .env.example sunt goale', () => {
  assert.equal(existsSync(join(root, '.env')), false)
  const env = read('.env.example')
  for (const key of ['PAYLOAD_SECRET', 'CONTACT_HASH_SECRET', 'SMTP_PASS', 'SEED_ADMIN_PASSWORD']) {
    const line = env.split(/\r?\n/).find((l) => l.startsWith(`${key}=`))
    assert.ok(line, `lipsește ${key} din .env.example`)
    assert.equal(line.slice(key.length + 1).trim(), '', `${key} trebuie să fie gol`)
  }
  assert.match(read('.gitignore'), /^\.env$/m)
})

test('rutele din src/lib/i18n/routes.ts corespund fișierelor page.tsx', async () => {
  const { pagePath, articlePath } = await importTs(join(root, 'src/lib/i18n/routes.ts'))
  const { locales, pageKeys } = await importTs(join(root, 'src/lib/i18n/config.ts'))
  const app = join(root, 'src/app/(frontend)')
  const expected = new Set()
  for (const locale of locales) {
    for (const key of pageKeys) {
      const file = join(app, pagePath(locale, key), 'page.tsx')
      assert.ok(existsSync(file), `lipsește ${relative(root, file)}`)
      expected.add(file)
    }
    const article = join(app, dirname(articlePath(locale, 'x')), '[slug]', 'page.tsx')
    assert.ok(existsSync(article), `lipsește ${relative(root, article)}`)
    expected.add(article)
  }
  const walk = (d) => readdirSync(d).flatMap((f) => {
    const p = join(d, f)
    return statSync(p).isDirectory() ? walk(p) : f === 'page.tsx' ? [p] : []
  })
  const orphans = walk(app).filter((p) => !expected.has(p)).map((p) => relative(root, p))
  assert.deepEqual(orphans, [])
})

test('slugify elimină diacriticele românești și produce sluguri valide', async () => {
  const { slugify, slugPattern } = await importTs(join(root, 'src/lib/slug.ts'))
  assert.equal(slugify('Pregătire și progres'), 'pregatire-si-progres')
  assert.equal(slugify('Ţintă, Şut, Înălțime, Ață'), 'tinta-sut-inaltime-ata')
  assert.match(slugify('2026 — sezonul pe zgură'), slugPattern)
})
