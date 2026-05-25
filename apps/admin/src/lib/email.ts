import { Resend } from 'resend'
import { render } from '@react-email/render'
import { OrderShippedEmail, type OrderShippedEmailProps } from '@/emails/order-shipped'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.NODE_ENV === 'production'
  ? "Galvão's Store <noreply@galvaosstore.com.br>"
  : "Galvão's Store <onboarding@resend.dev>"

async function sendEmail({ to, subject, component }: { to: string; subject: string; component: React.ReactElement }) {
  const html = await render(component)
  const { data, error } = await resend.emails.send({ from: FROM, to: to.toLowerCase(), subject, html })
  if (error) { console.error('[admin/email]', JSON.stringify(error)); throw new Error(JSON.stringify(error)) }
  console.log('[admin/email] enviado para', to, '— id:', data?.id)
  return data
}

export async function sendOrderShippedEmail(to: string, props: OrderShippedEmailProps) {
  return sendEmail({
    to,
    subject: `🚚 Pedido ${props.orderNumber} enviado — Rastreio: ${props.trackingCode}`,
    component: OrderShippedEmail(props) as unknown as React.ReactElement,
  })
}

export async function sendBackInStockEmail(to: string, productName: string, productSlug: string) {
  const storeUrl = process.env.STORE_URL ?? 'https://galvaosstore.com.br'
  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"></head>
<body style="background:#F5F6F7;margin:0;padding:32px 0;font-family:system-ui,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#0B0E12;padding:28px 32px;text-align:center">
      <div style="font-size:20px;font-weight:900;color:#F8F9FB;letter-spacing:1px">GALVÃO'S STORE</div>
      <div style="font-size:10px;font-weight:700;letter-spacing:3px;color:#F26B1F;margin-top:4px;text-transform:uppercase">Alta Performance</div>
    </div>
    <div style="height:4px;background:#F26B1F"></div>
    <div style="padding:36px 32px">
      <h1 style="font-size:22px;font-weight:900;color:#0B0E12;margin:0 0 12px">Voltou ao estoque! 🎉</h1>
      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px">
        O produto que você queria chegou:
      </p>
      <div style="background:#F5F6F7;border-radius:8px;padding:16px 20px;margin-bottom:28px">
        <strong style="font-size:16px;color:#0B0E12">${productName}</strong>
      </div>
      <p style="font-size:14px;color:#6B7280;margin:0 0 24px">
        Corra — o estoque pode esgotar rapidinho!
      </p>
      <a href="${storeUrl}/produto/${productSlug}" style="display:inline-block;background:#F26B1F;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px">
        Comprar agora →
      </a>
    </div>
    <div style="background:#0B0E12;padding:20px;text-align:center">
      <p style="font-size:12px;color:#6B7280;margin:0">
        © ${new Date().getFullYear()} Galvão's Store
        <br><a href="${storeUrl}" style="color:#F26B1F;text-decoration:none">galvaosstore.com.br</a>
      </p>
    </div>
  </div>
</body></html>`

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: to.toLowerCase(),
    subject: `🎉 ${productName} voltou ao estoque!`,
    html,
  })
  if (error) console.error('[admin/email] back-in-stock:', JSON.stringify(error))
  return data
}
