import Image from 'next/image'
import type { Media } from '@/payload-types'
import { hasPublicImage, mediaSrc } from '@/lib/media'

export { hasPublicImage } from '@/lib/media'

type Props = {
  media: Media | number | string | null | undefined
  sizes: string
  priority?: boolean
  className?: string
  fill?: boolean
  locale?: string
}

/** Imagine responsivă din Payload. Folosește numai imagini (nu video) cu drepturi verificate. */
export function MediaImage({ media, sizes, priority, className, fill }: Props) {
  if (!hasPublicImage(media) || !media.url) return null
  const alt = media.alt ?? ''
  if (fill) {
    return (
      <Image
        src={mediaSrc(media.url)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={{ objectPosition: `${media.focalX ?? 50}% ${media.focalY ?? 50}%`, objectFit: 'cover' }}
      />
    )
  }
  return (
    <Image src={mediaSrc(media.url)} alt={alt} width={media.width ?? 1600} height={media.height ?? 1000} sizes={sizes} priority={priority} className={className} />
  )
}

