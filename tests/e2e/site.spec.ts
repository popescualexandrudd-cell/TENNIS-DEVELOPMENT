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

  test('fără scroll orizontal', async ({ page }) => {
    for (const path of ['/ro', '/ro/contact', '/ro/antrenamente']) {
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })

  test('fără încălcări de accesibilitate serioase (axe)', async ({ page }) => {
    for (const path of ['/ro', '/ro/contact']) {
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

test.describe('meniu mobil', () => {
  test.skip(({ isMobile }) => !isMobile, 'doar pe mobil')
  test('se deschide, se închide cu Escape și redă focusul', async ({ page }) => {
    await page.goto('/ro')
    const button = page.getByRole('button', { name: 'Meniu' })
    await button.click()
    await expect(page.getByRole('navigation', { name: 'Meniu' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('navigation', { name: 'Meniu' })).toBeHidden()
    await expect(button).toBeFocused()
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
