import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { hasPublicMedia, isVideo, mediaSrc, type MediaRef } from '@/lib/media'
import { MediaImage } from './MediaImage'
import { LoopVideo } from './LoopVideo'

export { hasPublicMedia } from '@/lib/media'

/**
 * Media de secțiune care umple containerul (părintele trebuie să fie `relative`):
 * fotografie, sau imaginea de previzualizare + bucla video deasupra (vezi LoopVideo). Creditul, dacă există, apare în colț.
 */
export function SectionMedia({ media, sizes, locale, priority, className = '' }: { media: MediaRef; sizes: string; locale: Locale; priority?: boolean; className?: string }) {
  if (!hasPublicMedia(media)) return null
  const video = isVideo(media)
  const t = getDictionary(locale).video
  return (
    <div className={`absolute inset-0 ${className}`}>
      <MediaImage media={video ? media.poster : media} fill sizes={sizes} priority={priority} />
      {video && media.url ? <LoopVideo src={mediaSrc(media.url)} type={media.mimeType ?? 'video/mp4'} labels={t} /> : null}
      <MediaCredit credit={media.credit} />
    </div>
  )
}

/** Creditul rămâne vizibil: spune clar când e un material de bancă (nu o fotografie cu Daniel sau cu jucătorii lui). */
export function MediaCredit({ credit }: { credit?: string | null }) {
  if (!credit) return null
  return <small className="absolute top-3 right-3 z-10 rounded-full bg-black/65 px-2.5 py-1 text-[0.75rem] leading-none text-white">{credit}</small>
}
