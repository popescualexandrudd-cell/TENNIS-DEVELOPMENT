import { ContentPageView } from '@/features/site/views'
import { pageMetadata } from '@/features/site/views'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600

export async function generateMetadata() {
  return pageMetadata('en', 'privacy', 'Privacy')
}

export default async function Page() {
  await ensureLocale('en')
  return <ContentPageView locale="en" pageKey="privacy" />
}
