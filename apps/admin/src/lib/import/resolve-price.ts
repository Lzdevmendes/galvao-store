import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import type { ScrapedProduct } from './types'

export interface ResolvedPrice {
  priceInCents: number
  pricePromoInCents: number | null
}

// O robô nunca calcula preço de venda por markup — o Galvão cadastra o preço
// final em `import_price_rules` (tela /importacoes) e é isso que decide se um
// item pode ser publicado automaticamente ou fica pendente. SKU exato tem
// prioridade sobre substring de nome.
export async function resolvePrice(
  item: ScrapedProduct,
  brandId: string | null,
): Promise<ResolvedPrice | null> {
  const bySku = await db.all<{ price_in_cents: number; price_promo_in_cents: number | null }>(sql`
    SELECT price_in_cents, price_promo_in_cents FROM import_price_rules
    WHERE match_type = 'sku' AND lower(match_value) = lower(${item.externalRef})
    LIMIT 1
  `)
  if (bySku.length > 0) {
    return { priceInCents: bySku[0].price_in_cents, pricePromoInCents: bySku[0].price_promo_in_cents }
  }

  const byName = await db.all<{ price_in_cents: number; price_promo_in_cents: number | null }>(sql`
    SELECT price_in_cents, price_promo_in_cents FROM import_price_rules
    WHERE match_type = 'name_contains'
      AND instr(lower(${item.name}), lower(match_value)) > 0
      AND (brand_id IS NULL OR brand_id = ${brandId})
    ORDER BY length(match_value) DESC
    LIMIT 1
  `)
  if (byName.length > 0) {
    return { priceInCents: byName[0].price_in_cents, pricePromoInCents: byName[0].price_promo_in_cents }
  }

  return null
}

// Resolve o brand_id local a partir do nome da marca como aparece no site do
// importador (ex.: "Nike", "NIKE", "nike futebol" → precisa bater com `brands`).
export async function resolveBrandId(brandName: string): Promise<string | null> {
  const rows = await db.all<{ id: string }>(sql`
    SELECT id FROM brands WHERE lower(name) = lower(${brandName}) LIMIT 1
  `)
  return rows[0]?.id ?? null
}

// Resolve category_id local a partir do nome/piso como aparece no site do
// importador — bate por nome exato ou por surface_type (ex.: "Society"/"IC").
export async function resolveCategoryId(categoryName: string): Promise<string | null> {
  const rows = await db.all<{ id: string }>(sql`
    SELECT id FROM categories
    WHERE lower(name) = lower(${categoryName}) OR lower(surface_type) = lower(${categoryName})
    LIMIT 1
  `)
  return rows[0]?.id ?? null
}
