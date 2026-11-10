import { ContactView } from '@/features/site/views'
import { pageMetadata } from '@/features/site/views'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600

export async function generateMetadata() {
  return pageMetadata('en', 'contact', 'Contact')
}

export default async function Page() {
  await ensureLocale('en')
  return <ContactView locale="en" />
}
