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

/** Păstrează pagina echivalentă când traducerea există; altfel duce la homepage-ul celeilalte limbi. */
export function LanguageSwitch({ target, targetAvailability, label }: Props) {
  const pathname = usePathname()
  const override = useAlternateOverride()
  const match = pageKeyFromPath(pathname)
  let href = pagePath(target, 'home')
  if (override) href = override
  else if (match && targetAvailability[match.key]) href = pagePath(target, match.key)
  else if (pathname.includes('/jurnal/') || pathname.includes('/journal/')) {
    if (targetAvailability.journal) href = pagePath(target, 'journal')
  }
  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-2 font-display text-sm font-bold tracking-wider uppercase hover:text-coral"
    >
      {target.toUpperCase()}
    </Link>
  )
}
