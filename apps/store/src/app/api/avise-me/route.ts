import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { limiters, getRealIp, checkRateLimit } from '@/lib/ratelimit'

const schema = z.object({
  email:       z.string().email('E-mail inválido'),
  variantId:   z.string().min(1, 'variantId obrigatório'),
  productName: z.string().optional().default(''),
})

export async function POST(req: NextRequest) {
  const ip = getRealIp(req)
  const blocked = await checkRateLimit(limiters.aviseme, `aviseme:${ip}`, 5, 10 * 60 * 1000, 600)
  if (blocked) return blocked

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { email, variantId, productName } = parsed.data
  const key = email.toLowerCase()
  await db.run(sql`
    INSERT INTO stock_alerts (id, email, variant_id, product_name)
    VALUES (${crypto.randomUUID()}, ${key}, ${variantId}, ${productName})
    ON CONFLICT(email, variant_id) DO NOTHING
  `)

  return NextResponse.json({ ok: true })
}
