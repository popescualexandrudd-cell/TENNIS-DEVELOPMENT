import { JournalIndexView } from '@/features/journal/JournalIndexView'
import { pageMetadata } from '@/features/site/views'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600

export async function generateMetadata() {
  return pageMetadata('en', 'journal', 'Journal')
}

export default async function Page() {
  await ensureLocale('en')
  return <JournalIndexView locale="en" />
}
