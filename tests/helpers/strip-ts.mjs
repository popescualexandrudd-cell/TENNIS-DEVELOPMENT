// Proces copil pentru importTs(): citește TypeScript din stdin și scrie JavaScript (tipuri eliminate) la stdout.
// Rulat cu --disable-wasm-trap-handler, ca amaro (Wasm) să poată aloca memorie sub `ulimit -v`.
import { stripTypeScriptTypes } from 'node:module'

let src = ''
process.stdin.setEncoding('utf8')
for await (const chunk of process.stdin) src += chunk
process.stdout.write(stripTypeScriptTypes(src, { mode: 'strip' }))
