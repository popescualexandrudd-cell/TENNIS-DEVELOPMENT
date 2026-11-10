import { LegalPageView, legalPageMetadata } from '@/features/legal/LegalPageView'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600

export async function generateMetadata() {
  return legalPageMetadata('en', 'cookies')
}

export default async function Page() {
  await ensureLocale('en')
  return <LegalPageView locale="en" pageKey="cookies" />
}
