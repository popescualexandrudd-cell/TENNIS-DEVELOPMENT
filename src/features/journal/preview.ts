import 'server-only'
import { draftMode, headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

/**
 * Preview privat: necesită AMBELE condiții — cookie-ul Next.js draftMode și o sesiune
 * validă de administrare. Cookie-ul singur nu oferă acces la drafturi.
 */
export async function getPreviewUser(): Promise<unknown | null> {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user && user.collection === 'admin-users' ? user : null
}
