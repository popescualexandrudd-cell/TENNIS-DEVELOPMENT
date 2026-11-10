import Link from 'next/link'
import type { CoachingService } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'

export function ServiceCard({ service, locale, headingLevel = 'h3' }: { service: CoachingService; locale: Locale; headingLevel?: 'h2' | 'h3' }) {
  const t = getDictionary(locale).coaching
  const H = headingLevel
  return (
    <article className="flex flex-col border-t-2 border-brand pt-6">
      <H className="text-[1.5rem] font-bold">{service.title}</H>
      <dl className="mt-5 grid gap-4">
        <div>
          <dt className="font-display text-sm font-bold tracking-wider text-coral-ink uppercase">{t.audience}</dt>
          <dd className="mt-1">{service.audience}</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-bold tracking-wider text-coral-ink uppercase">{t.format}</dt>
          <dd className="mt-1">{service.format}</dd>
        </div>
        <div>
          <dt className="font-display text-sm font-bold tracking-wider text-coral-ink uppercase">{t.goals}</dt>
          <dd className="mt-1">{service.goals}</dd>
        </div>
      </dl>
      {service.description ? <p className="mt-4 text-muted">{service.description}</p> : null}
      <Link href={`${pagePath(locale, 'contact')}?tip=antrenamente`} className="link-arrow mt-auto pt-5 plausible-event-name=cta_contact_click">
        {t.request} <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}
