import { getSiteSettings } from '@/lib/content'
import { absoluteUrl } from '@/lib/seo/site'

export const revalidate = 86400

/** RFC 9116: unde se raportează o problemă de securitate. Apare doar dacă există un email configurat. */
export async function GET() {
  const settings = await getSiteSettings('ro')
  const email = settings.legal?.privacyEmail || settings.email
  if (!email) return new Response('Not found', { status: 404 })
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  const body = [`Contact: mailto:${email}`, `Expires: ${expires}`, 'Preferred-Languages: ro, en', `Canonical: ${absoluteUrl('/.well-known/security.txt')}`, ''].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } })
}
