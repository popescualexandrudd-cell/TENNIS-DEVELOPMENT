import type { ReactNode } from 'react'
import { preload } from 'react-dom'
import '@/styles/globals.css'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAvailability, getSiteSettings, isLocaleEnabled } from '@/lib/content'
import { AlternateProvider } from './AlternateLocale'
import { Analytics } from './Analytics'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export async function SiteLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = getDictionary(locale)
  for (const href of ['/fonts/manrope-latin-wght-normal.woff2', '/fonts/source-sans-3-latin-wght-normal.woff2']) {
    preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  }
  const otherLocale: Locale = locale === 'ro' ? 'en' : 'ro'
  const [settings, availability, enabled, otherEnabled] = await Promise.all([
    getSiteSettings(locale),
    getAvailability(locale),
    isLocaleEnabled(locale),
    isLocaleEnabled(otherLocale),
  ])
  // O limbă nepublicată afișează doar pagina 404, cu legături către limba implicită.
  const navLocale: Locale = enabled ? locale : 'ro'
  const navAvailability = enabled ? availability : await getAvailability('ro')
  const other = enabled && otherEnabled ? { locale: otherLocale, availability: await getAvailability(otherLocale) } : null

  return (
    <html lang={locale} style={{ ['--header-h' as string]: '72px' }}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#continut"
          className="sr-only z-[60] rounded-sm bg-brand px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t.skipToContent}
        </a>
        <AlternateProvider>
          <SiteHeader locale={navLocale} availability={navAvailability} other={other} />
          <main id="continut" className="flex-1" tabIndex={-1}>
            {children}
          </main>
        </AlternateProvider>
        <SiteFooter locale={navLocale} availability={navAvailability} settings={settings} />
        <Analytics />
      </body>
    </html>
  )
}
