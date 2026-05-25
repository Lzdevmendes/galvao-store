import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import Link from 'next/link'
import { SalesDashboardChart, BrandsSharePanel } from './dashboard-charts'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'agora'
  if (mins < 60) return `há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `há ${hrs}h`
  return `há ${Math.floor(hrs / 24)}d`
}

const statusColor: Record<string, string> = {
  pending_payment: '#F59E0B', paid: '#2CB35A', processing: '#3B82F6',
  shipped: '#1FB5A8', delivered: '#2CB35A', cancelled: '#E23B3B', refunded: '#E23B3B',
}
const statusLabel: Record<string, string> = {
  pending_payment: 'Aguardando Pix', paid: 'Pago', processing: 'Processando',
  shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
}

export default async function AdminDashboard() {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const since30   = new Date(Date.now() - 30 * 86400000).toISOString()
  const since60   = new Date(Date.now() - 60 * 86400000).toISOString()

  // ── All queries in parallel ──
  const [
    [todayData], [yesterdayData], [avgTicket], [totalRevenue], [pendingOrders], [lowStockCount],
    daily30, daily60, brandRevenue, recentOrders, criticalStock,
  ] = await Promise.all([
    db.all<{ n: number; total: number }>(sql`SELECT COUNT(*) n, COALESCE(SUM(total_in_cents),0) total FROM orders WHERE DATE(created_at) = ${today}`),
    db.all<{ n: number; total: number }>(sql`SELECT COUNT(*) n, COALESCE(SUM(total_in_cents),0) total FROM orders WHERE DATE(created_at) = ${yesterday}`),
    db.all<{ avg: number }>(sql`SELECT COALESCE(AVG(total_in_cents),0) avg FROM orders WHERE status IN ('paid','processing','shipped','delivered') AND created_at >= ${since30}`),
    db.all<{ total: number }>(sql`SELECT COALESCE(SUM(total_in_cents),0) total FROM orders WHERE status IN ('paid','processing','shipped','delivered')`),
    db.all<{ n: number }>(sql`SELECT COUNT(*) n FROM orders WHERE status = 'pending_payment'`),
    db.all<{ n: number }>(sql`SELECT COUNT(*) n FROM product_variants WHERE stock - stock_reserved <= 3`),
    db.all<{ day: string; total: number; orders: number }>(sql`
      SELECT DATE(created_at) day, COALESCE(SUM(total_in_cents),0) total, COUNT(*) orders
      FROM orders WHERE created_at >= ${since30}
      GROUP BY DATE(created_at) ORDER BY day
    `),
    db.all<{ day: string; total: number; orders: number }>(sql`
      SELECT DATE(created_at) day, COALESCE(SUM(total_in_cents),0) total, COUNT(*) orders
      FROM orders WHERE created_at >= ${since60} AND created_at < ${since30}
      GROUP BY DATE(created_at) ORDER BY day
    `),
    db.all<{ brand_name: string; total: number }>(sql`
      SELECT b.name brand_name, COALESCE(SUM(oi.total_in_cents),0) total
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.name = oi.product_name
      JOIN brands b ON b.id = p.brand_id
      WHERE o.status IN ('paid','processing','shipped','delivered') AND o.created_at >= ${since30}
      GROUP BY b.name ORDER BY total DESC LIMIT 5
    `),
    db.all<{ id: string; order_number: string; customer_name: string; status: string; total_in_cents: number; created_at: string }>(sql`
      SELECT id, order_number, customer_name, status, total_in_cents, created_at
      FROM orders ORDER BY created_at DESC LIMIT 8
    `),
    db.all<{ id: string; product_name: string; brand_name: string; sku: string; size: string; available: number; image_url: string | null }>(sql`
      SELECT pv.id, p.name product_name, b.name brand_name, pv.sku, pv.size,
             (pv.stock - pv.stock_reserved) available,
             (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) image_url
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      JOIN brands b ON b.id = p.brand_id
      WHERE pv.stock - pv.stock_reserved <= 3
      ORDER BY available ASC LIMIT 6
    `),
  ])

  const revenueChange = yesterdayData?.total > 0
    ? Math.round(((todayData?.total ?? 0) - yesterdayData.total) / yesterdayData.total * 100)
    : null

  const ordersChange = yesterdayData?.n > 0
    ? Math.round(((todayData?.n ?? 0) - yesterdayData.n) / yesterdayData.n * 100)
    : null

  const salesData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000)
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    const dayStr = d.toISOString().split('T')[0]
    const atual     = daily30.find(r => r.day === dayStr)?.total ?? 0
    const prevDay   = new Date(d.getTime() - 30 * 86400000).toISOString().split('T')[0]
    const anterior  = daily60.find(r => r.day === prevDay)?.total ?? 0
    return { label, atual, anterior }
  })

  // ── Brands share ──
  const totalBrandRev = brandRevenue.reduce((s, r) => s + r.total, 1)
  const brandColors   = ['#F26B1F', '#1FB5A8', '#3B82F6', '#2CB35A', '#9CA3AF']
  const brandsData    = brandRevenue.map((b, i) => ({
    name: b.brand_name,
    pct:  Math.round(b.total / totalBrandRev * 100),
    revenue: b.total,
    color: brandColors[i] ?? '#4A5462',
  }))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 26, margin: '0 0 4px' }}>
            {greeting}! 👋
          </h1>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            {totalRevenue?.total ? ` · Receita total: ${fmt(totalRevenue.total)}` : ''}
          </p>
        </div>
        <Link href="/produtos/novo" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, background: '#F26B1F', color: '#fff', textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13 }}>
          + Novo produto
        </Link>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        {/* Featured — Vendas hoje */}
        <div style={{ background: 'linear-gradient(135deg, #141922 0%, #0F1318 100%)', border: '1px solid #F26B1F33', borderRadius: 14, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: '#F26B1F', opacity: 0.06, filter: 'blur(30px)' }} />
          <p style={{ fontSize: 11, color: '#4A5462', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 10px' }}>Vendas hoje</p>
          <p style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 32, color: '#F26B1F', margin: '0 0 8px', lineHeight: 1 }}>{fmt(todayData?.total ?? 0)}</p>
          {revenueChange !== null && (
            <span style={{ fontSize: 12, fontWeight: 700, color: revenueChange >= 0 ? '#2CB35A' : '#E23B3B' }}>
              {revenueChange >= 0 ? '▲' : '▼'} {Math.abs(revenueChange)}% vs ontem
            </span>
          )}
        </div>

        {/* Pedidos hoje */}
        <KpiCard label="Pedidos hoje" value={String(todayData?.n ?? 0)}
          sub={ordersChange !== null ? `${ordersChange >= 0 ? '▲' : '▼'} ${Math.abs(ordersChange)}% vs ontem` : 'Primeiro dia'}
          subColor={ordersChange !== null ? (ordersChange >= 0 ? '#2CB35A' : '#E23B3B') : '#6B7280'}
          href="/pedidos" />

        {/* Ticket médio */}
        <KpiCard label="Ticket médio" value={fmt(avgTicket?.avg ?? 0)} sub="Últimos 30 dias" href="/relatorios" />

        {/* Aguardando */}
        <KpiCard label="Aguardando" value={String(pendingOrders?.n ?? 0)}
          sub={pendingOrders?.n ? 'Pendentes de pgto' : 'Nenhum pendente'}
          subColor={pendingOrders?.n ? '#F59E0B' : '#2CB35A'}
          href="/pedidos" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 24 }}>
        <SalesDashboardChart data={salesData} />
        {brandsData.length > 0
          ? <BrandsSharePanel brands={brandsData} />
          : (
            <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 13, color: '#4A5462' }}>Sem dados de vendas por marca ainda</p>
            </div>
          )
        }
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        {/* Pedidos recentes */}
        <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 14, margin: 0 }}>Pedidos recentes</p>
            <Link href="/pedidos" style={{ fontSize: 12, color: '#F26B1F', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2530' }}>
                {['Pedido', 'Cliente', 'Total', 'Status', 'Quando'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, color: '#4A5462', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#4A5462', fontSize: 13 }}>Nenhum pedido ainda.</td></tr>
              )}
              {recentOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #141922' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/pedidos/${o.id}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#F26B1F', textDecoration: 'none' }}>{o.order_number}</Link>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: '#D1D5DB' }}>
                    {o.customer_name.split(' ')[0]} {o.customer_name.split(' ').slice(-1)[0]}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700 }}>{fmt(o.total_in_cents)}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor[o.status] ?? '#6B7280', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: statusColor[o.status] ?? '#9CA3AF', fontWeight: 600 }}>{statusLabel[o.status] ?? o.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#6B7280' }}>{timeAgo(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estoque crítico */}
        <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 14, margin: 0 }}>Estoque crítico</p>
            {lowStockCount?.n ? (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#E23B3B22', color: '#E23B3B' }}>
                {lowStockCount.n} alertas
              </span>
            ) : null}
          </div>

          {criticalStock.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#2CB35A', fontWeight: 600 }}>✅ Estoque OK</p>
              <p style={{ fontSize: 12, color: '#4A5462', marginTop: 4 }}>Nenhuma variante crítica</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {criticalStock.map(v => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: '1px solid #141922' }}>
                    {/* Imagem ou placeholder */}
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1E2530', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {v.image_url
                        ? <img src={v.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '👟'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.product_name}</p>
                      <p style={{ fontSize: 10, color: '#6B7280', margin: '2px 0 0' }}>Tam. {v.size} · {v.brand_name}</p>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, whiteSpace: 'nowrap',
                      background: v.available <= 0 ? '#E23B3B22' : '#F59E0B22',
                      color: v.available <= 0 ? '#E23B3B' : '#F59E0B',
                    }}>
                      {v.available <= 0 ? '• Crítico' : `• Baixo (${v.available})`}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid #1E2530' }}>
                <Link href="/estoque?filter=low" style={{ fontSize: 12, color: '#F26B1F', textDecoration: 'none', fontWeight: 600 }}>
                  Ver estoque completo →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, subColor = '#6B7280', href }: {
  label: string; value: string; sub?: string; subColor?: string; href?: string
}) {
  const inner = (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 14, padding: '20px 22px', cursor: href ? 'pointer' : 'default', transition: 'border-color .2s' }}
      className={href ? 'stat-card stat-card--link' : 'stat-card'}>
      <p style={{ fontSize: 11, color: '#4A5462', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 12px' }}>{label}</p>
      <p style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 28, color: '#F8F9FB', margin: '0 0 6px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: subColor, margin: 0, fontWeight: 600 }}>{sub}</p>}
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}
