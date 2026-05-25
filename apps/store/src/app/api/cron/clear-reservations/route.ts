import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expired = await db.all<{ id: string }>(sql`
    SELECT id FROM orders
    WHERE status = 'pending_payment'
    AND created_at < datetime('now', '-30 minutes')
  `)

  let cleared = 0

  for (const { id } of expired) {
    const items = await db.all<{ variant_id: string; qty: number }>(sql`
      SELECT variant_id, qty FROM order_items WHERE order_id = ${id}
    `)

    for (const item of items) {
      await db.run(sql`
        UPDATE product_variants
        SET stock_reserved = MAX(0, stock_reserved - ${item.qty})
        WHERE id = ${item.variant_id}
      `)
    }

    await db.run(sql`UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ${id}`)
    await db.run(sql`
      INSERT INTO order_events (id, order_id, type, created_by, created_at)
      VALUES (${crypto.randomUUID()}, ${id}, 'cancelled', 'system', datetime('now'))
    `)

    cleared++
  }

  return NextResponse.json({ ok: true, cleared })
}
