import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureLocalUser } from '@/lib/user-sync'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import PrivacyForm from './privacy-form'

export const metadata = { title: 'Privacidade e dados' }

export default async function PrivacidadePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/conta/privacidade')

  await ensureLocalUser(user)
  const rows = await db.all<{ marketing_opt_in: number }>(
    sql`SELECT marketing_opt_in FROM users WHERE id = ${user.id} LIMIT 1`,
  )

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 640 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, margin: '0 0 6px' }}>
        Privacidade e dados
      </h1>
      <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: '0 0 28px' }}>
        Controle suas preferências e exerça seus direitos (LGPD).
      </p>
      <PrivacyForm marketingOptIn={!!rows[0]?.marketing_opt_in} />
    </div>
  )
}
