import { test, expect } from '@playwright/test'

// As páginas da conta exigem login. Sem sessão, devem redirecionar para /auth/login
// preservando o destino (?redirect=). Cobre o gating de autenticação (LGPD/IDOR).
test.describe('Conta — gating de autenticação', () => {
  for (const path of ['/conta/privacidade', '/conta/dados', '/conta/enderecos']) {
    test(`${path} redireciona convidado para login`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  }

  test('login mostra formulário e opção Google', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})

test.describe('Exportar dados — exige autenticação', () => {
  test('GET /api/conta/exportar sem sessão devolve 401', async ({ request }) => {
    const res = await request.get('/api/conta/exportar')
    expect(res.status()).toBe(401)
  })
})
