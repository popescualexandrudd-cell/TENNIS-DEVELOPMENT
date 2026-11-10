import { CoachingView } from '@/features/site/views'
import { pageMetadata } from '@/features/site/views'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600

export async function generateMetadata() {
  return pageMetadata('ro', 'coaching', 'Antrenamente')
}

export default async function Page() {
  await ensureLocale('ro')
  return <CoachingView locale="ro" />
}
