import { createHmac } from 'crypto'
import type { Payload } from 'payload'

export const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 3 } as const

/** Hash ireversibil al IP-ului (HMAC cu secret de server). IP-ul brut nu se salvează. */
export function hashIp(ip: string, secret: string): string {
  return createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32)
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * Limitare în stocarea comună (PostgreSQL): numără solicitările recente cu același hash IP.
 * Funcționează consecvent și cu mai multe instanțe ale aplicației.
 */
export async function isRateLimited(payload: Payload, ipHash: string, now = new Date()): Promise<boolean> {
  const since = new Date(now.getTime() - RATE_LIMIT.windowMs).toISOString()
  const { totalDocs } = await payload.count({
    collection: 'contact-requests',
    overrideAccess: true,
    where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since } }] },
  })
  return totalDocs >= RATE_LIMIT.max
}
