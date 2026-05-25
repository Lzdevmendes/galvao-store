import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { email, variantId, productName } = await req.json()

  if (!email || !variantId) {
    return NextResponse.json({ error: 'Parâmetros em falta' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
  }

  const key = email.toLowerCase()
  await db.run(sql`
    INSERT INTO stock_alerts (id, email, variant_id, product_name)
    VALUES (${crypto.randomUUID()}, ${key}, ${variantId}, ${productName ?? ''})
    ON CONFLICT(email, variant_id) DO NOTHING
  `)

  return NextResponse.json({ ok: true })
}
