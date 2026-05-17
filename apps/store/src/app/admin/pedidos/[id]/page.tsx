import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import { OrderActions } from './order-actions'

type PageProps = { params: Promise<{ id: string }> }

const statusColor: Record<string, string> = {
  pending_payment: '#F59E0B', paid: '#2CB35A', processing: '#3B82F6',
  shipped: '#1FB5A8', delivered: '#2CB35A', cancelled: '#E23B3B', refunded: '#E23B3B',
}
const statusLabel: Record<string, string> = {
  pending_payment: 'Aguardando Pagamento', paid: 'Pago', processing: 'Em Processamento',
  shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 24, marginBottom: 16 }}>
      <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 15, margin: '0 0 16px', color: '#F8F9FB' }}>{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 8, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', width: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#F8F9FB' }}>{value ?? '—'}</span>
    </div>
  )
}

export default async function AdminOrderDetail({ params }: PageProps) {
  const { id } = await params

  const orders = db.all<{
    id: string; order_number: string; status: string; created_at: string; updated_at: string
    customer_name: string; customer_email: string; customer_phone: string | null; customer_cpf: string | null
    ship_street: string; ship_number: string; ship_complement: string | null
    ship_district: string; ship_city: string; ship_state: string; ship_cep: string
    delivery_method: string; shipping_in_cents: number; estimated_days: number | null
    tracking_code: string | null; shipped_at: string | null; delivered_at: string | null
    payment_method: string; payment_id: string | null
    pix_key: string | null; boleto_url: string | null
    subtotal_in_cents: number; discount_in_cents: number; total_in_cents: number
    coupon_code: string | null; paid_at: string | null
    nfe_url: string | null; notes: string | null
  }>(sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`)

  const order = orders[0]
  if (!order) notFound()

  const items = db.all<{
    product_name: string; brand_name: string; variant_size: string
    variant_color: string | null; qty: number; unit_in_cents: number; total_in_cents: number
  }>(sql`SELECT product_name, brand_name, variant_size, variant_color, qty, unit_in_cents, total_in_cents FROM order_items WHERE order_id = ${id}`)

  const events = db.all<{ type: string; created_by: string; created_at: string }>(
    sql`SELECT type, created_by, created_at FROM order_events WHERE order_id = ${id} ORDER BY created_at ASC`
  )

  const pixDisc    = order.payment_method === 'pix' ? Math.round(order.subtotal_in_cents * 0.05) : 0
  const couponDisc = order.discount_in_cents - pixDisc

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Link href="/admin/pedidos" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Pedidos</Link>
          <h1 style={{ fontSize: 22, margin: '8px 0 4px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 900 }}>
            {order.order_number}
          </h1>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
            background: `${statusColor[order.status]}22`, color: statusColor[order.status] ?? '#9CA3AF',
          }}>
            {statusLabel[order.status] ?? order.status}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 28, fontWeight: 900, color: '#F26B1F', margin: 0, fontFamily: 'Archivo Black, sans-serif' }}>
            {fmt(order.total_in_cents)}
          </p>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>
            {new Date(order.created_at).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div>
          {/* Acções */}
          <OrderActions orderId={order.id} currentStatus={order.status} currentTracking={order.tracking_code} />

          {/* Itens */}
          <Section title="Itens do Pedido">
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < items.length - 1 ? '1px solid #1E2530' : 'none' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{item.product_name}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>
                    {item.brand_name} · Tam. {item.variant_size}{item.variant_color ? ` · ${item.variant_color}` : ''} · Qty {item.qty}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{fmt(item.total_in_cents)}</p>
                  {item.qty > 1 && <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>{fmt(item.unit_in_cents)} cada</p>}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #1E2530', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9CA3AF' }}>
                <span>Subtotal</span><span>{fmt(order.subtotal_in_cents)}</span>
              </div>
              {couponDisc > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#2CB35A' }}>
                  <span>Cupom{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                  <span>−{fmt(couponDisc)}</span>
                </div>
              )}
              {pixDisc > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#2CB35A' }}>
                  <span>PIX 5%</span><span>−{fmt(pixDisc)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9CA3AF' }}>
                <span>Frete ({order.delivery_method.toUpperCase()})</span><span>{fmt(order.shipping_in_cents)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, paddingTop: 8, borderTop: '1px solid #1E2530', color: '#F26B1F' }}>
                <span>TOTAL</span><span>{fmt(order.total_in_cents)}</span>
              </div>
            </div>
          </Section>

          {/* Timeline */}
          <Section title="Timeline">
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F26B1F', marginTop: 4, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{statusLabel[ev.type] ?? ev.type}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>
                    {new Date(ev.created_at).toLocaleString('pt-BR')} · por {ev.created_by}
                  </p>
                </div>
              </div>
            ))}
          </Section>
        </div>

        <div>
          {/* Cliente */}
          <Section title="Cliente">
            <InfoRow label="Nome"   value={order.customer_name} />
            <InfoRow label="E-mail" value={order.customer_email} />
            <InfoRow label="Tel."   value={order.customer_phone} />
            <InfoRow label="CPF"    value={order.customer_cpf} />
          </Section>

          {/* Entrega */}
          <Section title="Entrega">
            <InfoRow label="Modalidade"  value={`${order.delivery_method.toUpperCase()}${order.estimated_days ? ` · ${order.estimated_days}d` : ''}`} />
            <InfoRow label="Rastreio"    value={order.tracking_code} />
            <InfoRow label="Despachado"  value={order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('pt-BR') : null} />
            <InfoRow label="Entregue"    value={order.delivered_at ? new Date(order.delivered_at).toLocaleDateString('pt-BR') : null} />
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#141922', borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}>
              {order.ship_street}, {order.ship_number}{order.ship_complement ? ` — ${order.ship_complement}` : ''}<br />
              {order.ship_district} · {order.ship_city}/{order.ship_state}<br />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6B7280' }}>CEP {order.ship_cep}</span>
            </div>
          </Section>

          {/* Pagamento */}
          <Section title="Pagamento">
            <InfoRow label="Método"      value={order.payment_method === 'credit_card' ? 'Cartão de Crédito' : order.payment_method.toUpperCase()} />
            <InfoRow label="ID MP"       value={order.payment_id} />
            <InfoRow label="Pago em"     value={order.paid_at ? new Date(order.paid_at).toLocaleString('pt-BR') : null} />
            {order.boleto_url && (
              <a href={order.boleto_url} target="_blank" rel="noreferrer"
                style={{ display: 'block', marginTop: 8, fontSize: 12, color: '#F26B1F' }}>
                Ver boleto →
              </a>
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}
