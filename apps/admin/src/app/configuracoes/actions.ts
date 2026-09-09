'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { NextResponse } from 'next/server'

export async function saveSettings(formData: FormData) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }
  const settings = [
    'store_name', 'store_phone', 'store_whatsapp', 'store_email',
    'store_address', 'free_shipping_threshold', 'pix_discount_pct',
    'instagram_url', 'facebook_url',
  ]

  for (const key of settings) {
    const value = formData.get(key)
    if (value === null) continue
    await db.run(sql`
      INSERT INTO app_settings (key, value, updated_by)
      VALUES (${key}, ${JSON.stringify(String(value))}, ${auth.userId})
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `)
  }

  revalidatePath('/configuracoes')
  return { success: true }
}

export async function getSettings(): Promise<Record<string, string>> {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return {}
  try {
    const rows = await db.all<{ key: string; value: string }>(sql`SELECT key, value FROM app_settings`)
    return Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)]))
  } catch {
    return {}
  }
}
