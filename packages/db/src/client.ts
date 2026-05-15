import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

const url = process.env.DATABASE_URL ?? 'file:./galvao.db'
const authToken = process.env.DATABASE_AUTH_TOKEN

// authToken só é necessário para URLs remotas (libsql:// ou https://)
// Para file:// o token é ignorado — sem risco de 401
if (!url.startsWith('file:') && !authToken) {
  throw new Error(
    '[db] DATABASE_AUTH_TOKEN é obrigatório para conexão remota.\n' +
    'Defina a variável de ambiente DATABASE_AUTH_TOKEN com o token Turso.'
  )
}

const client = createClient({ url, authToken })

export const db = drizzle(client, { schema })
export type DB = typeof db
