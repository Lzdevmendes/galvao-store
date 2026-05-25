import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'

type OrderRow = {
  id: string; order_number: string; status: string
  customer_name: string; customer_email: string
  ship_street: string; ship_number: string; ship_complement: string | null
  ship_district: string; ship_city: string; ship_state: string; ship_cep: string
  delivery_method: string; shipping_in_cents: number; estimated_days: number | null
  tracking_code: string | null
  payment_method: string; subtotal_in_cents: number
  discount_in_cents: number; total_in_cents: number; coupon_code: string | null
  pix_key: string | null; boleto_url: string | null; boleto_bar_code: string | null
  paid_at: string | null; created_at: string; updated_at: string
}

type ItemRow = {
  product_name: string; brand_name: string; variant_size: string
  variant_color: string | null; image_url: string | null
  qty: number; unit_in_cents: number; total_in_cents: number
}

type EventRow = { type: string; created_at: string }

const STATUS_STEPS = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered']

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Aguardando pagamento',
  paid:            'Pagamento confirmado',
  processing:      'Em preparação',
  shipped:         'Enviado',
  delivered:       'Entregue',
  cancelled:       'Cancelado',
  refunded:        'Reembolsado',
}

const DELIVERY_LABEL: Record<string, string> = {
  sedex: 'SEDEX', pac: 'PAC', local_delivery: 'Entrega Local Galvão',
}

const PAY_LABEL: Record<string, string> = {
  pix: 'PIX', credit_card: 'Cartão de Crédito', boleto: 'Boleto Bancário',
}

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const rows = await db.all<OrderRow>(sql`
    SELECT * FROM orders
    WHERE id = ${id}
      AND (user_id = ${user.id} OR customer_email = ${user.email})
    LIMIT 1
  `)
  const order = rows[0]
  if (!order) notFound()

  const items = await db.all<ItemRow>(sql`
    SELECT product_name, brand_name, variant_size, variant_color, image_url, qty, unit_in_cents, total_in_cents
    FROM order_items WHERE order_id = ${id}
  `)

  const events = await db.all<EventRow>(sql`
    SELECT type, created_at FROM order_events WHERE order_id = ${id} ORDER BY created_at ASC
  `)

  const currentStepIdx = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/conta/pedidos" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', textDecoration: 'none' }}>
          ← Meus Pedidos
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '.04em', margin: 0 }}>
            {order.order_number}
          </h1>
          <span style={{
            padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-ui)',
            background: isCancelled ? '#FEE2E2' : currentStepIdx === 4 ? '#D1FAE5' : '#DBEAFE',
            color: isCancelled ? '#991B1B' : currentStepIdx === 4 ? '#065F46' : '#1E40AF',
          }}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', marginTop: 6 }}>
          Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="rg-sidebar-sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Timeline / Tracker */}
          {!isCancelled && (
            <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, marginBottom: 24 }}>ACOMPANHAMENTO</p>
              <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                {/* Linha de fundo */}
                <div style={{ position: 'absolute', top: 14, left: 14, right: 14, height: 2, background: 'var(--border)', zIndex: 0 }} />
                {/* Linha preenchida */}
                <div style={{
                  position: 'absolute', top: 14, left: 14, height: 2, zIndex: 1,
                  background: 'var(--brand-green)',
                  width: currentStepIdx >= 0 ? `${(currentStepIdx / (STATUS_STEPS.length - 1)) * (100 - 14)}%` : '0%',
                  transition: 'width .5s',
                }} />
                {STATUS_STEPS.map((step, i) => {
                  const done    = i < currentStepIdx
                  const current = i === currentStepIdx
                  return (
                    <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-ui)',
                        background: done ? 'var(--brand-green)' : current ? 'var(--brand-orange)' : 'var(--bg-sunk)',
                        color: done || current ? '#fff' : 'var(--fg-faint)',
                        border: current ? '3px solid rgba(242,107,31,.3)' : 'none',
                      }}>
                        {done ? '✓' : i + 1}
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: current ? 700 : 400, textAlign: 'center',
                        color: done ? 'var(--brand-green)' : current ? 'var(--fg)' : 'var(--fg-faint)',
                        marginTop: 6, lineHeight: 1.3,
                      }}>
                        {STATUS_LABELS[step]}
                      </p>
                    </div>
                  )
                })}
              </div>

              {order.tracking_code && (
                <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(34,197,94,.08)', borderRadius: 10 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: '0 0 4px' }}>Código de rastreio</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--brand-green)', margin: 0 }}>{order.tracking_code}</p>
                </div>
              )}
            </div>
          )}

          {/* Itens */}
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, marginBottom: 20 }}>ITENS DO PEDIDO</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 60, height: 60, background: 'var(--bg-sunk)', borderRadius: 10, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image_url
                      ? <Image src={item.image_url} alt={item.product_name} width={54} height={54} style={{ objectFit: 'contain', mixBlendMode: 'multiply', width: '85%', height: '85%' }} />
                      : <span style={{ fontSize: 24 }}>👟</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, margin: '0 0 2px', color: 'var(--fg)' }}>{item.product_name}</p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: 0 }}>
                      {item.brand_name} · Tam. {item.variant_size}
                      {item.variant_color ? ` · ${item.variant_color}` : ''}
                      {' · Qty '}{item.qty}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{fmt(item.total_in_cents)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entrega */}
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, marginBottom: 16 }}>ENTREGA</p>
            <div className="rg-delivery">
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Endereço</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  {order.ship_street}, {order.ship_number}{order.ship_complement ? `, ${order.ship_complement}` : ''}<br />
                  {order.ship_district}<br />
                  {order.ship_city} — {order.ship_state}<br />
                  CEP {order.ship_cep}
                </p>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Modalidade</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, margin: '0 0 4px' }}>{DELIVERY_LABEL[order.delivery_method] ?? order.delivery_method}</p>
                {order.estimated_days && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: 0 }}>Prazo: {order.estimated_days} dia(s) útil(eis)</p>}
              </div>
            </div>
          </div>

          {/* Timeline de eventos */}
          {events.length > 0 && (
            <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, marginBottom: 20 }}>HISTÓRICO</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-orange)', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, margin: 0 }}>{STATUS_LABELS[ev.type] ?? ev.type}</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', margin: '2px 0 0' }}>
                        {new Date(ev.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — Resumo */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, marginBottom: 20 }}>RESUMO FINANCEIRO</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SRow label="Subtotal" value={fmt(order.subtotal_in_cents)} />
              {order.discount_in_cents > 0 && <SRow label="Desconto" value={`-${fmt(order.discount_in_cents)}`} green />}
              {order.shipping_in_cents > 0 ? <SRow label="Frete" value={fmt(order.shipping_in_cents)} /> : <SRow label="Frete" value="Grátis" green />}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                <SRow label="TOTAL" value={fmt(order.total_in_cents)} large />
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: '4px 0 0' }}>
                Pago via {PAY_LABEL[order.payment_method] ?? order.payment_method}
              </p>
              {order.coupon_code && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--brand-green)', margin: 0 }}>Cupom: {order.coupon_code}</p>}
            </div>

            {order.pix_key && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34,197,94,.08)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', margin: '0 0 6px' }}>Chave PIX (copia e cola)</p>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg)', wordBreak: 'break-all' }}>{order.pix_key.slice(0, 60)}...</code>
              </div>
            )}

            {order.boleto_url && (
              <a href={order.boleto_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '12px', borderRadius: 10, background: 'var(--brand-orange)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14 }}>
                Abrir Boleto PDF
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SRow({ label, value, green, large }: { label: string; value: string; green?: boolean; large?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: large ? 14 : 13, fontWeight: large ? 700 : 400, color: large ? 'var(--fg)' : 'var(--fg-muted)' }}>{label}</span>
      <span style={{ fontFamily: large ? 'var(--font-display)' : 'var(--font-ui)', fontSize: large ? 20 : 13, fontWeight: large ? 900 : 600, color: green ? 'var(--brand-green)' : large ? 'var(--brand-orange)' : 'var(--fg)' }}>{value}</span>
    </div>
  )
}
