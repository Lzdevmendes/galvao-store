import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { limiters, getRealIp, checkRateLimit } from '@/lib/ratelimit'
import { APP_URL, brand, font } from '@/emails/_components/email-layout'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.NODE_ENV === 'production'
  ? "Galvão's Store <noreply@galvaosstore.com.br>"
  : "Galvão's Store <onboarding@resend.dev>"

const schema = z.object({ email: z.string().email('E-mail inválido') })

export async function POST(req: NextRequest) {
  // Rate limit por IP (anti-spam geral)
  const ip = getRealIp(req)
  const blockedIp = await checkRateLimit(limiters.newsletter, `newsletter:${ip}`, 3, 10 * 60 * 1000, 600)
  if (blockedIp) return blockedIp

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const key = parsed.data.email.toLowerCase()

  // Rate limit por e-mail — 1 inscrição por e-mail a cada 24h (bloqueia spam com e-mails gerados)
  const blockedEmail = await checkRateLimit(limiters.newsletterEmail, `newsletter_email:${key}`, 1, 24 * 60 * 60 * 1000, 86400)
  if (blockedEmail) return NextResponse.json({ ok: true, already: true }) // silencioso — não revelar o limite

  const existing = await db.all<{ status: string }>(sql`SELECT status FROM newsletter_subscriptions WHERE email = ${key} LIMIT 1`)
  // Já confirmado — nada a fazer (resposta silenciosa, não revela se o e-mail existe)
  if (existing.length > 0 && existing[0].status === 'confirmed') {
    return NextResponse.json({ ok: true, already: true })
  }

  // LGPD: double opt-in. Grava como 'pending' e envia e-mail de confirmação.
  const confirmToken     = crypto.randomUUID()
  const unsubscribeToken = crypto.randomUUID()

  if (existing.length > 0) {
    await db.run(sql`UPDATE newsletter_subscriptions SET status = 'pending', confirm_token = ${confirmToken}, unsubscribe_token = ${unsubscribeToken} WHERE email = ${key}`)
  } else {
    await db.run(sql`INSERT INTO newsletter_subscriptions (id, email, status, confirm_token, unsubscribe_token) VALUES (${crypto.randomUUID()}, ${key}, 'pending', ${confirmToken}, ${unsubscribeToken})`)
  }

  resend.emails.send({
    from: FROM,
    to: key,
    subject: "Confirme sua inscrição — Galvão's Store ⚽",
    html: confirmHtml(confirmToken),
  }).catch(() => { /* silent */ })

  return NextResponse.json({ ok: true })
}

function confirmHtml(token: string) {
  const confirmUrl = `${APP_URL}/api/newsletter/confirmar?token=${token}`
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
        CONFIRME SUA INSCRIÇÃO ⚽
      </h1>
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px">
        Falta um passo para entrar na lista VIP da Galvão's Store. Clique no botão abaixo para confirmar que é você.
      </p>
      <a href="${confirmUrl}" style="display:inline-block;background:${brand.orange};color:${brand.white};font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:.3px;margin:8px 0 28px">
        Confirmar inscrição →
      </a>
      <p style="font-size:13px;color:#6B7280;line-height:1.6;margin:0">
        Se não foi você que pediu, ignore este e-mail — nenhuma inscrição será feita sem esta confirmação.
      </p>
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
