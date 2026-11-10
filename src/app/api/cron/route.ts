import { timingSafeEqual } from 'crypto'
import config from '@payload-config'
import { getPayload } from 'payload'
import { runAutomations } from '@/features/automation/tasks'

/**
 * Punctul de intrare al automatizărilor (decizia 0017). Apelat de cron-ul serverului la 15 minute:
 *   curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://domeniu/api/cron
 * Fără CRON_SECRET configurat, endpoint-ul este oprit (404).
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 24) return new Response('Not found', { status: 404 })
  const given = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  const a = Buffer.from(given)
  const b = Buffer.from(secret)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ ok: false }, { status: 401 })
  const payload = await getPayload({ config })
  const force = new URL(request.url).searchParams.get('daily') === '1'
  const result = await runAutomations(payload, new Date(), { forceDaily: force })
  return Response.json({ ok: true, result }, { headers: { 'Cache-Control': 'no-store' } })
}
