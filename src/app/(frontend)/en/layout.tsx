import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { SiteLayout } from '@/components/SiteLayout'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Daniel Popescu', template: '%s — Daniel Popescu' },
  icons: {
    icon: [{ url: '/brand/dp-monogram.svg', type: 'image/svg+xml' }, { url: '/favicon.ico', sizes: '48x48' }],
    apple: '/brand/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = { themeColor: '#F4F7FB' }

export default function Layout({ children }: { children: ReactNode }) {
  return <SiteLayout locale="en">{children}</SiteLayout>
}
