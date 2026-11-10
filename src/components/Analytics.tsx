import Script from 'next/script'

/**
 * Plausible (fără cookies, fără date personale). Activ numai dacă NEXT_PUBLIC_PLAUSIBLE_DOMAIN este setat.
 * Evenimentele se marchează cu clase `plausible-event-name=...` (vezi docs/TOOLS.md).
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC
  if (!domain || !src) return null
  return <Script defer data-domain={domain} src={src} strategy="afterInteractive" />
}

/** Trimite un eveniment custom, dacă scriptul este încărcat. Nu transmite niciodată date personale. */
export function track(event: 'contact_submit_success' | 'cta_contact_click' | 'testimonial_submit_success', props?: Record<string, string>) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { plausible?: (e: string, o?: { props?: Record<string, string> }) => void }
  w.plausible?.(event, props ? { props } : undefined)
}
