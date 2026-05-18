import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

type PageProps = { searchParams: Promise<{ q?: string; page?: string }> }

export default async function AdminClientes({ searchParams }: PageProps) {
  const sp    = await searchParams
  const q     = sp.q?.trim() ?? ''
  const page  = Math.max(1, Number(sp.page ?? 1))
  const limit = 25
  const offset= (page - 1) * limit

  const where = q
    ? sql`WHERE u.email LIKE ${'%'+q+'%'} OR u.name LIKE ${'%'+q+'%'}`
    : sql``

  const [{ total }] = db.all<{ total: number }>(sql`SELECT COUNT(*) total FROM users u ${where}`)

  const clientes = db.all<{
    id: string; email: string; name: string | null; phone: string | null
    created_at: string; order_count: number; total_spent: number
  }>(sql`
    SELECT u.id, u.email, u.name, u.phone, u.created_at,
           COUNT(o.id) order_count,
           COALESCE(SUM(o.total_in_cents), 0) total_spent
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id AND o.status IN ('paid','processing','shipped','delivered')
    ${where}
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `)

  const pages = Math.ceil(total / limit)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 24, margin: 0 }}>
          Clientes <span style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 400 }}>({total})</span>
        </h1>
      </div>

      <form style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <input name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail..."
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #1E2530', background: '#0F1318', color: '#F8F9FB', fontSize: 13, width: 300, outline: 'none' }}
        />
        <button type="submit" style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#F26B1F', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Buscar
        </button>
      </form>

      <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2530' }}>
              {['Nome', 'E-mail', 'Tel.', 'Pedidos', 'Gasto total', 'Desde', ''].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: '#4A5462', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#4A5462', fontSize: 14 }}>Nenhum cliente encontrado.</td></tr>
            )}
            {clientes.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #141922' }}>
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600 }}>{c.name ?? '—'}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: '#9CA3AF' }}>{c.email}</td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#9CA3AF' }}>{c.phone ?? '—'}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 700, color: c.order_count > 0 ? '#F26B1F' : '#6B7280' }}>
                  {c.order_count}
                </td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 700, color: '#2CB35A' }}>
                  {c.total_spent > 0 ? fmt(c.total_spent) : '—'}
                </td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#6B7280' }}>
                  {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <Link href={`/clientes/${c.id}`} style={{ fontSize: 12, color: '#F26B1F', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ver →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Página {page} de {pages}</span>
        </div>
      )}
    </div>
  )
}
