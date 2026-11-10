import { readFile } from 'fs/promises'
import path from 'path'
import { ImageResponse } from 'next/og'
import { isLocale, legalPageKeys, pageKeys, type Locale, type PageKey } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getAvailability, getPage, getSiteSettings, isLocaleEnabled } from '@/lib/content'
import { getArticle } from '@/features/journal/queries'

/**
 * Imagine Open Graph 1200×630 generată în identitatea site-ului, folosită când pagina nu are o fotografie proprie.
 * URL: /og/{locale}/page/{key} sau /og/{locale}/article/{slug}. Titlul vine din CMS, NU din URL —
 * nimeni nu poate genera pe domeniul site-ului imagini cu text arbitrar.
 */
const fontDir = path.join(process.cwd(), 'src/assets/og')
const fonts = Promise.all([readFile(path.join(fontDir, 'archivo-expanded-italic-850.ttf')), readFile(path.join(fontDir, 'source-sans-3-600.ttf'))])

async function resolveTitle(locale: Locale, kind: string, key: string): Promise<{ title: string; label: string } | null> {
  const t = getDictionary(locale)
  if (kind === 'page' && (pageKeys as readonly string[]).includes(key)) {
    const pageKey = key as PageKey
    if (!(await getAvailability(locale))[pageKey]) return null
    if ((legalPageKeys as readonly string[]).includes(pageKey)) return { title: t.legal.titles[pageKey as 'privacy'], label: '' }
    const page = await getPage(pageKey, locale)
    if (pageKey === 'home') return { title: page?.title ?? '', label: '' }
    return { title: page?.title || t.nav[pageKey as 'about'] || '', label: t.nav[pageKey as 'about'] ?? '' }
  }
  if (kind === 'article') {
    const article = await getArticle(locale, key, { draft: false })
    return article ? { title: article.title, label: t.nav.journal } : null
  }
  return null
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const [locale, kind, key] = (await params).slug
  if (!locale || !kind || !key || !isLocale(locale) || !(await isLocaleEnabled(locale))) return new Response('Not found', { status: 404 })
  const resolved = await resolveTitle(locale, kind, key)
  if (!resolved) return new Response('Not found', { status: 404 })
  const settings = await getSiteSettings(locale)
  const [first, ...rest] = (settings.personName || 'Daniel Popescu').toUpperCase().split(' ')
  const [display, sans] = await fonts
  const title = resolved.title.length > 90 ? `${resolved.title.slice(0, 88)}…` : resolved.title

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#1C2633', position: 'relative', overflow: 'hidden', fontFamily: 'Source Sans 3' }}>
        {/* Straturile „terenului”, ca în hero */}
        <div style={{ position: 'absolute', right: -160, top: 40, width: 760, height: 520, borderRadius: 40, background: '#7F94AD', transform: 'rotate(-28deg)' }} />
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -10,
            width: 720,
            height: 500,
            borderRadius: 40,
            background: 'linear-gradient(115deg, #E4572E 0%, #F07A4A 40%, #F6A985 75%, #D5E0EB 100%)',
            transform: 'rotate(-28deg)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', background: 'linear-gradient(90deg, rgba(28,38,51,0.97) 0%, rgba(28,38,51,0.9) 52%, rgba(28,38,51,0) 85%)' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '64px 72px', width: '100%', height: '100%' }}>
          {resolved.label ? (
            <div style={{ color: '#F28A5E', fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 18 }}>{resolved.label}</div>
          ) : null}
          {title ? (
            <div style={{ color: '#F4F7FB', fontFamily: 'Archivo Expanded', fontStyle: 'italic', fontSize: title.length > 50 ? 46 : 58, lineHeight: 1.05, maxWidth: 820, textTransform: 'uppercase', marginBottom: 34 }}>
              {title}
            </div>
          ) : null}
          <div style={{ display: 'flex', fontFamily: 'Archivo Expanded', fontStyle: 'italic', fontSize: title ? 34 : 88, lineHeight: 1, color: '#F4F7FB' }}>
            {first}&nbsp;<span style={{ color: '#F28A5E' }}>{rest.join(' ')}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Archivo Expanded', data: display, style: 'italic', weight: 800 },
        { name: 'Source Sans 3', data: sans, style: 'normal', weight: 600 },
      ],
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    },
  )
}
