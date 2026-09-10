import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fetchSourcePage, sleep } from './fetch-source'
import { normalizeScrapedProducts } from './normalize'
import { upsertScrapedProduct } from './upsert-product'
import { parsers } from './parsers'

interface ImportSourceRow {
  id: string
  name: string
  base_url: string
  parser_key: string
  request_delay_ms: number
}

export interface RunSummary {
  sourceId: string
  sourceName: string
  status: 'success' | 'error' | 'partial'
  itemsFound: number
  itemsPublished: number
  itemsUpdated: number
  itemsPendingPrice: number
  errorMessage: string | null
}

// Roda o import de UM source e grava o resultado em `import_runs` — chamado
// tanto pelo cron (apps/admin/src/app/api/cron/import-produtos/route.ts)
// quanto pelo botão manual "Buscar novidades agora" (importacoes/actions.ts).
export async function runImportForSource(source: ImportSourceRow): Promise<RunSummary> {
  const runId = crypto.randomUUID()
  await db.run(sql`
    INSERT INTO import_runs (id, source_id, started_at, items_found, items_published, items_updated, items_pending_price)
    VALUES (${runId}, ${source.id}, datetime('now'), 0, 0, 0, 0)
  `)

  const summary: RunSummary = {
    sourceId: source.id, sourceName: source.name, status: 'success',
    itemsFound: 0, itemsPublished: 0, itemsUpdated: 0, itemsPendingPrice: 0, errorMessage: null,
  }

  try {
    const parser = parsers[source.parser_key]
    if (!parser) {
      throw new Error(`Nenhum parser registado para parser_key="${source.parser_key}" (Fase B ainda não implementada para este source)`)
    }

    const html = await fetchSourcePage(source.base_url)
    await sleep(source.request_delay_ms)

    const rawItems = parser.parse(html, source.base_url)
    const { valid, rejected } = normalizeScrapedProducts(rawItems)
    summary.itemsFound = valid.length

    if (rejected.length > 0) {
      console.error(`[import] ${source.name}: ${rejected.length} item(ns) rejeitado(s) na validação`, rejected.slice(0, 5))
    }

    for (const item of valid) {
      const result = await upsertScrapedProduct(source.id, item)
      if (result.status === 'published') summary.itemsPublished++
      else if (result.status === 'updated') summary.itemsUpdated++
      else summary.itemsPendingPrice++
    }

    if (rejected.length > 0 && valid.length > 0) summary.status = 'partial'
  } catch (err) {
    summary.status = 'error'
    summary.errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error(`[import] falha ao processar source ${source.name}:`, err)
  }

  await db.run(sql`
    UPDATE import_runs SET
      finished_at = datetime('now'),
      status = ${summary.status},
      items_found = ${summary.itemsFound},
      items_published = ${summary.itemsPublished},
      items_updated = ${summary.itemsUpdated},
      items_pending_price = ${summary.itemsPendingPrice},
      error_message = ${summary.errorMessage}
    WHERE id = ${runId}
  `)
  await db.run(sql`UPDATE import_sources SET last_run_at = datetime('now') WHERE id = ${source.id}`)

  return summary
}

// Roda todos os sources ativos, sequencialmente (o pacing entre sites também
// evita disparar tudo em paralelo contra hosts diferentes de uma vez).
export async function runAllActiveSources(): Promise<RunSummary[]> {
  const sources = await db.all<ImportSourceRow>(sql`
    SELECT id, name, base_url, parser_key, request_delay_ms FROM import_sources WHERE active = 1
  `)

  const summaries: RunSummary[] = []
  for (const source of sources) {
    summaries.push(await runImportForSource(source))
  }
  return summaries
}
