import type { SiteSetting } from '@/payload-types'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { ContactForm } from '@/features/contact/ContactForm'

type Props = {
  locale: Locale
  settings: SiteSetting
  availability: Record<PageKey, boolean>
  heading: string
  invite?: string | null
  headingLevel?: 'h1' | 'h2'
  headingId?: string
}

export function ContactSection({ locale, settings, availability, heading, invite, headingLevel = 'h2', headingId }: Props) {
  const t = getDictionary(locale)
  const H = headingLevel
  const privacyHref = availability.privacy ? pagePath(locale, 'privacy') : null
  return (
    <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
      <div>
        <H id={headingId} className={headingLevel === 'h1' ? 'h-hero' : 'h-section'}>{heading}</H>
        {invite ? <p className="mt-5 max-w-[46ch] text-lg text-muted">{invite}</p> : null}
        {settings.email || settings.phone ? (
          <div className="mt-8">
            <p className="eyebrow">{t.contact.directChannels}</p>
            <ul className="mt-2">
              {settings.email ? (
                <li>
                  <a href={`mailto:${settings.email}`} className="link-arrow break-all">
                    {settings.email}
                  </a>
                </li>
              ) : null}
              {settings.phone ? (
                <li>
                  <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="link-arrow">
                    {settings.phone}
                  </a>
                </li>
              ) : null}
            </ul>
            {settings.location ? <p className="mt-3 text-muted">{settings.location}</p> : null}
          </div>
        ) : null}
      </div>
      <div className="rounded-md bg-surface p-5 sm:p-8">
        <ContactForm locale={locale} t={t.contact} privacyHref={privacyHref} />
      </div>
    </div>
  )
}
