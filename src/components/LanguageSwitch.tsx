'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { siteLanguages, type Locale, type PageKey } from '@/lib/i18n/config'
import { pageKeyFromPath, pagePath } from '@/lib/i18n/routes'
import { useAlternateOverride } from './AlternateLocale'

type Props = {
  locale: Locale
  /** Cealaltă limbă publică și paginile ei disponibile; `null` dacă nu este publică. */
  other: { locale: Locale; availability: Record<PageKey, boolean> } | null
  labels: { switch: string; current: string; soon: string }
}

/**
 * Selector de limbă lângă butonul „Meniu” (decizia 0016): buton cu codul limbii curente + listă dropdown
 * cu toate `siteLanguages`. Doar limbile publice sunt linkuri (păstrează pagina echivalentă când traducerea
 * există, decizia 0002); restul apar dezactivate, „în pregătire”. Se închide cu Escape sau la clic în afară.
 */
export function LanguageSwitch({ locale, other, labels }: Props) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const override = useAlternateOverride()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  function hrefFor(target: Locale, availability: Record<PageKey, boolean>) {
    if (override) return override
    const match = pageKeyFromPath(pathname)
    if (match && availability[match.key]) return pagePath(target, match.key)
    if ((pathname.includes('/jurnal/') || pathname.includes('/journal/')) && availability.journal) return pagePath(target, 'journal')
    return pagePath(target, 'home')
  }

  const row = 'flex min-h-11 w-full items-center justify-between gap-4 rounded-md px-3 text-sm'
  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${labels.switch}: ${locale.toUpperCase()}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-control px-3 text-sm font-bold transition-colors duration-200 hover:border-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
        </svg>
        <span lang={locale}>{locale.toUpperCase()}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
        </svg>
      </button>
      <ul
        id={id}
        hidden={!open}
        aria-label={labels.switch}
        className="absolute right-0 top-full z-50 mt-3 w-56 list-none rounded-lg border border-line bg-panel p-2 shadow-[0_30px_60px_-20px_rgb(28_38_51/0.35)]"
      >
        {siteLanguages.map(({ code, label }) => {
          const tag = <span className="font-bold">{code.toUpperCase()}</span>
          if (code === locale) {
            return (
              <li key={code}>
                <span className={`${row} bg-ink text-background`} aria-current="true" lang={code}>
                  <span>{label}</span>
                  <span className="sr-only">({labels.current})</span>
                  {tag}
                </span>
              </li>
            )
          }
          if (other && code === other.locale) {
            return (
              <li key={code}>
                <Link
                  href={hrefFor(other.locale, other.availability)}
                  hrefLang={code}
                  lang={code}
                  onClick={() => setOpen(false)}
                  className={`${row} text-ink no-underline hover:text-coral-text`}
                >
                  <span>{label}</span>
                  {tag}
                </Link>
              </li>
            )
          }
          return (
            <li key={code}>
              <span className={`${row} cursor-not-allowed text-muted`} aria-disabled="true">
                <span lang={code}>{label}</span>
                <span className="text-xs">{labels.soon}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
