import 'server-only'
import { cache } from 'react'
import type { CoachingService, Page, SiteSetting } from '@/payload-types'
import type { Locale, PageKey } from '@/lib/i18n/config'
import { getPayloadClient } from '@/lib/payload'
import { countPublishedArticles } from '@/features/journal/queries'

export const getSiteSettings = cache(async (locale: Locale): Promise<SiteSetting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale, fallbackLocale: false, depth: 1, overrideAccess: false })
})

/** Engleza este publică doar când este activată explicit în setări. */
export const isLocaleEnabled = cache(async (locale: Locale): Promise<boolean> => {
  if (locale === 'ro') return true
  const settings = await getSiteSettings('ro')
  return Boolean(settings.englishEnabled)
})

/** Pagina fixă, publicată și marcată disponibilă în limba cerută. */
export const getPage = cache(async (key: PageKey, locale: Locale): Promise<Page | null> => {
  if (!(await isLocaleEnabled(locale))) return null
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    overrideAccess: false,
    locale,
    fallbackLocale: false,
    where: { and: [{ key: { equals: key } }, { _status: { equals: 'published' } }] },
    limit: 1,
    // 2: media de secțiune + imaginea de previzualizare a unui clip video (media.poster).
    depth: 2,
  })
  const page = docs[0]
  return page && page.available ? page : null
})

/** Oferte confirmate, cu traducere completă în limba cerută. */
export const getConfirmedServices = cache(async (locale: Locale): Promise<CoachingService[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'coaching-services',
    overrideAccess: false,
    locale,
    fallbackLocale: false,
    where: { confirmed: { equals: true } },
    sort: 'order',
    limit: 3,
  })
  return docs.filter((s) => s.title && s.audience && s.format && s.goals)
})

/** Ce pagini există public într-o limbă — folosit pentru navigație, sitemap și selectorul de limbă. */
export const getAvailability = cache(async (locale: Locale): Promise<Record<PageKey, boolean>> => {
  const enabled = await isLocaleEnabled(locale)
  if (!enabled) return { home: false, about: false, coaching: false, journal: false, contact: false, privacy: false }
  const [about, coaching, privacy, services, articles] = await Promise.all([
    getPage('about', locale),
    getPage('coaching', locale),
    getPage('privacy', locale),
    getConfirmedServices(locale),
    countPublishedArticles(locale),
  ])
  return {
    home: true,
    about: Boolean(about),
    coaching: Boolean(coaching) || services.length > 0,
    journal: articles > 0,
    contact: true,
    privacy: Boolean(privacy),
  }
})
