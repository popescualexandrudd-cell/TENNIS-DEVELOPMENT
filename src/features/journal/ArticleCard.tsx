import Link from 'next/link'
import type { Article } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { articlePath } from '@/lib/i18n/routes'
import { hasPublicImage, MediaImage } from '@/components/MediaImage'
import { formatDate } from '@/lib/format'

export function ArticleCard({ article, locale, headingLevel = 'h3' }: { article: Article; locale: Locale; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const category = article.category && typeof article.category === 'object' ? article.category.name : null
  return (
    <article className="group relative flex flex-col">
      <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-md bg-soft">
        {hasPublicImage(article.coverImage) ? (
          <MediaImage
            media={article.coverImage}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-[250ms] group-hover:scale-[1.03]"
          />
        ) : (
          // Monogramă decorativă (SVG, nu text) când articolul nu are încă imagine
          <svg viewBox="0 0 64 64" className="absolute bottom-4 left-4 h-16 w-16 opacity-20" aria-hidden="true" focusable="false">
            <path d="M14 18h9.5c8 0 13 5.4 13 14s-5 14-13 14H14V18zm6 5.2v17.6h3.2c4.6 0 7.3-3.3 7.3-8.8s-2.7-8.8-7.3-8.8H20z" fill="#0F1B33" />
            <path d="M39 18h8.6c5.6 0 9 3 9 8.1s-3.4 8.2-9 8.2H45V46h-6V18zm6 5v6.4h2.3c2.2 0 3.3-1.1 3.3-3.2s-1.1-3.2-3.3-3.2H45z" fill="#0F1B33" />
          </svg>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        {category ? <span className="eyebrow eyebrow-coral !text-xs">{category}</span> : null}
        {article.publishedAt ? <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time> : null}
      </div>
      <H className="mt-2 text-[1.25rem] leading-[1.15] font-[800]">
        <Link href={articlePath(locale, article.slug!)} className="text-ink no-underline after:absolute after:inset-0 hover:underline">
          {article.title}
        </Link>
      </H>
      <p className="mt-2 text-muted">{article.excerpt}</p>
    </article>
  )
}
