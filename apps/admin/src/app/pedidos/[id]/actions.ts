'use server'

import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { sendOrderShippedEmail } from '@/lib/email'
import { waSendOrderShipped, waSendOrderDelivered } from '@/lib/whatsapp'

export type UpdateOrderPayload = {
  orderId:      string
  status:       string
  trackingCode?: string
}

export async function updateOrderStatus({ orderId, status, trackingCode }: UpdateOrderPayload) {
  const now = new Date().toISOString()

  if (status === 'shipped') {
    if (!trackingCode?.trim()) return { success: false, error: 'Código de rastreio obrigatório para status Enviado.' }

    await db.run(sql`
      UPDATE orders SET
        status = 'shipped',
        tracking_code = ${trackingCode.trim().toUpperCase()},
        shipped_at = ${now},
        updated_at = ${now}
      WHERE id = ${orderId}
    `)

    // Buscar dados para e-mail
    const orders = await db.all<{
      order_number: string; customer_name: string; customer_email: string; customer_phone: string | null
      delivery_method: string; estimated_days: number | null
      ship_street: string; ship_number: string; ship_complement: string | null
      ship_district: string; ship_city: string; ship_state: string; ship_cep: string
    }>(sql`SELECT order_number, customer_name, customer_email, customer_phone, delivery_method, estimated_days,
      ship_street, ship_number, ship_complement, ship_district, ship_city, ship_state, ship_cep
      FROM orders WHERE id = ${orderId} LIMIT 1`)
    const items = await db.all<{
      product_name: string; brand_name: string; variant_size: string
      variant_color: string | null; image_url: string | null
      qty: number; unit_in_cents: number; total_in_cents: number
    }>(sql`SELECT product_name, brand_name, variant_size, variant_color, image_url, qty, unit_in_cents, total_in_cents FROM order_items WHERE order_id = ${orderId}`)

    const o = orders[0]
    if (o) {
      void sendOrderShippedEmail(o.customer_email, {
        orderNumber:    o.order_number,
        customerName:   o.customer_name,
        shippedAt:      now,
        trackingCode:   trackingCode.trim().toUpperCase(),
        deliveryMethod: o.delivery_method,
        estimatedDays:  o.estimated_days,
        items: items.map(i => ({
          productName:  i.product_name,
          brandName:    i.brand_name,
          variantSize:  i.variant_size,
          variantColor: i.variant_color,
          imageUrl:     i.image_url,
          qty:          i.qty,
          unitInCents:  i.unit_in_cents,
          totalInCents: i.total_in_cents,
        })),
        address: {
          street: o.ship_street, number: o.ship_number, complement: o.ship_complement,
          district: o.ship_district, city: o.ship_city, state: o.ship_state, cep: o.ship_cep,
        },
      }).catch(e => console.error('[email] order-shipped:', e))

      const carrier = o.delivery_method === 'sedex' ? 'SEDEX' : o.delivery_method === 'pac' ? 'PAC' : 'Correios'
      void waSendOrderShipped(o.customer_phone ?? null, o.order_number, trackingCode.trim().toUpperCase(), carrier)
        .catch(e => console.error('[whatsapp] order-shipped:', e))
    }

  } else if (status === 'delivered') {
    await db.run(sql`
      UPDATE orders SET status = 'delivered', delivered_at = ${now}, updated_at = ${now}
      WHERE id = ${orderId}
    `)

    const deliveredOrders = await db.all<{ order_number: string; customer_name: string; customer_phone: string | null }>(sql`
      SELECT order_number, customer_name, customer_phone FROM orders WHERE id = ${orderId} LIMIT 1
    `)
    const d = deliveredOrders[0]
    if (d) {
      void waSendOrderDelivered(d.customer_phone ?? null, d.order_number, d.customer_name)
        .catch(e => console.error('[whatsapp] order-delivered:', e))
    }

  } else {
    await db.run(sql`
      UPDATE orders SET status = ${status}, updated_at = ${now}
      WHERE id = ${orderId}
    `)
  }

  await db.run(sql`
    INSERT INTO order_events (id, order_id, type, created_by, created_at)
    VALUES (${crypto.randomUUID()}, ${orderId}, ${status as 'paid'|'processing'|'shipped'|'delivered'|'cancelled'|'refunded'}, 'admin', ${now})
  `)

  revalidatePath(`/admin/pedidos/${orderId}`)
  revalidatePath('/admin/pedidos')
  revalidatePath('/admin')
  return { success: true }
}
