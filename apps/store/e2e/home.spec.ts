import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('carrega corretamente', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Galvão/)
    await expect(page.locator('nav.brands')).toBeVisible()
  })

  test('PromoBar está visível', async ({ page }) => {
    await page.goto('/')
    const promoBar = page.locator('.promo-bar')
    await expect(promoBar).toBeVisible()
  })

  test('navegação por marca funciona', async ({ page }) => {
    await page.goto('/')
    const brandLinks = page.locator('nav.brands a')
    const count = await brandLinks.count()
    expect(count).toBeGreaterThan(0)
  })
})
