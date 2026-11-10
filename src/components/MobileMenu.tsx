'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { NavLinks } from './NavLinks'

type Item = { href: string; label: string }

export function MobileMenu({ items, cta, labels, extra }: { items: Item[]; cta: Item; labels: { menu: string; close: string }; extra?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-control px-4 text-sm font-bold"
      >
        <span>{open ? labels.close : labels.menu}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>
      <div id={id} hidden={!open} className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 overflow-y-auto bg-background">
        <nav className="container-site flex min-h-full flex-col justify-between gap-10 py-8" aria-label={labels.menu}>
          <NavLinks items={items} onNavigate={() => setOpen(false)} size="xl" />
          <div className="flex flex-col gap-4">
            <Link href={cta.href} onClick={() => setOpen(false)} className="btn btn-primary w-full">
              {cta.label}
            </Link>
            {extra}
          </div>
        </nav>
      </div>
    </div>
  )
}
