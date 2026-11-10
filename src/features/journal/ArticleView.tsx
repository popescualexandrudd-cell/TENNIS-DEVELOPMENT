import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { CoachingService } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { articlePath, pagePath } from '@/lib/i18n/routes'
import { formatDate } from '@/lib/format'
import { buildMetadata } from '@/lib/seo/metadata'
import { articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data'
import { isLocaleEnabled } from '@/lib/content'
import { hasPublicImage, MediaImage } from '@/components/MediaImage'
import { RichText } from '@/components/RichText'
import { JsonLd } from '@/components/JsonLd'
import { SetAlternate } from '@/components/AlternateLocale'
import { findArticleByPreviousSlug, getArticle, getPublicSources, getPublishedTranslation } from './queries'
import { getPreviewUser } from './preview'

const other = (l: Locale): Locale => (l === 'ro' ? 'en' : 'ro')

async function loadArticle(locale: Locale, slug: string) {
  if (!(await isLocaleEnabled(locale))) return { article: null, preview: false }
  const user = await getPreviewUser()
  const article = await getArticle(locale, slug, { draft: Boolean(user), user })
  return { article, preview: Boolean(user) }
}

export async function articleMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const { article, preview } = await loadArticle(locale, slug)
  if (!article) return {}
  const translation = (await isLocaleEnabled(other(locale))) ? await getPublishedTranslation(article, other(locale)) : null
  return buildMetadata({
    locale,
    path: articlePath(locale, article.slug!),
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt,
    image: article.seo?.image || article.coverImage,
    alternates: translation?.slug ? { [other(locale)]: articlePath(other(locale), translation.slug) } : {},
    noindex: preview || article.seo?.noindex,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
  })
}

export async function ArticleView({ locale, slug }: { locale: Locale; slug: string }) {
  const { article, preview } = await loadArticle(locale, slug)
  if (!article) {
    const moved = await findArticleByPreviousSlug(locale, slug)
    if (moved?.slug) permanentRedirect(articlePath(locale, moved.slug))
    notFound()
  }
  const t = getDictionary(locale)
  const [sources, translation] = await Promise.all([
    getPublicSources(article.id),
    (await isLocaleEnabled(other(locale))) ? getPublishedTranslation(article, other(locale)) : null,
  ])
  const category = article.category && typeof article.category === 'object' ? article.category.name : null
  const services = (article.relatedServices ?? []).filter((s): s is CoachingService => typeof s === 'object' && Boolean(s?.confirmed))

  return (
    <article>
      {preview ? (
        <div className="bg-coral text-ink">
          <p className="container-site py-2 text-sm font-semibold">
            Preview privat — {article._status === 'published' ? 'versiune cu posibile modificări nepublicate' : 'draft nepublicat'}.{' '}
            {/* Rută API care șterge cookie-ul de preview; nu e navigare client-side. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/exit-preview" className="underline">
              Ieși din preview
            </a>
          </p>
        </div>
      ) : null}
      <SetAlternate href={translation?.slug ? articlePath(other(locale), translation.slug) : null} />
      <header className="container-site pt-10 lg:pt-20">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href={pagePath(locale, 'journal')} className="underline">
                {t.journal.title}
              </Link>
            </li>
            {category ? (
              <li aria-hidden="true" className="before:content-['/']">
                {' '}
              </li>
            ) : null}
            {category ? <li>{category}</li> : null}
          </ol>
        </nav>
        <h1 className="mt-5 max-w-[22ch] text-[clamp(2.125rem,1.6rem+2.4vw,3.75rem)] font-bold">{article.title}</h1>
        <p className="mt-5 max-w-[42rem] text-lg text-muted lg:text-xl">{article.excerpt}</p>
        <p className="mt-6 text-sm text-muted">
          {t.journal.by} {article.authorName}
          {article.publishedAt ? (
            <>
              {' · '}
              {t.journal.publishedOn} <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
            </>
          ) : null}
        </p>
      </header>
      {hasPublicImage(article.coverImage) ? (
        <div className="container-site mt-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md">
            <MediaImage media={article.coverImage} fill priority sizes="(min-width: 1240px) 1240px, 100vw" />
          </div>
        </div>
      ) : null}
      <div className="container-site section !pt-12">
        <RichText data={article.content} className="prose-article" />

        {sources.length > 0 ? (
          <section className="mt-14 max-w-[68ch] border-t border-line pt-6" aria-labelledby="h-sources">
            <h2 id="h-sources" className="text-lg font-bold">
              {t.journal.sources}
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
              {sources.map((s) => (
                <li key={s.id}>
                  <a href={s.url} rel="noopener nofollow" target="_blank" className="underline">
                    {s.title}
                  </a>
                  {s.publisher ? ` — ${s.publisher}` : ''}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {services.length > 0 ? (
          <aside className="mt-14 max-w-[68ch] rounded-md bg-surface p-6">
            <p className="font-display text-lg font-bold">{t.journal.relatedCoaching}</p>
            <ul className="mt-2">
              {services.map((s) => (
                <li key={s.id}>{s.title}</li>
              ))}
            </ul>
            <Link href={pagePath(locale, 'contact')} className="btn btn-primary mt-5 plausible-event-name=cta_contact_click">
              {t.cta.primary}
            </Link>
          </aside>
        ) : null}
      </div>
      {!preview ? (
        <JsonLd
          data={[
            articleSchema(article, locale),
            breadcrumbSchema([
              { name: t.breadcrumbHome, path: pagePath(locale, 'home') },
              { name: t.journal.title, path: pagePath(locale, 'journal') },
              { name: article.title, path: articlePath(locale, article.slug!) },
            ]),
          ]}
        />
      ) : null}
    </article>
  )
}
