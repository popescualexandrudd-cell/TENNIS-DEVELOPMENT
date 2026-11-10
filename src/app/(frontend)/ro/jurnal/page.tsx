import { JournalIndexView } from '@/features/journal/JournalIndexView'
import { pageMetadata } from '@/features/site/views'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600

export async function generateMetadata() {
  return pageMetadata('ro', 'journal', 'Jurnal')
}

export default async function Page() {
  await ensureLocale('ro')
  return <JournalIndexView locale="ro" />
}
