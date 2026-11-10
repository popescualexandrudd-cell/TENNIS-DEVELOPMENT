'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { pageKeyFromPath, pagePath } from '@/lib/i18n/routes'
import { useAlternateOverride } from './AlternateLocale'

type Props = {
  locale: Locale
  target: Locale
  /** Paginile disponibile în limba țintă. */
  targetAvailability: Record<PageKey, boolean>
  label: string
}

/** Comutator RO/EN în formă de pastilă. Păstrează pagina echivalentă când traducerea există. */
export function LanguageSwitch({ locale, target, targetAvailability, label }: Props) {
  const pathname = usePathname()
  const override = useAlternateOverride()
  const match = pageKeyFromPath(pathname)
  let href = pagePath(target, 'home')
  if (override) href = override
  else if (match && targetAvailability[match.key]) href = pagePath(target, match.key)
  else if ((pathname.includes('/jurnal/') || pathname.includes('/journal/')) && targetAvailability.journal) href = pagePath(target, 'journal')
  const pill = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-bold'
  return (
    <div className="inline-flex items-center rounded-full border border-line p-0.5" role="group" aria-label={label}>
      <span className={`${pill} bg-ink text-background`} aria-current="true" lang={locale}>
        {locale.toUpperCase()}
      </span>
      <Link href={href} hrefLang={target} lang={target} className={`${pill} text-ink no-underline hover:text-coral-text`}>
        {target.toUpperCase()}
      </Link>
    </div>
  )
}
