import Link from 'next/link'
import type { SiteSetting } from '@/payload-types'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { LanguageSwitch } from './LanguageSwitch'
import { SiteMenu } from './SiteMenu'
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
 * Bară de sus pe toate ecranele: wordmark + selector de limbă + buton „Meniu”.
 * Meniul se deschide pe tot ecranul pe telefon și ca dropdown pe laptop (SiteMenu).
 */
export function SiteHeader({ locale, availability, other, settings }: Props) {
  const t = getDictionary(locale)
  const items = (['about', 'coaching', 'journal', 'contact'] as const)
    .filter((key) => availability[key])
    .map((key) => ({ href: pagePath(locale, key), label: t.nav[key] }))
  const cta = { href: pagePath(locale, 'contact'), label: t.cta.primary }
  // Mereu vizibil lângă „Meniu”; limbile fără rute publice apar „în pregătire” (decizia 0016).
  const switcher = (
    <LanguageSwitch
      locale={locale}
      other={other}
      labels={{ switch: t.nav.languageSwitch, current: t.nav.languageCurrent, soon: t.nav.languageSoon }}
    />
  )
  const home = (
    <Link href={pagePath(locale, 'home')} className="inline-flex min-h-11 items-center rounded-sm text-ink no-underline">
      <Wordmark />
    </Link>
  )

  return (
    // Fără backdrop-filter: ar transforma header-ul în containing block pentru panoul `fixed` de pe telefon.
    <header className="sticky top-0 z-50 bg-background">
      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-4">
        {home}
        <div className="flex items-center gap-2">
          {switcher}
          <SiteMenu
            items={items}
            cta={cta}
            labels={{ menu: t.nav.menu, close: t.nav.close }}
            extra={
              <div className="flex flex-col items-start gap-4">
                <SocialLinks settings={settings} />
              </div>
            }
          />
        </div>
      </div>
    </header>
  )
}
