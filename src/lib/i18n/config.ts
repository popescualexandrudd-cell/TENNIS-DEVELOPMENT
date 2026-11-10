export const locales = ['ro', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ro'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Cheile paginilor publice. Slugurile sunt localizate în `routes.ts`. */
export const pageKeys = ['home', 'about', 'coaching', 'journal', 'contact', 'privacy'] as const
export type PageKey = (typeof pageKeys)[number]
