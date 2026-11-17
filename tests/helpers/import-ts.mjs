// Import robust pentru fișiere `.ts` fără dependențe sub node:test.
// Node elimină tipurile cu amaro (Wasm); sub o limită de memorie virtuală (`ulimit -v`) instanțierea Wasm poate
// eșua cu „WebAssembly.Instance(): Out of memory”. Atunci eliminăm tipurile într-un proces copil cu
// --disable-wasm-trap-handler și importăm un `.mjs` temporar. Funcționează doar pentru module fără importuri
// relative la runtime (importurile `import type` sunt eliminate).
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const stripper = fileURLToPath(new URL('./strip-ts.mjs', import.meta.url))
const isWasmOom = (e) => /WebAssembly|Wasm/i.test(String(e?.message ?? e)) && /memory/i.test(String(e?.message ?? e))

export async function importTs(absPath) {
  try {
    return await import(pathToFileURL(absPath).href)
  } catch (e) {
    if (!isWasmOom(e)) throw e
  }
  const r = spawnSync(process.execPath, ['--disable-wasm-trap-handler', stripper], {
    input: readFileSync(absPath, 'utf8'),
    encoding: 'utf8',
  })
  if (r.status !== 0) throw new Error(`importTs: eliminarea tipurilor a eșuat pentru ${absPath}: ${r.stderr}`)
  const out = join(mkdtempSync(join(tmpdir(), 'import-ts-')), basename(absPath).replace(/\.ts$/, '.mjs'))
  writeFileSync(out, r.stdout)
  return import(pathToFileURL(out).href)
}
