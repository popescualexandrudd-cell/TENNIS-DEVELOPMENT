'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { NavLinks } from './NavLinks'

type Item = { href: string; label: string }

/**
 * Meniul site-ului, același pe toate ecranele: buton „Meniu” în bara de sus.
 * Telefon / tabletă: panou pe tot ecranul. Laptop (≥ 1024 px): dropdown ancorat sub buton.
 * Se închide cu Escape (focusul revine pe buton), la clic în afară sau la navigare.
 */
export function SiteMenu({ items, cta, labels, extra }: { items: Item[]; cta: Item; labels: { menu: string; close: string }; extra?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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
    // Blocăm derularea doar când panoul acoperă tot ecranul (sub 1024 px).
    const fullscreen = !window.matchMedia('(min-width: 1024px)').matches
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    if (fullscreen) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
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
        className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 overflow-y-auto bg-background lg:absolute lg:inset-x-auto lg:top-full lg:right-0 lg:bottom-auto lg:mt-3 lg:max-h-[calc(100dvh-var(--header-h)-24px)] lg:w-[420px] lg:rounded-lg lg:border lg:border-line lg:bg-panel lg:shadow-[0_30px_60px_-20px_rgb(28_38_51/0.35)]"
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
