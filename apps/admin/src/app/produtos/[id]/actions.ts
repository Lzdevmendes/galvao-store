'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateProduct(productId: string, formData: FormData) {
  const name        = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const line        = String(formData.get('line') ?? '').trim() || null
  const badge       = String(formData.get('badge') ?? '') || null
  const status      = String(formData.get('status') ?? 'draft')
  const metaTitle   = String(formData.get('meta_title') ?? '').trim() || null
  const metaDesc    = String(formData.get('meta_description') ?? '').trim() || null

  if (!name || !description) return { error: 'Nome e descrição são obrigatórios.' }

  await db.run(sql`
    UPDATE products
    SET name = ${name},
        description = ${description},
        line = ${line},
        badge = ${badge},
        status = ${status},
        meta_title = ${metaTitle},
        meta_description = ${metaDesc},
        updated_at = datetime('now')
    WHERE id = ${productId}
  `)

  revalidatePath(`/produtos/${productId}`)
  revalidatePath('/produtos')
  return { ok: true }
}

export async function updateVariantPrice(variantId: string, priceInCents: number, promoInCents: number | null) {
  if (priceInCents <= 0) return { error: 'Preço inválido.' }

  await db.run(sql`
    UPDATE product_variants
    SET price_in_cents = ${priceInCents},
        price_promo_in_cents = ${promoInCents},
        updated_at = datetime('now')
    WHERE id = ${variantId}
  `)

  return { ok: true }
}
