import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/require-admin'

const BUCKET    = 'product-images'
const MAX_SIZE  = 10 * 1024 * 1024
const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const form      = await req.formData()
  const file      = form.get('file') as File | null
  const productId = form.get('productId') as string | null

  if (!file || !productId)          return NextResponse.json({ error: 'Parâmetros em falta' }, { status: 400 })
  if (file.size > MAX_SIZE)         return NextResponse.json({ error: 'Arquivo muito grande (máx. 5 MB)' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Formato não suportado (JPG, PNG, WebP)' }, { status: 400 })

  const ext    = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path   = `${productId}/${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: storageErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (storageErr) return NextResponse.json({ error: storageErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)

  const countRows  = db.all<{ n: number }>(sql`SELECT COUNT(*) as n FROM product_images WHERE product_id = ${productId}`)
  const sortOrder  = countRows[0]?.n ?? 0
  const isPrimary  = sortOrder === 0
  const imageId    = crypto.randomUUID()

  db.run(sql`
    INSERT INTO product_images (id, product_id, url, alt, sort_order, is_primary)
    VALUES (${imageId}, ${productId}, ${publicUrl}, '', ${sortOrder}, ${isPrimary ? 1 : 0})
  `)

  return NextResponse.json({ id: imageId, url: publicUrl, sortOrder, isPrimary })
}
