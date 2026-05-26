import { Resend } from 'resend'
import { render } from '@react-email/render'
import { OrderCreatedEmail, type OrderCreatedEmailProps } from '@/emails/order-created'
import { PaymentConfirmedEmail, type PaymentConfirmedEmailProps } from '@/emails/payment-confirmed'
import { OrderShippedEmail, type OrderShippedEmailProps } from '@/emails/order-shipped'
import { OrderDeliveredEmail, type OrderDeliveredEmailProps } from '@/emails/order-delivered'
import { OrderCancelledEmail, type OrderCancelledEmailProps } from '@/emails/order-cancelled'
import { PasswordResetEmail, type PasswordResetEmailProps } from '@/emails/password-reset'
import { WelcomeClubEmail, type WelcomeClubEmailProps } from '@/emails/welcome-club'
import { CartAbandonedEmail, type CartAbandonedEmailProps } from '@/emails/cart-abandoned'
import { BackInStockEmail, type BackInStockEmailProps } from '@/emails/back-in-stock'

const resend = new Resend(process.env.RESEND_API_KEY)

// Em dev usa o sender de teste do Resend (não requer domínio verificado)
// Em prod trocar para: noreply@galvaosstore.com.br (após verificar domínio)
const FROM = process.env.NODE_ENV === 'production'
  ? 'Galvão\'s Store <noreply@galvaosstore.com.br>'
  : 'Galvão\'s Store <onboarding@resend.dev>'

// ── Generic send helper ───────────────────────────────────
async function sendEmail({
  to,
  subject,
  component,
}: {
  to:        string
  subject:   string
  component: React.ReactElement
}) {
  // Renderiza o componente React para HTML no servidor
  const html = await render(component)
  const { data, error } = await resend.emails.send({ from: FROM, to: to.toLowerCase(), subject, html })
  if (error) {
    console.error('[email] send error:', JSON.stringify(error))
    throw new Error(`Resend error: ${JSON.stringify(error)}`)
  }
  console.log(`[email] ✓ enviado para ${to} — id: ${data?.id}`)
  return data
}

// ── 1. Pedido criado ──────────────────────────────────────
export async function sendOrderCreatedEmail(
  to: string,
  props: OrderCreatedEmailProps,
) {
  return sendEmail({
    to,
    subject: `Pedido ${props.orderNumber} recebido — Galvão's Store`,
    component: OrderCreatedEmail(props),
  })
}

// ── 2. Pagamento confirmado ───────────────────────────────
export async function sendPaymentConfirmedEmail(
  to: string,
  props: PaymentConfirmedEmailProps,
) {
  return sendEmail({
    to,
    subject: `✅ Pagamento confirmado — Pedido ${props.orderNumber}`,
    component: PaymentConfirmedEmail(props),
  })
}

// ── 3. Pedido enviado ────────────────────────────────────
export async function sendOrderShippedEmail(
  to: string,
  props: OrderShippedEmailProps,
) {
  return sendEmail({
    to,
    subject: `🚚 Pedido ${props.orderNumber} enviado — Rastreio: ${props.trackingCode}`,
    component: OrderShippedEmail(props),
  })
}

// ── 4. Pedido entregue ────────────────────────────────────
export async function sendOrderDeliveredEmail(
  to: string,
  props: OrderDeliveredEmailProps,
) {
  return sendEmail({
    to,
    subject: `🎉 Pedido ${props.orderNumber} entregue — Conta-nos o que achou!`,
    component: OrderDeliveredEmail(props),
  })
}

// ── 5. Redefinição de senha ───────────────────────────────
export async function sendPasswordResetEmail(
  to: string,
  props: PasswordResetEmailProps,
) {
  return sendEmail({
    to,
    subject: `🔐 Redefinição de senha — Galvão's Store`,
    component: PasswordResetEmail(props),
  })
}

// ── 6. Pedido cancelado ───────────────────────────────────
export async function sendOrderCancelledEmail(
  to: string,
  props: OrderCancelledEmailProps,
) {
  return sendEmail({
    to,
    subject: `Pedido ${props.orderNumber} cancelado — Galvão's Store`,
    component: OrderCancelledEmail(props),
  })
}

// ── 7. Boas-vindas ao Clube ───────────────────────────────
export async function sendWelcomeClubEmail(
  to: string,
  props: WelcomeClubEmailProps,
) {
  return sendEmail({
    to,
    subject: `⭐ Bem-vindo ao Clube Galvão's Store, ${props.customerName.split(' ')[0]}!`,
    component: WelcomeClubEmail(props),
  })
}

// ── 8. Carrinho abandonado ────────────────────────────────
export async function sendCartAbandonedEmail(
  to: string,
  props: CartAbandonedEmailProps,
) {
  const subjects: Record<CartAbandonedEmailProps['variant'], string> = {
    '1h':  'Esqueceu alguma coisa? Seu carrinho está esperando!',
    '24h': 'Seus produtos ainda estão no carrinho 🛒',
    '72h': 'Última chamada — seu carrinho está quase expirando ⏰',
  }
  return sendEmail({
    to,
    subject: subjects[props.variant],
    component: CartAbandonedEmail(props),
  })
}

// ── 9. Produto de volta ao estoque ───────────────────────
export async function sendBackInStockEmail(
  to: string,
  props: BackInStockEmailProps,
) {
  return sendEmail({
    to,
    subject: `🎉 ${props.productName} (Tam. ${props.variantSize}) voltou ao estoque!`,
    component: BackInStockEmail(props),
  })
}

// ── Dispatcher por status (usado no webhook MP) ───────────
export async function dispatchOrderStatusEmail(
  order: {
    status:         string
    customerEmail:  string
    customerName:   string
    orderNumber:    string
    paidAt?:        string | null
    shippedAt?:     string | null
    deliveredAt?:   string | null
    trackingCode?:  string | null
    deliveryMethod: string
    estimatedDays?: number | null
    items: Array<{
      productName:  string
      brandName:    string
      variantSize:  string
      variantColor?: string | null
      imageUrl?:    string | null
      qty:          number
      unitInCents:  number
      totalInCents: number
    }>
    subtotalInCents:  number
    discountInCents:  number
    shippingInCents:  number
    totalInCents:     number
    couponCode?:      string | null
    paymentMethod:    'pix' | 'credit_card' | 'boleto'
    shipCep:          string
    shipStreet:       string
    shipNumber:       string
    shipComplement?:  string | null
    shipDistrict:     string
    shipCity:         string
    shipState:        string
  }
) {
  const to      = order.customerEmail
  const address = {
    street:     order.shipStreet,
    number:     order.shipNumber,
    complement: order.shipComplement,
    district:   order.shipDistrict,
    city:       order.shipCity,
    state:      order.shipState,
    cep:        order.shipCep,
  }
  const totals = {
    subtotalInCents: order.subtotalInCents,
    discountInCents: order.discountInCents,
    shippingInCents: order.shippingInCents,
    totalInCents:    order.totalInCents,
    couponCode:      order.couponCode,
    paymentMethod:   order.paymentMethod,
  }

  switch (order.status) {
    case 'paid':
      return sendPaymentConfirmedEmail(to, {
        orderNumber:    order.orderNumber,
        customerName:   order.customerName,
        paidAt:         order.paidAt ?? new Date().toISOString(),
        items:          order.items,
        totals,
        deliveryMethod: order.deliveryMethod,
        estimatedDays:  order.estimatedDays,
      })

    case 'shipped':
      if (!order.trackingCode) return
      return sendOrderShippedEmail(to, {
        orderNumber:    order.orderNumber,
        customerName:   order.customerName,
        shippedAt:      order.shippedAt ?? new Date().toISOString(),
        trackingCode:   order.trackingCode,
        deliveryMethod: order.deliveryMethod,
        estimatedDays:  order.estimatedDays,
        items:          order.items,
        address,
      })

    case 'delivered':
      return sendOrderDeliveredEmail(to, {
        orderNumber:  order.orderNumber,
        customerName: order.customerName,
        deliveredAt:  order.deliveredAt ?? new Date().toISOString(),
        items:        order.items,
      })

    case 'cancelled':
    case 'refunded':
      return sendOrderCancelledEmail(to, {
        orderNumber:   order.orderNumber,
        customerName:  order.customerName,
        cancelledAt:   new Date().toISOString(),
        items:         order.items,
        totalInCents:  order.totalInCents,
        paymentMethod: order.paymentMethod,
        refundExpected: order.status === 'refunded',
      })
  }
}
