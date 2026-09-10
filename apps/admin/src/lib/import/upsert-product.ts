import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { slugify } from '@/lib/slugify'
import { resolvePrice, resolveBrandId, resolveCategoryId, type ResolvedPrice } from './resolve-price'
import { downloadAndStoreImage } from './download-image'
import type { ScrapedProduct } from './types'

const MAX_IMAGES_PER_PRODUCT = 6

export type UpsertResult =
  | { status: 'published'; productId: string }
  | { status: 'updated'; productId: string }
  | { status: 'pending' }

// Decide o destino de um item já validado (normalize.ts):
// - já existe (mesmo source+external_ref) → atualiza só estoque/disponibilidade
// - marca+categoria+preço resolvidos → cria produto já `published`
// - falta qualquer um dos três → fica em `import_pending_items` (não dá pra
//   publicar produto sem marca/categoria — FK NOT NULL — nem sem preço, por
//   decisão do Galvão de nunca calcular markup automático)
export async function upsertScrapedProduct(sourceId: string, item: ScrapedProduct): Promise<UpsertResult> {
  const existing = await db.all<{ id: string }>(sql`
    SELECT id FROM products WHERE external_source_id = ${sourceId} AND external_ref = ${item.externalRef} LIMIT 1
  `)

  if (existing.length > 0) {
    const productId = existing[0].id
    await updateVariantsStock(productId, item.sizes)
    return { status: 'updated', productId }
  }

  const [brandId, categoryId] = await Promise.all([
    resolveBrandId(item.brandName),
    resolveCategoryId(item.categoryName),
  ])

  const price = brandId ? await resolvePrice(item, brandId) : null

  if (!brandId || !categoryId || !price) {
    await stagePendingItem(sourceId, item)
    return { status: 'pending' }
  }

  const productId = await createPublishedProduct(sourceId, item, brandId, categoryId, price)
  return { status: 'published', productId }
}

async function stagePendingItem(sourceId: string, item: ScrapedProduct): Promise<void> {
  const id = crypto.randomUUID()
  await db.run(sql`
    INSERT INTO import_pending_items
      (id, source_id, external_ref, raw_name, raw_brand, raw_category, cost_in_cents, sizes_json, image_urls_json, created_at)
    VALUES
      (${id}, ${sourceId}, ${item.externalRef}, ${item.name}, ${item.brandName}, ${item.categoryName},
       ${item.costInCents ?? null}, ${JSON.stringify(item.sizes)}, ${JSON.stringify(item.imageUrls)}, datetime('now'))
    ON CONFLICT(source_id, external_ref) DO UPDATE SET
      raw_name = excluded.raw_name,
      raw_brand = excluded.raw_brand,
      raw_category = excluded.raw_category,
      cost_in_cents = excluded.cost_in_cents,
      sizes_json = excluded.sizes_json,
      image_urls_json = excluded.image_urls_json
  `)
}

async function createPublishedProduct(
  sourceId: string,
  item: ScrapedProduct,
  brandId: string,
  categoryId: string,
  price: ResolvedPrice,
): Promise<string> {
  const baseSlug = slugify(item.name)
  let productId = baseSlug
  const dup = await db.all(sql`SELECT id FROM products WHERE id = ${productId} OR slug = ${baseSlug} LIMIT 1`)
  if (dup.length > 0) productId = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

  const skuRaw  = baseSlug.toUpperCase().replace(/-/g, '').slice(0, 16)
  const suffix  = Math.random().toString(36).slice(2, 5).toUpperCase()
  const skuBase = `${item.brandName.toUpperCase().slice(0, 3)}-${skuRaw}-${suffix}`
  const description = `${item.name} — importado automaticamente de ${item.brandName}. Revisar e completar descrição.`

  await db.run(sql`
    INSERT INTO products
      (id, slug, brand_id, category_id, name, sku_base, description, features, specs, tags, status,
       external_source_id, external_ref, created_at, updated_at)
    VALUES
      (${productId}, ${productId}, ${brandId}, ${categoryId}, ${item.name}, ${skuBase}, ${description},
       '[]', '{}', '[]', 'published', ${sourceId}, ${item.externalRef}, datetime('now'), datetime('now'))
  `)

  for (const { size, stock } of item.sizes) {
    const variantId = crypto.randomUUID()
    const sku = `${skuBase}-${size}`
    await db.run(sql`
      INSERT INTO product_variants
        (id, product_id, sku, size, color, price_in_cents, price_promo_in_cents, cost_in_cents,
         stock, stock_reserved, available, weight_g, height_cm, width_cm, length_cm, created_at, updated_at)
      VALUES
        (${variantId}, ${productId}, ${sku}, ${size}, null, ${price.priceInCents}, ${price.pricePromoInCents},
         ${item.costInCents ?? null}, ${stock}, 0, ${stock > 0 ? 1 : 0}, 500, 12, 22, 30, datetime('now'), datetime('now'))
    `)
    if (stock > 0) {
      await db.run(sql`
        INSERT INTO stock_movements (id, variant_id, delta, reason, reference_id, created_by, created_at)
        VALUES (${crypto.randomUUID()}, ${variantId}, ${stock}, 'import', ${sourceId}, 'system:import', datetime('now'))
      `)
    }
  }

  for (const imageUrl of item.imageUrls.slice(0, MAX_IMAGES_PER_PRODUCT)) {
    const result = await downloadAndStoreImage(productId, imageUrl)
    if (!result.ok) {
      // Imagem individual falhando não derruba o produto — só fica sem essa foto.
      console.error(`[import] falha ao baixar imagem de ${productId}: ${result.error}`)
    }
  }

  return productId
}

async function updateVariantsStock(productId: string, sizes: { size: string; stock: number }[]): Promise<void> {
  const referenceVariant = await db.all<{ price_in_cents: number; price_promo_in_cents: number | null }>(sql`
    SELECT price_in_cents, price_promo_in_cents FROM product_variants WHERE product_id = ${productId} LIMIT 1
  `)

  for (const { size, stock } of sizes) {
    const existing = await db.all<{ id: string; stock: number }>(sql`
      SELECT id, stock FROM product_variants WHERE product_id = ${productId} AND size = ${size} LIMIT 1
    `)

    if (existing.length > 0) {
      const variantId = existing[0].id
      const delta = stock - existing[0].stock
      await db.run(sql`
        UPDATE product_variants SET stock = ${stock}, available = ${stock > 0 ? 1 : 0}, updated_at = datetime('now')
        WHERE id = ${variantId}
      `)
      if (delta !== 0) {
        await db.run(sql`
          INSERT INTO stock_movements (id, variant_id, delta, reason, reference_id, created_by, created_at)
          VALUES (${crypto.randomUUID()}, ${variantId}, ${delta}, 'import', null, 'system:import', datetime('now'))
        `)
      }
    } else if (referenceVariant.length > 0 && stock > 0) {
      // Tamanho novo apareceu no site do importador depois da primeira importação —
      // usa o mesmo preço já praticado nas outras variantes deste produto.
      const variantId = crypto.randomUUID()
      const sku = `${productId}-${size}-${Math.random().toString(36).slice(2, 5)}`.toUpperCase()
      await db.run(sql`
        INSERT INTO product_variants
          (id, product_id, sku, size, color, price_in_cents, price_promo_in_cents,
           stock, stock_reserved, available, weight_g, height_cm, width_cm, length_cm, created_at, updated_at)
        VALUES
          (${variantId}, ${productId}, ${sku}, ${size}, null, ${referenceVariant[0].price_in_cents}, ${referenceVariant[0].price_promo_in_cents},
           ${stock}, 0, 1, 500, 12, 22, 30, datetime('now'), datetime('now'))
      `)
    }
  }
}
