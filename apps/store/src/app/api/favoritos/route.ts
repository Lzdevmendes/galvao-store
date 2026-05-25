import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function firstVariantId(productId: string): Promise<string | null> {
  const rows = await db.all<{ id: string }>(sql`SELECT id FROM product_variants WHERE product_id = ${productId} LIMIT 1`)
  return rows[0]?.id ?? null
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ ids: [] })
  const rows = await db.all<{ product_id: string }>(sql`
    SELECT pv.product_id FROM wishlists w
    JOIN product_variants pv ON pv.id = w.variant_id
    WHERE w.user_id = ${user.id}
  `)
  return NextResponse.json({ ids: [...new Set(rows.map(r => r.product_id))] })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { productId } = await req.json()
  const variantId = await firstVariantId(productId)
  if (!variantId) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  const exists = await db.all(sql`
    SELECT w.id FROM wishlists w
    JOIN product_variants pv ON pv.id = w.variant_id
    WHERE w.user_id = ${user.id} AND pv.product_id = ${productId}
  `)
  if (exists.length === 0) {
    await db.run(sql`INSERT INTO wishlists (id, user_id, variant_id, created_at) VALUES (${crypto.randomUUID()}, ${user.id}, ${variantId}, datetime('now'))`)
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { productId } = await req.json()
  await db.run(sql`
    DELETE FROM wishlists WHERE user_id = ${user.id} AND variant_id IN (
      SELECT id FROM product_variants WHERE product_id = ${productId}
    )
  `)
  return NextResponse.json({ ok: true })
}
