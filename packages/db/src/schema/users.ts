import { text, integer } from 'drizzle-orm/sqlite-core'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { orders } from './orders'
import { wishlists, cartItems } from './commerce'

export const users = sqliteTable('users', {
  id:        text('id').primaryKey(),       // Supabase Auth UID
  email:     text('email').notNull().unique(),
  name:      text('name'),
  phone:     text('phone'),
  cpf:       text('cpf'),
  birthday:  text('birthday'),             // YYYY-MM-DD
  isClubMember:   integer('is_club_member', { mode: 'boolean' }).notNull().default(false),
  marketingOptIn: integer('marketing_opt_in', { mode: 'boolean' }).notNull().default(false),
  // Aceite explícito de Termos de Uso / Política de Privacidade no cadastro —
  // nullable porque contas criadas antes deste campo existir não têm esse registo.
  termsAcceptedAt: text('terms_accepted_at'),
  termsVersion:    text('terms_version'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const addresses = sqliteTable('addresses', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label:      text('label').notNull().default('Casa'),
  name:       text('name').notNull(),
  cep:        text('cep').notNull(),
  street:     text('street').notNull(),
  number:     text('number').notNull(),
  complement: text('complement'),
  district:   text('district').notNull(),
  city:       text('city').notNull(),
  state:      text('state', { length: 2 }).notNull(),
  isDefault:  integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt:  text('created_at').notNull().default(sql`(datetime('now'))`),
})

// Utilizadores do backoffice — separados dos customers
export const adminUsers = sqliteTable('admin_users', {
  id:          text('id').primaryKey(),
  email:       text('email').notNull().unique(),
  name:        text('name').notNull(),
  role:        text('role', { enum: ['owner','manager','staff','marketing'] }).notNull().default('staff'),
  permissions: text('permissions', { mode: 'json' }).$type<Record<string,boolean>>().default(sql`'{}'`),
  active:      integer('active', { mode: 'boolean' }).notNull().default(true),
  lastLoginAt: text('last_login_at'),
  createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`),
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
