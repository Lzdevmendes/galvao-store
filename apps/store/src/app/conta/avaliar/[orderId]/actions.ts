'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

type ReviewInput = { productId: string; rating: number; body: string }

export async function submitReviews({ orderId, customerId, reviews }: {
  orderId: string
  customerId: string
  reviews: ReviewInput[]
}) {
  for (const r of reviews) {
    const exists = db.all(sql`SELECT id FROM reviews WHERE order_id = ${orderId} AND product_id = ${r.productId} LIMIT 1`)
    if (exists.length > 0) continue

    db.run(sql`
      INSERT INTO reviews (id, product_id, customer_id, order_id, rating, body, approved, created_at)
      VALUES (${crypto.randomUUID()}, ${r.productId}, ${customerId}, ${orderId}, ${r.rating}, ${r.body || null}, 0, datetime('now'))
    `)
  }
}
