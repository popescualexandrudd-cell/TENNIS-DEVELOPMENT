import { notFound } from 'next/navigation'
import type { LegalPageKey, Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pagePath } from '@/lib/i18n/routes'
import { getAvailability, getPage, getSiteSettings } from '@/lib/content'
import { buildMetadata } from '@/lib/seo/metadata'
import { breadcrumbSchema } from '@/lib/seo/structured-data'
import { JsonLd } from '@/components/JsonLd'
import { RichText } from '@/components/RichText'
import { CookiesRo, PrivacyRo, TermsRo } from './content-ro'
import { isLegalReady } from './operator'

const views = { privacy: PrivacyRo, cookies: CookiesRo, terms: TermsRo } as const

export const analyticsEnabled = () => Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && process.env.NEXT_PUBLIC_PLAUSIBLE_SRC)

export async function legalPageMetadata(locale: Locale, key: LegalPageKey) {
  const [settings, availability] = await Promise.all([getSiteSettings(locale), getAvailability(locale)])
  const t = getDictionary(locale).legal
  return buildMetadata({
    locale,
    path: pagePath(locale, key),
    title: t.titles[key],
    description: t.descriptions[key],
    siteName: settings.personName,
    fallbackImage: `/og/${locale}/page/${key}`,
    // Incomplete (doar în dezvoltare) → niciodată indexate.
    noindex: !availability[key] || !isLegalReady(settings.legal),
  })
}

/**
 * Pagină legală generată din cod + Setări site → Date legale (decizia 0013).
 * Deocamdată doar în română; în engleză întoarce 404 până există o traducere verificată.
 */
export async function LegalPageView({ locale, pageKey }: { locale: Locale; pageKey: LegalPageKey }) {
  const [settings, availability] = await Promise.all([getSiteSettings(locale), getAvailability(locale)])
  if (!availability[pageKey]) notFound()
  const t = getDictionary(locale)
  const View = views[pageKey]
  const ready = isLegalReady(settings.legal)
  // Confidențialitate: o pagină CMS „privacy” publicată poate adăuga note suplimentare la final.
  const extra = pageKey === 'privacy' ? await getPage('privacy', locale) : null
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: t.breadcrumbHome, path: pagePath(locale, 'home') },
          { name: t.legal.titles[pageKey], path: pagePath(locale, pageKey) },
        ])}
      />
      <header className="container-site pt-10 pb-8 lg:pt-20 lg:pb-12">
        <h1 className="display h-page max-w-[18ch]">{t.legal.titles[pageKey]}</h1>
        {!ready ? (
          <p role="note" className="mt-6 max-w-[42rem] rounded-md border-l-4 border-coral-text bg-panel p-4 font-semibold">
            {t.legal.draftNotice}
          </p>
        ) : null}
      </header>
      <div className="container-site section !pt-4">
        <div className="prose-article prose-legal">
          <View settings={settings} analyticsEnabled={analyticsEnabled()} />
          {extra?.body ? (
            <section aria-labelledby="extra">
              <h2 id="extra">{t.legal.extra}</h2>
              <RichText data={extra.body} />
            </section>
          ) : null}
        </div>
      </div>
    </>
  )
}
