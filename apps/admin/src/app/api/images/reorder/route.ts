import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function PATCH(req: NextRequest) {
  const { images } = await req.json() as { images: { id: string; sortOrder: number }[] }
  for (const img of images) {
    db.run(sql`UPDATE product_images SET sort_order = ${img.sortOrder} WHERE id = ${img.id}`)
  }
  return NextResponse.json({ ok: true })
}
