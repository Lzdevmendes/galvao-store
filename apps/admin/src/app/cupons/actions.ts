'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { NextResponse } from 'next/server'

export async function toggleCoupon(couponId: string, active: boolean) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  await db.run(sql`UPDATE coupons SET active = ${active ? 0 : 1} WHERE id = ${couponId}`)
  revalidatePath('/cupons')
  return { success: true }
}

export async function createCoupon(formData: FormData) {
  const authC = await requireAdmin()
  if (authC instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  const code    = String(formData.get('code')).trim().toUpperCase()
  const type    = String(formData.get('type'))
  const value   = Number(formData.get('value'))
  const minOrder= formData.get('min_order') ? Number(formData.get('min_order')) * 100 : null
  const maxUses = formData.get('max_uses')  ? Number(formData.get('max_uses'))         : null
  const expires = formData.get('expires_at') ? String(formData.get('expires_at')) + 'T23:59:59Z' : null

  if (!code || !type || !value) return { success: false, error: 'Preencha todos os campos obrigatórios.' }
  if (code.length < 3) return { success: false, error: 'Código deve ter pelo menos 3 caracteres.' }

  const existing = await db.all(sql`SELECT id FROM coupons WHERE UPPER(code) = ${code} LIMIT 1`)
  if (existing.length > 0) return { success: false, error: 'Já existe um cupom com este código.' }

  const valueStored = type === 'percent' ? value : Math.round(value * 100)

  await db.run(sql`
    INSERT INTO coupons (id, code, type, value, min_order_in_cents, max_uses, used_count, active, expires_at, created_at)
    VALUES (${crypto.randomUUID()}, ${code}, ${type}, ${valueStored}, ${minOrder}, ${maxUses}, 0, 1, ${expires}, datetime('now'))
  `)
  revalidatePath('/admin/cupons')
  return { success: true }
}
