import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/require-admin'

const BUCKET = 'product-images'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const rows = db.all<{ url: string; product_id: string; is_primary: number }>(sql`
    SELECT url, product_id, is_primary FROM product_images WHERE id = ${id} LIMIT 1
  `)
  const img = rows[0]
  if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Extrair path do storage da URL pública
  const match = img.url.match(/\/object\/public\/product-images\/(.+)$/)
  if (match) {
    await supabaseAdmin.storage.from(BUCKET).remove([decodeURIComponent(match[1])])
  }

  db.run(sql`DELETE FROM product_images WHERE id = ${id}`)

  // Se era primária, promover a próxima
  if (img.is_primary) {
    db.run(sql`
      UPDATE product_images SET is_primary = 1
      WHERE id = (
        SELECT id FROM product_images
        WHERE product_id = ${img.product_id}
        ORDER BY sort_order ASC LIMIT 1
      )
    `)
  }

  // Renumerar sort_order das restantes
  const remaining = db.all<{ id: string }>(sql`
    SELECT id FROM product_images WHERE product_id = ${img.product_id} ORDER BY sort_order ASC
  `)
  remaining.forEach((r, i) => {
    db.run(sql`UPDATE product_images SET sort_order = ${i} WHERE id = ${r.id}`)
  })

  return NextResponse.json({ ok: true })
}
