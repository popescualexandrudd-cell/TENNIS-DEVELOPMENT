'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname()
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? 'page' : undefined}
              className="inline-flex min-h-11 items-center rounded-sm px-3 font-display text-[0.95rem] font-semibold text-white underline-offset-8 hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:decoration-coral"
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
