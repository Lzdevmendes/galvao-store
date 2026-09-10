import { z } from 'zod'
import type { ScrapedProduct } from './types'

// Nunca confiar em dado de fronteira externa sem validar (Regra 9 do CLAUDE.md)
// — isto roda ANTES de qualquer INSERT/UPDATE no banco.
const scrapedProductSchema = z.object({
  externalRef: z.string().trim().min(1).max(200),
  name:        z.string().trim().min(1).max(200),
  brandName:   z.string().trim().min(1).max(100),
  categoryName: z.string().trim().min(1).max(100),
  costInCents: z.number().int().positive().optional(),
  sizes: z.array(z.object({
    size:  z.string().trim().min(1).max(20),
    stock: z.number().int().min(0),
  })).min(1),
  imageUrls: z.array(z.string().url()).max(20),
})

export interface NormalizeResult {
  valid: ScrapedProduct[]
  rejected: { item: unknown; error: string }[]
}

// Filtra e normaliza uma lista bruta vinda de um parser — itens inválidos são
// descartados com o motivo registado, nunca derrubam a execução inteira.
export function normalizeScrapedProducts(items: unknown[]): NormalizeResult {
  const valid: ScrapedProduct[] = []
  const rejected: { item: unknown; error: string }[] = []

  for (const item of items) {
    const parsed = scrapedProductSchema.safeParse(item)
    if (parsed.success) {
      valid.push({
        ...parsed.data,
        name: parsed.data.name.trim(),
        brandName: parsed.data.brandName.trim(),
        categoryName: parsed.data.categoryName.trim(),
      })
    } else {
      rejected.push({ item, error: parsed.error.issues.map(i => i.message).join('; ') })
    }
  }

  return { valid, rejected }
}
