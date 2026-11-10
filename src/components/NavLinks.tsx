'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Navigația principală din meniu: linkuri mari, cu majuscule. */
export function NavLinks({ items, onNavigate, size = 'lg' }: { items: { href: string; label: string }[]; onNavigate?: () => void; size?: 'lg' | 'xl' }) {
  const pathname = usePathname()
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={current ? 'page' : undefined}
              className={`display inline-flex min-h-11 items-center text-ink no-underline transition-colors duration-200 hover:text-coral-text aria-[current=page]:text-coral-text ${
                size === 'xl' ? 'text-[clamp(1.5rem,7.5vw,2.75rem)] lg:text-[2rem]' : 'text-[1.375rem] xl:text-[1.5rem]'
              }`}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
