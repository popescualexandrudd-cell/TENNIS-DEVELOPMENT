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
 * Limitare în stocarea comună (PostgreSQL): numără trimiterile recente cu același hash IP (contact sau păreri).
 * Funcționează consecvent și cu mai multe instanțe ale aplicației.
 */
export async function isRateLimited(
  payload: Payload,
  ipHash: string,
  now = new Date(),
  { collection = 'contact-requests', windowMs = RATE_LIMIT.windowMs, max = RATE_LIMIT.max }: { collection?: 'contact-requests' | 'testimonials'; windowMs?: number; max?: number } = {},
): Promise<boolean> {
  const since = new Date(now.getTime() - windowMs).toISOString()
  const { totalDocs } = await payload.count({
    collection,
    overrideAccess: true,
    where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since } }] },
  })
  return totalDocs >= max
}
