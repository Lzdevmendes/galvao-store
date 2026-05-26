import { test, expect } from '@playwright/test'

// Nota: este teste requer produtos no catálogo e Mercado Pago sandbox activo.
// Em CI, mocks de DB e MP sandbox devem estar configurados.

test.describe('Fluxo de compra', () => {
  test('carrinho vazio redireciona para home ao tentar checkout', async ({ page }) => {
    await page.goto('/checkout')
    // Com carrinho vazio, deve redirecionar para home
    await expect(page).toHaveURL('/')
  })

  test('página de checkout carrega formulário', async ({ page }) => {
    // Simula item no carrinho via localStorage antes de navegar
    await page.goto('/')
    await page.evaluate(() => {
      const cartItem = {
        variantId:    'test-variant',
        productId:    'test-product',
        productSlug:  'test-slug',
        productName:  'Nike Phantom Test',
        brandName:    'Nike',
        imageUrl:     '',
        size:         '42',
        color:        'Preto',
        priceInCents: 39900,
        pricePromoInCents: null,
        quantity:     1,
      }
      const state = { state: { items: [cartItem] }, version: 0 }
      localStorage.setItem('galvao-cart', JSON.stringify(state))
    })

    await page.goto('/checkout')
    // Step 1 — Identificação deve estar visível
    await expect(page.locator('input[placeholder*="João"]').first()).toBeVisible({ timeout: 5000 })
  })

  test('step 1 valida campos obrigatórios', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const cartItem = {
        variantId: 'test-variant', productId: 'test-product', productSlug: 'test-slug',
        productName: 'Nike Test', brandName: 'Nike', imageUrl: '', size: '42', color: 'Preto',
        priceInCents: 39900, pricePromoInCents: null, quantity: 1,
      }
      localStorage.setItem('galvao-cart', JSON.stringify({ state: { items: [cartItem] }, version: 0 }))
    })
    await page.goto('/checkout')

    // Tentar avançar sem preencher dados
    await page.getByRole('button', { name: /Continuar para Endereço/i }).click()
    // Deve exibir erro de validação
    await expect(page.locator('text=Informe nome e sobrenome')).toBeVisible()
  })
})

test.describe('Newsletter', () => {
  test('API newsletter rejeita email inválido', async ({ request }) => {
    const res = await request.post('/api/newsletter', {
      data: { email: 'invalido' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  test('API newsletter aceita email válido', async ({ request }) => {
    const res = await request.post('/api/newsletter', {
      data: { email: `e2e-test-${Date.now()}@example.com` },
    })
    expect([200, 201]).toContain(res.status())
    const body = await res.json()
    expect(body.ok).toBe(true)
  })
})

test.describe('Avise-me', () => {
  test('API avise-me rejeita payload inválido', async ({ request }) => {
    const res = await request.post('/api/avise-me', {
      data: { email: 'invalido', variantId: '' },
    })
    expect(res.status()).toBe(400)
  })

  test('API avise-me aceita payload válido', async ({ request }) => {
    const res = await request.post('/api/avise-me', {
      data: { email: `e2e-${Date.now()}@example.com`, variantId: 'some-variant-id', productName: 'Nike Test' },
    })
    // 200 = inserido ou já existe (ON CONFLICT DO NOTHING)
    expect(res.status()).toBe(200)
  })
})
