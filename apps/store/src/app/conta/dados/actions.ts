'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { ensureLocalUser } from '@/lib/user-sync'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { name: string; phone: string; cpf: string; birthday: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  ensureLocalUser(user)

  // Actualiza metadados no Supabase (para o avatar/nome no header)
  await supabase.auth.updateUser({ data: { full_name: data.name } })

  // Actualiza na DB local
  db.run(sql`
    UPDATE users
    SET name = ${data.name}, phone = ${data.phone || null}, cpf = ${data.cpf || null},
        birthday = ${data.birthday || null}, updated_at = datetime('now')
    WHERE id = ${user.id}
  `)

  revalidatePath('/conta')
  return { success: true }
}
