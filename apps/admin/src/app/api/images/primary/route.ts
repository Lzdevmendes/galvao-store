import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/require-admin'

const schema = z.object({
  imageId:   z.string().min(1, 'imageId obrigatório'),
  productId: z.string().min(1, 'productId obrigatório'),
})

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth
  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  const { imageId, productId } = parsed.data
  await db.run(sql`UPDATE product_images SET is_primary = 0 WHERE product_id = ${productId}`)
  await db.run(sql`UPDATE product_images SET is_primary = 1 WHERE id = ${imageId}`)
  return NextResponse.json({ ok: true })
}
