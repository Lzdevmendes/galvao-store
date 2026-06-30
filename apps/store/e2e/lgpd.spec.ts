import { test, expect } from '@playwright/test'

// LGPD: nenhum script de analytics pode disparar antes do consentimento.
test.describe('Consentimento de cookies', () => {
  test('não carrega Clarity/GTM antes de aceitar', async ({ page }) => {
    const trackingRequests: string[] = []
    page.on('request', (req) => {
      const u = req.url()
      if (u.includes('clarity.ms') || u.includes('googletagmanager.com') || u.includes('google-analytics.com')) {
        trackingRequests.push(u)
      }
    })
    await page.goto('/')
    await page.waitForTimeout(2500) // dá tempo ao afterInteractive
    expect(trackingRequests, `tracking disparou sem consentimento: ${trackingRequests.join(', ')}`).toHaveLength(0)
  })

  test('descadastro com token inválido responde sem erro 500', async ({ request }) => {
    const res = await request.get('/api/newsletter/unsubscribe?token=inexistente')
    expect(res.status()).toBe(200)
  })
})
