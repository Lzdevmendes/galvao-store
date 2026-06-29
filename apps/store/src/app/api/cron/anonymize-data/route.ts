import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

// LGPD: anonimização pós-prazo. Pedidos guardam PII por obrigação fiscal (5 anos);
// passado esse prazo a PII é removida. Também limpa consentimentos antigos.
// Protegido por CRON_SECRET (Vercel Cron), igual a clear-reservations.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pedidos com mais de 5 anos e ainda com PII → anonimizar snapshots.
  // customer_email/ship_street/ship_number/ship_district são NOT NULL → placeholders.
  const orders = await db.run(sql`
    UPDATE orders
    SET customer_name = 'ANONIMIZADO', customer_email = 'anonimizado@anon.local',
        customer_phone = NULL, customer_cpf = NULL,
        ship_street = 'ANONIMIZADO', ship_number = '0', ship_complement = NULL,
        ship_district = 'ANONIMIZADO', updated_at = datetime('now')
    WHERE created_at < datetime('now', '-5 years')
      AND customer_name != 'ANONIMIZADO'
  `)

  // Consentimentos com mais de 5 anos não precisam de retenção.
  const consents = await db.run(sql`
    DELETE FROM user_consents WHERE created_at < datetime('now', '-5 years')
  `)

  return NextResponse.json({
    ok: true,
    ordersAnonymized: orders.rowsAffected,
    consentsPurged: consents.rowsAffected,
  })
}
