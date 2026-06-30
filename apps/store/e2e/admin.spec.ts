import { test, expect } from '@playwright/test'

// Smoke do admin. Requer o app admin a correr (porta 3001 por defeito).
// Configurável via ADMIN_BASE_URL. Cobre o gating: tudo redireciona para /login.
const ADMIN = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001'

test.describe('Admin — gating de autenticação', () => {
  test('rota protegida redireciona para /login', async ({ page }) => {
    await page.goto(`${ADMIN}/produtos`)
    await expect(page).toHaveURL(/\/login/)
  })

  test('página de login do admin renderiza', async ({ page }) => {
    await page.goto(`${ADMIN}/login`)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})
