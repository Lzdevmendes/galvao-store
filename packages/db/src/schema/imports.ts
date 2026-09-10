import { text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { brands } from './products'

// Um site de importador por linha. Fica vazia até termos as URLs reais —
// cada linha aponta pro parser (`parser_key`) que sabe ler aquele HTML.
export const importSources = sqliteTable('import_sources', {
  id:             text('id').primaryKey(),
  name:           text('name').notNull(),
  baseUrl:        text('base_url').notNull(),
  parserKey:      text('parser_key').notNull(),        // chave do adapter em apps/admin/src/lib/import/parsers/
  active:         integer('active', { mode: 'boolean' }).notNull().default(false),
  requestDelayMs: integer('request_delay_ms').notNull().default(1500), // pacing entre requests ao site
  lastRunAt:      text('last_run_at'),
  createdAt:      text('created_at').notNull().default(sql`(datetime('now'))`),
})

// Histórico de execuções — trilha de auditoria já que a publicação é automática
// (sem revisão manual prévia, o Galvão confere aqui depois).
export const importRuns = sqliteTable('import_runs', {
  id:                text('id').primaryKey(),
  sourceId:          text('source_id').notNull().references(() => importSources.id),
  startedAt:         text('started_at').notNull().default(sql`(datetime('now'))`),
  finishedAt:        text('finished_at'),
  status:            text('status', { enum: ['success', 'error', 'partial'] }),
  itemsFound:        integer('items_found').notNull().default(0),
  itemsPublished:    integer('items_published').notNull().default(0),
  itemsUpdated:      integer('items_updated').notNull().default(0),
  itemsPendingPrice: integer('items_pending_price').notNull().default(0),
  errorMessage:      text('error_message'),
})

// Preço de venda que o Galvão define — o robô nunca calcula markup sozinho.
// `match_type`/`match_value` resolvem qual item scrapeado usa qual preço.
export const importPriceRules = sqliteTable('import_price_rules', {
  id:                text('id').primaryKey(),
  matchType:         text('match_type', { enum: ['sku', 'name_contains'] }).notNull(),
  matchValue:        text('match_value').notNull(),
  brandId:           text('brand_id').references(() => brands.id),
  priceInCents:      integer('price_in_cents').notNull(),
  pricePromoInCents: integer('price_promo_in_cents'),
  createdAt:         text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:         text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// Staging pra item scrapeado sem regra de preço correspondente — não dá pra
// criar a variante (`product_variants.price_in_cents` é NOT NULL), então fica
// aqui até o Galvão cadastrar uma regra ou criar o produto manualmente.
export const importPendingItems = sqliteTable('import_pending_items', {
  id:            text('id').primaryKey(),
  sourceId:      text('source_id').notNull().references(() => importSources.id),
  externalRef:   text('external_ref').notNull(),   // SKU/URL do importador
  rawName:       text('raw_name').notNull(),
  rawBrand:      text('raw_brand'),
  rawCategory:   text('raw_category'),              // categoria/piso lida do site — sem match local também bloqueia auto-publish
  costInCents:   integer('cost_in_cents'),          // preço de custo, se visível no site
  sizesJson:     text('sizes_json', { mode: 'json' }).$type<{ size: string; stock: number }[]>().notNull().default(sql`'[]'`),
  imageUrlsJson: text('image_urls_json', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  createdAt:     text('created_at').notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  sourceRefUnq: uniqueIndex('import_pending_items_source_ref_unq').on(t.sourceId, t.externalRef),
}))

// ── Relations ──────────────────────────────────────────────
export const importSourcesRelations = relations(importSources, ({ many }) => ({
  runs:          many(importRuns),
  pendingItems:  many(importPendingItems),
}))

export const importRunsRelations = relations(importRuns, ({ one }) => ({
  source: one(importSources, { fields: [importRuns.sourceId], references: [importSources.id] }),
}))

export const importPendingItemsRelations = relations(importPendingItems, ({ one }) => ({
  source: one(importSources, { fields: [importPendingItems.sourceId], references: [importSources.id] }),
}))

export const importPriceRulesRelations = relations(importPriceRules, ({ one }) => ({
  brand: one(brands, { fields: [importPriceRules.brandId], references: [brands.id] }),
}))
