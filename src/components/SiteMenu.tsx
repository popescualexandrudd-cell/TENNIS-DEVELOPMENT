'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { NavLinks } from './NavLinks'

type Item = { href: string; label: string }

// Toate controalele care pot primi focus cu Tab (inclusiv cele din `extra`).
const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
]
  .map((s) => `${s}:not([tabindex="-1"])`)
  .join(', ')

/**
 * Meniul site-ului, același pe toate ecranele: buton „Meniu” în bara de sus.
 * Telefon / tabletă: panou pe tot ecranul. Laptop (≥ 1024 px): dropdown ancorat sub buton.
 * Se închide cu Escape (focusul revine pe buton), la clic în afară sau la navigare (inclusiv „Înapoi”).
 * Pe telefon: focus ținut în meniu, derulare blocată (reevaluată la rotire), zonă sigură jos respectată.
 */
export function SiteMenu({ items, cta, labels, extra }: { items: Item[]; cta: Item; labels: { menu: string; close: string }; extra?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)

  // Închidem meniul la orice schimbare de rută (inclusiv butonul „Înapoi” al browserului).
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const desktop = window.matchMedia('(min-width: 1024px)')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
        return
      }
      // Pe telefon panoul acoperă tot ecranul: ținem focusul (Tab / Shift+Tab) în meniu.
      if (e.key !== 'Tab' || desktop.matches || !rootRef.current) return
      // Excludem controalele dezactivate (inclusiv `[tabindex]` pe un control `disabled` sau dintr-un fieldset dezactivat):
      // `.focus()` ar eșua pe ele și ar bloca parcurgerea.
      const focusables = Array.from(rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.matches(':disabled') && (el.offsetParent !== null || el.getClientRects().length > 0),
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !rootRef.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !rootRef.current.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    // Blocăm derularea doar când panoul acoperă tot ecranul (sub 1024 px); reevaluăm la rotire / redimensionare.
    const applyScrollLock = () => {
      document.body.style.overflow = desktop.matches ? '' : 'hidden'
    }
    applyScrollLock()
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    desktop.addEventListener('change', applyScrollLock)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      desktop.removeEventListener('change', applyScrollLock)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div ref={rootRef} className="lg:relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-control px-4 text-sm font-bold transition-colors duration-200 hover:border-ink"
      >
        <span>{open ? labels.close : labels.menu}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>
      <div
        id={id}
        hidden={!open}
        className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 overflow-y-auto overscroll-contain bg-background pb-[env(safe-area-inset-bottom)] lg:absolute lg:pb-0 lg:inset-x-auto lg:top-full lg:right-0 lg:bottom-auto lg:mt-3 lg:max-h-[calc(100dvh-var(--header-h)-24px)] lg:w-[420px] lg:rounded-lg lg:border lg:border-line lg:bg-panel lg:shadow-[0_30px_60px_-20px_rgb(28_38_51/0.35)]"
      >
        <nav className="container-site flex min-h-full flex-col justify-between gap-10 py-8 lg:gap-8 lg:p-8" aria-label={labels.menu}>
          <NavLinks items={items} onNavigate={() => setOpen(false)} size="xl" />
          <div className="flex flex-col gap-4">
            <Link href={cta.href} onClick={() => setOpen(false)} className="btn btn-primary w-full plausible-event-name=cta_contact_click">
              {cta.label}
            </Link>
            {extra}
          </div>
        </nav>
      </div>
    </div>
  )
}
