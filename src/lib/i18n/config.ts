export const locales = ['ro', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ro'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Cheile paginilor publice. Slugurile sunt localizate în `routes.ts`. */
export const pageKeys = ['home', 'about', 'coaching', 'journal', 'contact', 'privacy', 'cookies', 'terms'] as const
/** Paginile legale sunt generate din cod + Setări site → Date legale (decizia 0013), nu din colecția Pages. */
export const legalPageKeys = ['privacy', 'cookies', 'terms'] as const
export type LegalPageKey = (typeof legalPageKeys)[number]
export type PageKey = (typeof pageKeys)[number]
