// Import robust pentru surse `.ts` în node:test, fără dependențe.
// Încearcă importul nativ (Node elimină tipurile). Dacă type-stripping-ul (Wasm) nu poate porni
// sub o limită de memorie virtuală (`WebAssembly.Instance(): Out of memory`), elimină tipurile
// într-un proces copil cu `--disable-wasm-trap-handler` și importă un `.mjs` temporar.
// Importurile relative către alte fișiere `.ts` sunt convertite recursiv.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const isWasmOom = (err) => err instanceof RangeError && /WebAssembly\.Instance\(\): Out of memory/.test(String(err?.message))

const childScript = `
const { stripTypeScriptTypes } = require('node:module')
const { readFileSync } = require('node:fs')
const out = {}
for (const f of JSON.parse(process.argv[1])) out[f] = stripTypeScriptTypes(readFileSync(f, 'utf8'))
process.stdout.write(JSON.stringify(out))
`

const relSpec = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]+)\2/g

function resolveTs(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec)
  for (const c of [base, `${base}.ts`, join(base, 'index.ts')]) {
    if (c.endsWith('.ts') && existsSync(c)) return c
  }
  return null
}

function stripInChild(files) {
  const r = spawnSync(process.execPath, ['--disable-wasm-trap-handler', '-e', childScript, JSON.stringify(files)], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  if (r.status !== 0) throw new Error(`importTs: eliminarea tipurilor a eșuat: ${r.stderr || r.error}`)
  return JSON.parse(r.stdout)
}

async function importViaChild(absPath) {
  const outDir = mkdtempSync(join(tmpdir(), 'import-ts-'))
  const root = dirname(absPath)
  const done = new Map() // .ts absolut -> .mjs absolut
  let pending = [absPath]
  while (pending.length) {
    const stripped = stripInChild(pending)
    const next = []
    for (const file of pending) {
      const target = join(outDir, relative(root, file).replaceAll('..', '__')).replace(/\.ts$/, '.mjs')
      done.set(file, target)
      const code = stripped[file].replace(relSpec, (m, pre, q, spec) => {
        const dep = resolveTs(file, spec)
        if (!dep) return m
        if (!done.has(dep) && !next.includes(dep) && !pending.includes(dep)) next.push(dep)
        const depTarget = join(outDir, relative(root, dep).replaceAll('..', '__')).replace(/\.ts$/, '.mjs')
        let rel = relative(dirname(target), depTarget)
        if (!rel.startsWith('.')) rel = `./${rel}`
        return `${pre}${q}${rel}${q}`
      })
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, code)
    }
    pending = next
  }
  return import(pathToFileURL(done.get(absPath)).href)
}

export async function importTs(absPath) {
  try {
    return await import(pathToFileURL(absPath).href)
  } catch (err) {
    if (!isWasmOom(err)) throw err
    return importViaChild(absPath)
  }
}
