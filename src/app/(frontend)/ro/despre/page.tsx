import { ContentPageView } from '@/features/site/views'
import { pageMetadata } from '@/features/site/views'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600

export async function generateMetadata() {
  return pageMetadata('ro', 'about', 'Despre')
}

export default async function Page() {
  await ensureLocale('ro')
  return <ContentPageView locale="ro" pageKey="about" />
}
