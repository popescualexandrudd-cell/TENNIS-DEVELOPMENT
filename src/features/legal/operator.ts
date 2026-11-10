import type { SiteSetting } from '@/payload-types'

export type LegalData = NonNullable<SiteSetting['legal']>

/** Câmpurile obligatorii lipsă pentru ca paginile legale să poată fi publicate (decizia 0013). */
export function missingLegalFields(legal: Partial<LegalData> | null | undefined): string[] {
  const l = legal ?? {}
  const missing: string[] = []
  if (!l.legalName?.trim()) missing.push('legalName')
  if (!l.privacyEmail?.trim()) missing.push('privacyEmail')
  if (!l.hostingProvider?.trim()) missing.push('hostingProvider')
  if (l.entityType && l.entityType !== 'individual') {
    if (!l.taxId?.trim()) missing.push('taxId')
    if (!l.address?.trim()) missing.push('address')
  }
  if (l.outsideEEA && !l.transferSafeguards?.trim()) missing.push('transferSafeguards')
  return missing
}

export function isLegalReady(legal: Partial<LegalData> | null | undefined): boolean {
  return missingLegalFields(legal).length === 0
}

/**
 * În producție paginile legale apar doar complete. În dezvoltare / previzualizare apar și incomplete,
 * cu golurile marcate vizibil, ca Daniel să vadă ce lipsește.
 */
export function legalPagesVisible(legal: Partial<LegalData> | null | undefined): boolean {
  return isLegalReady(legal) || process.env.SITE_ENV !== 'production'
}
