import { text, integer, real } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { users } from './users'
import { products } from './products'

export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentMethod = 'pix' | 'credit_card' | 'boleto'
export type DeliveryMethod = 'sedex' | 'pac' | 'local_delivery' | 'pickup'

export const orders = sqliteTable('orders', {
  id:            text('id').primaryKey(),
  userId:        text('user_id').references(() => users.id), // null = guest
  orderNumber:   text('order_number').notNull().unique(), // GS-2026-001042
  status:        text('status').$type<OrderStatus>().notNull().default('pending_payment'),

  // Customer info (snapshot)
  customerName:  text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  customerCpf:   text('customer_cpf'),

  // Shipping address (snapshot)
  shipCep:        text('ship_cep').notNull(),
  shipStreet:     text('ship_street').notNull(),
  shipNumber:     text('ship_number').notNull(),
  shipComplement: text('ship_complement'),
  shipDistrict:   text('ship_district').notNull(),
  shipCity:       text('ship_city').notNull(),
  shipState:      text('ship_state').notNull(),

  // Delivery
  deliveryMethod: text('delivery_method').$type<DeliveryMethod>().notNull().default('sedex'),
  shippingCost:   real('shipping_cost').notNull().default(0),
  estimatedDays:  integer('estimated_days'),
  trackingCode:   text('tracking_code'),

  // Payment
  paymentMethod:  text('payment_method').$type<PaymentMethod>().notNull(),
  paymentId:      text('payment_id'), // MP transaction ID
  pixQrCode:      text('pix_qr_code'),
  pixKey:         text('pix_key'),
  boletoUrl:      text('boleto_url'),
  paidAt:         text('paid_at'),

  // Values
  subtotal:       real('subtotal').notNull(),
  discountAmount: real('discount_amount').notNull().default(0),
  total:          real('total').notNull(),
  couponCode:     text('coupon_code'),

  // Notes
  notes:          text('notes'),

  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const orderItems = sqliteTable('order_items', {
  id:           text('id').primaryKey(),
  orderId:      text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId:    text('product_id').notNull().references(() => products.id),
  // Snapshot do produto no momento da compra
  productName:  text('product_name').notNull(),
  productSku:   text('product_sku').notNull(),
  brandName:    text('brand_name').notNull(),
  imageUrl:     text('image_url'),
  size:         real('size').notNull(),
  quantity:     integer('quantity').notNull().default(1),
  unitPrice:    real('unit_price').notNull(),
  totalPrice:   real('total_price').notNull(),
})

export const orderTimeline = sqliteTable('order_timeline', {
  id:        text('id').primaryKey(),
  orderId:   text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  status:    text('status').$type<OrderStatus>().notNull(),
  note:      text('note'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

// ── Relations ──────────────────────────────────────────────
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user:     one(users,   { fields: [orders.userId], references: [users.id] }),
  items:    many(orderItems),
  timeline: many(orderTimeline),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order:   one(orders,   { fields: [orderItems.orderId],   references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}))

export const orderTimelineRelations = relations(orderTimeline, ({ one }) => ({
  order: one(orders, { fields: [orderTimeline.orderId], references: [orders.id] }),
}))
