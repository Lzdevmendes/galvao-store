import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { limiters, checkRateLimit } from '@/lib/ratelimit'

// LGPD art. 18 (portabilidade) — devolve todos os dados pessoais do titular em JSON.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const blocked = await checkRateLimit(limiters.accountExport, `export:${user.id}`, 3, 60 * 60 * 1000, 3600)
  if (blocked) return blocked

  const [profile, addresses, orders, orderItems, wishlist, coupons, reviews, consents] = await Promise.all([
    db.all(sql`SELECT * FROM users WHERE id = ${user.id}`),
    db.all(sql`SELECT * FROM addresses WHERE user_id = ${user.id}`),
    db.all(sql`SELECT * FROM orders WHERE user_id = ${user.id}`),
    db.all(sql`SELECT oi.* FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = ${user.id}`),
    db.all(sql`SELECT * FROM wishlists WHERE user_id = ${user.id}`),
    db.all(sql`SELECT * FROM coupon_uses WHERE user_id = ${user.id}`),
    db.all(sql`SELECT * FROM reviews WHERE customer_id = ${user.id}`),
    db.all(sql`SELECT type, granted, source, created_at FROM user_consents WHERE user_id = ${user.id}`),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email },
    profile, addresses, orders, orderItems, wishlist, coupons, reviews, consents,
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="galvao-meus-dados-${user.id}.json"`,
    },
  })
}
