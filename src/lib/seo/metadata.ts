import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { stillImage } from '@/lib/media'
import { absoluteUrl } from './site'

type Input = {
  locale: Locale
  path: string
  title: string
  description?: string | null
  image?: Media | number | string | null
  /** Căi pentru traducerile PUBLICATE (hreflang). Nu include limbi indisponibile. */
  alternates?: Partial<Record<Locale, string>>
  noindex?: boolean | null
  type?: 'website' | 'article'
  publishedTime?: string | null
  modifiedTime?: string | null
  siteName?: string
}

export function buildMetadata(input: Input): Metadata {
  const url = absoluteUrl(input.path)
  const languages: Record<string, string> = {}
  const alternates = { [input.locale]: input.path, ...input.alternates }
  if (Object.keys(alternates).length > 1) {
    for (const [lang, path] of Object.entries(alternates)) if (path) languages[lang] = absoluteUrl(path)
    if (alternates.ro) languages['x-default'] = absoluteUrl(alternates.ro)
  }
  // Open Graph: fotografia, sau imaginea de previzualizare dacă media principală e un clip video.
  const image = stillImage(input.image)
  return {
    title: input.title,
    description: input.description ?? undefined,
    alternates: { canonical: url, languages: Object.keys(languages).length ? languages : undefined },
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? 'website',
      url,
      title: input.title,
      description: input.description ?? undefined,
      siteName: input.siteName ?? 'Daniel Popescu',
      locale: input.locale === 'ro' ? 'ro_RO' : 'en_GB',
      images: image ? [{ url: absoluteUrl(image.sizes?.large?.url ?? image.url!), alt: image.alt ?? '' }] : undefined,
      ...(input.type === 'article'
        ? { publishedTime: input.publishedTime ?? undefined, modifiedTime: input.modifiedTime ?? undefined }
        : {}),
    },
  }
}
