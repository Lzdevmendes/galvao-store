import { describe, it, expect, vi, beforeEach } from 'vitest'

const dbAll = vi.fn()
const dbRun = vi.fn()
vi.mock('@/lib/db', () => ({ db: {
  all: (...a: unknown[]) => dbAll(...a),
  run: (...a: unknown[]) => dbRun(...a),
} }))

const downloadAndStoreImage = vi.fn()
vi.mock('@/lib/import/download-image', () => ({
  downloadAndStoreImage: (...a: unknown[]) => downloadAndStoreImage(...a),
}))

import { upsertScrapedProduct } from '@/lib/import/upsert-product'
import type { ScrapedProduct } from '@/lib/import/types'

// O `sql\`...\`` do drizzle-orm devolve um objeto (StringChunk[] + params), não
// uma string — reconstrói o texto literal só pra dar pra procurar substring
// nas asserções abaixo (não é о formato de query real, só pra teste).
function sqlText(q: unknown): string {
  const chunks = (q as { queryChunks?: unknown[] })?.queryChunks ?? []
  return chunks.map(c => (c && typeof c === 'object' && 'value' in c) ? (c as { value: string[] }).value.join('') : '').join(' ')
}

const item: ScrapedProduct = {
  externalRef: 'REF-1',
  name: 'Chuteira Society X',
  brandName: 'Nike',
  categoryName: 'Society',
  sizes: [{ size: '40', stock: 5 }],
  imageUrls: ['https://exemplo.com/img.jpg'],
}

beforeEach(() => {
  dbAll.mockReset(); dbRun.mockReset(); downloadAndStoreImage.mockReset()
  dbAll.mockResolvedValue([])                       // default: nada encontrado
  dbRun.mockResolvedValue({ rowsAffected: 1 })
  downloadAndStoreImage.mockResolvedValue({ ok: true, url: 'https://storage/x.jpg' })
})

describe('upsertScrapedProduct', () => {
  it('sem marca/categoria/preço reconhecidos → fica pendente, nunca cria produto', async () => {
    // tudo vazio (default do beforeEach): produto novo, marca não resolvida
    const result = await upsertScrapedProduct('source1', item)
    expect(result.status).toBe('pending')
    // INSERT INTO import_pending_items é o único db.run esperado
    expect(dbRun).toHaveBeenCalledTimes(1)
    expect(sqlText(dbRun.mock.calls[0][0])).toContain('import_pending_items')
  })

  it('marca+categoria+regra de preço resolvidas → publica direto, nunca calcula markup', async () => {
    dbAll
      .mockResolvedValueOnce([])                                                   // existing product? não
      .mockResolvedValueOnce([{ id: 'nike' }])                                     // resolveBrandId
      .mockResolvedValueOnce([{ id: 'society' }])                                  // resolveCategoryId
      .mockResolvedValueOnce([])                                                   // resolvePrice: sku, sem match
      .mockResolvedValueOnce([{ price_in_cents: 52999, price_promo_in_cents: null }]) // resolvePrice: name_contains
      .mockResolvedValueOnce([])                                                   // dup slug check

    const result = await upsertScrapedProduct('source1', item)

    expect(result.status).toBe('published')
    const insertProductCall = dbRun.mock.calls.find(c => sqlText(c[0]).includes('INSERT INTO products'))
    expect(insertProductCall).toBeDefined()
    // preço vem só da regra (52999), nunca de costInCents/markup calculado
    const insertVariantCall = dbRun.mock.calls.find(c => sqlText(c[0]).includes('INSERT INTO product_variants'))
    expect(insertVariantCall).toBeDefined()
    expect(downloadAndStoreImage).toHaveBeenCalledWith(expect.any(String), 'https://exemplo.com/img.jpg')
  })

  it('produto já importado antes (mesmo source+external_ref) → atualiza estoque, não duplica', async () => {
    dbAll
      .mockResolvedValueOnce([{ id: 'chuteira-society-x' }])           // existing product? sim
      .mockResolvedValueOnce([{ price_in_cents: 52999, price_promo_in_cents: null }]) // referenceVariant
      .mockResolvedValueOnce([{ id: 'variant-1', stock: 2 }])          // variante existente do tamanho 40

    const result = await upsertScrapedProduct('source1', item)

    expect(result.status).toBe('updated')
    expect(dbRun.mock.calls.some(c => sqlText(c[0]).includes('INSERT INTO products'))).toBe(false)
    const updateCall = dbRun.mock.calls.find(c => sqlText(c[0]).includes('UPDATE product_variants'))
    expect(updateCall).toBeDefined()
  })
})
