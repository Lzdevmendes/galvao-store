import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ ids: [] })
  const rows = db.all<{ product_id: string }>(sql`SELECT product_id FROM wishlists WHERE user_id = ${user.id}`)
  return NextResponse.json({ ids: rows.map(r => r.product_id) })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { productId } = await req.json()
  const exists = db.all(sql`SELECT id FROM wishlists WHERE user_id = ${user.id} AND product_id = ${productId}`)
  if (exists.length === 0) {
    db.run(sql`INSERT INTO wishlists (id, user_id, product_id, created_at) VALUES (${crypto.randomUUID()}, ${user.id}, ${productId}, datetime('now'))`)
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { productId } = await req.json()
  db.run(sql`DELETE FROM wishlists WHERE user_id = ${user.id} AND product_id = ${productId}`)
  return NextResponse.json({ ok: true })
}
