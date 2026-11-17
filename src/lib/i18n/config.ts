export const locales = ['ro', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ro'

/**
 * Limbile afișate în selectorul din header (decizia 0016), în ordinea afișării.
 * Toate sunt selectabile. Doar cele din `locales` au rute și conținut propriu; celelalte duc la pagina
 * echivalentă în limba de rezervă (`fallbackLocale`) până primesc arbore de rute, dicționar și conținut
 * tradus și verificat (fără traduceri automate/inventate).
 */
export const siteLanguages = [
  { code: 'ro', label: 'Română' },
  { code: 'en', label: 'English' },
  { code: 'uk', label: 'Українська' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
] as const
export type SiteLanguageCode = (typeof siteLanguages)[number]['code']

/**
 * Limba publică în care se deschide o limbă din selector fără versiune proprie: engleza (limba internațională)
 * când este publică, altfel româna. `other` = cealaltă limbă publică, `null` dacă nu există.
 */
export function fallbackLocale(current: Locale, other: { locale: Locale } | null): Locale {
  if (current === 'en' || other?.locale === 'en') return 'en'
  return 'ro'
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Cheile paginilor publice. Slugurile sunt localizate în `routes.ts`. */
export const pageKeys = ['home', 'about', 'coaching', 'journal', 'contact', 'privacy', 'cookies', 'terms'] as const
/** Paginile legale sunt generate din cod + Setări site → Date legale (decizia 0013), nu din colecția Pages. */
export const legalPageKeys = ['privacy', 'cookies', 'terms'] as const
export type LegalPageKey = (typeof legalPageKeys)[number]
export type PageKey = (typeof pageKeys)[number]
