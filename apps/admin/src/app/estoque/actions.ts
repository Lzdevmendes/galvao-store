'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { sendBackInStockEmail } from '@/lib/email'

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

  // Disparar e-mails "Avise-me" quando stock fica disponível
  if (delta > 0 && newStock > 0) {
    const alerts = await db.all<{ id: string; email: string; product_name: string }>(sql`
      SELECT sa.id, sa.email, sa.product_name
      FROM stock_alerts sa
      WHERE sa.variant_id = ${variantId} AND sa.notified_at IS NULL
    `)
    if (alerts.length > 0) {
      const slugRows = await db.all<{ slug: string }>(sql`
        SELECT p.slug FROM product_variants pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.id = ${variantId} LIMIT 1
      `)
      const slug = slugRows[0]?.slug ?? ''
      const productName = alerts[0].product_name
      await Promise.allSettled(
        alerts.map(a => sendBackInStockEmail(a.email, productName, slug))
      )
      await db.run(sql`
        UPDATE stock_alerts SET notified_at = datetime('now')
        WHERE variant_id = ${variantId} AND notified_at IS NULL
      `)
    }
  }

  revalidatePath('/estoque')
  return { success: true }
}
