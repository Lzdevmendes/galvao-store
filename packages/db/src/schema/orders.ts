import { text, integer } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { users } from './users'
import { productVariants } from './products'

export type OrderStatus =
  | 'pending_payment' | 'paid' | 'processing'
  | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto'
export type DeliveryMethod = 'sedex' | 'pac' | 'local_delivery' | 'pickup'

export const orders = sqliteTable('orders', {
  id:          text('id').primaryKey(),
  userId:      text('user_id').references(() => users.id),   // null = guest
  orderNumber: text('order_number').notNull().unique(),       // GS-2026-001042
  status:      text('status').$type<OrderStatus>().notNull().default('pending_payment'),

  // Snapshot do cliente no momento do pedido
  customerName:  text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  customerCpf:   text('customer_cpf'),

  // Snapshot do endereço de entrega
  shipCep:        text('ship_cep').notNull(),
  shipStreet:     text('ship_street').notNull(),
  shipNumber:     text('ship_number').notNull(),
  shipComplement: text('ship_complement'),
  shipDistrict:   text('ship_district').notNull(),
  shipCity:       text('ship_city').notNull(),
  shipState:      text('ship_state').notNull(),

  // Entrega
  deliveryMethod: text('delivery_method').$type<DeliveryMethod>().notNull().default('sedex'),
  shippingInCents:integer('shipping_in_cents').notNull().default(0),
  estimatedDays:  integer('estimated_days'),
  trackingCode:   text('tracking_code'),
  shippedAt:      text('shipped_at'),
  deliveredAt:    text('delivered_at'),

  // Pagamento
  paymentMethod:  text('payment_method').$type<PaymentMethod>().notNull(),
  paymentId:      text('payment_id'),       // ID da transação MP
  pixQrCode:      text('pix_qr_code'),      // base64 do QR
  pixKey:         text('pix_key'),          // copia-e-cola
  pixExpiresAt:   text('pix_expires_at'),
  boletoUrl:      text('boleto_url'),
  boletoBarCode:  text('boleto_bar_code'),
  boletoExpiresAt:text('boleto_expires_at'),
  paidAt:         text('paid_at'),

  // Valores — TODOS em centavos
  subtotalInCents:  integer('subtotal_in_cents').notNull(),
  discountInCents:  integer('discount_in_cents').notNull().default(0),
  totalInCents:     integer('total_in_cents').notNull(),
  couponCode:       text('coupon_code'),

  // NF-e
  nfeKey:       text('nfe_key'),
  nfeUrl:       text('nfe_url'),
  nfePdfUrl:    text('nfe_pdf_url'),
  nfeIssuedAt:  text('nfe_issued_at'),

  // Notas
  notes:     text('notes'),

  // Aceite explícito de Termos de Uso / Política de Privacidade na finalização
  // da compra — cobre também guest checkout (user_id null), que o aceite do
  // cadastro (users.terms_accepted_at) não cobre.
  termsAcceptedAt: text('terms_accepted_at'),
  termsVersion:    text('terms_version'),

  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// Itens do pedido — snapshot completo (produto pode mudar depois)
export const orderItems = sqliteTable('order_items', {
  id:              text('id').primaryKey(),
  orderId:         text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  variantId:       text('variant_id').references(() => productVariants.id), // null se deletado
  // Snapshot no momento da compra
  productName:     text('product_name').notNull(),
  productSku:      text('product_sku').notNull(),
  brandName:       text('brand_name').notNull(),
  variantSize:     text('variant_size').notNull(),
  variantColor:    text('variant_color'),
  imageUrl:        text('image_url'),
  qty:             integer('qty').notNull().default(1),
  unitInCents:     integer('unit_in_cents').notNull(),   // preço unitário
  totalInCents:    integer('total_in_cents').notNull(),  // unit × qty
})

// Timeline de eventos do pedido
export const orderEvents = sqliteTable('order_events', {
  id:        text('id').primaryKey(),
  orderId:   text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  type:      text('type').$type<OrderStatus | 'note_added' | 'tracking_added'>().notNull(),
  payload:   text('payload', { mode: 'json' }).$type<Record<string,unknown>>().default(sql`'{}'`),
  createdBy: text('created_by'),   // admin_user_id | 'system' | 'customer'
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

// ── Relations ──────────────────────────────────────────────
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user:   one(users,  { fields: [orders.userId], references: [users.id] }),
  items:  many(orderItems),
  events: many(orderEvents),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order:   one(orders,          { fields: [orderItems.orderId],   references: [orders.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}))

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}))
