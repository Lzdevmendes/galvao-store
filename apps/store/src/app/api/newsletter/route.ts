import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { newsletterLimit, checkInMemory } from '@/lib/ratelimit'
import { APP_URL, brand, font } from '@/emails/_components/email-layout'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.NODE_ENV === 'production'
  ? "Galvão's Store <noreply@galvaosstore.com.br>"
  : "Galvão's Store <onboarding@resend.dev>"

const schema = z.object({ email: z.string().email('E-mail inválido') })

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (newsletterLimit) {
    const { success } = await newsletterLimit.limit(ip)
    if (!success) return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 })
  } else if (!checkInMemory(`newsletter:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const key = parsed.data.email.toLowerCase()

  const existing = await db.all(sql`SELECT id FROM newsletter_subscriptions WHERE email = ${key} LIMIT 1`)
  if (existing.length > 0) {
    return NextResponse.json({ ok: true, already: true })
  }

  await db.run(sql`INSERT INTO newsletter_subscriptions (id, email) VALUES (${crypto.randomUUID()}, ${key})`)

  resend.emails.send({
    from: FROM,
    to: key,
    subject: "Bem-vindo ao time Galvão's Store! ⚽",
    html: welcomeHtml(key),
  }).catch(() => { /* silent */ })

  return NextResponse.json({ ok: true })
}

function welcomeHtml(_email: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="background:${brand.bodyBg};margin:0;padding:32px 0;font-family:${font.base}">
  <div style="max-width:560px;margin:0 auto;background:${brand.white};border-radius:12px;overflow:hidden">
    <div style="background:${brand.dark};padding:32px;text-align:center">
      <div style="font-family:${font.base};font-size:24px;font-weight:900;color:${brand.light};letter-spacing:1px">GALVÃO'S STORE</div>
      <div style="font-size:11px;font-weight:600;letter-spacing:3px;color:${brand.orange};margin-top:4px;text-transform:uppercase">Alta Performance</div>
    </div>
    <div style="height:4px;background:${brand.orange}"></div>
    <div style="padding:40px 32px">
      <h1 style="font-size:26px;font-weight:900;color:${brand.dark};margin:0 0 16px;letter-spacing:.5px">
        BEM-VINDO AO TIME! ⚽
      </h1>
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px">
        Olá! Você agora faz parte da lista VIP da Galvão's Store.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 28px">
        Vai receber em primeira mão:
      </p>
      <ul style="font-size:14px;color:#374151;line-height:2;margin:0 0 28px;padding-left:20px">
        <li>🚀 Lançamentos antes de todo mundo</li>
        <li>🏷️ Ofertas exclusivas e relâmpago</li>
        <li>🎁 Cupons especiais para assinantes</li>
      </ul>
      <a href="${APP_URL}/produtos" style="display:inline-block;background:${brand.orange};color:${brand.white};font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:.3px">
        Explorar produtos →
      </a>
    </div>
    <div style="background:${brand.dark};padding:24px;text-align:center">
      <p style="font-size:12px;color:#6B7280;margin:0">
        © ${new Date().getFullYear()} Galvão's Store · Caraguatatuba / SP<br>
        <a href="${APP_URL}" style="color:${brand.orange};text-decoration:none">galvaosstore.com.br</a>
      </p>
    </div>
  </div>
</body>
</html>`
}
