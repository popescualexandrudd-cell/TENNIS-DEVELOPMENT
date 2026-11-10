import { ArticleView, articleMetadata } from '@/features/journal/ArticleView'
import { getPublishedArticles } from '@/features/journal/queries'
import { isLocaleEnabled } from '@/lib/content'
import { ensureLocale } from '@/lib/locale-guard'

export const revalidate = 3600
export const dynamicParams = true

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  if (!(await isLocaleEnabled('ro'))) return []
  const articles = await getPublishedArticles('ro', 200)
  return articles.filter((a) => a.slug).map((a) => ({ slug: a.slug! }))
}

export async function generateMetadata({ params }: Props) {
  return articleMetadata('ro', (await params).slug)
}

export default async function Page({ params }: Props) {
  await ensureLocale('ro')
  return <ArticleView locale="ro" slug={(await params).slug} />
}
