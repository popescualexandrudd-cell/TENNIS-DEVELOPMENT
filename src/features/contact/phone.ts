/* Fără zod: folosit și de formularul din browser. */

/** Prefixe oferite în formular (pasul 1). „other” = numărul se scrie complet, cu prefix. */
export const phoneCountries = [
  { code: 'RO', dial: '+40' },
  { code: 'MD', dial: '+373' },
  { code: 'IT', dial: '+39' },
  { code: 'ES', dial: '+34' },
  { code: 'DE', dial: '+49' },
  { code: 'FR', dial: '+33' },
  { code: 'GB', dial: '+44' },
  { code: 'US', dial: '+1' },
  { code: 'other', dial: '' },
] as const

/** Telefon opțional: cifre, spații, „+”, „-”, paranteze; 6–20 de caractere. Se salvează în format internațional. */
export function normalizePhone(country: string | undefined, raw: string | undefined): string | null {
  const value = (raw ?? '').trim()
  if (!value) return null
  const dial = phoneCountries.find((c) => c.code === country)?.dial ?? ''
  const digits = value.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('00')) return `+${digits.slice(2)}`
  if (dial) return `${dial}${digits.replace(/^0/, '')}`
  return digits
}
