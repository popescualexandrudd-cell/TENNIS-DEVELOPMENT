import { HomeView } from '@/features/site/HomeView'
import { pageMetadata } from '@/features/site/views'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600

export async function generateMetadata() {
  return pageMetadata('ro', 'home', 'Daniel Popescu')
}

export default async function Page() {
  await ensureLocale('ro')
  return <HomeView locale="ro" />
}
