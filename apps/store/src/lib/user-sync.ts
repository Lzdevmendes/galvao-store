// Garante que o utilizador Supabase existe na DB local (users table)
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import type { User } from '@supabase/supabase-js'

export async function ensureLocalUser(user: User): Promise<void> {
  const rows = await db.all<{ id: string }>(sql`SELECT id FROM users WHERE id = ${user.id} LIMIT 1`)
  if (rows.length > 0) return

  // `email` é UNIQUE na tabela `users`. Se o Supabase Auth recriar o id do
  // utilizador pro mesmo e-mail (ex: reset do projeto Supabase — já aconteceu
  // neste projeto, ver memória de infra), o INSERT abaixo falharia na unique
  // constraint. Em vez de crashar, revincula o histórico existente (pedidos,
  // endereços, favoritos, cupons usados) ao novo id.
  const byEmail = user.email
    ? await db.all<{ id: string }>(sql`SELECT id FROM users WHERE email = ${user.email} LIMIT 1`)
    : []

  if (byEmail.length > 0) {
    const oldId = byEmail[0].id
    // As FKs (orders.user_id -> users.id etc.) não têm ON UPDATE CASCADE, então
    // trocar o id do usuário e o user_id das tabelas filhas nesta ordem (ou na
    // ordem inversa) sempre viola a constraint em algum ponto intermediário.
    // `defer_foreign_keys` adia a checagem para o commit da transação, quando
    // o estado já está consistente de novo.
    await db.transaction(async (tx) => {
      await tx.run(sql`PRAGMA defer_foreign_keys = ON`)
      await tx.run(sql`UPDATE orders       SET user_id     = ${user.id} WHERE user_id     = ${oldId}`)
      await tx.run(sql`UPDATE coupon_uses  SET user_id     = ${user.id} WHERE user_id     = ${oldId}`)
      await tx.run(sql`UPDATE wishlists    SET user_id     = ${user.id} WHERE user_id     = ${oldId}`)
      await tx.run(sql`UPDATE addresses    SET user_id     = ${user.id} WHERE user_id     = ${oldId}`)
      await tx.run(sql`UPDATE cart_items   SET user_id     = ${user.id} WHERE user_id     = ${oldId}`)
      await tx.run(sql`UPDATE reviews      SET customer_id = ${user.id} WHERE customer_id = ${oldId}`)
      await tx.run(sql`UPDATE users SET id = ${user.id}, updated_at = datetime('now') WHERE id = ${oldId}`)
    })
    return
  }

  const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? ''
  await db.run(sql`
    INSERT INTO users (id, email, name, created_at, updated_at)
    VALUES (${user.id}, ${user.email!}, ${name}, datetime('now'), datetime('now'))
  `)
}

export async function getLocalUser(userId: string) {
  const rows = await db.all<{
    id: string; email: string; name: string | null; phone: string | null
    cpf: string | null; birthday: string | null; is_club_member: number
  }>(sql`SELECT id, email, name, phone, cpf, birthday, is_club_member FROM users WHERE id = ${userId} LIMIT 1`)
  return rows[0] ?? null
}
