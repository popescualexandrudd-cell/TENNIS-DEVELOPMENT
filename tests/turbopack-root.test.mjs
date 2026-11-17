// Regresie: build-ul Turbopack eșua când node_modules era un symlink în afara aplicației
// („Could not find the Next.js package (next/package.json)”). Rulare: node --test "tests/**/*.test.mjs"
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, realpathSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { importTs } from './helpers/import-ts.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { resolveTurbopackRoot, commonAncestor } = await importTs(join(root, 'src/lib/turbopack-root.ts'))

const fakeNext = (nodeModules) => {
  mkdirSync(join(nodeModules, 'next'), { recursive: true })
  writeFileSync(join(nodeModules, 'next', 'package.json'), '{"name":"next","version":"0.0.0"}')
}
const fakeApp = (dir) => {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'package.json'), '{"name":"app"}')
}
const withTmp = (fn) => {
  const tmp = realpathSync(mkdtempSync(join(tmpdir(), 'turbopack-root-')))
  try { fn(tmp) } finally { rmSync(tmp, { recursive: true, force: true }) }
}

test('next instalat local în aplicație: rădăcina rămâne directorul aplicației', () => {
  withTmp((tmp) => {
    const app = join(tmp, 'work', 'app')
    fakeApp(app)
    fakeNext(join(app, 'node_modules'))
    assert.equal(resolveTurbopackRoot(app), app)
  })
})

test('node_modules simlinkat în afara aplicației: rădăcina include pachetul next real', () => {
  withTmp((tmp) => {
    const app = join(tmp, 'work', 'app')
    const shared = join(tmp, 'shared', 'node_modules')
    fakeApp(app)
    fakeNext(shared)
    symlinkSync(shared, join(app, 'node_modules'), 'dir')
    const result = resolveTurbopackRoot(app)
    assert.equal(result, tmp)
    assert.ok(realpathSync(join(app, 'node_modules', 'next')).startsWith(result))
  })
})

test('next lipsă: se păstrează directorul aplicației', () => {
  withTmp((tmp) => {
    const app = join(tmp, 'app')
    fakeApp(app)
    assert.equal(resolveTurbopackRoot(app), app)
  })
})

test('commonAncestor găsește directorul comun', () => {
  assert.equal(commonAncestor('/work/app', '/opt/shared/node_modules/next'), '/')
  assert.equal(commonAncestor('/a/b/app', '/a/b/c/next'), '/a/b')
  assert.equal(commonAncestor('/a/b', '/a/b'), '/a/b')
})

test('next.config.ts folosește resolveTurbopackRoot, nu o rădăcină fixată pe aplicație', () => {
  const config = readFileSync(join(root, 'next.config.ts'), 'utf8')
  assert.match(config, /import \{ resolveTurbopackRoot \} from '\.\/src\/lib\/turbopack-root'/)
  assert.match(config, /turbopack:\s*\{\s*root:\s*resolveTurbopackRoot\(dirname\)\s*\}/)
  assert.doesNotMatch(config, /root:\s*path\.resolve\(dirname\)/)
})
