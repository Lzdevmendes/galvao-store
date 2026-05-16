import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const rows = db.all(sql`
    SELECT id, label, street, number, complement, district, city, state, cep, is_default
    FROM addresses WHERE user_id = ${user.id} ORDER BY is_default DESC, created_at DESC
  `)
  return NextResponse.json(rows)
}
