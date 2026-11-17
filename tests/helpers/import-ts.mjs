// Importă un fișier `.ts` din teste node:test, fără dependențe.
// 1. Încearcă importul nativ (Node ≥ 22.18 elimină tipurile).
// 2. Dacă eliminarea tipurilor pică cu „WebAssembly.Instance(): Out of memory” (limită de memorie virtuală,
//    ex. `ulimit -v` în sandbox), rulează `stripTypeScriptTypes` într-un proces copil cu
//    `--disable-wasm-trap-handler`, scrie `.mjs` temporare (inclusiv importurile relative `.ts`) și le importă.
// Astfel testele trec atât cu, cât și fără flag.
import { spawnSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const isWasmOom = (err) => err instanceof RangeError && /WebAssembly|Wasm/i.test(String(err.message))

// Rulat în procesul copil: transpilează fișierul și dependențele relative `.ts`, rescriind specificatorii.
const childScript = `
const { readFileSync, writeFileSync, existsSync } = require('node:fs')
const { dirname, resolve, join, basename } = require('node:path')
const { stripTypeScriptTypes } = require('node:module')
const [entry, outDir] = process.argv.slice(1)
const done = new Map()
let n = 0
function resolveTs(from, spec) {
  const base = resolve(dirname(from), spec)
  for (const c of [base, base + '.ts', join(base, 'index.ts')]) if (c.endsWith('.ts') && existsSync(c)) return c
  return null
}
function emit(file) {
  if (done.has(file)) return done.get(file)
  const out = join(outDir, (n++) + '-' + basename(file).replace(/\\.ts$/, '.mjs'))
  done.set(file, out)
  let code = stripTypeScriptTypes(readFileSync(file, 'utf8'), { mode: 'strip' })
  code = code.replace(/(from\\s*|import\\s*\\(\\s*|import\\s+)(['"])(\\.{1,2}\\/[^'"]+)\\2/g, (m, pre, q, spec) => {
    const ts = resolveTs(file, spec)
    return ts ? pre + q + 'file://' + emit(ts) + q : m
  })
  writeFileSync(out, code)
  return out
}
process.stdout.write(emit(resolve(entry)))
`

export async function importTs(absPath) {
  try {
    return await import(pathToFileURL(absPath).href)
  } catch (err) {
    if (!isWasmOom(err)) throw err
  }
  const outDir = mkdtempSync(join(tmpdir(), 'import-ts-'))
  const res = spawnSync(
    process.execPath,
    ['--disable-wasm-trap-handler', '--no-warnings', '-e', childScript, absPath, outDir],
    { encoding: 'utf8' },
  )
  if (res.status !== 0) throw new Error(`importTs: transpilare eșuată pentru ${absPath}\n${res.stderr}`)
  return import(pathToFileURL(res.stdout.trim()).href)
}
