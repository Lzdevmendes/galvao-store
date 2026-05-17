'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function saveSettings(formData: FormData) {
  const settings = [
    'store_name', 'store_phone', 'store_whatsapp', 'store_email',
    'store_address', 'free_shipping_threshold', 'pix_discount_pct',
    'instagram_url', 'facebook_url',
  ]

  for (const key of settings) {
    const value = formData.get(key)
    if (value === null) continue
    db.run(sql`
      INSERT INTO app_settings (key, value_json)
      VALUES (${key}, ${JSON.stringify(String(value))})
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json
    `)
  }

  revalidatePath('/configuracoes')
  return { success: true }
}

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = db.all<{ key: string; value_json: string }>(sql`SELECT key, value_json FROM app_settings`)
    return Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value_json)]))
  } catch {
    return {}
  }
}
