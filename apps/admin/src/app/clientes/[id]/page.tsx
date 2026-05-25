import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'

type PageProps = { params: Promise<{ id: string }> }

const statusColor: Record<string, string> = {
  pending_payment: '#F59E0B', paid: '#2CB35A', processing: '#3B82F6',
  shipped: '#1FB5A8', delivered: '#2CB35A', cancelled: '#E23B3B', refunded: '#E23B3B',
}
const statusLabel: Record<string, string> = {
  pending_payment: 'Aguardando', paid: 'Pago', processing: 'Em prep.',
  shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
}

function StatCard({ label, value, color = '#F8F9FB' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#141922', border: '1px solid #1E2530', borderRadius: 10, padding: '16px 20px' }}>
      <p style={{ fontSize: 11, color: '#4A5462', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 6px', fontFamily: 'Space Grotesk, sans-serif' }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 900, color, margin: 0, fontFamily: 'Archivo Black, sans-serif' }}>{value}</p>
    </div>
  )
}

export default async function ClienteDetailPage({ params }: PageProps) {
  const { id } = await params

  const users = await db.all<{
    id: string; email: string; name: string | null; phone: string | null
    cpf: string | null; created_at: string; is_club_member: number; marketing_opt_in: number
  }>(sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`)
  const user = users[0]
  if (!user) notFound()

  const [stats] = await db.all<{ total_orders: number; confirmed: number; total_spent: number; avg_ticket: number; cancelled: number }>(sql`
    SELECT
      COUNT(*) total_orders,
      COUNT(CASE WHEN status IN ('paid','processing','shipped','delivered') THEN 1 END) confirmed,
      COALESCE(SUM(CASE WHEN status IN ('paid','processing','shipped','delivered') THEN total_in_cents END),0) total_spent,
      COALESCE(AVG(CASE WHEN status IN ('paid','processing','shipped','delivered') THEN total_in_cents END),0) avg_ticket,
      COUNT(CASE WHEN status='cancelled' THEN 1 END) cancelled
    FROM orders WHERE user_id = ${id} OR customer_email = ${user.email}
  `)

  const orders = await db.all<{
    id: string; order_number: string; status: string; total_in_cents: number
    payment_method: string; created_at: string; delivery_method: string
  }>(sql`
    SELECT id, order_number, status, total_in_cents, payment_method, created_at, delivery_method
    FROM orders WHERE user_id = ${id} OR customer_email = ${user.email}
    ORDER BY created_at DESC LIMIT 20
  `)

  const topProducts = await db.all<{ product_name: string; brand_name: string; qty: number; total: number }>(sql`
    SELECT oi.product_name, oi.brand_name, SUM(oi.qty) qty, SUM(oi.total_in_cents) total
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE (o.user_id = ${id} OR o.customer_email = ${user.email})
      AND o.status IN ('paid','processing','shipped','delivered')
    GROUP BY oi.product_name
    ORDER BY total DESC LIMIT 5
  `)

  const payLabel: Record<string, string> = { pix: 'PIX', credit_card: 'Cartão', boleto: 'Boleto' }

  return (
    <div>
      {/* Header */}
      <Link href="/clientes" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Clientes</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '12px 0 28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 22, margin: '0 0 4px' }}>
            {user.name ?? 'Cliente sem nome'}
          </h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>{user.email}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {user.is_club_member ? <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: '#F26B1F22', color: '#F26B1F' }}>⭐ Clube</span> : null}
            {user.marketing_opt_in ? <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: '#1FB5A822', color: '#1FB5A8' }}>📧 Newsletter</span> : null}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#4A5462', margin: '0 0 4px' }}>Cliente desde</p>
          <p style={{ fontSize: 13, fontWeight: 600 }}>{new Date(user.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total gasto" value={fmt(stats?.total_spent ?? 0)} color="#F26B1F" />
        <StatCard label="Ticket médio" value={fmt(stats?.avg_ticket ?? 0)} color="#1FB5A8" />
        <StatCard label="Pedidos" value={String(stats?.total_orders ?? 0)} />
        <StatCard label="Confirmados" value={String(stats?.confirmed ?? 0)} color="#2CB35A" />
        <StatCard label="Cancelados" value={String(stats?.cancelled ?? 0)} color={stats?.cancelled ? '#E23B3B' : '#4A5462'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        {/* Pedidos */}
        <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530' }}>
            <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 14, margin: 0 }}>Histórico de pedidos</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2530' }}>
                {['Pedido', 'Pgto', 'Total', 'Status', 'Data'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, color: '#4A5462', letterSpacing: '.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #141922' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/pedidos/${o.id}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#F26B1F', textDecoration: 'none' }}>{o.order_number}</Link>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#9CA3AF' }}>{payLabel[o.payment_method] ?? o.payment_method}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700 }}>{fmt(o.total_in_cents)}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${statusColor[o.status]}22`, color: statusColor[o.status] ?? '#9CA3AF' }}>
                      {statusLabel[o.status] ?? o.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#6B7280' }}>
                    {new Date(o.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' })}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#4A5462', fontSize: 13 }}>Sem pedidos.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Dados pessoais */}
          <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 14, margin: '0 0 16px' }}>Dados pessoais</h3>
            {[
              { label: 'E-mail',    value: user.email },
              { label: 'Telefone',  value: user.phone },
              { label: 'CPF',       value: user.cpf },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', width: 72, flexShrink: 0 }}>{f.label}</span>
                <span style={{ fontSize: 13 }}>{f.value ?? '—'}</span>
              </div>
            ))}
          </div>

          {/* Top produtos */}
          <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 14, margin: '0 0 16px' }}>Produtos favoritos</h3>
            {topProducts.length === 0 && <p style={{ fontSize: 13, color: '#4A5462' }}>Sem compras ainda.</p>}
            {topProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: i < topProducts.length - 1 ? '1px solid #1E2530' : 'none' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 2px' }}>{p.product_name}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{p.brand_name} · Qty {p.qty}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#F26B1F' }}>{fmt(p.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
