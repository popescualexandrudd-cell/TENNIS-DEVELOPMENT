import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo/site'

/** `noindex`/`Disallow` nu sunt control de acces: administrarea și drafturile sunt protejate prin autentificare. */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.SITE_ENV === 'production'
  return {
    rules: isProduction ? [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }] : [{ userAgent: '*', disallow: '/' }],
    sitemap: isProduction ? absoluteUrl('/sitemap.xml') : undefined,
  }
}
