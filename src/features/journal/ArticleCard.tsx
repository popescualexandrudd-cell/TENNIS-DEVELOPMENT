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
      {hasPublicImage(article.coverImage) ? (
        <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-md bg-line">
          <MediaImage media={article.coverImage} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-[250ms] group-hover:scale-[1.02]" />
        </div>
      ) : null}
      <div className="flex items-center gap-3 text-sm text-muted">
        {category ? <span className="font-display font-bold tracking-wider text-coral-ink uppercase">{category}</span> : null}
        {article.publishedAt ? <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time> : null}
      </div>
      <H className="mt-2 text-[1.375rem] font-bold">
        <Link href={articlePath(locale, article.slug!)} className="text-ink no-underline after:absolute after:inset-0 hover:underline">
          {article.title}
        </Link>
      </H>
      <p className="mt-2 text-muted">{article.excerpt}</p>
    </article>
  )
}
