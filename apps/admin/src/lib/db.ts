// DB local para desenvolvimento — usar Supabase em produção
// ficheiro server-only (Next.js só o executa no servidor)
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { join } from 'path'

const DB_PATH = join(process.cwd(), '../../packages/db/galvao.db')

const sqlite = new Database(DB_PATH)
export const db = drizzle(sqlite)
