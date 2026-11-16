// Rădăcina Turbopack trebuie să conțină și pachetul `next` rezolvat real (realpath).
// Când `node_modules` este un symlink către un director partajat din afara aplicației,
// o rădăcină fixată pe directorul aplicației face build-ul să eșueze cu
// „Could not find the Next.js package (next/package.json)”.
import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const isInside = (parent: string, child: string): boolean => {
  const rel = path.relative(parent, child)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

/** Cel mai apropiat director comun; `null` dacă rădăcinile diferă (ex. drive-uri Windows diferite). */
export function commonAncestor(a: string, b: string): string | null {
  const from = path.resolve(a)
  const to = path.resolve(b)
  if (path.parse(from).root !== path.parse(to).root) return null
  let dir = from
  while (!isInside(dir, to)) {
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
  return dir
}

/**
 * Returnează directorul aplicației (comportamentul implicit) dacă `next` se află fizic în el;
 * altfel cel mai apropiat director comun dintre aplicație și pachetul `next`.
 */
export function resolveTurbopackRoot(appDir: string): string {
  const app = path.resolve(appDir)
  let realApp: string
  let nextDir: string
  try {
    realApp = realpathSync(app)
    const require = createRequire(path.join(realApp, 'package.json'))
    nextDir = path.dirname(realpathSync(require.resolve('next/package.json')))
  } catch {
    return app
  }
  if (isInside(realApp, nextDir)) return app
  return commonAncestor(realApp, nextDir) ?? app
}
