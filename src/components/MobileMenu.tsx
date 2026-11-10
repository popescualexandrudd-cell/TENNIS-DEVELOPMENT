'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

type Item = { href: string; label: string }

export function MobileMenu({ items, cta, labels, extra }: { items: Item[]; cta: Item; labels: { menu: string; close: string }; extra?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const pathname = usePathname()
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
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm px-2 font-display text-sm font-bold"
      >
        <span>{open ? labels.close : labels.menu}</span>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div
        id={id}
        hidden={!open}
        className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 overflow-y-auto border-t border-white/10 bg-brand text-white"
      >
        <nav className="container-site flex flex-col gap-1 py-6" aria-label={labels.menu}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.href || pathname.startsWith(item.href + '/') ? 'page' : undefined}
              className="flex min-h-12 items-center border-b border-white/15 font-display text-2xl font-bold text-white aria-[current=page]:text-coral"
            >
              {item.label}
            </Link>
          ))}
          <Link href={cta.href} onClick={() => setOpen(false)} className="btn btn-primary mt-6 w-full">
            {cta.label}
          </Link>
          {extra ? <div className="mt-4">{extra}</div> : null}
        </nav>
      </div>
    </div>
  )
}
