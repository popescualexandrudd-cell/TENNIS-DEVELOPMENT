import type { SiteSetting } from '@/payload-types'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { ContactForm } from '@/features/contact/ContactForm'
import { formatPhoneRo, whatsappLink } from '@/lib/whatsapp'

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
  const whatsapp = whatsappLink(settings.whatsapp, t.contact.whatsappMessage)
  return (
    <div className="grid gap-12 xl:grid-cols-[5fr_7fr] xl:gap-20">
      <div>
        <H id={headingId} className={`display ${headingLevel === 'h1' ? 'h-page' : 'h-section'}`}>
          {heading}
        </H>
        {invite ? <p className="mt-6 max-w-[40ch] text-lg text-muted">{invite}</p> : null}
        {whatsapp ? (
          <div className="mt-10">
            {/* Doar un link: nu se încarcă nimic de la WhatsApp/Meta până nu apasă vizitatorul. */}
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp plausible-event-name=whatsapp_click"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
                <path d="M12.04 2C6.56 2 2.1 6.45 2.1 11.93c0 1.75.46 3.46 1.33 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.78 1.22h.01c5.48 0 9.94-4.45 9.94-9.93A9.86 9.86 0 0 0 12.04 2Zm0 18.16h-.01a8.25 8.25 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.55 3.71-8.25 8.27-8.25a8.2 8.2 0 0 1 8.26 8.26c0 4.55-3.71 8.22-8.27 8.22Zm4.53-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.25 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.17-.48-.29Z" />
              </svg>
              {t.contact.whatsapp}
            </a>
            <p className="mt-3 text-sm text-muted">
              {formatPhoneRo(settings.whatsapp!)} · {t.contact.whatsappNote}
            </p>
          </div>
        ) : null}
        {settings.email || settings.phone ? (
          <div className="mt-10">
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
      <ContactForm locale={locale} t={t.contact} privacyHref={privacyHref} />
    </div>
  )
}
