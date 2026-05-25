// Garante que o utilizador Supabase existe na DB local (users table)
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import type { User } from '@supabase/supabase-js'

export async function ensureLocalUser(user: User): Promise<void> {
  const rows = await db.all<{ id: string }>(sql`SELECT id FROM users WHERE id = ${user.id} LIMIT 1`)
  if (rows.length === 0) {
    const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? ''
    await db.run(sql`
      INSERT INTO users (id, email, name, created_at, updated_at)
      VALUES (${user.id}, ${user.email!}, ${name}, datetime('now'), datetime('now'))
    `)
  }
}

export async function getLocalUser(userId: string) {
  const rows = await db.all<{
    id: string; email: string; name: string | null; phone: string | null
    cpf: string | null; birthday: string | null; is_club_member: number
  }>(sql`SELECT id, email, name, phone, cpf, birthday, is_club_member FROM users WHERE id = ${userId} LIMIT 1`)
  return rows[0] ?? null
}
