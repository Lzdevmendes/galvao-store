import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

function Stat({ label, value, sub, color = '#F8F9FB', href, icon }: {
  label: string; value: string; sub?: string; color?: string; href?: string; icon: string
}) {
  const inner = (
    <div className={href ? 'stat-card stat-card--link' : 'stat-card'} style={{
      background: '#0F1318',
      border: '1px solid #1E2530',
      borderRadius: 14,
      padding: '20px 22px',
      cursor: href ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color .2s, transform .2s',
    }}>
      {/* Glow de fundo */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color, opacity: 0.06, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Topo: label + ícone */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: '#4A5462', letterSpacing: '.1em', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>
          {label}
        </p>
        <span style={{
          fontSize: 16, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, background: `${color}18`,
        }}>
          {icon}
        </span>
      </div>

      {/* Valor */}
      <p style={{ fontSize: 30, fontWeight: 900, color, margin: 0, fontFamily: 'Archivo Black, sans-serif', lineHeight: 1 }}>
        {value}
      </p>

      {/* Sub */}
      {sub && (
        <p style={{ fontSize: 12, color: '#6B7280', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          {sub}
        </p>
      )}

      {/* Barra de cor na base */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 2, background: `linear-gradient(90deg, ${color}88, transparent)`,
      }} />
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}

export default async function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0]

  const [totalOrders] = db.all<{ n: number }>(sql`SELECT COUNT(*) n FROM orders`)
  const [pendingOrders] = db.all<{ n: number }>(sql`SELECT COUNT(*) n FROM orders WHERE status = 'pending_payment'`)
  const [processingOrders] = db.all<{ n: number }>(sql`SELECT COUNT(*) n FROM orders WHERE status IN ('paid','processing')`)
  const [shippedOrders] = db.all<{ n: number }>(sql`SELECT COUNT(*) n FROM orders WHERE status = 'shipped'`)
  const [todayOrders] = db.all<{ n: number; total: number }>(sql`
    SELECT COUNT(*) n, COALESCE(SUM(total_in_cents),0) total FROM orders WHERE DATE(created_at) = ${today}
  `)
  const [totalRevenue] = db.all<{ total: number }>(sql`
    SELECT COALESCE(SUM(total_in_cents),0) total FROM orders WHERE status IN ('paid','processing','shipped','delivered')
  `)
  const [totalCustomers] = db.all<{ n: number }>(sql`SELECT COUNT(*) n FROM users`)
  const [lowStock] = db.all<{ n: number }>(sql`
    SELECT COUNT(*) n FROM product_variants WHERE stock - stock_reserved <= 2
  `)

  const recentOrders = db.all<{
    id: string; order_number: string; customer_name: string
    status: string; total_in_cents: number; created_at: string; payment_method: string
  }>(sql`
    SELECT id, order_number, customer_name, status, total_in_cents, created_at, payment_method
    FROM orders ORDER BY created_at DESC LIMIT 8
  `)

  const statusColor: Record<string, string> = {
    pending_payment: '#F59E0B', paid: '#2CB35A', processing: '#3B82F6',
    shipped: '#1FB5A8', delivered: '#2CB35A', cancelled: '#E23B3B', refunded: '#E23B3B',
  }
  const statusLabel: Record<string, string> = {
    pending_payment: 'Aguardando', paid: 'Pago', processing: 'Processando',
    shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 24, margin: '0 0 8px' }}>Dashboard</h1>
      <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 32px' }}>
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      </p>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <Stat label="Pedidos hoje" value={String(todayOrders?.n ?? 0)}
          sub={todayOrders?.total ? `↑ ${fmt(todayOrders.total)}` : 'Nenhum ainda'}
          color="#F26B1F" href="/pedidos" icon="🛒" />
        <Stat label="Receita confirmada" value={fmt(totalRevenue?.total ?? 0)}
          sub="Pedidos pagos + enviados" color="#2CB35A" icon="💰" />
        <Stat label="Aguardando pagamento" value={String(pendingOrders?.n ?? 0)}
          sub={pendingOrders?.n ? 'Pendentes de confirmação' : 'Nenhum pendente'}
          color="#F59E0B" href="/pedidos" icon="⏳" />
        <Stat label="Para despachar" value={String(processingOrders?.n ?? 0)}
          sub={processingOrders?.n ? 'Prontos para envio' : 'Em dia!'}
          color="#3B82F6" href="/pedidos" icon="📦" />
        <Stat label="Enviados" value={String(shippedOrders?.n ?? 0)}
          sub="Em trânsito" color="#1FB5A8" href="/pedidos" icon="🚚" />
        <Stat label="Total pedidos" value={String(totalOrders?.n ?? 0)}
          sub="Desde o início" href="/pedidos" icon="📋" />
        <Stat label="Clientes" value={String(totalCustomers?.n ?? 0)}
          sub="Contas criadas" href="/clientes" icon="👥" />
        <Stat label="Stock crítico (≤2)" value={String(lowStock?.n ?? 0)}
          sub={lowStock?.n ? 'Atenção necessária' : 'Tudo OK!'}
          color={lowStock?.n && lowStock.n > 0 ? '#E23B3B' : '#2CB35A'}
          href="/estoque" icon={lowStock?.n && lowStock.n > 0 ? '⚠️' : '✅'} />
      </div>

      {/* Pedidos recentes */}
      <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1E2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 15, margin: 0 }}>Pedidos recentes</h2>
          <Link href="/pedidos" style={{ fontSize: 13, color: '#F26B1F', textDecoration: 'none' }}>Ver todos →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2530' }}>
              {['Pedido', 'Cliente', 'Pagamento', 'Total', 'Status', 'Data', ''].map(h => (
                <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, color: '#4A5462', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #1a2030' }}>
                <td style={{ padding: '12px 24px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#F26B1F' }}>{o.order_number}</td>
                <td style={{ padding: '12px 24px', fontSize: 13 }}>{o.customer_name.split(' ')[0]} {o.customer_name.split(' ').slice(-1)[0]}</td>
                <td style={{ padding: '12px 24px', fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase' }}>{o.payment_method === 'credit_card' ? 'Cartão' : o.payment_method.toUpperCase()}</td>
                <td style={{ padding: '12px 24px', fontSize: 13, fontWeight: 700 }}>{fmt(o.total_in_cents)}</td>
                <td style={{ padding: '12px 24px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: `${statusColor[o.status]}22`, color: statusColor[o.status] ?? '#9CA3AF',
                  }}>
                    {statusLabel[o.status] ?? o.status}
                  </span>
                </td>
                <td style={{ padding: '12px 24px', fontSize: 12, color: '#6B7280' }}>
                  {new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <Link href={`/pedidos/${o.id}`} style={{ fontSize: 12, color: '#F26B1F', textDecoration: 'none' }}>Ver →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
