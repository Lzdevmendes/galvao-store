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
