import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ReviewForm } from './review-form'

export default async function AvaliarPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const orders = await db.all<{ id: string; order_number: string; customer_email: string; status: string }>(sql`
    SELECT id, order_number, customer_email, status FROM orders WHERE id = ${orderId} LIMIT 1
  `)
  const order = orders[0]
  if (!order || order.customer_email !== user.email) redirect('/conta/pedidos')
  if (order.status !== 'delivered') redirect('/conta/pedidos')

  const items = await db.all<{ product_id: string; product_name: string; brand_name: string; image_url: string | null }>(sql`
    SELECT variant_id, product_name, brand_name, image_url,
      (SELECT p.id FROM products p JOIN product_variants pv ON pv.product_id = p.id WHERE pv.id = oi.variant_id LIMIT 1) product_id
    FROM order_items oi WHERE order_id = ${orderId}
  `)

  const reviewedRows = await db.all<{ product_id: string }>(sql`
    SELECT product_id FROM reviews WHERE order_id = ${orderId} AND customer_id = ${user.id}
  `)
  const alreadyReviewed = reviewedRows.map(r => r.product_id)

  const pending = items.filter(i => i.product_id && !alreadyReviewed.includes(i.product_id))

  if (pending.length === 0) redirect('/conta/pedidos?avaliado=1')

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-3xl tracking-wide" style={{ fontFamily: 'var(--font-stencil)' }}>Avaliar pedido</h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--fg-muted)' }}>Pedido {order.order_number} · Sua avaliação ajuda outros clientes</p>
      <ReviewForm orderId={orderId} items={pending} />
    </div>
  )
}
