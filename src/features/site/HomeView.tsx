import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { getAvailability, getConfirmedServices, getPage, getSiteSettings } from '@/lib/content'
import { getPublishedArticles } from '@/features/journal/queries'
import { ArticleCard } from '@/features/journal/ArticleCard'
import { hasPublicMedia, SectionMedia } from '@/components/SectionMedia'
import { ContactSection } from './ContactSection'
import { ServiceCard } from './ServiceCard'
import { HeroStage } from './HeroStage'

/** Titlu în două tonuri: primul cuvânt subțire, restul îngroșat. */
function SplitHeading({ text, id, as: H = 'h2', className = '' }: { text: string; id?: string; as?: 'h1' | 'h2'; className?: string }) {
  const [first, ...rest] = text.split(' ')
  return (
    <H id={id} className={`display ${className}`}>
      {rest.length ? (
        <>
          <span className="display-light">{first}</span> {rest.join(' ')}
        </>
      ) : (
        text
      )}
    </H>
  )
}

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
  const name = settings.personName || 'Daniel Popescu'
  const nameWords = name.trim().split(/\s+/)
  const nameTail = nameWords.pop() ?? name
  const nameHead = nameWords.join(' ')
  const tagline = page?.title
  const facts = home?.facts ?? []
  const testimonials = (home?.testimonials ?? []).filter((x) => x.consent && x.quote && x.name)

  return (
    <>
      {/* 1. Hero — card mare, cu fotografie reală sau motivul grafic */}
      <section className="container-site pt-2 lg:pt-8" aria-labelledby="h-hero">
        <HeroStage image={page?.image} locale={locale}>
          <h1 id="h-hero" className="display">
            {/* Ultimul cuvânt al numelui în portocaliu, ca „OWN THE NEXT POINT” din referință */}
            <span className="h-hero block">
              {nameHead ? `${nameHead} ` : null}
              <span className="text-coral-text">{nameTail}</span>
            </span>
            {tagline ? <span className="display-light mt-3 block text-[clamp(1.375rem,0.9rem+2.2vw,3rem)]">{tagline}</span> : null}
          </h1>
        </HeroStage>
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          {page?.intro ? <p className="max-w-[40rem] text-lg text-muted lg:text-xl">{page.intro}</p> : <span />}
          <div className="flex flex-wrap items-center gap-3">
            <Link href={pagePath(locale, 'contact')} className="btn btn-primary plausible-event-name=cta_contact_click">
              {t.cta.primary}
            </Link>
            {availability.about ? (
              <Link href={pagePath(locale, 'about')} className="btn btn-outline">
                {t.cta.aboutLink}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. Despre Daniel */}
      {home?.aboutText ? (
        <section className="section container-site" aria-labelledby="h-about">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow">{t.home.about}</p>
              <SplitHeading id="h-about" text={home.aboutHeading || t.home.about} className="h-section mt-4" />
              {hasPublicMedia(home.aboutImage) ? (
                <div className="relative mt-10 aspect-[4/5] max-w-md overflow-hidden rounded-lg">
                  <SectionMedia media={home.aboutImage} locale={locale} sizes="(min-width: 1024px) 420px, 100vw" />
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-xl leading-relaxed lg:text-[1.375rem]">{home.aboutText}</p>
              {home.approach && home.approach.length > 0 ? (
                <ul className="mt-10 grid gap-6">
                  {home.approach.map((item, i) => (
                    <li key={item.id ?? item.title} className="grid grid-cols-[auto_1fr] gap-4 border-t border-line pt-5">
                      <span className="text-sm font-bold text-coral-text">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className="text-lg font-[800]">{item.title}</h3>
                        <p className="mt-1 text-muted">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
              {availability.about ? (
                <Link href={pagePath(locale, 'about')} className="btn btn-outline mt-10">
                  {t.cta.readStory}
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Cifre — numai fapte confirmate */}
      {facts.length > 0 ? (
        <section className="container-site pb-[var(--section-space)]" aria-labelledby="h-facts">
          <h2 id="h-facts" className="display h-card">
            {t.home.facts}
          </h2>
          <dl className="mt-8 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
            {facts.map((f) => (
              <div key={f.id ?? f.label} className="card-navy flex flex-col p-8 sm:p-10">
                <dt className="sr-only">{f.label}</dt>
                <dd className="display text-[clamp(3rem,2rem+3vw,5rem)]">{f.value}</dd>
                <dd className="display mt-3 text-[1.125rem]">{f.label}</dd>
                {f.note ? <dd className="mt-3 text-muted">{f.note}</dd> : null}
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* 3. Antrenamente — numai oferte confirmate */}
      {services.length > 0 ? (
        <section className="section container-site border-t border-line" aria-labelledby="h-coaching">
          <p className="eyebrow">{t.home.workWithMe}</p>
          <SplitHeading id="h-coaching" text={home?.coachingHeading || t.home.coaching} className="h-section mt-4" />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} locale={locale} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {/* 4. Cum lucrez */}
      {home?.method && home.method.length > 0 ? (
        <section className="section container-site border-t border-line" aria-labelledby="h-method">
          <SplitHeading id="h-method" text={t.home.method} className="h-section" />
          <ol className="mt-12 grid gap-1.5 md:grid-cols-3">
            {home.method.map((step, i) => (
              <li key={step.id ?? step.title} className="card-navy relative isolate flex min-h-[320px] flex-col overflow-hidden p-8 sm:p-10">
                {hasPublicMedia(step.media) ? (
                  <>
                    <SectionMedia media={step.media} locale={locale} sizes="(min-width: 768px) 33vw, 100vw" className="-z-10" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/60 to-black/25" aria-hidden="true" />
                  </>
                ) : null}
                <span className="display text-sm text-coral-text">
                  {t.home.step} {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-auto pt-10 text-[1.5rem] leading-tight font-[800]">{step.title}</h3>
                <p className="mt-3 text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Testimoniale — numai reale, cu acord */}
      {testimonials.length > 0 ? (
        <section className="section container-site border-t border-line" aria-labelledby="h-testimonials">
          <SplitHeading id="h-testimonials" text={t.home.testimonials} className="h-section" />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {testimonials.map((x) => {
              const [first, ...rest] = x.name.split(' ')
              return (
                <figure key={x.id ?? x.name} className="on-navy relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-lg bg-navy-card p-8 sm:p-10">
                  {hasPublicMedia(x.image) ? (
                    <>
                      <SectionMedia media={x.image} locale={locale} sizes="(min-width: 1024px) 50vw, 100vw" className="-z-10" />
                      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/60 to-black/20" aria-hidden="true" />
                    </>
                  ) : null}
                  <blockquote className="text-[1.375rem] leading-snug font-bold">„{x.quote}”</blockquote>
                  <figcaption className="mt-6">
                    <span className="display block text-[1.75rem]">
                      <span className="display-light">{first}</span> {rest.join(' ')}
                    </span>
                    {x.role ? <span className="mt-1 block text-muted">{x.role}</span> : null}
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* 5. Din jurnal — numai articole publicate */}
      {articles.length > 0 ? (
        <section className="section container-site border-t border-line" aria-labelledby="h-journal">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SplitHeading id="h-journal" text={t.home.journal} className="h-section" />
            <Link href={pagePath(locale, 'journal')} className="btn btn-outline">
              {t.home.journalAll}
            </Link>
          </div>
          <div className="mt-12 grid gap-12 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      {/* 6. Contact */}
      <section className="section container-site border-t border-line" aria-labelledby="h-contact">
        <ContactSection
          locale={locale}
          settings={settings}
          availability={availability}
          heading={t.home.contact}
          headingId="h-contact"
          invite={home?.contactInvite}
        />
      </section>
    </>
  )
}
