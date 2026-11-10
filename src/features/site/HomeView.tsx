import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { getAvailability, getConfirmedServices, getPage, getSiteSettings } from '@/lib/content'
import { getPublishedArticles } from '@/features/journal/queries'
import { ArticleCard } from '@/features/journal/ArticleCard'
import { CourtLines } from '@/components/CourtLines'
import { hasPublicImage, MediaImage } from '@/components/MediaImage'
import { ContactSection } from './ContactSection'
import { ServiceCard } from './ServiceCard'

export async function HomeView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const [page, settings, availability, services, articles] = await Promise.all([
    getPage('home', locale),
    getSiteSettings(locale),
    getAvailability(locale),
    getConfirmedServices(locale),
    getPublishedArticles(locale, 3),
  ])
  const home = page?.home
  const heroTitle = page?.title || settings.personName || 'Daniel Popescu'

  return (
    <>
      {/* 1. Hero */}
      <section className="on-dark bg-brand text-white">
       <div className="container-site grid items-center gap-8 pt-8 pb-12 lg:grid-cols-[7fr_5fr] lg:gap-16 lg:pt-16 lg:pb-24">
        <div className="max-w-[42rem]">
          {settings.personName && page?.title ? <p className="eyebrow">{settings.personName}</p> : null}
          <h1 className="h-hero h-display mt-4">{heroTitle}</h1>
          {page?.intro ? <p className="mt-6 max-w-[34rem] text-lg text-on-dark-muted lg:text-xl">{page.intro}</p> : null}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={pagePath(locale, 'contact')} className="btn btn-primary plausible-event-name=cta_contact_click">
              {t.cta.primary}
            </Link>
            {availability.about ? (
              <Link href={pagePath(locale, 'about')} className="link-arrow">
                {t.cta.aboutLink} <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-md sm:aspect-[16/10] lg:aspect-[4/5]">
          {hasPublicImage(page?.image) ? (
            <MediaImage media={page!.image} fill priority sizes="(min-width: 1024px) 480px, 100vw" />
          ) : (
            <CourtLines className="absolute inset-0 h-full w-full" />
          )}
        </div>
       </div>
      </section>

      {/* 2. Despre Daniel */}
      {home?.aboutText ? (
        <section className="section bg-surface" aria-labelledby="h-about">
          <div className="container-site grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-20">
            {hasPublicImage(home.aboutImage) ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                <MediaImage media={home.aboutImage} fill sizes="(min-width: 1024px) 460px, 100vw" />
              </div>
            ) : null}
            <div className={hasPublicImage(home.aboutImage) ? '' : 'lg:col-span-2 lg:max-w-[52rem]'}>
              <h2 id="h-about" className="h-section">
                {t.home.about}
              </h2>
              <p className="mt-6 text-lg">{home.aboutText}</p>
              {home.approach && home.approach.length > 0 ? (
                <ul className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
                  {home.approach.map((item) => (
                    <li key={item.id ?? item.title} className="border-t border-line pt-4">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="mt-2 text-muted">{item.text}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              {availability.about ? (
                <Link href={pagePath(locale, 'about')} className="link-arrow mt-8">
                  {t.cta.readStory} <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* 3. Antrenamente — numai oferte confirmate */}
      {services.length > 0 ? (
        <section className="section" aria-labelledby="h-coaching">
          <div className="container-site">
            <h2 id="h-coaching" className="h-section">
              {t.home.coaching}
            </h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. Cum lucrez */}
      {home?.method && home.method.length > 0 ? (
        <section className="section bg-soft" aria-labelledby="h-method">
          <div className="container-site">
            <h2 id="h-method" className="h-section">
              {t.home.method}
            </h2>
            <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {home.method.map((step, i) => (
                <li key={step.id ?? step.title}>
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-coral font-display text-lg font-extrabold text-ink" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* 5. Din jurnal — numai articole publicate */}
      {articles.length > 0 ? (
        <section className="section" aria-labelledby="h-journal">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="h-journal" className="h-section">
                {t.home.journal}
              </h2>
              <Link href={pagePath(locale, 'journal')} className="link-arrow">
                {t.home.journalAll} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 6. Contact */}
      <section className="section border-t border-line" aria-labelledby="h-contact">
        <div className="container-site">
          <ContactSection locale={locale} settings={settings} availability={availability} heading={t.home.contact} headingId="h-contact" invite={home?.contactInvite} />
        </div>
      </section>
    </>
  )
}
