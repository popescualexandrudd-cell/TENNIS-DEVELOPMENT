import Link from 'next/link'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { LanguageSwitch } from './LanguageSwitch'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'
import { Wordmark } from './Wordmark'

type Props = {
  locale: Locale
  availability: Record<PageKey, boolean>
  /** Disponibilitatea în cealaltă limbă; `null` dacă cealaltă limbă nu este publică. */
  other: { locale: Locale; availability: Record<PageKey, boolean> } | null
}

export function SiteHeader({ locale, availability, other }: Props) {
  const t = getDictionary(locale)
  const items = (['about', 'coaching', 'journal', 'contact'] as const)
    .filter((key) => availability[key])
    .map((key) => ({ href: pagePath(locale, key), label: t.nav[key] }))
  const cta = { href: pagePath(locale, 'contact'), label: t.cta.primary }
  const switcher = other ? (
    <LanguageSwitch locale={locale} target={other.locale} targetAvailability={other.availability} label={t.nav.languageSwitch} />
  ) : null

  return (
    <header className="on-dark sticky top-0 z-50 border-b border-white/10 bg-brand text-white">
      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href={pagePath(locale, 'home')} className="inline-flex min-h-11 items-center rounded-sm text-white no-underline">
          <Wordmark />
        </Link>
        <nav aria-label={t.nav.primary} className="hidden items-center gap-2 lg:flex">
          <NavLinks items={items} />
          {switcher ? <span className="ml-2 border-l border-white/20 pl-2">{switcher}</span> : null}
          <Link href={cta.href} className="btn btn-primary ml-4 !min-h-11 !py-2 text-[0.95rem]">
            {cta.label}
          </Link>
        </nav>
        <MobileMenu items={items} cta={cta} labels={{ menu: t.nav.menu, close: t.nav.close }} extra={switcher} />
      </div>
    </header>
  )
}
