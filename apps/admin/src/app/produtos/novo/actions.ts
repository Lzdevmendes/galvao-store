'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function createProduct(formData: FormData) {
  const name        = String(formData.get('name') ?? '').trim()
  const brandId     = String(formData.get('brand_id') ?? '').trim()
  const categoryId  = String(formData.get('category_id') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const status      = String(formData.get('status') ?? 'draft')
  const line        = String(formData.get('line') ?? '').trim() || null
  const priceStr    = String(formData.get('price') ?? '0').replace(',', '.')
  const promoStr    = String(formData.get('price_promo') ?? '').replace(',', '.')
  const sizesRaw    = String(formData.get('sizes') ?? '').trim()

  if (!name || !brandId || !categoryId || !description) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  const priceInCents = Math.round(parseFloat(priceStr) * 100)
  if (priceInCents <= 0) return { error: 'Preço inválido.' }

  const promoInCents = promoStr ? Math.round(parseFloat(promoStr) * 100) : null

  const baseSlug  = slugify(name)
  const productId = baseSlug
  const skuRaw    = baseSlug.toUpperCase().replace(/-/g, '').slice(0, 16)
  const suffix    = Math.random().toString(36).slice(2, 5).toUpperCase()
  const skuBase   = `${brandId.toUpperCase().slice(0, 3)}-${skuRaw}-${suffix}`

  const existing = db.all(sql`SELECT id FROM products WHERE id = ${productId} OR slug = ${baseSlug} LIMIT 1`)
  if (existing.length > 0) return { error: 'Já existe um produto com este nome/slug.' }

  db.run(sql`
    INSERT INTO products (id, slug, brand_id, category_id, name, sku_base, description, features, specs, tags, status, line, created_at, updated_at)
    VALUES (${productId}, ${baseSlug}, ${brandId}, ${categoryId}, ${name}, ${skuBase}, ${description}, '[]', '{}', '[]', ${status}, ${line}, datetime('now'), datetime('now'))
  `)

  // Criar variantes se tamanhos fornecidos
  const sizes = sizesRaw
    .split(/[\s,;]+/)
    .map(s => s.trim())
    .filter(Boolean)

  for (const size of sizes) {
    const variantId = crypto.randomUUID()
    const sku = `${skuBase}-${size}`
    db.run(sql`
      INSERT INTO product_variants (id, product_id, sku, size, color, price_in_cents, price_promo_in_cents, stock, stock_reserved, available, weight_g, height_cm, width_cm, length_cm, created_at, updated_at)
      VALUES (${variantId}, ${productId}, ${sku}, ${size}, null, ${priceInCents}, ${promoInCents}, 0, 0, 1, 500, 12, 22, 30, datetime('now'), datetime('now'))
    `)
  }

  revalidatePath('/produtos')
  redirect(`/produtos/${productId}`)
}
