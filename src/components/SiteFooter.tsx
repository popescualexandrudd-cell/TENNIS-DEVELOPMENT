import Link from 'next/link'
import type { SiteSetting } from '@/payload-types'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { SocialLinks } from './SocialLinks'
import { Wordmark } from './Wordmark'

export function SiteFooter({ locale, availability, settings }: { locale: Locale; availability: Record<PageKey, boolean>; settings: SiteSetting }) {
  const t = getDictionary(locale)
  const nav = (['about', 'coaching', 'journal', 'contact'] as const).filter((k) => availability[k])
  return (
    <footer className="on-navy bg-navy">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href={pagePath(locale, 'home')} className="inline-flex min-h-11 items-center rounded-sm text-ink no-underline">
            <Wordmark />
          </Link>
          {settings.signature ? <p className="mt-2 text-muted">{settings.signature}</p> : null}
          <SocialLinks settings={settings} className="mt-4" />
        </div>
        <div>
          <h2 className="eyebrow">{t.footer.navigation}</h2>
          <ul className="mt-3">
            {nav.map((k) => (
              <li key={k}>
                <Link href={pagePath(locale, k)} className="inline-flex min-h-11 items-center text-ink hover:underline">
                  {t.nav[k]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow">{t.footer.legal}</h2>
          <ul className="mt-3">
            {settings.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className="inline-flex min-h-11 items-center break-all text-ink hover:underline">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {(['privacy', 'cookies', 'terms'] as const)
              .filter((k) => availability[k])
              .map((k) => (
                <li key={k}>
                  <Link href={pagePath(locale, k)} className="inline-flex min-h-11 items-center text-ink hover:underline">
                    {t.legal.titles[k]}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="container-site border-t border-line py-6 text-sm text-muted">
        © {new Date().getFullYear()} {settings.personName || 'Daniel Popescu'}
      </div>
    </footer>
  )
}
