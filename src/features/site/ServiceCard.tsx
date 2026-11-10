import Link from 'next/link'
import type { CoachingService } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { hasPublicImage, MediaImage } from '@/components/MediaImage'

/** Card mare de antrenament: fotografie (dacă există) sau navy, numerotat, cu CTA. */
export function ServiceCard({
  service,
  locale,
  index,
  headingLevel = 'h3',
}: {
  service: CoachingService
  locale: Locale
  index: number
  headingLevel?: 'h2' | 'h3'
}) {
  const t = getDictionary(locale).coaching
  const H = headingLevel
  const withImage = hasPublicImage(service.image)
  return (
    <article className="on-navy relative flex min-h-[520px] flex-col overflow-hidden rounded-lg bg-navy-card">
      {withImage ? (
        <>
          <MediaImage media={service.image} fill sizes="(min-width: 1280px) 440px, (min-width: 768px) 50vw, 100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10" aria-hidden="true" />
        </>
      ) : null}
      <div className="relative flex flex-1 flex-col p-6 sm:p-8">
        <span className="text-sm font-bold text-muted">{String(index + 1).padStart(2, '0')}</span>
        <H className="display mt-auto pt-16 text-[clamp(1.625rem,1.2rem+1.4vw,2.5rem)] [overflow-wrap:anywhere]">{service.title}</H>
        <dl className="mt-5 grid gap-3 text-[1rem]">
          <div>
            <dt className="eyebrow eyebrow-coral !text-xs">{t.audience}</dt>
            <dd className="mt-0.5">{service.audience}</dd>
          </div>
          <div>
            <dt className="eyebrow eyebrow-coral !text-xs">{t.format}</dt>
            <dd className="mt-0.5">{service.format}</dd>
          </div>
          <div>
            <dt className="eyebrow eyebrow-coral !text-xs">{t.goals}</dt>
            <dd className="mt-0.5">{service.goals}</dd>
          </div>
        </dl>
        {service.description ? <p className="mt-4 text-muted">{service.description}</p> : null}
        <div className="mt-6">
          <Link href={pagePath(locale, 'contact')} className="btn btn-outline plausible-event-name=cta_contact_click">
            {t.request}
          </Link>
        </div>
      </div>
    </article>
  )
}
