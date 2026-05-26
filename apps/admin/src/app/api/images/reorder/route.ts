import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/require-admin'

const schema = z.object({
  images: z.array(z.object({
    id:        z.string().min(1),
    sortOrder: z.number().int().min(0),
  })).min(1).max(50),
})

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth
  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  for (const img of parsed.data.images) {
    await db.run(sql`UPDATE product_images SET sort_order = ${img.sortOrder} WHERE id = ${img.id}`)
  }
  return NextResponse.json({ ok: true })
}
