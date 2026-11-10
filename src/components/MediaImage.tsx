import Image from 'next/image'
import type { Media } from '@/payload-types'

type Props = {
  media: Media | number | string | null | undefined
  sizes: string
  priority?: boolean
  className?: string
  fill?: boolean
  locale?: string
}

/** Imagine responsivă din Payload. Folosește numai fișiere cu drepturi verificate. */
export function MediaImage({ media, sizes, priority, className, fill }: Props) {
  if (!media || typeof media !== 'object' || !media.url) return null
  if (media.rights === 'unverified') return null
  const alt = media.alt ?? ''
  if (fill) {
    return (
      <Image
        src={media.url}
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
    <Image src={media.url} alt={alt} width={media.width ?? 1600} height={media.height ?? 1000} sizes={sizes} priority={priority} className={className} />
  )
}

export function hasPublicImage(media: Props['media']): media is Media {
  return Boolean(media && typeof media === 'object' && media.url && media.rights !== 'unverified')
}
