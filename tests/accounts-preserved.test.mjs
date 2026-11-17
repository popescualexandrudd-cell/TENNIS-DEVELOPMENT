// Regresie: conturile de administrare (colecția Payload `admin-users`) și restul structurii CMS
// trebuie să rămână la fel când se schimbă designul/structura site-ului public.
// Fără dependențe: doar node:fs/node:path; access.ts este importat direct (doar `import type`).
// Rulare: node --test "tests/**/*.test.mjs"
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { importTs } from './helpers/import-ts.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const migDir = join(root, 'src/migrations')
const migrations = readdirSync(migDir).filter((f) => /^\d{8}_\d{6}_.+\.ts$/.test(f)).sort()
const ACCOUNT_TABLES = ['public.admin_users', 'public.admin_users_roles', 'public.admin_users_sessions']

test('schema conturilor este identică în toate snapshoturile de migrație', () => {
  const snaps = migrations.map((f) => JSON.parse(readFileSync(join(migDir, f.replace(/\.ts$/, '.json')), 'utf8')))
  const pick = (s) => Object.fromEntries(ACCOUNT_TABLES.map((t) => [t, s.tables[t]]))
  const first = pick(snaps[0])
  for (const t of ACCOUNT_TABLES) assert.ok(first[t], `lipsește ${t} din snapshotul inițial`)
  for (const col of ['email', 'hash', 'salt', 'login_attempts', 'lock_until', 'reset_password_token', 'reset_password_expiration']) {
    assert.ok(first['public.admin_users'].columns[col], `lipsește coloana admin_users.${col}`)
  }
  snaps.slice(1).forEach((s, i) => assert.deepEqual(pick(s), first, `schema conturilor diferă în ${migrations[i + 1]}`))
})

test('migrațiile ulterioare celei inițiale nu modifică tabelele conturilor', () => {
  for (const f of migrations.slice(1)) {
    assert.doesNotMatch(readFileSync(join(migDir, f), 'utf8'), /admin_users/, `${f} atinge admin_users`)
  }
})

test('configurația de autentificare a conturilor este păstrată', () => {
  const src = read('src/cms/collections/AdminUsers.ts')
  for (const re of [
    /slug: 'admin-users'/,
    /tokenExpiration: 60 \* 60 \* 8/,
    /maxLoginAttempts: 5/,
    /lockTime: 15 \* 60 \* 1000/,
    /sameSite: 'Lax'/,
    /secure: process\.env\.NODE_ENV === 'production'/,
    /read: isAdminOrSelf/, /create: isAdmin,/, /update: isAdminOrSelf/, /delete: isAdmin,/,
    /if \(totalDocs === 0\) return \{ \.\.\.data, roles: \['admin'\] \}/,
    /defaultValue: \['editor'\]/,
    /saveToJWT: true/,
    /access: \{ create: isAdminField, update: isAdminField \}/,
    /value: 'admin'/, /value: 'editor'/,
  ]) assert.match(src, re)
})

test('Payload folosește admin-users pentru /admin și păstrează toate colecțiile', () => {
  const cfg = read('src/payload.config.ts')
  assert.match(cfg, /user: AdminUsers\.slug/)
  assert.match(cfg, /collections: \[Pages, CoachingServices, Articles, Categories, ArticleSources, Media, ContactRequests, Testimonials, AdminUsers\]/)
  assert.match(cfg, /globals: \[SiteSettings\]/)
  assert.match(read('src/app/api/preview/route.ts'), /user\.collection !== 'admin-users'\) return new Response\('Unauthorized', \{ status: 401 \}\)/)
})

test('regulile de acces pentru conturi se comportă la fel', async () => {
  const a = await importTs(join(root, 'src/cms/access.ts'))
  const req = (user) => ({ req: { user } })
  const admin = { collection: 'admin-users', id: 1, roles: ['admin'] }
  const editor = { collection: 'admin-users', id: 2, roles: ['editor'] }
  const foreign = { collection: 'other', id: 3, roles: ['admin'] }

  assert.equal(a.isAdmin(req(admin)), true)
  assert.equal(a.isAdmin(req(editor)), false)
  assert.equal(a.isAdmin(req(foreign)), false)
  assert.equal(a.isAdmin(req(null)), false)

  assert.equal(a.isAdminOrSelf(req(admin)), true)
  assert.deepEqual(a.isAdminOrSelf(req(editor)), { id: { equals: 2 } })
  assert.equal(a.isAdminOrSelf(req(undefined)), false)

  assert.equal(a.isAuthenticated(req(editor)), true)
  assert.equal(a.isAuthenticated(req(foreign)), false)
  assert.equal(a.publishedOrAuthenticated(req(editor)), true)
  assert.deepEqual(a.publishedOrAuthenticated(req(null)), { _status: { equals: 'published' } })
  assert.equal(a.nobody(), false)
  assert.equal(a.anyone(), true)
})
