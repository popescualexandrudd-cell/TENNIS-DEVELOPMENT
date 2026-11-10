import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * Flux editorial real prin REST: publicare → pagina apare; retragere → pagina dispare (cache invalidat).
 * Necesită un cont admin (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD) în baza de date folosită de server.
 */
const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD

async function login(request: APIRequestContext) {
  const res = await request.post('/api/admin-users/login', { data: { email, password } })
  expect(res.ok()).toBeTruthy()
  return ((await res.json()) as { token: string }).token
}

test.describe('publicare și retragere', () => {
  test.skip(!email || !password, 'lipsesc credențialele de seed')
  test.skip(({ isMobile }) => isMobile, 'flux API, o singură rulare')

  test('draftul nu este public prin REST; publicarea și retragerea actualizează paginile', async ({ request, playwright, baseURL }) => {
    const token = await login(request)
    const auth = { Authorization: `JWT ${token}` }
    const slug = `e2e-${Date.now()}`
    const anon = await playwright.request.newContext({ baseURL })

    const created = await request.post('/api/articles?draft=true', {
      headers: auth,
      data: {
        title: 'Articol E2E',
        slug,
        language: 'ro',
        excerpt: 'Test.',
        authorName: 'Daniel Popescu',
        translationGroup: slug,
        content: { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Text', version: 1, format: 0, detail: 0, mode: 'normal', style: '' }] }] } },
        _status: 'draft',
      },
    })
    expect(created.ok(), await created.text()).toBeTruthy()
    const id = ((await created.json()) as { doc: { id: number } }).doc.id

    try {
      // Anonim: draftul nu apare nici în listă, nici după ID, nici cu draft=true, nici prin versiuni.
      const list = await (await anon.get(`/api/articles?draft=true&where[slug][equals]=${slug}`)).json()
      expect(list.totalDocs).toBe(0)
      expect((await anon.get(`/api/articles/${id}?draft=true`)).status()).toBeGreaterThanOrEqual(403)
      expect((await anon.get('/api/articles/versions')).status()).toBe(403)
      expect((await anon.get(`/ro/jurnal/${slug}`)).status()).toBe(404)
      // Preview fără sesiune: refuzat.
      expect((await anon.get(`/api/preview?collection=articles&id=${id}`, { maxRedirects: 0 })).status()).toBe(401)

      // Publicare
      const pub = await request.patch(`/api/articles/${id}`, { headers: auth, data: { _status: 'published' } })
      expect(pub.ok(), await pub.text()).toBeTruthy()
      await expect.poll(async () => (await anon.get(`/ro/jurnal/${slug}`)).status()).toBe(200)
      await expect.poll(async () => (await (await anon.get('/ro/jurnal')).text()).includes(`/ro/jurnal/${slug}`)).toBe(true)

      // Retragere (arhivare)
      const arch = await request.patch(`/api/articles/${id}`, { headers: auth, data: { workflow: 'archived', _status: 'published' } })
      expect(arch.ok(), await arch.text()).toBeTruthy()
      await expect.poll(async () => (await anon.get(`/ro/jurnal/${slug}`)).status()).toBe(404)
      await expect.poll(async () => (await (await anon.get('/ro/jurnal')).text()).includes(`/ro/jurnal/${slug}`)).toBe(false)
    } finally {
      await request.delete(`/api/articles/${id}`, { headers: auth })
      await anon.dispose()
    }
  })
})

test.describe('moderarea părerilor', () => {
  test.skip(!email || !password, 'lipsesc credențialele de seed')
  test.skip(({ isMobile }) => isMobile, 'flux API, o singură rulare')

  test('părerea trimisă nu e publică; aprobată apare pe homepage; ștearsă dispare', async ({ request, playwright, baseURL }) => {
    const quote = `Părere E2E ${Date.now()} — verificarea fluxului de aprobare.`
    const anon = await playwright.request.newContext({ baseURL })
    const sent = await anon.post('/api/feedback', {
      headers: { origin: baseURL!, 'x-forwarded-for': `192.0.2.${Math.floor(Math.random() * 250) + 1}` },
      data: { name: 'Test Moderare', quote, consent: true, locale: 'ro' },
    })
    expect(sent.status(), await sent.text()).toBe(201)

    const pub = async () => ((await (await anon.get('/api/testimonials?limit=100')).json()) as { docs: { quote: string }[] }).docs
    expect((await pub()).some((d) => d.quote === quote)).toBe(false)

    const token = await login(request)
    const auth = { Authorization: `JWT ${token}` }
    const found = (await (await request.get(`/api/testimonials?where[quote][equals]=${encodeURIComponent(quote)}`, { headers: auth })).json()) as { docs: { id: number; email?: string }[] }
    const id = found.docs[0]!.id
    expect((await request.patch(`/api/testimonials/${id}`, { headers: auth, data: { status: 'approved' } })).ok()).toBeTruthy()

    const publicDoc = (await pub()).find((d) => d.quote === quote) as Record<string, unknown> | undefined
    expect(publicDoc).toBeTruthy()
    expect(publicDoc).not.toHaveProperty('email')
    await expect.poll(async () => (await (await anon.get('/ro')).text()).includes(quote)).toBe(true)

    expect((await request.delete(`/api/testimonials/${id}`, { headers: auth })).ok()).toBeTruthy()
    await expect.poll(async () => (await (await anon.get('/ro')).text()).includes(quote)).toBe(false)
    await anon.dispose()
  })
})
