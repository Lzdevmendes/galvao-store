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
  pending_payment: 'Aguardando', paid: 'Pago', processing: 'Processando',
  shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
}

export default async function ClienteDetailPage({ params }: PageProps) {
  const { id } = await params

  const users = await db.all<{
    id: string; email: string; name: string | null; phone: string | null
    cpf: string | null; created_at: string; is_club_member: number; marketing_opt_in: number
  }>(sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`)
  const user = users[0]
  if (!user) notFound()

  const [[stats], orders, topProducts, addresses] = await Promise.all([
    db.all<{ total_orders: number; confirmed: number; total_spent: number; avg_ticket: number; cancelled: number; last_order: string | null }>(sql`
      SELECT
        COUNT(*) total_orders,
        COUNT(CASE WHEN status IN ('paid','processing','shipped','delivered') THEN 1 END) confirmed,
        COALESCE(SUM(CASE WHEN status IN ('paid','processing','shipped','delivered') THEN total_in_cents END),0) total_spent,
        COALESCE(AVG(CASE WHEN status IN ('paid','processing','shipped','delivered') THEN total_in_cents END),0) avg_ticket,
        COUNT(CASE WHEN status='cancelled' THEN 1 END) cancelled,
        MAX(created_at) last_order
      FROM orders WHERE user_id = ${id} OR customer_email = ${user.email}
    `),
    db.all<{
      id: string; order_number: string; status: string; total_in_cents: number
      payment_method: string; created_at: string; delivery_method: string
    }>(sql`
      SELECT id, order_number, status, total_in_cents, payment_method, created_at, delivery_method
      FROM orders WHERE user_id = ${id} OR customer_email = ${user.email}
      ORDER BY created_at DESC LIMIT 20
    `),
    db.all<{ product_name: string; brand_name: string; qty: number; total: number }>(sql`
      SELECT oi.product_name, oi.brand_name, SUM(oi.qty) qty, SUM(oi.total_in_cents) total
      FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE (o.user_id = ${id} OR o.customer_email = ${user.email})
        AND o.status IN ('paid','processing','shipped','delivered')
      GROUP BY oi.product_name ORDER BY total DESC LIMIT 5
    `),
    db.all<{
      id: string; label: string; street: string; number: string; complement: string | null
      district: string; city: string; state: string; is_default: number
    }>(sql`SELECT * FROM addresses WHERE user_id = ${id} ORDER BY is_default DESC LIMIT 5`),
  ])

  const name      = user.name ?? user.email.split('@')[0]
  const firstName = name.split(' ')[0]
  const initial   = firstName.charAt(0).toUpperCase()
  const payLabel: Record<string, string> = { pix: 'PIX', credit_card: 'Cartão', boleto: 'Boleto' }

  // Customer score (simples baseado em LTV e frequência)
  const score = Math.min(99, Math.round(
    (stats?.confirmed ?? 0) * 5 +
    Math.min(50, (stats?.total_spent ?? 0) / 10000) +
    (user.is_club_member ? 10 : 0) -
    (stats?.cancelled ?? 0) * 3
  ))

  // Preferências de marcas (das compras)
  const brandPrefs = await db.all<{ brand_name: string; total: number }>(sql`
    SELECT oi.brand_name, SUM(oi.total_in_cents) total
    FROM order_items oi JOIN orders o ON o.id = oi.order_id
    WHERE (o.user_id = ${id} OR o.customer_email = ${user.email})
      AND o.status IN ('paid','processing','shipped','delivered')
    GROUP BY oi.brand_name ORDER BY total DESC LIMIT 5
  `)
  const maxBrand = brandPrefs[0]?.total ?? 1

  // Sincronização desde
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { month:'short', year:'numeric' })
    : '—'

  const lastOrderAgo = stats?.last_order
    ? (() => {
        const diff = Date.now() - new Date(stats.last_order).getTime()
        const days = Math.floor(diff / 86400000)
        if (days === 0) return 'hoje'
        if (days === 1) return 'ontem'
        if (days < 30) return `há ${days} dias`
        return new Date(stats.last_order).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' })
      })()
    : '—'

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/clientes" style={{ fontSize:12, color:'#6B7280', fontFamily:'JetBrains Mono, monospace', letterSpacing:'.1em', textTransform:'uppercase' }}>
          ← CLIENTES
        </Link>
        <span style={{ fontSize:12, color:'#4A5462', fontFamily:'JetBrains Mono, monospace', letterSpacing:'.1em' }}> · {name.toUpperCase()}</span>
      </div>

      {/* ── Hero do cliente ─────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#0B0E12,#1F252E)', color:'#fff', borderRadius:14, padding:32, marginBottom:20, position:'relative', overflow:'hidden' }}>
        {/* Glow decorativo */}
        <div style={{ position:'absolute', right:'-10%', top:'-50%', width:'50%', height:'200%', background:'radial-gradient(ellipse,rgba(242,107,31,.2),transparent 60%)', pointerEvents:'none' }} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center', position:'relative', zIndex:1 }}>
          {/* Identity */}
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--brand-orange,#F26B1F)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Archivo Black,sans-serif', fontSize:32, flexShrink:0 }}>
              {initial}
            </div>
            <div>
              <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:56, lineHeight:.95, margin:0 }}>
                {name}
              </h1>
              <div style={{ display:'flex', gap:16, marginTop:6, fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'rgba(255,255,255,.5)', flexWrap:'wrap' }}>
                <span>{user.email}</span>
                {user.phone && <span>{user.phone}</span>}
                {user.cpf && <span>CPF: {user.cpf}</span>}
              </div>
              {/* Tags */}
              <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap' }}>
                {user.is_club_member && (
                  <span style={{ padding:'3px 10px', borderRadius:999, fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:700, background:'#F26B1F', color:'#fff' }}>
                    ★ CLUBE GALVÃO&apos;S
                  </span>
                )}
                {(stats?.total_spent ?? 0) >= 200000 && (
                  <span style={{ padding:'3px 10px', borderRadius:999, fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:700, background:'#FFC83A', color:'#0B0E12' }}>
                    VIP · TOP 5%
                  </span>
                )}
                {(stats?.confirmed ?? 0) >= 3 && (
                  <span style={{ padding:'3px 10px', borderRadius:999, fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:700, background:'#2CB35A', color:'#fff' }}>
                    RECORRENTE
                  </span>
                )}
                {user.marketing_opt_in === 1 && (
                  <span style={{ padding:'3px 10px', borderRadius:999, fontFamily:'Space Grotesk,sans-serif', fontSize:11, fontWeight:700, background:'rgba(31,181,168,.3)', color:'#1FB5A8' }}>
                    NEWSLETTER
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end' }}>
            <button style={{ padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', color:'#fff', cursor:'pointer', fontFamily:'Space Grotesk,sans-serif', fontWeight:600, fontSize:13 }}>
              Enviar e-mail
            </button>
            <Link href={`/pedidos/novo?email=${encodeURIComponent(user.email)}`}
              style={{ padding:'8px 14px', borderRadius:8, background:'#F26B1F', color:'#fff', fontFamily:'Space Grotesk,sans-serif', fontWeight:600, fontSize:13 }}>
              + Criar pedido
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
        {[
          { l:'Total gasto (LTV)', v: fmt(stats?.total_spent ?? 0), color:'#2CB35A' },
          { l:'Pedidos',           v: String(stats?.total_orders ?? 0), color:'#F8F9FB' },
          { l:'Ticket médio',      v: fmt(stats?.avg_ticket ?? 0), color:'#1FB5A8' },
          { l:'Cliente desde',     v: memberSince, color:'#F8F9FB' },
          { l:'Último pedido',     v: lastOrderAgo, color: lastOrderAgo === 'hoje' ? '#F26B1F' : '#F8F9FB' },
        ].map(({ l, v, color }) => (
          <div key={l} style={{ background:'#141922', border:'1px solid #1E2530', borderRadius:10, padding:'16px 20px' }}>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', color:'#4A5462', marginBottom:6 }}>{l}</div>
            <div style={{ fontFamily:'Archivo Black,sans-serif', fontSize:22, lineHeight:1, color, marginBottom:4 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', borderBottom:'1px solid #1E2530', marginBottom:20, gap:0 }}>
        {[['Visão geral', true], ['Pedidos', false], ['Endereços', false], ['Notas', false]].map(([label, active]) => (
          <button key={String(label)} style={{
            padding:'10px 16px', background:'none', border:'none', fontFamily:'Space Grotesk,sans-serif', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
            color: active ? '#F8F9FB' : '#6B7280',
            borderBottom: active ? '2px solid #F26B1F' : '2px solid transparent',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Body: main + sidebar ────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>

        {/* Main column */}
        <div>
          {/* Score panel */}
          <div style={{ display:'flex', gap:16, alignItems:'center', background:'linear-gradient(135deg,#141922,#0F1318)', border:'1px solid #1E2530', borderRadius:10, padding:16, marginBottom:16 }}>
            <div style={{ fontFamily:'Archivo Black,sans-serif', fontSize:48, lineHeight:1, color:'#F26B1F', flexShrink:0 }}>
              {score}<span style={{ fontSize:20, color:'#4A5462' }}>/100</span>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>
                Score de cliente · {score >= 80 ? 'excelente' : score >= 50 ? 'bom' : 'em crescimento'}
              </div>
              <div style={{ fontSize:12, color:'#6B7280', lineHeight:1.4 }}>
                {(stats?.confirmed ?? 0)} pedido{(stats?.confirmed ?? 0) !== 1 ? 's' : ''} confirmado{(stats?.confirmed ?? 0) !== 1 ? 's' : ''}
                {user.is_club_member ? ' · membro do clube' : ''}
                {(stats?.cancelled ?? 0) === 0 ? ' · zero cancelamentos' : ''}
              </div>
            </div>
          </div>

          {/* Pedidos recentes */}
          <div style={{ background:'#0F1318', border:'1px solid #1E2530', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #1E2530', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontFamily:'Archivo Black,sans-serif', fontSize:14, margin:0 }}>Pedidos recentes</h3>
              <span style={{ fontSize:12, color:'#6B7280', fontFamily:'JetBrains Mono,monospace' }}>{stats?.total_orders ?? 0} no total</span>
            </div>

            {orders.length === 0 ? (
              <p style={{ padding:'32px 20px', textAlign:'center', color:'#4A5462', fontSize:13 }}>Sem pedidos ainda.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column' }}>
                {orders.map(o => (
                  <Link key={o.id} href={`/pedidos/${o.id}`}
                    style={{ display:'grid', gridTemplateColumns:'90px 1fr auto auto', gap:12, padding:'12px 20px', borderBottom:'1px solid #141922', alignItems:'center', fontSize:13, color:'inherit' }}>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'#F26B1F', letterSpacing:'.08em' }}>{o.order_number}</span>
                    <div>
                      <div style={{ fontWeight:600, marginBottom:2 }}>{fmt(o.total_in_cents)}</div>
                      <div style={{ fontSize:10, color:'#6B7280', fontFamily:'JetBrains Mono,monospace' }}>
                        {new Date(o.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' })}
                        {' · '}{payLabel[o.payment_method] ?? o.payment_method}
                      </div>
                    </div>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999,
                      fontFamily:'Space Grotesk,sans-serif', fontSize:10, fontWeight:700,
                      background: `${statusColor[o.status]}22`, color: statusColor[o.status] ?? '#9CA3AF',
                    }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />
                      {statusLabel[o.status] ?? o.status}
                    </span>
                    <span style={{ color:'#F26B1F', fontSize:12, fontWeight:600 }}>Ver →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top produtos */}
          {topProducts.length > 0 && (
            <div style={{ background:'#0F1318', border:'1px solid #1E2530', borderRadius:12, padding:20, marginTop:16 }}>
              <h3 style={{ fontFamily:'Archivo Black,sans-serif', fontSize:14, margin:'0 0 16px' }}>Produtos mais comprados</h3>
              {topProducts.map((p, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, paddingBottom:12, borderBottom: i < topProducts.length - 1 ? '1px solid #1E2530' : 'none' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{p.product_name}</div>
                    <div style={{ fontSize:11, color:'#6B7280' }}>{p.brand_name} · {p.qty}× comprado{p.qty > 1 ? 's' : ''}</div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:'#F26B1F', fontFamily:'JetBrains Mono,monospace' }}>{fmt(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Dados de contato */}
          <div style={{ background:'#0F1318', border:'1px solid #1E2530', borderRadius:12, padding:20 }}>
            <h3 style={{ fontFamily:'Archivo Black,sans-serif', fontSize:13, margin:'0 0 14px', letterSpacing:'.04em', textTransform:'uppercase', color:'#9CA3AF' }}>
              Dados de Contacto
            </h3>
            {[
              { k:'E-mail',   v: user.email },
              { k:'Telefone', v: user.phone },
              { k:'CPF',      v: user.cpf },
              { k:'Desde',    v: user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : null },
            ].map(({ k, v }) => (
              <div key={k} style={{ padding:'8px 0', borderBottom:'1px solid #141922', display:'flex', flexDirection:'column', gap:2 }}>
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:9, letterSpacing:'.18em', textTransform:'uppercase', color:'#4A5462' }}>{k}</span>
                <span style={{ fontSize:13, color: v ? '#F8F9FB' : '#4A5462' }}>{v ?? '—'}</span>
              </div>
            ))}
          </div>

          {/* Endereços */}
          {addresses.length > 0 && (
            <div style={{ background:'#0F1318', border:'1px solid #1E2530', borderRadius:12, padding:20 }}>
              <h3 style={{ fontFamily:'Archivo Black,sans-serif', fontSize:13, margin:'0 0 14px', letterSpacing:'.04em', textTransform:'uppercase', color:'#9CA3AF' }}>
                Endereços
              </h3>
              {addresses.map(addr => (
                <div key={addr.id} style={{
                  background: addr.is_default ? 'rgba(242,107,31,.08)' : '#141922',
                  border: addr.is_default ? '1px solid rgba(242,107,31,.2)' : '1px solid #1E2530',
                  borderRadius:8, padding:10, marginBottom:8, fontSize:12, lineHeight:1.5,
                }}>
                  <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color: addr.is_default ? '#F26B1F' : '#6B7280', fontWeight:700, marginBottom:3 }}>
                    {addr.label}{addr.is_default ? ' · PADRÃO' : ''}
                  </div>
                  <div style={{ fontWeight:600 }}>{addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''}</div>
                  <div style={{ color:'#9CA3AF' }}>{addr.district} — {addr.city}/{addr.state}</div>
                </div>
              ))}
            </div>
          )}

          {/* Preferências de marca */}
          {brandPrefs.length > 0 && (
            <div style={{ background:'#0F1318', border:'1px solid #1E2530', borderRadius:12, padding:20 }}>
              <h3 style={{ fontFamily:'Archivo Black,sans-serif', fontSize:13, margin:'0 0 14px', letterSpacing:'.04em', textTransform:'uppercase', color:'#9CA3AF' }}>
                Marcas Preferidas
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {brandPrefs.map(b => (
                  <div key={b.brand_name}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}>
                      <span style={{ fontWeight:600 }}>{b.brand_name}</span>
                      <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'#6B7280' }}>{fmt(b.total)}</span>
                    </div>
                    <div style={{ height:5, background:'#1E2530', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:3, background:'#F26B1F', width:`${Math.round(b.total / maxBrand * 100)}%`, transition:'width .3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
