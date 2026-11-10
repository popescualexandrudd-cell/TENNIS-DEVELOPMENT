import { notFound } from 'next/navigation'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { getAvailability, getConfirmedServices, getPage, getSiteSettings } from '@/lib/content'
import { buildMetadata } from '@/lib/seo/metadata'
import { breadcrumbSchema, personSchema } from '@/lib/seo/structured-data'
import { hasPublicMedia, SectionMedia } from '@/components/SectionMedia'
import { RichText } from '@/components/RichText'
import { JsonLd } from '@/components/JsonLd'
import { ContactSection } from './ContactSection'
import { ServiceCard } from './ServiceCard'

const other = (locale: Locale): Locale => (locale === 'ro' ? 'en' : 'ro')

/** Metadata pentru o pagină fixă; hreflang numai dacă traducerea este publicată. */
export async function pageMetadata(locale: Locale, key: PageKey, fallbackTitle: string) {
  const [page, settings, otherAvailability] = await Promise.all([getPage(key, locale), getSiteSettings(locale), getAvailability(other(locale))])
  const alternates = otherAvailability[key] ? { [other(locale)]: pagePath(other(locale), key) } : {}
  const isHome = key === 'home'
  const baseTitle = page?.seo?.title || page?.title || fallbackTitle
  return buildMetadata({
    locale,
    path: pagePath(locale, key),
    title: isHome ? settings.defaultTitle || baseTitle : baseTitle,
    description: page?.seo?.description || page?.intro || settings.defaultDescription,
    image: page?.seo?.image || page?.image || settings.defaultImage,
    alternates,
    noindex: page?.seo?.noindex,
    siteName: settings.personName,
  })
}

function PageHeader({ title, intro }: { title: string; intro?: string | null }) {
  return (
    <header className="container-site pt-10 pb-8 lg:pt-20 lg:pb-12">
      <h1 className="display h-page max-w-[16ch]">{title}</h1>
      {intro ? <p className="mt-6 max-w-[42rem] text-lg text-muted lg:text-xl">{intro}</p> : null}
    </header>
  )
}

/** Despre / Confidențialitate: pagini editoriale simple. 404 dacă nu sunt publicate în limba cerută. */
export async function ContentPageView({ locale, pageKey }: { locale: Locale; pageKey: 'about' | 'privacy' }) {
  const [page, settings] = await Promise.all([getPage(pageKey, locale), getSiteSettings(locale)])
  if (!page) notFound()
  const t = getDictionary(locale)
  return (
    <>
      <PageHeader title={page.title} intro={page.intro} />
      {hasPublicMedia(page.image) ? (
        <div className="container-site">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <SectionMedia media={page.image} locale={locale} priority sizes="(min-width: 1240px) 1240px, 100vw" />
          </div>
        </div>
      ) : null}
      <div className="container-site section !pt-10">
        <RichText data={page.body} className="prose-article" />
      </div>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: t.breadcrumbHome, path: pagePath(locale, 'home') },
            { name: page.title, path: pagePath(locale, pageKey) },
          ]),
          ...(pageKey === 'about' ? [personSchema(settings, locale)] : []),
        ]}
      />
    </>
  )
}

export async function CoachingView({ locale }: { locale: Locale }) {
  const [page, services, availability] = await Promise.all([getPage('coaching', locale), getConfirmedServices(locale), getAvailability(locale)])
  if (!availability.coaching) notFound()
  const t = getDictionary(locale)
  return (
    <>
      <PageHeader title={page?.title || t.nav.coaching} intro={page?.intro} />
      {page?.body ? (
        <div className="container-site pb-4">
          <RichText data={page.body} className="prose-article" />
        </div>
      ) : null}
      <section className="container-site section !pt-8">
        {services.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} locale={locale} index={i} headingLevel="h2" />
            ))}
          </div>
        ) : (
          <p className="max-w-[46ch] text-lg text-muted">{t.coaching.empty}</p>
        )}
      </section>
    </>
  )
}

export async function ContactView({ locale }: { locale: Locale }) {
  const [page, settings, availability] = await Promise.all([getPage('contact', locale), getSiteSettings(locale), getAvailability(locale)])
  const t = getDictionary(locale)
  return (
    <section className="container-site section">
      <ContactSection
        locale={locale}
        settings={settings}
        availability={availability}
        heading={page?.title || t.contact.title}
        invite={page?.intro}
        headingLevel="h1"
      />
    </section>
  )
}
