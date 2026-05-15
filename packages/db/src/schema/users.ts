import { text, integer, real } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { orders } from './orders'
import { wishlists, cartItems } from './commerce'

export const users = sqliteTable('users', {
  id:        text('id').primaryKey(), // Supabase Auth UID
  email:     text('email').notNull().unique(),
  name:      text('name'),
  phone:     text('phone'),
  cpf:       text('cpf'),
  role:      text('role', { enum: ['customer','admin'] }).notNull().default('customer'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const addresses = sqliteTable('addresses', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label:      text('label').notNull().default('Casa'), // Casa, Trabalho, etc.
  name:       text('name').notNull(),
  cep:        text('cep').notNull(),
  street:     text('street').notNull(),
  number:     text('number').notNull(),
  complement: text('complement'),
  district:   text('district').notNull(),
  city:       text('city').notNull(),
  state:      text('state').notNull(),
  isDefault:  integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt:  text('created_at').notNull().default(sql`(datetime('now'))`),
})

// ── Relations ──────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders:    many(orders),
  wishlist:  many(wishlists),
  cart:      many(cartItems),
}))

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}))
