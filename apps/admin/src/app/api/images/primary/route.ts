import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function PATCH(req: NextRequest) {
  const { imageId, productId } = await req.json() as { imageId: string; productId: string }
  db.run(sql`UPDATE product_images SET is_primary = 0 WHERE product_id = ${productId}`)
  db.run(sql`UPDATE product_images SET is_primary = 1 WHERE id = ${imageId}`)
  return NextResponse.json({ ok: true })
}
