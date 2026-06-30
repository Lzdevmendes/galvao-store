import { describe, it, expect } from 'vitest'
import { createClient } from '@libsql/client'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const here = dirname(fileURLToPath(import.meta.url))
const drizzleDir = join(here, '..', '..', 'drizzle')

// Aplica TODAS as migrations a uma DB em memória — garante que uma base criada
// do zero (como a Turso de produção) fica completa e consistente.
async function freshDb() {
  const client = createClient({ url: ':memory:' })
  const files = readdirSync(drizzleDir).filter(f => f.endsWith('.sql')).sort()
  for (const f of files) {
    const sql = readFileSync(join(drizzleDir, f), 'utf8')
    for (const stmt of sql.split('--> statement-breakpoint')) {
      const trimmed = stmt.trim()
      if (trimmed) await client.execute(trimmed)
    }
  }
  return client
}

async function tableExists(client: Awaited<ReturnType<typeof freshDb>>, name: string) {
  const r = await client.execute({
    sql: `SELECT count(*) AS c FROM sqlite_master WHERE type='table' AND name=?`,
    args: [name],
  })
  return Number(r.rows[0].c) === 1
}

describe('migrations criam um schema completo', () => {
  it('inclui as tabelas críticas (incl. as antes ausentes)', async () => {
    const db = await freshDb()
    for (const t of [
      'orders', 'order_items', 'products', 'product_variants', 'users',
      'newsletter_subscriptions', 'stock_alerts', 'checkout_idempotency', 'user_consents',
    ]) {
      expect(await tableExists(db, t), `tabela ${t}`).toBe(true)
    }
  })

  it('app_settings tem a coluna "value" (usada por /configuracoes)', async () => {
    const db = await freshDb()
    const r = await db.execute(`PRAGMA table_info(app_settings)`)
    const cols = r.rows.map(row => String(row.name))
    expect(cols).toContain('value')
  })

  it('stock_alerts tem índice único (email, variant_id) para o ON CONFLICT', async () => {
    const db = await freshDb()
    const r = await db.execute(`PRAGMA index_list(stock_alerts)`)
    const hasUnique = r.rows.some(row => Number(row.unique) === 1)
    expect(hasUnique).toBe(true)
  })
})
