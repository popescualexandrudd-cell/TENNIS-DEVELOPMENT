import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { articlePath } from '@/lib/i18n/routes'

/** Pornește preview-ul privat pentru un articol. Necesită sesiune de administrare validă. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (url.searchParams.get('collection') !== 'articles' || !id) return new Response('Bad request', { status: 400 })

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admin-users') return new Response('Unauthorized', { status: 401 })

  const article = await payload
    .findByID({ collection: 'articles', id, draft: true, overrideAccess: false, user, depth: 0 })
    .catch(() => null)
  if (!article?.slug || !article.language) return new Response('Not found', { status: 404 })

  ;(await draftMode()).enable()
  redirect(articlePath(article.language, article.slug))
}
