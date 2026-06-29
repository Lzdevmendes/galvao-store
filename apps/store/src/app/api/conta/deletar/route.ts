import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { limiters, getRealIpFromHeaders, checkRateLimit } from '@/lib/ratelimit'

// LGPD art. 18 (eliminação / direito ao esquecimento).
// Anonimiza PII do titular e desvincula a conta. Os pedidos são mantidos sem
// vínculo (user_id = NULL) por obrigação fiscal (5 anos) — a PII desses pedidos
// é depois removida pelo cron /api/cron/anonymize-data.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const blocked = await checkRateLimit(limiters.accountDelete, `delete:${user.id}`, 3, 60 * 60 * 1000, 3600)
  if (blocked) return blocked

  const ip = await getRealIpFromHeaders()

  // 1. Remove dados não-fiscais ligados à conta
  await db.run(sql`DELETE FROM wishlists  WHERE user_id = ${user.id}`)
  await db.run(sql`DELETE FROM cart_items WHERE user_id = ${user.id}`)
  await db.run(sql`DELETE FROM addresses  WHERE user_id = ${user.id}`)

  // 2. Anonimiza o registo do utilizador
  await db.run(sql`
    UPDATE users
    SET name = NULL, phone = NULL, cpf = NULL, birthday = NULL,
        email = ${'apagado-' + user.id + '@anon.local'}, marketing_opt_in = 0,
        updated_at = datetime('now')
    WHERE id = ${user.id}
  `)

  // 3. Desvincula pedidos (mantidos para obrigação fiscal, sem ligação à conta)
  await db.run(sql`UPDATE orders SET user_id = NULL WHERE user_id = ${user.id}`)

  // 4. Regista a eliminação (auditoria LGPD)
  await db.run(sql`
    INSERT INTO user_consents (id, user_id, type, granted, source, ip)
    VALUES (${crypto.randomUUID()}, NULL, 'necessary', 0, 'account_deletion', ${ip})
  `)

  // 5. Apaga o utilizador no Supabase Auth (service role) — best-effort
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      await admin.auth.admin.deleteUser(user.id)
    } catch { /* silent — dados locais já anonimizados */ }
  }

  // 6. Termina a sessão
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
