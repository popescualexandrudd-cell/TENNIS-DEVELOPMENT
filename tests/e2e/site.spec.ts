import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('site public', () => {
  test('`/` redirecționează la `/ro` și homepage-ul are hero + CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/ro$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ro')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Discutăm despre antrenamente' }).first()).toBeVisible()
  })

  test('homepage-ul randat nu mai conține secțiunea „Lucrează cu mine” (cod, CMS sau build vechi)', async ({ page }) => {
    await page.goto('/ro')
    const main = page.locator('main')
    await expect(main.getByText(/lucrează cu mine|work with me/i)).toHaveCount(0)
    // Ofertele (ServiceCard) apar doar pe pagina Antrenamente, nu pe homepage.
    await expect(page.locator('main a[href="#work-with-me"], main #work-with-me')).toHaveCount(0)
    const headings = await main.getByRole('heading', { level: 2 }).allInnerTexts()
    expect(headings.map((h) => h.trim().toLowerCase())).not.toContain('antrenamente')
  })

  test('homepage-ul randat nu mai conține secțiunea „Cum lucrez” (ro + en)', async ({ page }) => {
    for (const path of ['/ro', '/en']) {
      const res = await page.goto(path)
      if (path === '/en' && res?.status() === 404) continue // EN poate fi dezactivată (fără conținut)
      const main = page.locator('main')
      await expect(main.locator('#h-method, [aria-labelledby="h-method"], a[href="#h-method"]')).toHaveCount(0)
      const headings = await main.getByRole('heading', { level: 2 }).allInnerTexts()
      const norm = headings.map((h) => h.replace(/\s+/g, ' ').trim().toLowerCase())
      expect(norm, path).not.toContain('cum lucrez')
      expect(norm, path).not.toContain('how i work')
    }
  })

  test('fără scroll orizontal', async ({ page }) => {
    for (const path of ['/ro', '/ro/contact', '/ro/antrenamente', '/ro/jurnal', '/ro/confidentialitate', '/ro/cookies', '/ro/termeni']) {
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })

  test('fără încălcări de accesibilitate serioase (axe)', async ({ page }) => {
    for (const path of ['/ro', '/ro/contact', '/ro/antrenamente', '/ro/jurnal', '/ro/confidentialitate', '/ro/cookies', '/ro/termeni']) {
      await page.goto(path)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`), path).toEqual([])
    }
  })

  test('linkul „Sari la conținut” este primul element focalizabil', async ({ page }) => {
    await page.goto('/ro')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Sari la conținut' })).toBeFocused()
  })

  test('engleza nepublicată răspunde 404, fără pagini goale', async ({ request }) => {
    for (const path of ['/en', '/en/about', '/en/contact']) {
      expect((await request.get(path)).status(), path).toBe(404)
    }
  })

  test('administrarea și API-ul sunt excluse din indexare', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toMatch(/Disallow: \//)
  })
})

test.describe('meniu (telefon: ecran complet, laptop: dropdown)', () => {
  test('se deschide, se închide cu Escape și redă focusul', async ({ page }) => {
    await page.goto('/ro')
    const button = page.getByRole('button', { name: 'Meniu' })
    await button.click()
    await expect(page.getByRole('navigation', { name: 'Meniu' })).toBeVisible()
    // Linkurile trebuie să fie efectiv pe ecran (nu doar „vizibile” într-un container tăiat).
    await expect(page.getByRole('navigation', { name: 'Meniu' }).getByRole('link', { name: 'Contact' })).toBeInViewport()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('navigation', { name: 'Meniu' })).toBeHidden()
    await expect(button).toBeFocused()
  })
  test('se închide la clic în afara meniului', async ({ page }) => {
    await page.goto('/ro')
    await page.getByRole('button', { name: 'Meniu' }).click()
    const nav = page.getByRole('navigation', { name: 'Meniu' })
    await expect(nav).toBeVisible()
    await page.mouse.click(5, 5)
    await expect(nav).toBeHidden()
  })
})

test.describe('selector de limbă (decizia 0016)', () => {
  test('se deschide lângă „Meniu”, arată cele 5 limbi și se închide cu Escape', async ({ page }) => {
    await page.goto('/ro')
    const button = page.getByRole('button', { name: /^Schimbă limba: RO$/ })
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    const list = page.getByRole('list', { name: 'Schimbă limba' })
    await expect(list).toBeVisible()
    // Exclus de la traducerea automată a browserului (altfel „Română” devine „English”).
    await expect(page.locator('[translate="no"]').filter({ has: list })).toHaveCount(1)
    for (const name of ['Română', 'English', 'Українська', 'Deutsch', 'Français']) {
      await expect(list.getByText(name, { exact: true })).toBeVisible()
    }
    await expect(list.locator('[aria-current="true"]')).toContainText('Română')
    await expect(list.locator('[aria-disabled="true"]')).toHaveCount(await list.getByRole('link').count() ? 3 : 4)
    await page.keyboard.press('Escape')
    await expect(list).toBeHidden()
    await expect(button).toBeFocused()
  })

  test('cu engleza publică, English duce la pagina echivalentă /en', async ({ page }) => {
    await page.goto('/ro')
    await page.getByRole('button', { name: /^Schimbă limba: RO$/ }).click()
    const english = page.getByRole('list', { name: 'Schimbă limba' }).getByRole('link', { name: /English/ })
    test.skip((await english.count()) === 0, 'englishEnabled este debifat în Setări site (EN „în pregătire”)')
    await english.click()
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('button', { name: /^Change language: EN$/ })).toBeVisible()
  })
})

test.describe('media de secțiune', () => {
  test('buclele video rulează doar pe ecrane mari, fără sunet, cu buton de pauză', async ({ page, isMobile }) => {
    // Clipurile apar după hidratare (decizia se ia în browser, după ecran și preferințe).
    await page.goto('/ro', { waitUntil: 'networkidle' })
    const videos = page.locator('video')
    if (isMobile) {
      // Pe telefon rămâne doar imaginea de previzualizare.
      await expect(videos).toHaveCount(0)
      return
    }
    test.skip((await videos.count()) === 0, 'fără clipuri în CMS (seed fără media demonstrative)')
    const first = videos.first()
    await first.scrollIntoViewIfNeeded()
    await expect.poll(() => first.evaluate((v: HTMLVideoElement) => !v.paused && v.muted)).toBe(true)
    const pause = page.getByRole('button', { name: 'Oprește clipul' }).first()
    await pause.click()
    await expect.poll(() => first.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
    await expect(page.getByRole('button', { name: 'Pornește clipul' }).first()).toBeVisible()
  })

  test('cu „reducere mișcare” nu apare niciun clip', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/ro', { waitUntil: 'networkidle' })
    await expect(page.locator('video')).toHaveCount(0)
  })
})

test.describe('părerile sportivilor', () => {
  test('formularul „Lasă o părere” trimite o părere care așteaptă aprobare', async ({ page }) => {
    // IP aleator pe test, ca limita de 2 păreri/oră să nu afecteze rulările repetate.
    await page.setExtraHTTPHeaders({ 'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 250) + 1}` })
    await page.goto('/ro')
    await page.getByText('Lasă o părere').click()
    await page.getByRole('button', { name: 'Trimite părerea' }).click()
    await expect(page.locator('#testimonial-status')).toContainText('Verifică câmpurile marcate')
    await expect(page.getByLabel(/^Nume \(așa cum vrei/)).toHaveAttribute('aria-invalid', 'true')

    await page.getByLabel(/^Nume \(așa cum vrei/).fill('Test E2E')
    await page.getByLabel(/^Părerea ta/).fill('Părere trimisă de testul automat end-to-end, nu e reală.')
    await page.getByLabel(/^Sunt de acord/).check()
    await page.getByRole('button', { name: 'Trimite părerea' }).click()
    await expect(page.locator('#testimonial-status')).toContainText('o public pe site după ce o citesc')
    // Nu apare imediat pe site.
    await page.reload()
    await expect(page.getByText('Părere trimisă de testul automat')).toHaveCount(0)
  })
})

test.describe('formular de contact', () => {
  test('validare în interfață și trimitere reușită', async ({ page }) => {
    await page.goto('/ro/contact')
    await page.getByRole('button', { name: 'Trimite mesajul' }).click()
    await expect(page.getByRole('status')).toContainText('Verifică câmpurile marcate')
    await expect(page.getByLabel(/^Nume/)).toHaveAttribute('aria-invalid', 'true')

    await page.getByLabel(/^Nume/).fill('Test E2E')
    await page.getByLabel(/^Email/).fill(`e2e-${Date.now()}@example.test`)
    await page.getByLabel('Colaborare').check()
    await page.getByLabel(/^Mesaj/).fill('Mesaj trimis de testul automat end-to-end.')
    await page.getByRole('button', { name: 'Trimite mesajul' }).click()
    await expect(page.getByRole('status')).toContainText('Mulțumesc')
  })
})
