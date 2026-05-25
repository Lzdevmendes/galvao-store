import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/require-admin'

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth
  const { imageId, productId } = await req.json() as { imageId: string; productId: string }
  await db.run(sql`UPDATE product_images SET is_primary = 0 WHERE product_id = ${productId}`)
  await db.run(sql`UPDATE product_images SET is_primary = 1 WHERE id = ${imageId}`)
  return NextResponse.json({ ok: true })
}
