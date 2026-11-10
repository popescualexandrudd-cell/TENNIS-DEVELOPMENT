import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildSecurityHeaders } from './src/lib/security-headers'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const securityHeaders = buildSecurityHeaders()

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Fonturile TTF pentru imaginile Open Graph trebuie incluse în build-ul standalone.
  outputFileTracingIncludes: { '/og/[...slug]': ['./src/assets/og/**'] },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    // Româna este limba implicită: `/` trimite consecvent la `/ro`.
    return [{ source: '/', destination: '/ro', permanent: false }]
  },
  async headers() {
    return [
      // Site public + API: CSP strictă. Administrarea Payload: CSP proprie (decizia 0014).
      { source: '/((?!admin).*)', headers: securityHeaders.site },
      { source: '/admin/:path*', headers: securityHeaders.admin },
      { source: '/admin', headers: securityHeaders.admin },
      {
        source: '/fonts/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: { root: path.resolve(dirname) },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
