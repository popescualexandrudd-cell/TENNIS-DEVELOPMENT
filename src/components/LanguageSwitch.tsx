'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type MouseEvent } from 'react'
import { fallbackLocale, siteLanguages, type Locale, type PageKey } from '@/lib/i18n/config'
import { pageKeyFromPath, pagePath } from '@/lib/i18n/routes'
import {
  STORAGE_KEY,
  canTranslate,
  getTranslator,
  restoreTree,
  savedLanguage,
  translateTree,
} from '@/lib/i18n/page-translate'
import { useAlternateOverride } from './AlternateLocale'

type Props = {
  locale: Locale
  /** Cealaltă limbă publică și paginile ei disponibile; `null` dacă nu este publică. */
  other: { locale: Locale; availability: Record<PageKey, boolean> } | null
  /**
   * `fallback[l]`: indicația afișată lângă o limbă fără versiune proprie, de ex. „în engleză”.
   * `auto`: indicația când browserul traduce pagina pe loc (Translator API).
   */
  labels: { switch: string; current: string; fallback: Record<Locale, string>; auto: string }
}

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

// Prezența Translator API nu se schimbă în timpul sesiunii: abonament gol. Server/hidratare: `false`.
// (Fără `setState` sincron în `useEffect` — regula `react-hooks/set-state-in-effect` din `pnpm lint`.)
const noSubscribe = () => () => {}
const hasTranslator = () => getTranslator(window) !== null
const noTranslatorOnServer = () => false

/**
 * Selector de limbă lângă butonul „Meniu” (decizia 0016): buton cu codul limbii curente + listă dropdown
 * cu toate `siteLanguages`, toate selectabile. Cealaltă limbă publică păstrează pagina echivalentă (decizia 0002);
 * limbile fără versiune proprie duc la pagina echivalentă în limba publică de rezervă (`fallbackLocale`) și
 * afișează în ce limbă este conținutul. Se închide cu Escape sau la clic în afară.
 */
export function LanguageSwitch({ locale, other, labels }: Props) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const override = useAlternateOverride()
  const listRef = useRef<HTMLUListElement>(null)
  /** Limba în care pagina este tradusă automat acum (UK/DE/FR) sau `null` = textul original al paginii. */
  const [translated, setTranslated] = useState<string | null>(null)
  /** Browserul are Translator API (Chrome); altfel limbile fără versiune proprie rămân linkuri de rezervă. */
  const autoAvailable = useSyncExternalStore(noSubscribe, hasTranslator, noTranslatorOnServer)
  /** Limba afișată pe buton și marcată curentă: cea tradusă automat sau limba paginii. */
  const shown = translated ?? locale
  /** Limbile traduse automat: toate cele fără versiune publică (UK/DE/FR, plus EN cât timp e nepublică). */
  const autoKey = siteLanguages
    .map((l) => l.code)
    .filter((c) => c !== locale && c !== other?.locale)
    .join(',')

  /** Traduce pagina curentă în `code`; `false` dacă browserul nu poate (pagina rămâne neschimbată). */
  const applyTranslation = useCallback(
    async (code: string): Promise<boolean> => {
      const factory = getTranslator(window)
      if (!factory) return false
      restoreTree()
      const ok = await translateTree(document.body, locale, code, factory).catch(() => false)
      document.documentElement.lang = ok ? code : locale
      setTranslated(ok ? code : null)
      return ok
    },
    [locale],
  )

  const resetTranslation = useCallback(() => {
    restoreTree()
    document.documentElement.lang = locale
    storage()?.removeItem(STORAGE_KEY)
    setTranslated(null)
  }, [locale])

  // La încărcare și după fiecare navigare: reaplică limba tradusă aleasă (salvată în localStorage),
  // ca textele noii pagini să fie și ele traduse și alegerea să reziste la refresh.
  useEffect(() => {
    const saved = savedLanguage(storage(), autoKey.split(','))
    if (!saved) {
      // Alegere salvată pentru o limbă care între timp are versiune publică: o ștergem, pagina rămâne originală.
      storage()?.removeItem(STORAGE_KEY)
      return
    }
    let cancelled = false
    // Așteaptă randarea noii pagini înainte de a colecta textul.
    const timer = window.setTimeout(() => {
      if (!cancelled) void applyTranslation(saved)
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [pathname, applyTranslation, autoKey])

  async function onAutoSelect(e: MouseEvent<HTMLAnchorElement>, code: string) {
    const factory = getTranslator(window)
    // Fără Translator API: linkul își face treaba (versiunea de rezervă RO/EN).
    if (!factory) return
    e.preventDefault()
    // `currentTarget` nu mai este disponibil după `await` (eveniment React): păstrăm linkul de rezervă acum.
    const fallbackHref = e.currentTarget.href
    setOpen(false)
    if (!(await canTranslate(factory, locale, code))) {
      // Perechea de limbi nu este disponibilă în acest browser: deschide versiunea de rezervă.
      window.location.assign(fallbackHref)
      return
    }
    if (await applyTranslation(code)) storage()?.setItem(STORAGE_KEY, code)
  }

  useEffect(() => {
    if (!open) return
    // Linkuri + butonul „revino la limba paginii” (apare doar când pagina e tradusă automat).
    const focusableItems = (): HTMLElement[] =>
      Array.from(listRef.current?.querySelectorAll<HTMLElement>('a[href], button') ?? [])
    // La deschidere, focus pe prima limbă selectabilă (dacă există), ca lista să fie folosibilă din tastatură.
    focusableItems()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
        return
      }
      // Săgeți / Home / End mută focusul între limbile selectabile (linkuri; limba curentă nu este link).
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
      const items = focusableItems()
      if (items.length === 0) return
      e.preventDefault()
      const at = items.indexOf(document.activeElement as HTMLAnchorElement)
      const next =
        e.key === 'Home' ? 0
        : e.key === 'End' ? items.length - 1
        : e.key === 'ArrowDown' ? (at + 1) % items.length
        : (at <= 0 ? items.length : at) - 1
      items[next]?.focus()
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
    // translate="no": traducerea automată a browserului înlocuia „Română”/„RO” cu „English”/„EN” și „în pregătire”
    // cu „in preparation”, iar selectorul părea blocat pe engleză. Numele native și codurile rămân neatinse.
    // onBlur: lista se închide când focusul trece pe alt element din afara selectorului (Tab). Fără `relatedTarget`
    // (clic, Safari) nu închide aici — clicurile în afară sunt tratate de `pointerdown`.
    <div
      ref={rootRef}
      className="relative"
      translate="no"
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null
        if (open && next && !e.currentTarget.contains(next)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${labels.switch}: ${shown.toUpperCase()}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-control px-3 text-sm font-bold transition-colors duration-200 hover:border-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
        </svg>
        <span lang={shown}>{shown.toUpperCase()}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
        </svg>
      </button>
      <ul
        ref={listRef}
        id={id}
        hidden={!open}
        aria-label={labels.switch}
        className="absolute right-0 top-full z-50 mt-3 w-56 list-none rounded-lg border border-line bg-panel p-2 shadow-[0_30px_60px_-20px_rgb(28_38_51/0.35)]"
      >
        {siteLanguages.map(({ code, label }) => {
          const tag = <span className="font-bold">{code.toUpperCase()}</span>
          if (code === shown) {
            return (
              <li key={code}>
                <span className={`${row} bg-ink text-background`} aria-current="true" lang={code}>
                  <span>{label}</span>
                  <span className="sr-only">({labels.current})</span>
                  {translated ? <span className="text-xs">{labels.auto}</span> : tag}
                </span>
              </li>
            )
          }
          if (code === locale) {
            // Pagina este tradusă automat: limba paginii revine la textul original, fără reîncărcare.
            return (
              <li key={code}>
                <button
                  type="button"
                  lang={code}
                  onClick={() => {
                    resetTranslation()
                    setOpen(false)
                  }}
                  className={`${row} text-ink hover:text-coral-text`}
                >
                  <span>{label}</span>
                  {tag}
                </button>
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
                  onClick={() => {
                    // Limba publică aleasă explicit: renunță la traducerea automată salvată.
                    if (translated) resetTranslation()
                    setOpen(false)
                  }}
                  className={`${row} text-ink no-underline hover:text-coral-text`}
                >
                  <span>{label}</span>
                  {tag}
                </Link>
              </li>
            )
          }
          // Limbă fără versiune proprie publicată (UK/DE/FR, EN cât timp e nepublică): la clic, browserul traduce
          // pagina pe loc (Translator API, model local; decizia 0016, actualizată 19.11.2026). Fără API sau fără
          // perechea de limbi, linkul duce la pagina echivalentă în limba publică de rezervă (EN dacă e publică,
          // altfel RO), cu indicația limbii reale. Nicio traducere scrisă de mână/inventată în cod sau CMS.
          const target = fallbackLocale(locale, other)
          return (
            <li key={code}>
              <Link
                href={other && target === other.locale ? hrefFor(other.locale, other.availability) : pathname}
                hrefLang={autoAvailable ? code : target}
                onClick={(e) => void onAutoSelect(e, code)}
                className={`${row} text-ink no-underline hover:text-coral-text`}
              >
                <span lang={code}>{label}</span>
                <span className="text-xs text-muted">{autoAvailable ? labels.auto : labels.fallback[target]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
