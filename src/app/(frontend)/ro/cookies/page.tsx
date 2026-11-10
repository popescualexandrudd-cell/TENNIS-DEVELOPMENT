import { LegalPageView, legalPageMetadata } from '@/features/legal/LegalPageView'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600

export async function generateMetadata() {
  return legalPageMetadata('ro', 'cookies')
}

export default async function Page() {
  await ensureLocale('ro')
  return <LegalPageView locale="ro" pageKey="cookies" />
}
