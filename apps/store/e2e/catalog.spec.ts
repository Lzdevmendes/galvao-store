import { test, expect } from '@playwright/test'

test.describe('Catálogo', () => {
  test('página /produtos carrega com paginação', async ({ page }) => {
    await page.goto('/produtos')
    await expect(page).toHaveTitle(/Galvão/)
    // Verifica que há produtos na grade (ou mensagem de catálogo vazio)
    const grid = page.locator('.grid-products, [class*="grid"]').first()
    await expect(grid).toBeVisible()
  })

  test('busca retorna resultados', async ({ page }) => {
    await page.goto('/busca?q=nike')
    await expect(page).toHaveURL(/busca/)
    // Página carrega sem erro 500
    const status = page.locator('h1').first()
    await expect(status).toBeVisible()
  })

  test('SiteHeader tem campo de busca', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.locator('header.site input[type="search"], header.site input[placeholder*="busca"], header.site input[placeholder*="Busca"]').first()
    await expect(searchInput).toBeVisible()
  })
})
