import { text, integer } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { users } from './users'
import { productVariants } from './products'
import { orders } from './orders'

export type CouponType = 'percent' | 'fixed' | 'shipping'

export const coupons = sqliteTable('coupons', {
  id:                 text('id').primaryKey(),
  code:               text('code').notNull().unique(),
  type:               text('type', { enum: ['percent','fixed','shipping'] }).$type<CouponType>().notNull(),
  value:              integer('value').notNull(),        // % ou centavos
  minOrderInCents:    integer('min_order_in_cents').default(0),
  maxUses:            integer('max_uses'),               // null = ilimitado
  usedCount:          integer('used_count').notNull().default(0),
  maxUsesPerCustomer: integer('max_uses_per_customer').default(1),
  segmentFilter:      text('segment_filter', { mode: 'json' }),
  active:             integer('active', { mode: 'boolean' }).notNull().default(true),
  startsAt:           text('starts_at'),
  expiresAt:          text('expires_at'),
  createdAt:          text('created_at').notNull().default(sql`(datetime('now'))`),
})

// Registo de uso de cupão (auditoria + controlo de max_uses_per_customer)
export const couponUses = sqliteTable('coupon_uses', {
  id:         text('id').primaryKey(),
  couponId:   text('coupon_id').notNull().references(() => coupons.id),
  userId:     text('user_id').references(() => users.id),
  orderId:    text('order_id').references(() => orders.id),
  usedAt:     text('used_at').notNull().default(sql`(datetime('now'))`),
})

// Carrinho server-side (para users logados — guest usa cookie)
export const cartItems = sqliteTable('cart_items', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  variantId:  text('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  qty:        integer('qty').notNull().default(1),
  reservedUntil: text('reserved_until'),   // TTL 30min do stock_reserved
  updatedAt:  text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const wishlists = sqliteTable('wishlists', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  variantId: text('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

// Zonas de entrega local (carro próprio — por prefixo de CEP)
export const deliveryZones = sqliteTable('delivery_zones', {
  id:           text('id').primaryKey(),
  name:         text('name').notNull(),
  cepPrefix:    text('cep_prefix').notNull(),    // ex: "01", "04"
  feeInCents:   integer('fee_in_cents').notNull().default(0),
  minDays:      integer('min_days').notNull().default(0),
  maxDays:      integer('max_days').notNull().default(1),
  description:  text('description'),
  active:       integer('active', { mode: 'boolean' }).notNull().default(true),
})

// Notas internas — polimórfico (order ou customer)
export const internalNotes = sqliteTable('internal_notes', {
  id:         text('id').primaryKey(),
  targetType: text('target_type', { enum: ['order','customer'] }).notNull(),
  targetId:   text('target_id').notNull(),
  body:       text('body').notNull(),
  createdBy:  text('created_by').notNull(),   // admin_user_id
  createdAt:  text('created_at').notNull().default(sql`(datetime('now'))`),
})

// Log de auditoria — toda alteração crítica (preço, estoque, status pedido)
export const auditLog = sqliteTable('audit_log', {
  id:         text('id').primaryKey(),
  tableName:  text('table_name').notNull(),
  recordId:   text('record_id').notNull(),
  action:     text('action', { enum: ['insert','update','delete'] }).notNull(),
  before:     text('before', { mode: 'json' }),
  after:      text('after',  { mode: 'json' }),
  userId:     text('user_id'),      // admin_user_id | 'system'
  ipAddress:  text('ip_address'),
  createdAt:  text('created_at').notNull().default(sql`(datetime('now'))`),
})

// Configurações da loja (key/value flexível)
export const appSettings = sqliteTable('app_settings', {
  key:       text('key').primaryKey(),   // 'store.name', 'shipping.free_above', etc.
  value:     text('value', { mode: 'json' }).notNull(),
  updatedBy: text('updated_by'),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ── Relations ──────────────────────────────────────────────
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user:    one(users,           { fields: [cartItems.userId],    references: [users.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}))

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user:    one(users,           { fields: [wishlists.userId],    references: [users.id] }),
  variant: one(productVariants, { fields: [wishlists.variantId], references: [productVariants.id] }),
}))

export const couponsRelations = relations(coupons, ({ many }) => ({
  uses: many(couponUses),
}))

export const couponUsesRelations = relations(couponUses, ({ one }) => ({
  coupon: one(coupons, { fields: [couponUses.couponId], references: [coupons.id] }),
  user:   one(users,   { fields: [couponUses.userId],   references: [users.id] }),
  order:  one(orders,  { fields: [couponUses.orderId],  references: [orders.id] }),
}))
