import type { Locale, PageKey } from './config'

const segments: Record<Locale, Record<PageKey, string>> = {
  ro: {
    home: '',
    about: 'despre',
    coaching: 'antrenamente',
    journal: 'jurnal',
    contact: 'contact',
    privacy: 'confidentialitate',
    cookies: 'cookies',
    terms: 'termeni',
  },
  en: {
    home: '',
    about: 'about',
    coaching: 'coaching',
    journal: 'journal',
    contact: 'contact',
    privacy: 'privacy',
    cookies: 'cookies',
    terms: 'terms',
  },
}

/** Calea publică a unei pagini, de ex. `pagePath('ro', 'about')` → `/ro/despre`. */
export function pagePath(locale: Locale, key: PageKey): string {
  const segment = segments[locale][key]
  return segment ? `/${locale}/${segment}` : `/${locale}`
}

export function articlePath(locale: Locale, slug: string): string {
  return `${pagePath(locale, 'journal')}/${slug}`
}

/** Găsește cheia paginii pentru un pathname public (fără articole). */
export function pageKeyFromPath(pathname: string): { locale: Locale; key: PageKey } | null {
  for (const locale of Object.keys(segments) as Locale[]) {
    for (const key of Object.keys(segments[locale]) as PageKey[]) {
      if (pathname === pagePath(locale, key)) return { locale, key }
    }
  }
  return null
}
