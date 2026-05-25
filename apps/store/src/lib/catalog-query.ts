import { db } from './db'
import { sql, type SQL } from 'drizzle-orm'
import type { ProductCardData } from '@/components/catalog/product-card'

export type SortOption = 'relevancia' | 'lancamentos' | 'menor-preco' | 'maior-preco'

export const PAGE_SIZE = 24

export interface CatalogFilters {
  brandId?:    string
  categoryId?: string
  line?:       string
  size?:       string
  sort?:       SortOption | string
  page?:       number
}

function buildWhere(base: SQL, extra: SQL[]): SQL {
  return extra.reduce<SQL>((acc, cond) => sql`${acc} AND ${cond}`, base)
}

const ORDER: Record<SortOption, SQL> = {
  'relevancia':  sql`p.rating DESC, p.review_count DESC, p.created_at DESC`,
  'lancamentos': sql`p.created_at DESC`,
  'menor-preco': sql`min_price ASC`,
  'maior-preco': sql`min_price DESC`,
}

function orderClause(sort?: string): SQL {
  return ORDER[(sort as SortOption) ?? 'relevancia'] ?? ORDER.relevancia
}

export async function queryProducts(filters: CatalogFilters): Promise<ProductCardData[]> {
  const extra: SQL[] = []
  if (filters.brandId)    extra.push(sql`p.brand_id    = ${filters.brandId}`)
  if (filters.categoryId) extra.push(sql`p.category_id = ${filters.categoryId}`)
  if (filters.line)       extra.push(sql`p.line        = ${filters.line}`)
  if (filters.size)       extra.push(sql`
    EXISTS (
      SELECT 1 FROM product_variants sv
      WHERE sv.product_id = p.id
        AND sv.size        = ${filters.size}
        AND sv.available   = 1
    )
  `)

  const where = buildWhere(sql`p.status = 'published'`, extra)
  const order = orderClause(filters.sort)
  const page   = Math.max(1, filters.page ?? 1)
  const offset = (page - 1) * PAGE_SIZE

  return await db.all<ProductCardData>(sql`
    SELECT p.id, p.slug, p.name, b.name AS brand_name, p.badge,
           COALESCE(pi.url, '')    AS image_url,
           COALESCE(pi.alt, p.name) AS image_alt,
           MIN(v.price_in_cents)        AS min_price,
           MIN(v.price_promo_in_cents)  AS min_promo
    FROM   products p
    JOIN   brands b          ON b.id  = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    LEFT JOIN product_variants v ON v.product_id = p.id AND v.available   = 1
    WHERE  ${where}
    GROUP  BY p.id
    ORDER  BY ${order}
    LIMIT  ${PAGE_SIZE} OFFSET ${offset}
  `)
}

export async function queryProductsCount(filters: Omit<CatalogFilters, 'sort' | 'page'>): Promise<number> {
  const extra: SQL[] = []
  if (filters.brandId)    extra.push(sql`p.brand_id    = ${filters.brandId}`)
  if (filters.categoryId) extra.push(sql`p.category_id = ${filters.categoryId}`)
  if (filters.line)       extra.push(sql`p.line        = ${filters.line}`)
  if (filters.size)       extra.push(sql`
    EXISTS (
      SELECT 1 FROM product_variants sv
      WHERE sv.product_id = p.id
        AND sv.size        = ${filters.size}
        AND sv.available   = 1
    )
  `)
  const where = buildWhere(sql`p.status = 'published'`, extra)
  const rows = await db.all<{ n: number }>(sql`
    SELECT COUNT(DISTINCT p.id) as n
    FROM   products p
    JOIN   brands b ON b.id = p.brand_id
    WHERE  ${where}
  `)
  return rows[0]?.n ?? 0
}

export async function queryAvailableSizes(
  filters: Omit<CatalogFilters, 'size' | 'sort'>
): Promise<string[]> {
  const extra: SQL[] = [sql`pv.available = 1`]
  if (filters.brandId)    extra.push(sql`p.brand_id    = ${filters.brandId}`)
  if (filters.categoryId) extra.push(sql`p.category_id = ${filters.categoryId}`)
  if (filters.line)       extra.push(sql`p.line        = ${filters.line}`)

  const where = buildWhere(sql`p.status = 'published'`, extra)

  const rows = await db.all<{ size: string }>(sql`
    SELECT DISTINCT pv.size
    FROM   product_variants pv
    JOIN   products p ON p.id = pv.product_id
    WHERE  ${where}
    ORDER  BY CAST(pv.size AS INTEGER)
  `)
  return rows.map(r => r.size)
}

export async function queryBrandLines(brandId: string): Promise<string[]> {
  const rows = await db.all<{ line: string }>(sql`
    SELECT DISTINCT line
    FROM   products
    WHERE  brand_id = ${brandId}
      AND  line IS NOT NULL
      AND  status   = 'published'
    ORDER  BY line
  `)
  return rows.map(r => r.line)
}

export async function queryBrandsWithCount(limit = 4) {
  return await db.all<{
    id: string; slug: string; name: string; gradient_css: string | null; count: number
  }>(sql`
    SELECT b.id, b.slug, b.name, b.gradient_css,
           COUNT(p.id) AS count
    FROM   brands b
    LEFT JOIN products p ON p.brand_id = b.id AND p.status = 'published'
    WHERE  b.active = 1
    GROUP  BY b.id
    ORDER  BY count DESC
    LIMIT  ${limit}
  `)
}

export async function queryCategoriesWithCount() {
  return await db.all<{
    id: string; slug: string; name: string; surface_type: string | null; sort_order: number; count: number
  }>(sql`
    SELECT c.id, c.slug, c.name, c.surface_type, c.sort_order,
           COUNT(p.id) AS count
    FROM   categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.status = 'published'
    GROUP  BY c.id
    HAVING count > 0
    ORDER  BY c.sort_order
  `)
}
