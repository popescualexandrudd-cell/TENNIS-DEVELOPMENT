import { expect, test } from '@playwright/test'

/** Securitate, confidențialitate și SEO tehnic (deciziile 0013, 0014). */

test.describe('securitate', () => {
  test.skip(({ isMobile }) => isMobile, 'antete HTTP, o singură rulare')

  test('antetele de securitate: CSP strictă pe site, separată în administrare', async ({ request }) => {
    const site = (await request.get('/ro')).headers()
    expect(site['content-security-policy']).toContain("default-src 'self'")
    expect(site['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(site['content-security-policy']).toContain("object-src 'none'")
    expect(site['x-frame-options']).toBe('DENY')
    expect(site['x-content-type-options']).toBe('nosniff')
    expect(site['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(site['permissions-policy']).toContain('camera=()')
    expect(site['x-powered-by']).toBeUndefined()

    const admin = (await request.get('/admin/login')).headers()
    expect(admin['content-security-policy']).toContain("frame-ancestors 'self'")
    expect(admin['x-frame-options']).toBe('SAMEORIGIN')
  })

  test('site-ul public nu setează cookie-uri și nu încarcă resurse de la terți', async ({ page, context, baseURL }) => {
    const origin = new URL(baseURL!).origin
    const external: string[] = []
    page.on('request', (r) => {
      const url = r.url()
      if (!url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:')) external.push(url)
    })
    const violations: string[] = []
    page.on('console', (m) => /Content Security Policy/i.test(m.text()) && violations.push(m.text()))
    for (const path of ['/ro', '/ro/contact', '/ro/jurnal', '/ro/confidentialitate', '/ro/cookies', '/ro/termeni']) {
      await page.goto(path, { waitUntil: 'networkidle' })
    }
    expect(await context.cookies()).toEqual([])
    expect(external).toEqual([])
    expect(violations).toEqual([])
  })

  test('security.txt (RFC 9116)', async ({ request }) => {
    const res = await request.get('/.well-known/security.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toMatch(/^Contact: mailto:/m)
    expect(body).toMatch(/^Expires: \d{4}-/m)
  })
})

test.describe('pagini legale', () => {
  test('confidențialitate, cookies și termeni sunt accesibile din footer', async ({ page }) => {
    await page.goto('/ro')
    const footer = page.getByRole('contentinfo')
    for (const [name, path] of [
      ['Confidențialitate', '/ro/confidentialitate'],
      ['Cookie-uri', '/ro/cookies'],
      ['Termeni și condiții', '/ro/termeni'],
    ] as const) {
      await expect(footer.getByRole('link', { name })).toHaveAttribute('href', path)
    }
    await page.goto('/ro/confidentialitate')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Confidențialitate/i)
    await expect(page.getByRole('heading', { name: /Formularul „Lasă o părere”/ })).toBeVisible()
    await expect(page.getByText('ANSPDCP', { exact: false }).first()).toBeVisible()
  })

  test('cu date legale incomplete, paginile nu se indexează (noindex)', async ({ page }) => {
    await page.goto('/ro/termeni')
    const incomplete = (await page.getByText('⟨de completat').count()) > 0
    test.skip(!incomplete, 'date legale complete în această bază')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })
})

test.describe('SEO tehnic', () => {
  test.skip(({ isMobile }) => isMobile, 'o singură rulare')

  test('homepage: canonical, Open Graph, Twitter, JSON-LD Person + WebSite', async ({ page }) => {
    await page.goto('/ro')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/ro$/)
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /\/og\/ro\/page\/home|\/api\/media\//)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((t) => {
      const d = JSON.parse(t) as { '@type': string } | { '@type': string }[]
      return Array.isArray(d) ? d.map((x) => x['@type']) : [d['@type']]
    })
    expect(types).toEqual(expect.arrayContaining(['WebSite', 'Person']))
  })

  test('imaginea Open Graph: generată pentru pagini existente, 404 pentru restul', async ({ request }) => {
    const ok = await request.get('/og/ro/page/home')
    expect(ok.status()).toBe(200)
    expect(ok.headers()['content-type']).toContain('image/png')
    expect((await request.get('/og/ro/page/nu-exista')).status()).toBe(404)
    expect((await request.get('/og/ro/article/nu-exista')).status()).toBe(404)
    expect((await request.get('/og/xx/page/home')).status()).toBe(404)
  })

  test('manifest, iconițe și sitemap cu paginile legale', async ({ request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json()
    expect(manifest.icons.length).toBeGreaterThan(0)
    expect((await request.get('/brand/apple-touch-icon.png')).status()).toBe(200)
    expect((await request.get('/favicon.ico')).status()).toBe(200)
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/ro/confidentialitate')
    expect(sitemap).toContain('/ro/termeni')
    expect(sitemap).not.toContain('/admin')
  })
})
