import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { aviseMeLimit, checkInMemory } from '@/lib/ratelimit'

const schema = z.object({
  email:       z.string().email('E-mail inválido'),
  variantId:   z.string().min(1, 'variantId obrigatório'),
  productName: z.string().optional().default(''),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (aviseMeLimit) {
    const { success } = await aviseMeLimit.limit(ip)
    if (!success) return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 })
  } else if (!checkInMemory(`aviseme:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 })
  }

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
