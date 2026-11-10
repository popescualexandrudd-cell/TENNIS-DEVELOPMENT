import 'server-only'
import { cache } from 'react'
import type { Article, ArticleSource } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { getPayloadClient } from '@/lib/payload'

type Draft = { draft?: boolean }

/** Articole publicate într-o limbă. Accesul public este impus prin `overrideAccess: false`. */
export const getPublishedArticles = cache(async (locale: Locale, limit = 24): Promise<Article[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    overrideAccess: false,
    where: { and: [{ language: { equals: locale } }, { _status: { equals: 'published' } }] },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
  return docs
})

export const countPublishedArticles = cache(async (locale: Locale): Promise<number> => {
  const payload = await getPayloadClient()
  const { totalDocs } = await payload.count({
    collection: 'articles',
    overrideAccess: false,
    where: { and: [{ language: { equals: locale } }, { _status: { equals: 'published' } }] },
  })
  return totalDocs
})

/**
 * Un articol după slug. În modul preview (draftMode + utilizator autentificat) se citește ultima versiune,
 * inclusiv modificările nepublicate; altfel numai versiunea publicată.
 */
export const getArticle = cache(
  async (locale: Locale, slug: string, { draft = false, user }: Draft & { user?: unknown } = {}): Promise<Article | null> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'articles',
      overrideAccess: false,
      user: draft ? (user as never) : undefined,
      draft,
      where: draft
        ? { and: [{ language: { equals: locale } }, { slug: { equals: slug } }] }
        : { and: [{ language: { equals: locale } }, { slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      limit: 1,
      depth: 2,
    })
    return docs[0] ?? null
  },
)

/** Caută un articol publicat după un slug vechi, pentru redirect permanent. */
export const findArticleByPreviousSlug = cache(async (locale: Locale, slug: string): Promise<Article | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    overrideAccess: false,
    where: {
      and: [{ language: { equals: locale } }, { 'previousSlugs.slug': { equals: slug } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
})

/** Traducerea publicată a unui articol (același grup de traducere, altă limbă). */
export const getPublishedTranslation = cache(async (article: Pick<Article, 'translationGroup' | 'id'>, locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    overrideAccess: false,
    where: {
      and: [
        { translationGroup: { equals: article.translationGroup } },
        { language: { equals: locale } },
        { _status: { equals: 'published' } },
        { id: { not_equals: article.id } },
      ],
    },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
})

/**
 * Sursele afișabile ale unui articol. Colecția nu este publică; o citim pe server numai după ce
 * articolul a fost deja obținut prin regulile publice (sau preview autentificat).
 */
export const getPublicSources = cache(async (articleId: Article['id']): Promise<ArticleSource[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'article-sources',
    overrideAccess: true,
    where: { and: [{ article: { equals: articleId } }, { showPublicly: { equals: true } }] },
    sort: 'createdAt',
    limit: 50,
    depth: 0,
  })
  return docs
})
