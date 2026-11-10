import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { SiteLayout } from '@/components/SiteLayout'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Daniel Popescu', template: '%s — Daniel Popescu' },
  icons: { icon: '/brand/dp-monogram.svg' },
}

export const viewport: Viewport = { themeColor: '#F4F7FB' }

export default function Layout({ children }: { children: ReactNode }) {
  return <SiteLayout locale="en">{children}</SiteLayout>
}
