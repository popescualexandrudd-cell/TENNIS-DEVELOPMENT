import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getPage } from '@/lib/content'
import { getPublishedArticles } from './queries'
import { ArticleCard } from './ArticleCard'

export async function JournalIndexView({ locale }: { locale: Locale }) {
  const [page, articles] = await Promise.all([getPage('journal', locale), getPublishedArticles(locale, 60)])
  // Fără articole publicate nu afișăm o pagină goală.
  if (articles.length === 0) notFound()
  const t = getDictionary(locale)
  return (
    <>
      <header className="container-site pt-10 pb-8 lg:pt-20 lg:pb-12">
        <h1 className="display h-page">{page?.title || t.journal.title}</h1>
        {page?.intro ? <p className="mt-6 max-w-[42rem] text-lg text-muted lg:text-xl">{page.intro}</p> : null}
      </header>
      <section className="container-site section !pt-4">
        <div className="grid gap-14 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} locale={locale} headingLevel="h2" />
          ))}
        </div>
      </section>
    </>
  )
}
