import { text, integer, real } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { users } from './users'
import { products } from './products'

// ── Coupons ─────────────────────────────────────────────────
export type CouponType = 'percent' | 'fixed' | 'shipping'

export const coupons = sqliteTable('coupons', {
  id:           text('id').primaryKey(),
  code:         text('code').notNull().unique(),
  type:         text('type').$type<CouponType>().notNull(),
  value:        real('value').notNull(),           // % or R$ or 0 (shipping)
  minOrderValue:real('min_order_value').default(0),
  maxUses:      integer('max_uses'),               // null = ilimitado
  usedCount:    integer('used_count').notNull().default(0),
  active:       integer('active', { mode: 'boolean' }).notNull().default(true),
  expiresAt:    text('expires_at'),
  createdAt:    text('created_at').notNull().default(sql`(datetime('now'))`),
})

// ── Wishlist ────────────────────────────────────────────────
export const wishlists = sqliteTable('wishlists', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

// ── Cart (server-side, para usuários logados) ───────────────
export const cartItems = sqliteTable('cart_items', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  size:      real('size').notNull(),
  quantity:  integer('quantity').notNull().default(1),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ── Delivery Zones (entrega local) ──────────────────────────
export const deliveryZones = sqliteTable('delivery_zones', {
  id:          text('id').primaryKey(),
  name:        text('name').notNull(),        // ex: "Zona Centro - SP"
  cepPrefix:   text('cep_prefix').notNull(), // ex: "01" (CEPs 01XXX-XXX)
  fee:         real('fee').notNull(),         // R$ 0 = grátis
  minDays:     integer('min_days').notNull().default(0),
  maxDays:     integer('max_days').notNull().default(1),
  description: text('description'),           // "Entrega pelo carro — até 1 dia"
  active:      integer('active', { mode: 'boolean' }).notNull().default(true),
})

// ── Relations ──────────────────────────────────────────────
export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user:    one(users,    { fields: [wishlists.userId],    references: [users.id] }),
  product: one(products, { fields: [wishlists.productId], references: [products.id] }),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user:    one(users,    { fields: [cartItems.userId],    references: [users.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}))
