import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { createHmac } from 'crypto'
import { sendPaymentConfirmedEmail } from '@/lib/email'

// MP envia: POST /api/webhooks/mercadopago?data.id=...&type=payment
// Header x-signature: ts=...,v1=...
// Header x-request-id: <uuid>

function validateSignature(req: NextRequest, _body: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return true // dev mode sem secret

  const sig       = req.headers.get('x-signature') ?? ''
  const requestId = req.headers.get('x-request-id') ?? ''
  const dataId    = req.nextUrl.searchParams.get('data.id') ?? ''

  const tsMatch = sig.match(/ts=(\d+)/)
  const v1Match = sig.match(/v1=([a-f0-9]+)/)
  if (!tsMatch || !v1Match) return false

  const ts        = tsMatch[1]
  const expected  = v1Match[1]
  const manifest  = `id:${dataId};request-id:${requestId};ts:${ts};`
  const computed  = createHmac('sha256', secret).update(manifest).digest('hex')

  return computed === expected
}

export async function POST(req: NextRequest) {
  const body = await req.text()

  if (!validateSignature(req, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: { type?: string; data?: { id?: string }; action?: string }
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Só processar eventos de pagamento
  if (payload.type !== 'payment' && payload.action !== 'payment.updated') {
    return NextResponse.json({ ok: true })
  }

  const mpPaymentId = payload.data?.id ?? req.nextUrl.searchParams.get('data.id')
  if (!mpPaymentId) return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })

  try {
    // Buscar detalhes do pagamento na API do MP
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) return NextResponse.json({ ok: true })

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!mpRes.ok) return NextResponse.json({ error: 'MP API error' }, { status: 502 })

    const payment = await mpRes.json()
    const orderId = payment.external_reference as string
    const status  = payment.status as string

    if (!orderId) return NextResponse.json({ ok: true })

    // Buscar pedido
    const orders = db.all<{ id: string; status: string }>(sql`
      SELECT id, status FROM orders WHERE id = ${orderId} LIMIT 1
    `)
    const order = orders[0]
    if (!order) return NextResponse.json({ ok: true })

    // Mapear status MP → status interno
    const statusMap: Record<string, string> = {
      approved:     'paid',
      in_process:   'pending_payment',
      pending:      'pending_payment',
      rejected:     'cancelled',
      cancelled:    'cancelled',
      refunded:     'refunded',
      charged_back: 'refunded',
    }
    const newStatus = statusMap[status] ?? 'pending_payment'

    if (newStatus === order.status) return NextResponse.json({ ok: true })

    // Atualizar status do pedido
    if (newStatus === 'paid') {
      db.run(sql`
        UPDATE orders
        SET status = 'paid', paid_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ${orderId}
      `)

      // Decrementar estoque definitivo
      const items = db.all<{ variant_id: string; qty: number }>(sql`
        SELECT variant_id, qty FROM order_items WHERE order_id = ${orderId}
      `)
      for (const item of items) {
        db.run(sql`
          UPDATE product_variants
          SET stock          = stock          - ${item.qty},
              stock_reserved = stock_reserved - ${item.qty}
          WHERE id = ${item.variant_id}
        `)
      }

      // Evento na timeline
      db.run(sql`
        INSERT INTO order_events (id, order_id, type, created_by, created_at)
        VALUES (${crypto.randomUUID()}, ${orderId}, 'paid', 'system', datetime('now'))
      `)

      // E-mail de pagamento confirmado
      const fullOrder = db.all<{
        order_number: string; customer_name: string; customer_email: string
        delivery_method: string; estimated_days: number | null
        subtotal_in_cents: number; discount_in_cents: number
        shipping_in_cents: number; total_in_cents: number
        coupon_code: string | null; payment_method: string
      }>(sql`SELECT * FROM orders WHERE id = ${orderId} LIMIT 1`)

      const fullItems = db.all<{
        product_name: string; brand_name: string; variant_size: string
        variant_color: string | null; image_url: string | null
        qty: number; unit_in_cents: number; total_in_cents: number
      }>(sql`SELECT * FROM order_items WHERE order_id = ${orderId}`)

      if (fullOrder[0]) {
        const o = fullOrder[0]
        void sendPaymentConfirmedEmail(o.customer_email, {
          orderNumber:    o.order_number,
          customerName:   o.customer_name,
          paidAt:         new Date().toISOString(),
          items:          fullItems.map(i => ({
            productName:  i.product_name,
            brandName:    i.brand_name,
            variantSize:  i.variant_size,
            variantColor: i.variant_color,
            imageUrl:     i.image_url,
            qty:          i.qty,
            unitInCents:  i.unit_in_cents,
            totalInCents: i.total_in_cents,
          })),
          totals: {
            subtotalInCents: o.subtotal_in_cents,
            discountInCents: o.discount_in_cents,
            shippingInCents: o.shipping_in_cents,
            totalInCents:    o.total_in_cents,
            couponCode:      o.coupon_code,
            paymentMethod:   o.payment_method as 'pix' | 'credit_card' | 'boleto',
          },
          deliveryMethod: o.delivery_method,
          estimatedDays:  o.estimated_days,
        }).catch(e => console.error('[email] payment-confirmed:', e))
      }

    } else if (newStatus === 'cancelled' || newStatus === 'refunded') {
      db.run(sql`
        UPDATE orders
        SET status = ${newStatus}, updated_at = datetime('now')
        WHERE id = ${orderId}
      `)

      // Liberar reserva de estoque
      const items = db.all<{ variant_id: string; qty: number }>(sql`
        SELECT variant_id, qty FROM order_items WHERE order_id = ${orderId}
      `)
      for (const item of items) {
        db.run(sql`
          UPDATE product_variants
          SET stock_reserved = MAX(0, stock_reserved - ${item.qty})
          WHERE id = ${item.variant_id}
        `)
      }

      db.run(sql`
        INSERT INTO order_events (id, order_id, type, created_by, created_at)
        VALUES (${crypto.randomUUID()}, ${orderId}, ${newStatus as 'cancelled' | 'refunded'}, 'system', datetime('now'))
      `)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MP Webhook]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
