import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

interface CouponRow {
  id: string
  code: string
  type: 'percent' | 'fixed' | 'shipping'
  value: number
  min_order_in_cents: number | null
  expires_at: string | null
  used_at?: string
  order_id?: string | null
}

function fmtDiscount(type: string, value: number) {
  if (type === 'percent') return `${value}% OFF`
  if (type === 'shipping') return 'Frete grátis'
  return `R$ ${(value / 100).toFixed(2).replace('.', ',')} OFF`
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

export default async function CuponsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const used = db.all<CouponRow>(sql`
    SELECT c.id, c.code, c.type, c.value, c.min_order_in_cents, c.expires_at,
           cu.used_at, cu.order_id
    FROM coupon_uses cu
    JOIN coupons c ON c.id = cu.coupon_id
    WHERE cu.user_id = ${user.id}
    ORDER BY cu.used_at DESC
  `)

  const available = db.all<CouponRow>(sql`
    SELECT c.id, c.code, c.type, c.value, c.min_order_in_cents, c.expires_at
    FROM coupons c
    WHERE c.active = 1
      AND (c.expires_at IS NULL OR c.expires_at > datetime('now'))
      AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
    ORDER BY c.created_at DESC
    LIMIT 10
  `)

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/conta" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', textDecoration: 'none' }}>← Minha Conta</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '.04em', marginTop: 8, marginBottom: 0 }}>CUPONS</h1>
      </div>

      {/* Cupons disponíveis */}
      {available.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
            Disponíveis agora
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {available.map(c => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        </section>
      )}

      {/* Histórico de uso */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
          Histórico de uso
        </h2>

        {used.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', marginBottom: 20 }}>
              Nenhum cupom utilizado ainda.
            </p>
            <Link href="/produtos" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--brand-orange)', color: '#fff', borderRadius: 10, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Explorar produtos
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {used.map(c => (
              <div key={`${c.id}-${c.used_at}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ background: 'var(--bg-sunk)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 13, letterSpacing: '.06em', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
                    {c.code}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>
                      {fmtDiscount(c.type, c.value)}
                    </div>
                    {c.used_at && (
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                        Usado em {new Date(c.used_at).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
                {c.order_id && (
                  <Link href={`/conta/pedidos/${c.order_id}`} style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--brand-orange)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Ver pedido →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function CouponCard({ coupon }: { coupon: CouponRow }) {
  const exp = coupon.expires_at
  const expired = isExpired(exp)

  return (
    <div style={{
      background: 'var(--bg-elev)',
      border: `2px dashed var(--brand-orange)`,
      borderRadius: 14,
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
      opacity: expired ? .5 : 1,
    }}>
      <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, background: 'rgba(242,107,31,.06)', borderRadius: '50%' }} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, letterSpacing: '.06em', color: 'var(--brand-orange)', marginBottom: 6 }}>
        {coupon.code}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, color: 'var(--fg)', marginBottom: 4 }}>
        {fmtDiscount(coupon.type, coupon.value)}
      </div>
      {coupon.min_order_in_cents != null && coupon.min_order_in_cents > 0 && (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)' }}>
          Pedido mínimo: R$ {(coupon.min_order_in_cents / 100).toFixed(2).replace('.', ',')}
        </div>
      )}
      {exp && (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: expired ? '#EF4444' : 'var(--fg-muted)', marginTop: 6 }}>
          {expired ? 'Expirado' : `Válido até ${new Date(exp).toLocaleDateString('pt-BR')}`}
        </div>
      )}
    </div>
  )
}
