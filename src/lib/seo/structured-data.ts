import type { Article, SiteSetting } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { articlePath, pagePath } from '@/lib/i18n/routes'
import { absoluteUrl, siteUrl } from './site'

export function personSchema(settings: SiteSetting, locale: Locale) {
  const sameAs = (settings.social ?? []).map((s) => s.url).filter((u): u is string => Boolean(u?.startsWith('https://')))
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl()}/#person`,
    name: settings.personName || 'Daniel Popescu',
    url: absoluteUrl(pagePath(locale, 'about')),
    ...(settings.jobTitle ? { jobTitle: settings.jobTitle } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export function websiteSchema(settings: SiteSetting, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl()}/#website`,
    url: absoluteUrl(pagePath(locale, 'home')),
    name: settings.personName || 'Daniel Popescu',
    inLanguage: locale,
    publisher: { '@id': `${siteUrl()}/#person` },
  }
}

export function articleSchema(article: Article, locale: Locale) {
  const image = article.coverImage && typeof article.coverImage === 'object' && article.coverImage.url ? absoluteUrl(article.coverImage.url) : undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    inLanguage: locale,
    mainEntityOfPage: absoluteUrl(articlePath(locale, article.slug!)),
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt,
    author: { '@type': 'Person', name: article.authorName, '@id': `${siteUrl()}/#person` },
    ...(image ? { image } : {}),
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  }
}
