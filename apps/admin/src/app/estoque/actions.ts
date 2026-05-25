'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type Reason = 'purchase' | 'return' | 'adjustment' | 'reservation' | 'reservation_expired' | 'import'

export async function adjustStock(
  variantId: string,
  delta: number,
  reason: Reason,
  note: string,
): Promise<{ success: boolean; error?: string }> {
  if (!variantId || delta === 0) return { success: false, error: 'Parâmetros inválidos.' }

  const row = await db.get<{ stock: number }>(
    sql`SELECT stock FROM product_variants WHERE id = ${variantId} LIMIT 1`
  )
  if (!row) return { success: false, error: 'Variante não encontrada.' }

  const newStock = row.stock + delta
  if (newStock < 0) return { success: false, error: `Stock insuficiente. Actual: ${row.stock}.` }

  await db.run(sql`UPDATE product_variants SET stock = ${newStock}, updated_at = datetime('now') WHERE id = ${variantId}`)

  await db.run(sql`
    INSERT INTO stock_movements (id, variant_id, delta, reason, reference_id, created_by, created_at)
    VALUES (${crypto.randomUUID()}, ${variantId}, ${delta}, ${reason}, ${note || null}, 'admin', datetime('now'))
  `)

  revalidatePath('/estoque')
  return { success: true }
}
