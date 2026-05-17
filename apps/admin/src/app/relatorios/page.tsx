import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import { RevenueAreaChart, OrdersBarChart, PaymentPieChart, TopProductsChart } from './charts'
import Link from 'next/link'

type Period = '7d' | '30d' | '90d'
type PageProps = { searchParams: Promise<{ period?: string }> }

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 14, margin: '0 0 20px', color: '#F8F9FB' }}>{title}</h3>
      {children}
    </div>
  )
}

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const period: Period = (sp.period as Period) ?? '30d'
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const since = new Date(Date.now() - days * 86400000).toISOString()

  // ── KPIs ──
  const [revenue]  = db.all<{ total: number; count: number }>(sql`
    SELECT COALESCE(SUM(total_in_cents),0) total, COUNT(*) count
    FROM orders WHERE status IN ('paid','processing','shipped','delivered') AND created_at >= ${since}
  `)
  const [cancelled] = db.all<{ count: number }>(sql`SELECT COUNT(*) count FROM orders WHERE status='cancelled' AND created_at >= ${since}`)
  const [avgTicket] = db.all<{ avg: number }>(sql`SELECT COALESCE(AVG(total_in_cents),0) avg FROM orders WHERE status IN ('paid','processing','shipped','delivered') AND created_at >= ${since}`)
  const [newCustomers] = db.all<{ count: number }>(sql`SELECT COUNT(*) count FROM users WHERE created_at >= ${since}`)

  // ── Receita por dia ──
  const dailyData = db.all<{ day: string; total: number; orders: number }>(sql`
    SELECT DATE(created_at) day,
           COALESCE(SUM(CASE WHEN status IN ('paid','processing','shipped','delivered') THEN total_in_cents ELSE 0 END),0) total,
           COUNT(CASE WHEN status IN ('paid','processing','shipped','delivered') THEN 1 END) orders
    FROM orders WHERE created_at >= ${since}
    GROUP BY DATE(created_at) ORDER BY day
  `).map(r => ({ label: new Date(r.day).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }), total: r.total, orders: r.orders }))

  // ── Pedidos por dia (total + cancelados) ──
  const ordersData = db.all<{ day: string; orders: number; cancelled: number }>(sql`
    SELECT DATE(created_at) day,
           COUNT(*) orders,
           COUNT(CASE WHEN status='cancelled' THEN 1 END) cancelled
    FROM orders WHERE created_at >= ${since}
    GROUP BY DATE(created_at) ORDER BY day
  `).map(r => ({ label: new Date(r.day).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }), orders: r.orders, cancelled: r.cancelled }))

  // ── Mix de pagamento ──
  const payData = db.all<{ method: string; count: number }>(sql`
    SELECT payment_method method, COUNT(*) count
    FROM orders WHERE status IN ('paid','processing','shipped','delivered') AND created_at >= ${since}
    GROUP BY payment_method
  `)
  const payTotal = payData.reduce((s, r) => s + r.count, 0) || 1
  const payColors: Record<string, string> = { pix: '#2CB35A', credit_card: '#3B82F6', boleto: '#F59E0B' }
  const payLabels: Record<string, string> = { pix: 'PIX', credit_card: 'Cartão', boleto: 'Boleto' }
  const pieData = payData.map(r => ({
    name: payLabels[r.method] ?? r.method,
    value: Math.round((r.count / payTotal) * 100),
    color: payColors[r.method] ?? '#6B7280',
  }))

  // ── Top produtos ──
  const topProducts = db.all<{ name: string; total: number }>(sql`
    SELECT oi.product_name name, SUM(oi.total_in_cents) total
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status IN ('paid','processing','shipped','delivered') AND o.created_at >= ${since}
    GROUP BY oi.product_name
    ORDER BY total DESC LIMIT 8
  `)

  // ── Status breakdown ──
  const statusBreak = db.all<{ status: string; count: number; total: number }>(sql`
    SELECT status, COUNT(*) count, COALESCE(SUM(total_in_cents),0) total
    FROM orders WHERE created_at >= ${since}
    GROUP BY status ORDER BY count DESC
  `)

  const statusColor: Record<string, string> = {
    pending_payment: '#F59E0B', paid: '#2CB35A', processing: '#3B82F6',
    shipped: '#1FB5A8', delivered: '#2CB35A', cancelled: '#E23B3B', refunded: '#E23B3B',
  }
  const statusLabel: Record<string, string> = {
    pending_payment: 'Aguardando', paid: 'Pago', processing: 'Processando',
    shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
  }

  const periods: { value: Period; label: string }[] = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 24, margin: '0 0 4px' }}>Relatórios</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Análise de performance do negócio</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {periods.map(p => (
            <Link key={p.value} href={`/relatorios?period=${p.value}`} style={{
              padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif', textDecoration: 'none',
              background: period === p.value ? '#F26B1F' : '#1E2530',
              color: period === p.value ? '#fff' : '#9CA3AF',
            }}>
              {p.label}
            </Link>
          ))}
          <Link href={`/relatorios/export?period=${period}`} style={{
            padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif', textDecoration: 'none',
            background: 'rgba(31,181,168,.15)', color: '#1FB5A8', border: '1px solid rgba(31,181,168,.3)',
          }}>
            ↓ CSV
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Receita',       value: fmt(revenue?.total ?? 0),  color: '#F26B1F', sub: `${revenue?.count ?? 0} pedidos` },
          { label: 'Ticket médio',  value: fmt(avgTicket?.avg ?? 0),  color: '#1FB5A8', sub: 'pedidos confirmados' },
          { label: 'Cancelamentos', value: String(cancelled?.count ?? 0), color: '#E23B3B', sub: 'no período' },
          { label: 'Novos clientes',value: String(newCustomers?.count ?? 0), color: '#2CB35A', sub: 'cadastros' },
        ].map(k => (
          <div key={k.label} style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: '18px 20px' }}>
            <p style={{ fontSize: 11, color: '#4A5462', letterSpacing: '.08em', textTransform: 'uppercase', margin: '0 0 8px', fontFamily: 'Space Grotesk, sans-serif' }}>{k.label}</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: k.color, margin: '0 0 4px', fontFamily: 'Archivo Black, sans-serif' }}>{k.value}</p>
            <p style={{ fontSize: 11, color: '#6B7280', margin: 0, fontFamily: 'Space Grotesk, sans-serif' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Gráficos principais */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card title="Receita diária">
          <RevenueAreaChart data={dailyData} />
        </Card>
        <Card title="Pedidos por dia">
          <OrdersBarChart data={ordersData} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 16 }}>
        <Card title="Mix de pagamento">
          {pieData.length > 0
            ? <PaymentPieChart data={pieData} />
            : <p style={{ color: '#4A5462', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Sem dados</p>
          }
        </Card>
        <Card title="Top produtos — receita">
          {topProducts.length > 0
            ? <TopProductsChart data={topProducts} />
            : <p style={{ color: '#4A5462', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Sem dados</p>
          }
        </Card>
      </div>

      {/* Breakdown por status */}
      <Card title="Breakdown por status">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2530' }}>
              {['Status', 'Pedidos', 'Receita', '% do total'].map(h => (
                <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, color: '#4A5462', letterSpacing: '.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statusBreak.map(row => {
              const pct = revenue?.total ? Math.round((row.total / revenue.total) * 100) : 0
              return (
                <tr key={row.status} style={{ borderBottom: '1px solid #141922' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: `${statusColor[row.status]}22`, color: statusColor[row.status] ?? '#9CA3AF' }}>
                      {statusLabel[row.status] ?? row.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>{row.count}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{fmt(row.total)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: '#1E2530', borderRadius: 2, maxWidth: 120 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#F26B1F', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#9CA3AF', minWidth: 28 }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
