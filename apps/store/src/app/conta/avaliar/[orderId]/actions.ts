'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

type ReviewInput = { productId: string; rating: number; body: string }

export async function submitReviews({ orderId, reviews }: {
  orderId: string
  reviews: ReviewInput[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Garante que o pedido pertence ao utilizador antes de inserir reviews
  const orders = await db.all(sql`SELECT id FROM orders WHERE id = ${orderId} AND customer_email = ${user.email} LIMIT 1`)
  if (orders.length === 0) throw new Error('Pedido não encontrado')

  for (const r of reviews) {
    const exists = await db.all(sql`SELECT id FROM reviews WHERE order_id = ${orderId} AND product_id = ${r.productId} LIMIT 1`)
    if (exists.length > 0) continue

    await db.run(sql`
      INSERT INTO reviews (id, product_id, customer_id, order_id, rating, body, approved, created_at)
      VALUES (${crypto.randomUUID()}, ${r.productId}, ${user.id}, ${orderId}, ${r.rating}, ${r.body || null}, 0, datetime('now'))
    `)
  }
}
