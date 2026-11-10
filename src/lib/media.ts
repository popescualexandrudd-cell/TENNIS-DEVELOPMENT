import type { Media } from '@/payload-types'

export type MediaRef = Media | number | string | null | undefined

/**
 * Payload întoarce URL-uri absolute (cu serverURL); optimizatorul next/image acceptă fișierele locale doar ca
 * cale relativă (`images.localPatterns`). Fișierele din `/api/media/file/` devin deci relative; restul rămân neschimbate.
 */
export function mediaSrc(url: string): string {
  try {
    const u = new URL(url, 'http://local')
    return u.pathname.startsWith('/api/media/file/') ? u.pathname + u.search : url
  } catch {
    return url
  }
}

export function isVideo(media: Media): boolean {
  return typeof media.mimeType === 'string' && media.mimeType.startsWith('video/')
}

/** Imagine (nu video) cu URL și drepturi verificate. */
export function hasPublicImage(media: MediaRef): media is Media {
  return Boolean(media && typeof media === 'object' && media.url && media.rights !== 'unverified' && !isVideo(media))
}

/** Fotografie publică, sau clip video public cu imagine de previzualizare publică. */
export function hasPublicMedia(media: MediaRef): media is Media {
  if (!media || typeof media !== 'object' || !media.url || media.rights === 'unverified') return false
  return isVideo(media) ? hasPublicImage(media.poster) : true
}

/** Imaginea statică a unei media publice: fotografia însăși sau imaginea de previzualizare a clipului. */
export function stillImage(media: MediaRef): Media | null {
  if (!hasPublicMedia(media)) return null
  return isVideo(media) ? (media.poster as Media) : media
}
