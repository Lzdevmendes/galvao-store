import { supabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const BUCKET   = 'product-images'
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5 MB

// Valida tipo real pelo magic bytes — não confia em Content-Type/extensão declarados
// JPEG: FF D8 FF | PNG: 89 50 4E 47 | WebP: 52 49 46 46 ... 57 45 42 50
export function detectMimeFromBuffer(buf: Buffer): string | null {
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  return null  // SVG, HTML, executáveis, etc. — REJEITADOS
}

export type StoreProductImageResult =
  | { ok: true; id: string; url: string; sortOrder: number; isPrimary: boolean }
  | { ok: false; error: string; status: 400 | 500 }

// Valida (magic bytes + tamanho) e sobe um buffer de imagem já em memória pro
// Storage + tabela `product_images`. Reaproveitado tanto pelo upload manual
// (apps/admin/src/app/api/images/upload/route.ts, a partir de um FormData)
// quanto pelo pipeline de import (a partir de uma imagem baixada do site do
// importador) — a validação de segurança é sempre a mesma, não pode divergir
// entre os dois caminhos.
export async function storeProductImage(
  productId: string,
  buffer: Buffer,
): Promise<StoreProductImageResult> {
  if (buffer.byteLength > MAX_IMAGE_SIZE) {
    return { ok: false, error: 'Arquivo muito grande (máx. 5 MB)', status: 400 }
  }
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(productId)) {
    return { ok: false, error: 'productId inválido', status: 400 }
  }

  const realMime = detectMimeFromBuffer(buffer)
  if (!realMime) {
    return { ok: false, error: 'Formato não suportado. Use JPG, PNG ou WebP.', status: 400 }
  }

  const ext  = realMime === 'image/png' ? 'png' : realMime === 'image/webp' ? 'webp' : 'jpg'
  const path = `${productId}/${crypto.randomUUID()}.${ext}`

  const { error: storageErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: realMime, upsert: false })

  if (storageErr) return { ok: false, error: storageErr.message, status: 500 }

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)

  const countRows = await db.all<{ n: number }>(sql`SELECT COUNT(*) as n FROM product_images WHERE product_id = ${productId}`)
  const sortOrder = countRows[0]?.n ?? 0
  const isPrimary = sortOrder === 0
  const imageId   = crypto.randomUUID()

  await db.run(sql`
    INSERT INTO product_images (id, product_id, url, alt, sort_order, is_primary)
    VALUES (${imageId}, ${productId}, ${publicUrl}, '', ${sortOrder}, ${isPrimary ? 1 : 0})
  `)

  return { ok: true, id: imageId, url: publicUrl, sortOrder, isPrimary }
}
