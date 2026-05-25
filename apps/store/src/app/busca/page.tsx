import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { type ProductCardData } from '@/components/catalog/product-card'
import { BuscaClient } from './busca-client'

type SearchParams = Promise<{ q?: string; marca?: string; categoria?: string; tamanho?: string; sort?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" — Busca · Galvão's Store` : "Busca · Galvão's Store",
    description: `Resultados de busca para ${q} na Galvão's Store.`,
  }
}

async function searchProducts(q: string, marca?: string, categoria?: string, tamanho?: string, sort = 'relevancia'): Promise<ProductCardData[]> {
  const term = `%${q}%`
  const brandFilter    = marca    ? sql`AND b.slug = ${marca}`    : sql``
  const catFilter      = categoria ? sql`AND c.slug = ${categoria}` : sql``
  const sizeFilter     = tamanho   ? sql`AND EXISTS (SELECT 1 FROM product_variants sv WHERE sv.product_id = p.id AND sv.size = ${tamanho} AND sv.available = 1 AND sv.stock > sv.stock_reserved)` : sql``
  const orderClause    = sort === 'menor-preco' ? sql`min_price ASC` : sort === 'maior-preco' ? sql`min_price DESC` : sort === 'lancamentos' ? sql`p.created_at DESC` : sql`p.rating DESC, p.review_count DESC`

  return await db.all<ProductCardData>(sql`
    SELECT p.id, p.slug, p.name, b.name as brand_name, p.badge,
           COALESCE(pi.url, '') as image_url,
           COALESCE(pi.alt, p.name) as image_alt,
           MIN(v.price_in_cents) as min_price,
           MIN(v.price_promo_in_cents) as min_promo
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    LEFT JOIN product_variants v ON v.product_id = p.id AND v.available = 1
    WHERE p.status = 'published'
      AND (
        p.name LIKE ${term}
        OR b.name LIKE ${term}
        OR c.name LIKE ${term}
        OR p.description LIKE ${term}
        OR p.line LIKE ${term}
      )
      ${brandFilter}
      ${catFilter}
      ${sizeFilter}
    GROUP BY p.id
    ORDER BY ${orderClause}
    LIMIT 48
  `)
}

export default async function BuscaPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = '', marca, categoria, tamanho, sort } = await searchParams

  const [products, brands, categories, sizes] = await Promise.all([
    q.trim() ? searchProducts(q.trim(), marca, categoria, tamanho, sort) : Promise.resolve([] as ProductCardData[]),
    Promise.resolve(await db.all<{ slug: string; name: string }>(sql`SELECT slug, name FROM brands WHERE active = 1 ORDER BY name`)),
    Promise.resolve(await db.all<{ slug: string; name: string }>(sql`SELECT c.slug, c.name FROM categories c JOIN products p ON p.category_id = c.id WHERE p.status = 'published' GROUP BY c.id ORDER BY c.sort_order`)),
    Promise.resolve(await db.all<{ size: string }>(sql`SELECT DISTINCT size FROM product_variants WHERE available = 1 ORDER BY CAST(size AS REAL), size`)),
  ])

  return (
    <BuscaClient
      q={q}
      products={products}
      brands={brands}
      categories={categories}
      sizes={sizes.map(s => s.size)}
      total={products.length}
      currentMarca={marca}
      currentCategoria={categoria}
      currentTamanho={tamanho}
      currentSort={sort}
    />
  )
}
