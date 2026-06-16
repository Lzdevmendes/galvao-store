import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'

type OrderRow = {
  id: string; order_number: string; status: string
  total_in_cents: number; payment_method: string
  delivery_method: string; tracking_code: string | null
  created_at: string; item_count: number
  first_image: string | null; first_product: string
}

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  pending_payment: { label: 'Aguard. pagamento', bg: '#FEF3C7', color: '#92400E' },
  paid:            { label: 'Pago',              bg: '#D1FAE5', color: '#065F46' },
  processing:      { label: 'Em processamento',  bg: '#DBEAFE', color: '#1E40AF' },
  shipped:         { label: 'Enviado',            bg: '#EDE9FE', color: '#5B21B6' },
  delivered:       { label: 'Entregue',           bg: '#D1FAE5', color: '#065F46' },
  cancelled:       { label: 'Cancelado',          bg: '#FEE2E2', color: '#991B1B' },
  refunded:        { label: 'Reembolsado',        bg: '#F3F4F6', color: '#374151' },
}

const PAY: Record<string, string> = {
  pix: 'PIX', credit_card: 'Cartão', boleto: 'Boleto',
}

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const orders = await db.all<OrderRow>(sql`
    SELECT o.id, o.order_number, o.status, o.total_in_cents,
           o.payment_method, o.delivery_method, o.tracking_code, o.created_at,
           COUNT(oi.id)    AS item_count,
           MIN(oi.image_url) AS first_image,
           MIN(oi.product_name) AS first_product
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ${user.id} OR o.customer_email = ${user.email}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `)

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <Link href="/conta" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', textDecoration: 'none' }}>
            ← Minha Conta
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '.04em', marginTop: 8, marginBottom: 0 }}>
            MEUS PEDIDOS
          </h1>
        </div>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>
          {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--fg-muted)', marginBottom: 20 }}>
            Você ainda não fez nenhum pedido.
          </p>
          <Link href="/produtos" style={{ display: 'inline-block', padding: '14px 28px', background: 'var(--brand-orange)', color: '#fff', borderRadius: 10, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ver produtos
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const st = STATUS[order.status] ?? STATUS.pending_payment
            const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
            return (
              <Link key={order.id} href={`/conta/pedidos/${order.id}`} style={{ textDecoration: 'none' }}>
                <div className="order-card" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, transition: 'border-color .15s, transform .15s' }}>
                  {/* Thumbnail */}
                  <div style={{ width: 64, height: 64, background: '#fff', borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {order.first_image
                      ? <img src={order.first_image} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                      : <span style={{ fontSize: 28 }}>👟</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{order.order_number}</span>
                      <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-ui)', background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.first_product}{order.item_count > 1 ? ` +${order.item_count - 1} item(s)` : ''}
                    </p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-faint)', margin: '4px 0 0' }}>
                      {date} · {PAY[order.payment_method] ?? order.payment_method}
                      {order.tracking_code && <span style={{ marginLeft: 8, color: 'var(--brand-green)', fontWeight: 600 }}>• Rastreio disponível</span>}
                    </p>
                  </div>

                  {/* Total */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--brand-green)', margin: 0 }}>{fmt(order.total_in_cents)}</p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-faint)', margin: '4px 0 0' }}>Ver detalhes →</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
