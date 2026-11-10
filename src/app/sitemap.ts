import type { MetadataRoute } from 'next'
import { locales, type Locale, type PageKey } from '@/lib/i18n/config'
import { articlePath, pagePath } from '@/lib/i18n/routes'
import { getAvailability, getPage, isLocaleEnabled } from '@/lib/content'
import { legalPageKeys } from '@/lib/i18n/config'
import { getPublishedArticles, getPublishedTranslation } from '@/features/journal/queries'
import { absoluteUrl } from '@/lib/seo/site'

export const revalidate = 3600

/** Numai pagini publice și traduceri publicate. Preview-ul și administrarea nu apar. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  const availability = Object.fromEntries(await Promise.all(locales.map(async (l) => [l, await getAvailability(l)] as const))) as Record<
    Locale,
    Record<PageKey, boolean>
  >
  for (const locale of locales) {
    if (!(await isLocaleEnabled(locale))) continue
    const other: Locale = locale === 'ro' ? 'en' : 'ro'
    for (const key of Object.keys(availability[locale]) as PageKey[]) {
      if (!availability[locale][key]) continue
      const languages = availability[other][key] ? { [locale]: absoluteUrl(pagePath(locale, key)), [other]: absoluteUrl(pagePath(other, key)) } : undefined
      // Data ultimei modificări: din CMS pentru paginile editoriale (paginile legale sunt generate din cod).
      const page = (legalPageKeys as readonly string[]).includes(key) || key === 'contact' ? null : await getPage(key, locale)
      entries.push({ url: absoluteUrl(pagePath(locale, key)), lastModified: page?.updatedAt, alternates: languages ? { languages } : undefined })
    }
    for (const article of await getPublishedArticles(locale, 1000)) {
      if (!article.slug || article.seo?.noindex) continue
      const translation = (await isLocaleEnabled(other)) ? await getPublishedTranslation(article, other) : null
      entries.push({
        url: absoluteUrl(articlePath(locale, article.slug)),
        lastModified: article.updatedAt,
        alternates: translation?.slug
          ? { languages: { [locale]: absoluteUrl(articlePath(locale, article.slug)), [other]: absoluteUrl(articlePath(other, translation.slug)) } }
          : undefined,
      })
    }
  }
  return entries
}
