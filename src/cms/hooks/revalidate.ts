import type { PayloadRequest } from 'payload'

/**
 * Invalidează cache-ul paginilor afectate de o modificare editorială.
 * Rulează numai în serverul Next.js; în scripturi (seed, migrații) este ignorat.
 */
export async function revalidatePaths(paths: string[], req?: PayloadRequest): Promise<void> {
  if (req?.context?.disableRevalidate) return
  const unique = [...new Set(paths)]
  try {
    const { revalidatePath } = await import('next/cache')
    for (const path of unique) revalidatePath(path)
    revalidatePath('/sitemap.xml')
  } catch (error) {
    req?.payload.logger.debug({ msg: 'revalidate skipped (not in Next.js runtime)', error })
  }
}

export async function revalidateWholeSite(req?: PayloadRequest): Promise<void> {
  if (req?.context?.disableRevalidate) return
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch (error) {
    req?.payload.logger.debug({ msg: 'revalidate skipped (not in Next.js runtime)', error })
  }
}
