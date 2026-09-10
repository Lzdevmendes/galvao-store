'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { NextResponse } from 'next/server'
import { runAllActiveSources, runImportForSource } from '@/lib/import/run-import'
import { upsertScrapedProduct } from '@/lib/import/upsert-product'
import type { ScrapedProduct } from '@/lib/import/types'

export async function createImportSource(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  const name           = String(formData.get('name') ?? '').trim()
  const baseUrl         = String(formData.get('base_url') ?? '').trim()
  const parserKey       = String(formData.get('parser_key') ?? '').trim()
  const requestDelayStr = String(formData.get('request_delay_ms') ?? '1500')

  if (!name || !baseUrl || !parserKey) return { success: false, error: 'Preencha nome, URL e parser_key.' }
  let baseUrlObj: URL
  try {
    baseUrlObj = new URL(baseUrl)
  } catch {
    return { success: false, error: 'URL inválida.' }
  }
  if (baseUrlObj.protocol !== 'https:') return { success: false, error: 'A URL precisa ser https://.' }

  const requestDelayMs = Math.max(500, parseInt(requestDelayStr, 10) || 1500)

  await db.run(sql`
    INSERT INTO import_sources (id, name, base_url, parser_key, active, request_delay_ms, created_at)
    VALUES (${crypto.randomUUID()}, ${name}, ${baseUrlObj.toString()}, ${parserKey}, 0, ${requestDelayMs}, datetime('now'))
  `)

  revalidatePath('/importacoes')
  return { success: true }
}

export async function toggleImportSource(sourceId: string, active: boolean): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  await db.run(sql`UPDATE import_sources SET active = ${active ? 1 : 0} WHERE id = ${sourceId}`)
  revalidatePath('/importacoes')
  return { success: true }
}

// Roda UM source específico, mesmo que ainda esteja `active = false` — é como
// se testa um parser novo (Fase B) antes de deixar no cron automático.
export async function testImportSource(sourceId: string): Promise<{ success: boolean; error?: string; summary?: string }> {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  const rows = await db.all<{ id: string; name: string; base_url: string; parser_key: string; request_delay_ms: number }>(sql`
    SELECT id, name, base_url, parser_key, request_delay_ms FROM import_sources WHERE id = ${sourceId} LIMIT 1
  `)
  const source = rows[0]
  if (!source) return { success: false, error: 'Source não encontrado.' }

  const summary = await runImportForSource(source)
  revalidatePath('/importacoes')

  if (summary.status === 'error') return { success: false, error: summary.errorMessage ?? 'Erro desconhecido.' }
  return {
    success: true,
    summary: `${summary.itemsPublished} publicado(s), ${summary.itemsUpdated} atualizado(s), ${summary.itemsPendingPrice} pendente(s).`,
  }
}

export async function runImportNow(): Promise<{ success: boolean; error?: string; summary?: string }> {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  const summaries = await runAllActiveSources()
  revalidatePath('/importacoes')

  if (summaries.length === 0) return { success: true, summary: 'Nenhum source ativo configurado.' }

  const total = summaries.reduce((acc, s) => ({
    published: acc.published + s.itemsPublished,
    pending: acc.pending + s.itemsPendingPrice,
    updated: acc.updated + s.itemsUpdated,
  }), { published: 0, pending: 0, updated: 0 })

  return {
    success: true,
    summary: `${total.published} publicado(s), ${total.updated} atualizado(s), ${total.pending} pendente(s) de preço/categoria.`,
  }
}

export async function createPriceRule(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  const matchType  = String(formData.get('match_type') ?? '')
  const matchValue = String(formData.get('match_value') ?? '').trim()
  const brandId    = String(formData.get('brand_id') ?? '').trim() || null
  const priceStr   = String(formData.get('price') ?? '').replace(',', '.')
  const promoStr   = String(formData.get('price_promo') ?? '').replace(',', '.')

  if ((matchType !== 'sku' && matchType !== 'name_contains') || !matchValue) {
    return { success: false, error: 'Preencha o tipo e o valor de correspondência.' }
  }
  const priceInCents = Math.round(parseFloat(priceStr) * 100)
  if (!priceInCents || priceInCents <= 0) return { success: false, error: 'Preço inválido.' }
  const promoInCents = promoStr ? Math.round(parseFloat(promoStr) * 100) : null

  await db.run(sql`
    INSERT INTO import_price_rules (id, match_type, match_value, brand_id, price_in_cents, price_promo_in_cents, created_at, updated_at)
    VALUES (${crypto.randomUUID()}, ${matchType}, ${matchValue}, ${brandId}, ${priceInCents}, ${promoInCents}, datetime('now'), datetime('now'))
  `)

  revalidatePath('/importacoes')
  return { success: true }
}

export async function deletePriceRule(ruleId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  await db.run(sql`DELETE FROM import_price_rules WHERE id = ${ruleId}`)
  revalidatePath('/importacoes')
  return { success: true }
}

// Reprocessa um item pendente contra as regras de preço atuais — usado depois
// que o Galvão cadastra a regra que faltava. Reaproveita a mesma lógica de
// publicação usada pelo robô (upsertScrapedProduct), não uma cópia.
export async function retryPendingItem(pendingId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  const rows = await db.all<{
    source_id: string; external_ref: string; raw_name: string; raw_brand: string | null
    raw_category: string | null; cost_in_cents: number | null; sizes_json: string; image_urls_json: string
  }>(sql`SELECT source_id, external_ref, raw_name, raw_brand, raw_category, cost_in_cents, sizes_json, image_urls_json FROM import_pending_items WHERE id = ${pendingId} LIMIT 1`)

  const row = rows[0]
  if (!row) return { success: false, error: 'Item pendente não encontrado.' }
  if (!row.raw_brand || !row.raw_category) {
    return { success: false, error: 'Item sem marca/categoria reconhecida — edite manualmente em Produtos.' }
  }

  const item: ScrapedProduct = {
    externalRef: row.external_ref,
    name: row.raw_name,
    brandName: row.raw_brand,
    categoryName: row.raw_category,
    costInCents: row.cost_in_cents ?? undefined,
    sizes: JSON.parse(row.sizes_json),
    imageUrls: JSON.parse(row.image_urls_json),
  }

  const result = await upsertScrapedProduct(row.source_id, item)
  if (result.status === 'pending') {
    return { success: false, error: 'Ainda sem regra de preço correspondente.' }
  }

  await db.run(sql`DELETE FROM import_pending_items WHERE id = ${pendingId}`)
  revalidatePath('/importacoes')
  revalidatePath('/produtos')
  return { success: true }
}

export async function discardPendingItem(pendingId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return { success: false, error: 'Não autorizado.' }

  await db.run(sql`DELETE FROM import_pending_items WHERE id = ${pendingId}`)
  revalidatePath('/importacoes')
  return { success: true }
}
