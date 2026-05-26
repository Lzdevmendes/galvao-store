import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import type { CartItem } from '@/store/cart'

const cartItemSchema = z.object({
  variantId:         z.string().min(1),
  quantity:          z.number().int().min(1).max(99),
  productId:         z.string().optional(),
  productSlug:       z.string().optional(),
  productName:       z.string().optional(),
  brandName:         z.string().optional(),
  imageUrl:          z.string().optional(),
  size:              z.string().optional(),
  color:             z.string().optional(),
  priceInCents:      z.number().int().min(0).optional(),
  pricePromoInCents: z.number().int().min(0).nullable().optional(),
})
const syncSchema = z.object({ items: z.array(cartItemSchema).max(50) })

// POST: guest cart → DB + return merged cart
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = syncSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  const { items } = parsed.data as { items: CartItem[] }

  // Upsert cada item do guest cart na DB (não substituir qty se já existe mais)
  for (const item of items) {
    await db.run(sql`
      INSERT INTO cart_items (id, user_id, variant_id, qty, updated_at)
      VALUES (${crypto.randomUUID()}, ${user.id}, ${item.variantId}, ${item.quantity}, datetime('now'))
      ON CONFLICT(user_id, variant_id) DO UPDATE SET
        qty        = MAX(qty, excluded.qty),
        updated_at = datetime('now')
    `)
  }

  // Retornar todos os itens do utilizador da DB para merge
  const dbItems = await db.all<{
    variant_id: string; qty: number
    price_in_cents: number; price_promo_in_cents: number | null
    product_id: string; product_slug: string; product_name: string
    brand_name: string; image_url: string; size: string; color: string
  }>(sql`
    SELECT ci.variant_id, ci.qty,
           pv.price_in_cents, pv.price_promo_in_cents,
           p.id product_id, p.slug product_slug, p.name product_name,
           b.name brand_name,
           COALESCE(pi.url,'') image_url,
           pv.size, pv.color
    FROM cart_items ci
    JOIN product_variants pv ON pv.id = ci.variant_id
    JOIN products p          ON p.id  = pv.product_id
    JOIN brands b            ON b.id  = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    WHERE ci.user_id = ${user.id}
      AND pv.available = 1
      AND pv.stock > pv.stock_reserved
  `)

  const cartItems: CartItem[] = dbItems.map(r => ({
    variantId:         r.variant_id,
    productId:         r.product_id,
    productSlug:       r.product_slug,
    productName:       r.product_name,
    brandName:         r.brand_name,
    imageUrl:          r.image_url,
    size:              r.size,
    color:             r.color,
    priceInCents:      r.price_in_cents,
    pricePromoInCents: r.price_promo_in_cents,
    quantity:          r.qty,
  }))

  return NextResponse.json({ items: cartItems })
}

// DELETE: limpar carrinho do utilizador no logout
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true })
  await db.run(sql`DELETE FROM cart_items WHERE user_id = ${user.id}`)
  return NextResponse.json({ ok: true })
}
