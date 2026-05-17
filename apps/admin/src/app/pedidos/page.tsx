import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

type PageProps = { searchParams: Promise<{ status?: string; q?: string; page?: string }> }

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pending_payment', label: 'Aguardando' },
  { value: 'paid', label: 'Pago' },
  { value: 'processing', label: 'Processando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
]

const statusColor: Record<string, string> = {
  pending_payment: '#F59E0B', paid: '#2CB35A', processing: '#3B82F6',
  shipped: '#1FB5A8', delivered: '#2CB35A', cancelled: '#E23B3B', refunded: '#E23B3B',
}

export default async function AdminPedidos({ searchParams }: PageProps) {
  const sp     = await searchParams
  const status = sp.status ?? ''
  const q      = sp.q?.trim() ?? ''
  const page   = Math.max(1, Number(sp.page ?? 1))
  const limit  = 20
  const offset = (page - 1) * limit

  const baseWhere = sql`WHERE 1=1
    ${status ? sql`AND status = ${status}` : sql``}
    ${q ? sql`AND (order_number LIKE ${'%'+q+'%'} OR customer_name LIKE ${'%'+q+'%'} OR customer_email LIKE ${'%'+q+'%'})` : sql``}
  `

  const [{ total }] = db.all<{ total: number }>(sql`SELECT COUNT(*) total FROM orders ${baseWhere}`)
  const orders = db.all<{
    id: string; order_number: string; customer_name: string; customer_email: string
    status: string; payment_method: string; total_in_cents: number
    delivery_method: string; tracking_code: string | null; created_at: string
  }>(sql`SELECT id, order_number, customer_name, customer_email, status, payment_method,
    total_in_cents, delivery_method, tracking_code, created_at
    FROM orders ${baseWhere}
    ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`)

  const pages = Math.ceil(total / limit)

  const buildUrl = (params: Record<string, string>) => {
    const p = new URLSearchParams({ status, q, page: String(page), ...params })
    for (const [k, v] of p.entries()) if (!v) p.delete(k)
    return `/admin/pedidos?${p}`
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 24, margin: 0 }}>
          Pedidos <span style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 400 }}>({total})</span>
        </h1>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Busca */}
        <form style={{ display: 'flex', gap: 8 }}>
          <input name="q" defaultValue={q} placeholder="Nº pedido, nome, e-mail..."
            style={{
              padding: '9px 14px', borderRadius: 8, border: '1px solid #1E2530',
              background: '#0F1318', color: '#F8F9FB', fontSize: 13, width: 260, outline: 'none',
            }}
          />
          <input type="hidden" name="status" value={status} />
          <button type="submit" style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#F26B1F', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Buscar
          </button>
        </form>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(opt => (
            <Link key={opt.value} href={buildUrl({ status: opt.value, page: '1' })}
              style={{
                padding: '8px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                textDecoration: 'none', whiteSpace: 'nowrap',
                background: status === opt.value ? '#F26B1F' : '#1E2530',
                color: status === opt.value ? '#fff' : '#9CA3AF',
              }}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2530' }}>
              {['Pedido', 'Cliente', 'Pagamento', 'Frete', 'Total', 'Status', 'Data', ''].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: '#4A5462', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#4A5462', fontSize: 14 }}>Nenhum pedido encontrado.</td></tr>
            )}
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #141922' }}>
                <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#F26B1F', whiteSpace: 'nowrap' }}>{o.order_number}</td>
                <td style={{ padding: '12px 20px' }}>
                  <p style={{ fontSize: 13, margin: 0 }}>{o.customer_name}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{o.customer_email}</p>
                </td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase' }}>
                  {o.payment_method === 'credit_card' ? 'Cartão' : o.payment_method.toUpperCase()}
                </td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#9CA3AF' }}>
                  {o.delivery_method.toUpperCase()}
                  {o.tracking_code && <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#1FB5A8', marginTop: 2 }}>{o.tracking_code}</div>}
                </td>
                <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 700 }}>{fmt(o.total_in_cents)}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: `${statusColor[o.status]}22`, color: statusColor[o.status] ?? '#9CA3AF',
                  }}>
                    {STATUS_OPTIONS.find(s => s.value === o.status)?.label ?? o.status}
                  </span>
                </td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                  {new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <Link href={`/admin/pedidos/${o.id}`} style={{ fontSize: 12, color: '#F26B1F', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ver →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          {page > 1 && <Link href={buildUrl({ page: String(page - 1) })} style={{ padding: '8px 16px', borderRadius: 8, background: '#1E2530', color: '#F8F9FB', textDecoration: 'none', fontSize: 13 }}>← Anterior</Link>}
          <span style={{ fontSize: 13, color: '#6B7280' }}>Página {page} de {pages}</span>
          {page < pages && <Link href={buildUrl({ page: String(page + 1) })} style={{ padding: '8px 16px', borderRadius: 8, background: '#1E2530', color: '#F8F9FB', textDecoration: 'none', fontSize: 13 }}>Próxima →</Link>}
        </div>
      )}
    </div>
  )
}
