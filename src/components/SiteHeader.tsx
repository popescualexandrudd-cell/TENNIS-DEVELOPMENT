import Link from 'next/link'
import type { SiteSetting } from '@/payload-types'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { LanguageSwitch } from './LanguageSwitch'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'
import { SocialLinks } from './SocialLinks'
import { Wordmark } from './Wordmark'

type Props = {
  locale: Locale
  availability: Record<PageKey, boolean>
  /** Disponibilitatea în cealaltă limbă; `null` dacă cealaltă limbă nu este publică. */
  other: { locale: Locale; availability: Record<PageKey, boolean> } | null
  settings: SiteSetting
}

/**
 * Desktop: bară laterală fixă (wordmark sus, navigație mare jos, social).
 * Mobil: bară de sus cu wordmark și meniu pe tot ecranul.
 */
export function SiteHeader({ locale, availability, other, settings }: Props) {
  const t = getDictionary(locale)
  const items = (['about', 'coaching', 'journal', 'contact'] as const)
    .filter((key) => availability[key])
    .map((key) => ({ href: pagePath(locale, key), label: t.nav[key] }))
  const cta = { href: pagePath(locale, 'contact'), label: t.cta.primary }
  const switcher = other ? (
    <LanguageSwitch locale={locale} target={other.locale} targetAvailability={other.availability} label={t.nav.languageSwitch} />
  ) : null
  const home = (
    <Link href={pagePath(locale, 'home')} className="inline-flex min-h-11 items-center rounded-sm text-ink no-underline">
      <Wordmark />
    </Link>
  )

  return (
    <>
      {/* Mobil */}
      {/* Fără backdrop-filter: ar transforma header-ul în containing block pentru meniul `fixed`. */}
      <header className="sticky top-0 z-50 bg-background lg:hidden">
        <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-4">
          {home}
          <MobileMenu items={items} cta={cta} labels={{ menu: t.nav.menu, close: t.nav.close }} extra={switcher} />
        </div>
      </header>

      {/* Desktop */}
      <header className="fixed inset-y-0 left-0 z-50 hidden w-[var(--sidebar-w)] flex-col justify-between px-10 py-8 lg:flex">
        <div className="flex flex-col items-start gap-6">{home}</div>
        <div className="flex flex-col items-start gap-8">
          <nav aria-label={t.nav.primary}>
            <NavLinks items={items} />
          </nav>
          <Link href={cta.href} className="btn btn-primary !min-h-11 !px-5 text-sm plausible-event-name=cta_contact_click">
            {cta.label}
          </Link>
          <div className="flex flex-col items-start gap-4">
            {switcher}
            <SocialLinks settings={settings} />
          </div>
        </div>
      </header>
    </>
  )
}
