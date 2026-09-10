import { text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

export const brands = sqliteTable('brands', {
  id:          text('id').primaryKey(),
  slug:        text('slug').notNull().unique(),
  name:        text('name').notNull(),
  tagline:     text('tagline'),
  description: text('description'),
  logoUrl:     text('logo_url'),
  heroImage:   text('hero_image'),
  gradientCss: text('gradient_css'),
  stripeStyle: text('stripe_style'),
  active:      integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const categories = sqliteTable('categories', {
  id:          text('id').primaryKey(),
  slug:        text('slug').notNull().unique(),
  name:        text('name').notNull(),
  parentId:    text('parent_id'),           // hierarquia (ex: calçados > campo)
  surfaceType: text('surface_type'),         // FG | SG | IC | AG | TF
  icon:        text('icon'),
  description: text('description'),
  sortOrder:   integer('sort_order').notNull().default(0),
})

export const products = sqliteTable('products', {
  id:          text('id').primaryKey(),
  slug:        text('slug').notNull().unique(),
  brandId:     text('brand_id').notNull().references(() => brands.id),
  categoryId:  text('category_id').notNull().references(() => categories.id),
  line:        text('line'),                 // Phantom, Predator, Future, etc.
  name:        text('name').notNull(),
  skuBase:     text('sku_base').notNull().unique(), // base sem variante
  description: text('description').notNull(),
  features:    text('features', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  specs:       text('specs',    { mode: 'json' }).$type<Record<string,string>>().notNull().default(sql`'{}'`),
  tags:        text('tags',     { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  badge:       text('badge', { enum: ['new','sale','bestseller','exclusive'] }),
  // Agregados calculados — actualizar ao salvar variante
  rating:      integer('rating').notNull().default(0),       // × 10 (4.8 = 48)
  reviewCount: integer('review_count').notNull().default(0),
  // SEO
  metaTitle:       text('meta_title'),
  metaDescription: text('meta_description'),
  metaImage:       text('meta_image'),
  // Status
  status:    text('status', { enum: ['draft','published','archived'] }).notNull().default('draft'),
  // Origem — preenchido só quando o produto veio do pipeline de import automático
  // (packages/db/src/schema/imports.ts). Par único: permite re-rodar o import e
  // fazer UPDATE (estoque/disponibilidade) em vez de duplicar o produto.
  externalSourceId: text('external_source_id'),
  externalRef:      text('external_ref'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  externalSourceRefUnq: uniqueIndex('products_external_source_ref_unq').on(t.externalSourceId, t.externalRef),
}))

// Variantes — a unidade real de venda (tamanho × cor)
// TODOS os preços em CENTAVOS (integer). R$ 529,99 = 52999
export const productVariants = sqliteTable('product_variants', {
  id:               text('id').primaryKey(),
  productId:        text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sku:              text('sku').notNull().unique(),
  size:             text('size').notNull(),           // "41", "42", "M", "GG"
  color:            text('color'),                    // "Branco/Marinho"
  priceInCents:     integer('price_in_cents').notNull(),       // 52999 = R$ 529,99
  pricePromoInCents:integer('price_promo_in_cents'),           // null = sem promoção
  costInCents:      integer('cost_in_cents'),                  // custo de aquisição
  stock:            integer('stock').notNull().default(0),
  stockReserved:    integer('stock_reserved').notNull().default(0), // reservado no carrinho
  available:        integer('available', { mode: 'boolean' }).notNull().default(true),
  // Dimensões para cálculo de frete (Frenet / Correios)
  weightG:          integer('weight_g').notNull().default(500),   // gramas — padrão chuteira
  heightCm:         integer('height_cm').notNull().default(12),   // altura caixa
  widthCm:          integer('width_cm').notNull().default(22),    // largura caixa
  lengthCm:         integer('length_cm').notNull().default(30),   // comprimento caixa
  createdAt:        text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:        text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const productImages = sqliteTable('product_images', {
  id:        text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  url:       text('url').notNull(),
  alt:       text('alt').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
})

// Auditoria de estoque — toda entrada/saída registada
export const stockMovements = sqliteTable('stock_movements', {
  id:          text('id').primaryKey(),
  variantId:   text('variant_id').notNull().references(() => productVariants.id),
  delta:       integer('delta').notNull(),            // +5 = entrada, -1 = saída
  reason:      text('reason', {
    enum: ['purchase','return','adjustment','reservation','reservation_expired','import'],
  }).notNull(),
  referenceId: text('reference_id'),                 // order_id ou null
  createdBy:   text('created_by'),                   // admin_user_id ou 'system'
  createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const reviews = sqliteTable('reviews', {
  id:         text('id').primaryKey(),
  productId:  text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull(),          // users.id
  orderId:    text('order_id'),                       // orders.id — confirma compra
  rating:     integer('rating').notNull(),            // 1–5
  title:      text('title'),
  body:       text('body'),
  tags:       text('tags', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  approved:   integer('approved', { mode: 'boolean' }).notNull().default(false),
  createdAt:  text('created_at').notNull().default(sql`(datetime('now'))`),
})

// ── Relations ──────────────────────────────────────────────
export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  brand:    one(brands,     { fields: [products.brandId],    references: [brands.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  images:   many(productImages),
  reviews:  many(reviews),
}))

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product:        one(products, { fields: [productVariants.productId], references: [products.id] }),
  images:         many(productImages),
  stockMovements: many(stockMovements),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products,        { fields: [productImages.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [productImages.variantId], references: [productVariants.id] }),
}))

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  variant: one(productVariants, { fields: [stockMovements.variantId], references: [productVariants.id] }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}))
