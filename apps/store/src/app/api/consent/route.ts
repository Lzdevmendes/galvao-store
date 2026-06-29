import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { limiters, getRealIp, checkRateLimit } from '@/lib/ratelimit'

const schema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
  anonId:    z.string().max(64).optional(),
})

// LGPD art. 8 — regista cada decisão de consentimento de forma auditável.
// Funciona para visitante anónimo (user_id null) e para utilizador logado.
export async function POST(req: NextRequest) {
  const ip = getRealIp(req)
  const blocked = await checkRateLimit(limiters.consent, `consent:${ip}`, 30, 10 * 60 * 1000, 600)
  if (blocked) return blocked

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { analytics, marketing, anonId } = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null
  const ua = req.headers.get('user-agent')?.slice(0, 255) ?? null

  const decisions: [string, boolean][] = [
    ['necessary', true],
    ['analytics', analytics],
    ['marketing', marketing],
  ]

  for (const [type, granted] of decisions) {
    await db.run(sql`
      INSERT INTO user_consents (id, user_id, anon_id, type, granted, source, ip, user_agent)
      VALUES (${crypto.randomUUID()}, ${userId}, ${anonId ?? null}, ${type}, ${granted ? 1 : 0}, 'cookie_banner', ${ip}, ${ua})
    `)
  }

  // Mantém o opt-in de marketing do utilizador logado em sincronia.
  if (userId) {
    await db.run(sql`UPDATE users SET marketing_opt_in = ${marketing ? 1 : 0} WHERE id = ${userId}`)
  }

  return NextResponse.json({ ok: true })
}
