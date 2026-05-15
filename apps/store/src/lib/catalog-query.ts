import { db } from './db'
import { sql, type SQL } from 'drizzle-orm'
import type { ProductCardData } from '@/components/catalog/product-card'

// ── Types ──────────────────────────────────────────────────────────────────

export type SortOption = 'relevancia' | 'lancamentos' | 'menor-preco' | 'maior-preco'

export interface CatalogFilters {
  brandId?:    string
  categoryId?: string
  line?:       string
  size?:       string
  sort?:       SortOption | string
}

// ── Helpers ────────────────────────────────────────────────────────────────

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

// ── Queries ────────────────────────────────────────────────────────────────

/** Lista de produtos com filtros opcionais. */
export function queryProducts(filters: CatalogFilters): ProductCardData[] {
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

  return db.all<ProductCardData>(sql`
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
  `)
}

/** Tamanhos disponíveis para um contexto de filtros (sem filtro de tamanho). */
export function queryAvailableSizes(
  filters: Omit<CatalogFilters, 'size' | 'sort'>
): string[] {
  const extra: SQL[] = [sql`pv.available = 1`]
  if (filters.brandId)    extra.push(sql`p.brand_id    = ${filters.brandId}`)
  if (filters.categoryId) extra.push(sql`p.category_id = ${filters.categoryId}`)
  if (filters.line)       extra.push(sql`p.line        = ${filters.line}`)

  const where = buildWhere(sql`p.status = 'published'`, extra)

  return db.all<{ size: string }>(sql`
    SELECT DISTINCT pv.size
    FROM   product_variants pv
    JOIN   products p ON p.id = pv.product_id
    WHERE  ${where}
    ORDER  BY CAST(pv.size AS INTEGER)
  `).map(r => r.size)
}

/** Linhas (sub-marcas) de uma marca, só se tiver produtos publicados. */
export function queryBrandLines(brandId: string): string[] {
  return db.all<{ line: string }>(sql`
    SELECT DISTINCT line
    FROM   products
    WHERE  brand_id = ${brandId}
      AND  line IS NOT NULL
      AND  status   = 'published'
    ORDER  BY line
  `).map(r => r.line)
}

/** Marcas activas com contagem real de produtos publicados. */
export function queryBrandsWithCount(limit = 4) {
  return db.all<{
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

/** Categorias com contagem real — só as que têm produtos. */
export function queryCategoriesWithCount() {
  return db.all<{
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
