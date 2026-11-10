import { randomUUID } from 'crypto'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { lexical } from '../../scripts/lexical'
import { migrations } from '@/migrations'

let instance: Payload | null = null

export async function testPayload(): Promise<Payload> {
  if (instance) return instance
  instance = await getPayload({ config })
  await instance.db.migrate({ migrations: migrations as never })
  return instance
}

const tables = ['articles', 'article_sources', 'contact_requests', 'pages', 'coaching_services', 'categories', 'admin_users']

export async function resetDb(payload: Payload) {
  const db = payload.db as unknown as { drizzle: { execute: (q: string) => Promise<unknown> } }
  await db.drizzle.execute(`TRUNCATE ${tables.map((t) => `"${t}"`).join(', ')}, "_articles_v", "_pages_v" RESTART IDENTITY CASCADE`)
}

export const ctx = { disableRevalidate: true }

export function articleData(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Articol de test',
    language: 'ro' as const,
    translationGroup: randomUUID(),
    authorName: 'Daniel Popescu',
    excerpt: 'Rezumat de test.',
    content: lexical(['Conținut de test.']),
    workflow: 'draft' as const,
    ...overrides,
  }
}

export async function createEditor(payload: Payload) {
  return payload.create({
    collection: 'admin-users',
    overrideAccess: true,
    context: ctx,
    data: { email: `editor-${randomUUID()}@example.test`, password: 'test-password-123', roles: ['editor'] },
  })
}
