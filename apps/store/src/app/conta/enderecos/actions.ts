'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { ensureLocalUser } from '@/lib/user-sync'
import { revalidatePath } from 'next/cache'

export type AddressPayload = {
  label: string; cep: string; street: string; number: string
  complement: string; district: string; city: string; state: string
  isDefault: boolean
}

export async function addAddress(payload: AddressPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  ensureLocalUser(user)

  if (payload.isDefault) {
    await db.run(sql`UPDATE addresses SET is_default = 0 WHERE user_id = ${user.id}`)
  }

  await db.run(sql`
    INSERT INTO addresses (id, user_id, label, name, cep, street, number, complement, district, city, state, is_default, created_at)
    VALUES (${crypto.randomUUID()}, ${user.id}, ${payload.label || 'Casa'}, ${user.user_metadata?.full_name ?? ''}, ${payload.cep}, ${payload.street}, ${payload.number}, ${payload.complement || null}, ${payload.district}, ${payload.city}, ${payload.state}, ${payload.isDefault ? 1 : 0}, datetime('now'))
  `)

  revalidatePath('/conta/enderecos')
  return { success: true }
}

export async function deleteAddress(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  await db.run(sql`DELETE FROM addresses WHERE id = ${id} AND user_id = ${user.id}`)
  revalidatePath('/conta/enderecos')
  return { success: true }
}

export async function setDefaultAddress(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  await db.run(sql`UPDATE addresses SET is_default = 0 WHERE user_id = ${user.id}`)
  await db.run(sql`UPDATE addresses SET is_default = 1 WHERE id = ${id} AND user_id = ${user.id}`)
  revalidatePath('/conta/enderecos')
  return { success: true }
}
