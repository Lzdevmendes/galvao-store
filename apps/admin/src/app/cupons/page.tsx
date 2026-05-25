import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import { CouponActions } from './coupon-actions'

export default async function AdminCupons() {
  const cupons = await db.all<{
    id: string; code: string; type: string; value: number
    min_order_in_cents: number | null; max_uses: number | null
    used_count: number; active: number
    starts_at: string | null; expires_at: string | null
  }>(sql`SELECT id, code, type, value, min_order_in_cents, max_uses, used_count, active, starts_at, expires_at FROM coupons ORDER BY created_at DESC`)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 24, margin: 0 }}>Cupons</h1>
        <CouponActions mode="create" />
      </div>

      <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2530' }}>
              {['Código', 'Tipo', 'Valor', 'Uso mín.', 'Usos', 'Validade', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: '#4A5462', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cupons.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#4A5462', fontSize: 14 }}>Nenhum cupom. Crie o primeiro!</td></tr>
            )}
            {cupons.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #141922', opacity: c.active ? 1 : 0.5 }}>
                <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#F26B1F' }}>{c.code}</td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#9CA3AF' }}>{c.type === 'percent' ? 'Percentual' : 'Fixo'}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 700 }}>
                  {c.type === 'percent' ? `${c.value}%` : fmt(c.value)}
                </td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#9CA3AF' }}>
                  {c.min_order_in_cents ? fmt(c.min_order_in_cents) : '—'}
                </td>
                <td style={{ padding: '12px 20px', fontSize: 13 }}>
                  {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}
                </td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#9CA3AF' }}>
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString('pt-BR') : '∞'}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: c.active ? '#2CB35A22' : '#E23B3B22',
                    color: c.active ? '#2CB35A' : '#E23B3B',
                  }}>
                    {c.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <CouponActions mode="toggle" couponId={c.id} active={!!c.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
