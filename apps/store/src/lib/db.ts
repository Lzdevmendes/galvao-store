import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { join } from 'path'

const url = process.env.DATABASE_URL ?? `file:${join(process.cwd(), '../../packages/db/galvao.db')}`

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

export const db = drizzle(client)
