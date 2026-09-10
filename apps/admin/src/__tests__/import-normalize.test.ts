import { describe, it, expect } from 'vitest'
import { normalizeScrapedProducts } from '@/lib/import/normalize'

const base = {
  externalRef: 'REF-1',
  name: 'Chuteira Society X',
  brandName: 'Nike',
  categoryName: 'Society',
  sizes: [{ size: '40', stock: 3 }],
  imageUrls: ['https://exemplo.com/img.jpg'],
}

describe('normalizeScrapedProducts', () => {
  it('aceita um item válido', () => {
    const { valid, rejected } = normalizeScrapedProducts([base])
    expect(valid).toHaveLength(1)
    expect(rejected).toHaveLength(0)
    expect(valid[0].name).toBe('Chuteira Society X')
  })

  it('rejeita item sem nome', () => {
    const { valid, rejected } = normalizeScrapedProducts([{ ...base, name: '' }])
    expect(valid).toHaveLength(0)
    expect(rejected).toHaveLength(1)
  })

  it('rejeita item sem tamanhos', () => {
    const { valid, rejected } = normalizeScrapedProducts([{ ...base, sizes: [] }])
    expect(valid).toHaveLength(0)
    expect(rejected).toHaveLength(1)
  })

  it('rejeita URL de imagem inválida', () => {
    const { valid, rejected } = normalizeScrapedProducts([{ ...base, imageUrls: ['nao-e-url'] }])
    expect(valid).toHaveLength(0)
    expect(rejected).toHaveLength(1)
  })

  it('rejeita custo negativo mas mantém os outros itens válidos da lista', () => {
    const { valid, rejected } = normalizeScrapedProducts([base, { ...base, externalRef: 'REF-2', costInCents: -100 }])
    expect(valid).toHaveLength(1)
    expect(rejected).toHaveLength(1)
  })

  it('não derruba a lista inteira num item malformado (não-objeto)', () => {
    const { valid, rejected } = normalizeScrapedProducts([base, null, undefined, 'string qualquer'])
    expect(valid).toHaveLength(1)
    expect(rejected).toHaveLength(3)
  })
})
