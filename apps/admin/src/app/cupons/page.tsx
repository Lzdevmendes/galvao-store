import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { CouponActions } from './coupon-actions'

type CouponRow = {
  id: string; code: string; type: string; value: number
  min_order_in_cents: number | null; max_uses: number | null
  used_count: number; active: number
  starts_at: string | null; expires_at: string | null
  revenue_in_cents: number
}

type CouponStatus = 'ativo' | 'pausado' | 'expirado' | 'agendado'

function getCouponStatus(c: CouponRow): CouponStatus {
  const now = new Date().toISOString()
  if (c.expires_at && c.expires_at < now) return 'expirado'
  if (c.starts_at && c.starts_at > now) return 'agendado'
  if (!c.active) return 'pausado'
  return 'ativo'
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function fmtRevenue(cents: number) {
  if (cents === 0) return 'R$ 0'
  if (cents >= 100000) return `R$ ${(cents / 100000).toFixed(0)}k`
  return `R$ ${(cents / 100).toFixed(0)}`
}

type SearchParams = Promise<{ tab?: string }>

export default async function AdminCupons({ searchParams }: { searchParams: SearchParams }) {
  const { tab = 'ativo' } = await searchParams

  const rows = await db.all<CouponRow>(sql`
    SELECT
      c.id, c.code, c.type, c.value,
      c.min_order_in_cents, c.max_uses, c.used_count, c.active,
      c.starts_at, c.expires_at,
      COALESCE(SUM(o.discount_in_cents), 0) as revenue_in_cents
    FROM coupons c
    LEFT JOIN orders o ON o.coupon_code = c.code AND o.status NOT IN ('cancelled','pending_payment')
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `)

  // Classificar por status
  const byStatus = new Map<CouponStatus, CouponRow[]>([
    ['ativo', []], ['agendado', []], ['expirado', []], ['pausado', []],
  ])
  for (const r of rows) {
    byStatus.get(getCouponStatus(r))!.push(r)
  }

  const activeCount    = byStatus.get('ativo')!.length
  const scheduledCount = byStatus.get('agendado')!.length
  const expiredCount   = byStatus.get('expirado')!.length
  const pausedCount    = byStatus.get('pausado')!.length

  const totalRevenue = rows.reduce((s, r) => s + r.revenue_in_cents, 0)
  const totalDiscounts = rows.filter(r => getCouponStatus(r) === 'ativo').length

  const displayed: CouponRow[] =
    tab === 'agendado' ? byStatus.get('agendado')! :
    tab === 'expirado' ? byStatus.get('expirado')! :
    tab === 'pausado'  ? byStatus.get('pausado')! :
    tab === 'todos'    ? rows :
    byStatus.get('ativo')!

  const pillStyle = (s: CouponStatus): React.CSSProperties => ({
    ativo:    { background: 'rgba(44,179,90,.15)', color: '#2CB35A' },
    pausado:  { background: 'rgba(255,200,58,.18)', color: '#B8870E' },
    expirado: { background: 'rgba(155,155,155,.15)', color: '#6B7280' },
    agendado: { background: 'rgba(31,181,168,.15)', color: '#1FB5A8' },
  }[s] as React.CSSProperties)

  const pillLabel = (s: CouponStatus) =>
    ({ ativo: 'ATIVO', pausado: 'PAUSADO', expirado: 'EXPIRADO', agendado: 'AGENDADO' }[s])

  const borderColor = (s: CouponStatus) =>
    ({ ativo: '#F26B1F', pausado: '#6B7280', expirado: '#4A5462', agendado: '#1FB5A8' }[s])

  const tabActive = (t: string) => tab === t ? {
    borderBottom: '2px solid var(--brand-orange)',
    color: '#F8F9FB',
  } : {
    borderBottom: '2px solid transparent',
    color: '#6B7280',
  }

  const TABS: [string, string, number][] = [
    ['ativo',    'Ativos',     activeCount],
    ['agendado', 'Agendados',  scheduledCount],
    ['expirado', 'Expirados',  expiredCount],
    ['pausado',  'Pausados',   pausedCount],
    ['todos',    'Todos',      rows.length],
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Archivo Black, sans-serif', fontSize:28, margin:'0 0 4px', letterSpacing:'-.005em' }}>
            Cupons &amp; Promoções
          </h1>
          <div style={{ fontSize:13, color:'#6B7280' }}>
            {totalDiscounts} ativos · {fmtRevenue(totalRevenue)} em descontos aplicados (total acumulado)
          </div>
        </div>
        <CouponActions mode="create" />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid #1E2530', marginBottom:24 }}>
        {TABS.map(([key, label, count]) => (
          <a
            key={key}
            href={`?tab=${key}`}
            style={{
              padding:'10px 16px',
              fontFamily:'var(--font-ui,Space Grotesk,sans-serif)',
              fontSize:13, fontWeight:600,
              textDecoration:'none',
              transition:'color .15s',
              ...tabActive(key),
            }}
          >
            {label} · {count}
          </a>
        ))}
      </div>

      {/* Grid de cards */}
      {displayed.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 0', color:'#4A5462' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎟️</div>
          <div style={{ fontSize:14 }}>Nenhum cupom nesta categoria.</div>
        </div>
      ) : (
        <div className="cupons-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {displayed.map(c => {
            const status = getCouponStatus(c)
            return (
              <div
                key={c.id}
                style={{
                  background:'var(--bg-elev,#0F1318)',
                  border:'1px solid #1E2530',
                  borderRadius:10,
                  padding:18,
                  position:'relative',
                  overflow:'hidden',
                  opacity: status === 'expirado' ? 0.65 : 1,
                }}
              >
                {/* Left accent border */}
                <div style={{
                  position:'absolute', left:0, top:0, bottom:0, width:4,
                  background: borderColor(status),
                }} />

                {/* Status + menu */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, paddingLeft:4 }}>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap:5,
                    padding:'3px 9px', borderRadius:999,
                    fontFamily:'var(--font-ui,Space Grotesk,sans-serif)',
                    fontSize:11, fontWeight:700,
                    ...pillStyle(status),
                  }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />
                    {pillLabel(status)}
                  </span>
                  <CouponActions mode="toggle" couponId={c.id} active={!!c.active} compact />
                </div>

                {/* Code */}
                <div style={{
                  fontFamily:'Archivo Black, sans-serif',
                  fontSize:19, letterSpacing:'.03em',
                  color:'#F8F9FB', marginBottom:4, paddingLeft:4,
                }}>
                  {c.code}
                </div>

                {/* Description */}
                <div style={{ fontSize:12, color:'#6B7280', marginBottom:14, paddingLeft:4, lineHeight:1.5 }}>
                  {c.type === 'percent' ? `${c.value}% OFF` : `R$ ${(c.value/100).toFixed(0)} OFF`}
                  {c.min_order_in_cents ? ` acima de R$ ${(c.min_order_in_cents/100).toFixed(0)}` : ''}
                </div>

                {/* Stats */}
                <div style={{ display:'flex', gap:20, paddingLeft:4 }}>
                  <div>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, color:'#4A5462', textTransform:'uppercase', letterSpacing:'.14em', marginBottom:3 }}>USADO</div>
                    <strong style={{ fontSize:13, color:'#F8F9FB' }}>
                      {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}
                    </strong>
                  </div>
                  <div>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, color:'#4A5462', textTransform:'uppercase', letterSpacing:'.14em', marginBottom:3 }}>RECEITA</div>
                    <strong style={{ fontSize:13, color:'#2CB35A', fontFamily:'JetBrains Mono,monospace' }}>
                      {fmtRevenue(c.revenue_in_cents)}
                    </strong>
                  </div>
                  <div>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, color:'#4A5462', textTransform:'uppercase', letterSpacing:'.14em', marginBottom:3 }}>
                      {status === 'expirado' ? 'EXPIROU' : 'EXPIRA'}
                    </div>
                    <strong style={{ fontSize:13, color: c.expires_at && new Date(c.expires_at) < new Date(Date.now() + 3*24*60*60*1000) && status === 'ativo' ? '#FFC83A' : '#F8F9FB' }}>
                      {fmtDate(c.expires_at)}
                    </strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
