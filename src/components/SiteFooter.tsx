import Link from 'next/link'
import type { SiteSetting } from '@/payload-types'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { SocialIcons } from './SocialLinks'
import { Wordmark } from './Wordmark'

/**
 * Footer centrat (decizia 0016): wordmark, iconițe sociale, navigație cu majuscule, separator,
 * linkuri legale și copyright. Rețelele și paginile apar doar dacă există în CMS.
 */
export function SiteFooter({ locale, availability, settings }: { locale: Locale; availability: Record<PageKey, boolean>; settings: SiteSetting }) {
  const t = getDictionary(locale)
  const nav = (['about', 'coaching', 'journal', 'contact'] as const).filter((k) => availability[k])
  const legal = (['terms', 'privacy', 'cookies'] as const).filter((k) => availability[k])
  return (
    <footer className="on-navy bg-[#0B0B0C]">
      <div className="container-site flex flex-col items-center py-16 text-center lg:py-20">
        <Link href={pagePath(locale, 'home')} className="inline-flex min-h-11 items-center rounded-sm text-ink no-underline">
          <Wordmark className="!text-[1.25rem] lg:!text-[1.5rem]" />
        </Link>
        {settings.signature ? <p className="mt-2 text-muted">{settings.signature}</p> : null}
        <SocialIcons settings={settings} className="mt-8" />

        <nav aria-label={t.footer.navigation} className="mt-10">
          <ul className="flex flex-wrap justify-center gap-x-10 gap-y-2">
            {nav.map((k) => (
              <li key={k}>
                <Link
                  href={pagePath(locale, k)}
                  className="inline-flex min-h-11 items-center text-[0.95rem] font-semibold tracking-[0.12em] text-ink uppercase hover:text-coral-text"
                >
                  {t.nav[k]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 h-px w-full max-w-[48rem] bg-white/15" aria-hidden="true" />

        <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-1 text-[0.95rem]">
          {legal.map((k) => (
            <li key={k}>
              <Link href={pagePath(locale, k)} className="inline-flex min-h-11 items-center text-muted hover:text-ink">
                {t.legal.titles[k]}
              </Link>
            </li>
          ))}
          {settings.email ? (
            <li>
              <a href={`mailto:${settings.email}`} className="inline-flex min-h-11 items-center break-all text-muted hover:text-ink">
                {settings.email}
              </a>
            </li>
          ) : null}
        </ul>
        <p className="mt-4 text-sm text-muted">
          © {new Date().getFullYear()} {settings.personName || 'Daniel Popescu'}
        </p>
      </div>
    </footer>
  )
}
