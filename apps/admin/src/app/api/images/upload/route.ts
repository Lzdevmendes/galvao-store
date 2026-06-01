import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/require-admin'

const BUCKET   = 'product-images'
const MAX_SIZE = 5 * 1024 * 1024  // 5 MB

// Valida tipo real pelo magic bytes — não confia no file.type do cliente
// JPEG: FF D8 FF | PNG: 89 50 4E 47 | WebP: 52 49 46 46 ... 57 45 42 50
function detectMimeFromBuffer(buf: Buffer): string | null {
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  return null  // SVG, HTML, executáveis, etc. — REJEITADOS
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const form      = await req.formData()
  const file      = form.get('file') as File | null
  const productId = form.get('productId') as string | null

  if (!file || !productId) return NextResponse.json({ error: 'Parâmetros em falta' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Arquivo muito grande (máx. 5 MB)' }, { status: 400 })
  // Rejeitar se productId tiver path traversal (ex: "../../../etc")
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(productId)) return NextResponse.json({ error: 'productId inválido' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  // Validar tipo pelo conteúdo real do arquivo — não pelo Content-Type do cliente
  const realMime = detectMimeFromBuffer(buffer)
  if (!realMime) return NextResponse.json({ error: 'Formato não suportado. Use JPG, PNG ou WebP.' }, { status: 400 })

  const ext  = realMime === 'image/png' ? 'png' : realMime === 'image/webp' ? 'webp' : 'jpg'
  const path = `${productId}/${crypto.randomUUID()}.${ext}`

  const { error: storageErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: realMime, upsert: false })

  if (storageErr) return NextResponse.json({ error: storageErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)

  const countRows  = await db.all<{ n: number }>(sql`SELECT COUNT(*) as n FROM product_images WHERE product_id = ${productId}`)
  const sortOrder  = countRows[0]?.n ?? 0
  const isPrimary  = sortOrder === 0
  const imageId    = crypto.randomUUID()

  await db.run(sql`
    INSERT INTO product_images (id, product_id, url, alt, sort_order, is_primary)
    VALUES (${imageId}, ${productId}, ${publicUrl}, '', ${sortOrder}, ${isPrimary ? 1 : 0})
  `)

  return NextResponse.json({ id: imageId, url: publicUrl, sortOrder, isPrimary })
}
