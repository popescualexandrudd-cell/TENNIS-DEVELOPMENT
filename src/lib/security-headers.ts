/**
 * Antete de securitate (decizia 0014). Folosit din next.config.ts, deci fără importuri din aplicație.
 *
 * CSP: Next.js App Router injectează scripturi inline pentru hidratare, iar paginile sunt statice (ISR), așa că un nonce per
 * cerere nu e posibil fără a renunța la cache. Restricția utilă rămâne pe **origini**: totul doar de pe același domeniu
 * (fonturi, imagini, clipuri locale), fără iframe-uri, fără plugin-uri, formulare doar către site.
 */
type Header = { key: string; value: string }

function originOf(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

export function buildSecurityHeaders({ env = process.env } = {}): { site: Header[]; admin: Header[] } {
  const production = env.NODE_ENV === 'production'
  const https = (env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://')
  const analytics = env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? originOf(env.NEXT_PUBLIC_PLAUSIBLE_SRC) : null
  const extra = analytics ? ` ${analytics}` : ''
  const devEval = production ? '' : " 'unsafe-eval'" // doar pentru `next dev` (React Refresh)

  const site = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${devEval}${extra}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "media-src 'self'",
    `connect-src 'self'${extra}`,
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    ...(production && https ? ['upgrade-insecure-requests'] : []),
  ].join('; ')

  // Interfața Payload are nevoie de eval/inline și de iframe-uri pe același domeniu (previzualizare).
  const admin = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self' blob:",
  ].join('; ')

  const common: Header[] = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), browsing-topics=(), interest-cohort=()',
    },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'X-DNS-Prefetch-Control', value: 'off' },
    // HSTS doar pe HTTPS real în producție (pe localhost ar bloca dezvoltarea).
    ...(production && https ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] : []),
  ]

  return {
    site: [...common, { key: 'X-Frame-Options', value: 'DENY' }, { key: 'Content-Security-Policy', value: site }],
    admin: [...common, { key: 'X-Frame-Options', value: 'SAMEORIGIN' }, { key: 'Content-Security-Policy', value: admin }],
  }
}
