import Link from 'next/link'
import type { SiteSetting } from '@/payload-types'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { Wordmark } from './Wordmark'

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  x: 'X',
}

export function SiteFooter({ locale, availability, settings }: { locale: Locale; availability: Record<PageKey, boolean>; settings: SiteSetting }) {
  const t = getDictionary(locale)
  const nav = (['about', 'coaching', 'journal', 'contact'] as const).filter((k) => availability[k])
  const social = (settings.social ?? []).filter((s) => s.url?.startsWith('https://'))
  return (
    <footer className="on-dark bg-ink text-white">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-20">
        <div>
          <Link href={pagePath(locale, 'home')} className="inline-flex min-h-11 items-center rounded-sm text-white no-underline">
            <Wordmark />
          </Link>
          {settings.signature ? <p className="mt-2 text-on-dark-muted">{settings.signature}</p> : null}
        </div>
        <div>
          <h2 className="font-display text-sm font-bold tracking-wider text-on-dark-muted uppercase">{t.footer.navigation}</h2>
          <ul className="mt-3">
            {nav.map((k) => (
              <li key={k}>
                <Link href={pagePath(locale, k)} className="inline-flex min-h-11 items-center text-white hover:underline">
                  {t.nav[k]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {social.length > 0 ? (
          <div>
            <h2 className="font-display text-sm font-bold tracking-wider text-on-dark-muted uppercase">{t.footer.social}</h2>
            <ul className="mt-3">
              {social.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="me noopener" target="_blank" className="inline-flex min-h-11 items-center text-white hover:underline">
                    {platformLabels[s.platform] ?? s.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div aria-hidden="true" />
        )}
        <div>
          <h2 className="font-display text-sm font-bold tracking-wider text-on-dark-muted uppercase">{t.footer.legal}</h2>
          <ul className="mt-3">
            {settings.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className="inline-flex min-h-11 items-center break-all text-white hover:underline">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {availability.privacy ? (
              <li>
                <Link href={pagePath(locale, 'privacy')} className="inline-flex min-h-11 items-center text-white hover:underline">
                  {t.footer.privacy}
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="container-site border-t border-white/15 py-6 text-sm text-on-dark-muted">
        © {new Date().getFullYear()} {settings.personName || 'Daniel Popescu'}
      </div>
    </footer>
  )
}
