import { text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

export const brands = sqliteTable('brands', {
  id:   text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  tagline:     text('tagline'),
  description: text('description'),
  heroImage:   text('hero_image'),
  gradientCss: text('gradient_css'),
  stripeStyle: text('stripe_style'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const categories = sqliteTable('categories', {
  id:   text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  icon: text('icon'),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const products = sqliteTable('products', {
  id:          text('id').primaryKey(),
  slug:        text('slug').notNull().unique(),
  brandId:     text('brand_id').notNull().references(() => brands.id),
  categoryId:  text('category_id').notNull().references(() => categories.id),
  line:        text('line'),
  name:        text('name').notNull(),
  colorway:    text('colorway').notNull(),
  sku:         text('sku').notNull().unique(),
  description: text('description').notNull(),
  features:    text('features', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  specs:       text('specs',    { mode: 'json' }).$type<Record<string,string>>().notNull().default(sql`'{}'`),
  price:       real('price').notNull(),
  originalPrice: real('original_price'),
  badge:       text('badge', { enum: ['new','sale','bestseller','exclusive'] }),
  rating:      real('rating').notNull().default(0),
  reviewCount: integer('review_count').notNull().default(0),
  inStock:     integer('in_stock', { mode: 'boolean' }).notNull().default(true),
  published:   integer('published', { mode: 'boolean' }).notNull().default(true),
  tags:        text('tags', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt:   text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const productImages = sqliteTable('product_images', {
  id:        text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url:       text('url').notNull(),
  alt:       text('alt').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
})

export const productSizes = sqliteTable('product_sizes', {
  id:        text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  size:      real('size').notNull(),
  available: integer('available', { mode: 'boolean' }).notNull().default(true),
  stock:     integer('stock').notNull().default(0),
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
  images:   many(productImages),
  sizes:    many(productSizes),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))

export const productSizesRelations = relations(productSizes, ({ one }) => ({
  product: one(products, { fields: [productSizes.productId], references: [products.id] }),
}))
