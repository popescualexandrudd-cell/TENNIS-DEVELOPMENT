import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { ro } from '@payloadcms/translations/languages/ro'
import { en } from '@payloadcms/translations/languages/en'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { AdminUsers } from './cms/collections/AdminUsers'
import { Articles } from './cms/collections/Articles'
import { ArticleSources } from './cms/collections/ArticleSources'
import { Categories } from './cms/collections/Categories'
import { CoachingServices } from './cms/collections/CoachingServices'
import { ContactRequests } from './cms/collections/ContactRequests'
import { Testimonials } from './cms/collections/Testimonials'
import { Media } from './cms/collections/Media'
import { Pages } from './cms/collections/Pages'
import { SiteSettings } from './cms/globals/SiteSettings'
import { emailAdapter } from './lib/email'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const serverURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('PAYLOAD_SECRET lipsește')
}

export default buildConfig({
  serverURL,
  secret: process.env.PAYLOAD_SECRET || 'dev-only-insecure-secret',
  admin: {
    user: AdminUsers.slug,
    meta: { titleSuffix: ' — Daniel Popescu', robots: 'noindex, nofollow' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: { supportedLanguages: { ro, en }, fallbackLanguage: 'ro' },
  localization: {
    locales: [
      { label: 'Română', code: 'ro' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'ro',
    fallback: false,
  },
  collections: [Pages, CoachingServices, Articles, Categories, ArticleSources, Media, ContactRequests, Testimonials, AdminUsers],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  email: emailAdapter(),
  graphQL: { disable: true },
  cors: [serverURL],
  csrf: [serverURL],
  upload: { limits: { fileSize: 15_000_000 } },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
    push: false,
  }),
  sharp,
  telemetry: false,
})
