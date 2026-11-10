export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  // Payload întoarce deja URL-uri absolute pentru media: nu le prefixăm a doua oară.
  if (/^https?:\/\//i.test(path)) return path
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`
}
