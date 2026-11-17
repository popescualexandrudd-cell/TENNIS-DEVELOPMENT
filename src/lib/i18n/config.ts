export const locales = ['ro', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ro'

/**
 * Limbile afișate în selectorul din header (decizia 0016), în ordinea afișării.
 * Doar cele din `locales` au rute și conținut; celelalte apar „în pregătire” până primesc
 * arbore de rute, dicționar și conținut tradus (fără traduceri automate/inventate).
 */
export const siteLanguages = [
  { code: 'ro', label: 'Română' },
  { code: 'en', label: 'English' },
  { code: 'uk', label: 'Українська' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
] as const
export type SiteLanguageCode = (typeof siteLanguages)[number]['code']

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Cheile paginilor publice. Slugurile sunt localizate în `routes.ts`. */
export const pageKeys = ['home', 'about', 'coaching', 'journal', 'contact', 'privacy', 'cookies', 'terms'] as const
/** Paginile legale sunt generate din cod + Setări site → Date legale (decizia 0013), nu din colecția Pages. */
export const legalPageKeys = ['privacy', 'cookies', 'terms'] as const
export type LegalPageKey = (typeof legalPageKeys)[number]
export type PageKey = (typeof pageKeys)[number]
