import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { APP_URL } from '@/emails/_components/email-layout'

// LGPD: descadastro da newsletter a partir do link de qualquer e-mail (sem login).
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? ''
  if (!token) return html('Link inválido', 'Este link de descadastro não é válido.')

  await db.run(sql`
    UPDATE newsletter_subscriptions
    SET status = 'unsubscribed'
    WHERE unsubscribe_token = ${token}
  `)

  return html('Inscrição cancelada', 'Você não receberá mais e-mails de marketing da Galvão\'s Store. Sentiremos sua falta! ⚽')
}

function html(title: string, message: string) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="font-family:system-ui,sans-serif;background:#0B0E12;color:#F8F9FB;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px">
  <div style="max-width:440px;text-align:center;background:#13171d;border:1px solid #232a33;border-radius:16px;padding:40px 32px">
    <div style="font-size:22px;font-weight:900;letter-spacing:1px">GALVÃO'S STORE</div>
    <div style="height:3px;width:48px;background:#F26B1F;margin:14px auto 24px;border-radius:2px"></div>
    <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
    <p style="font-size:14px;color:#9aa3ad;line-height:1.6;margin:0 0 28px">${message}</p>
    <a href="${APP_URL}" style="display:inline-block;background:#F26B1F;color:#fff;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:8px">Voltar à loja</a>
  </div>
</body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}
