import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import Link from 'next/link'
import { AdjustForm } from './adjust-form'

type PageProps = {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>
}

type VariantRow = {
  id: string
  product_name: string
  brand_name: string
  sku: string
  size: string
  color: string | null
  stock: number
  stock_reserved: number
  available: number
  price_in_cents: number
}

const LIMIT = 30

function availColor(avail: number): string {
  if (avail <= 0) return '#E23B3B'
  if (avail <= 3) return '#F59E0B'
  return '#2CB35A'
}

export default async function EstoquePage({ searchParams }: PageProps) {
  const sp     = await searchParams
  const q      = sp.q?.trim() ?? ''
  const filter = sp.filter ?? 'all'
  const page   = Math.max(1, Number(sp.page ?? 1))
  const offset = (page - 1) * LIMIT

  const filterClause =
    filter === 'low'  ? sql`AND (pv.stock - pv.stock_reserved) <= 3 AND (pv.stock - pv.stock_reserved) > 0` :
    filter === 'zero' ? sql`AND (pv.stock - pv.stock_reserved) <= 0` :
    sql``

  const searchClause = q
    ? sql`AND (p.name LIKE ${'%'+q+'%'} OR pv.sku LIKE ${'%'+q+'%'})`
    : sql``

  const rows = await db.all<VariantRow>(sql`
    SELECT
      pv.id, p.name product_name, b.name brand_name,
      pv.sku, pv.size, pv.color, pv.stock, pv.stock_reserved,
      (pv.stock - pv.stock_reserved) available,
      pv.price_in_cents
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    JOIN brands b   ON b.id = p.brand_id
    WHERE 1=1
    ${searchClause}
    ${filterClause}
    ORDER BY available ASC, p.name ASC, pv.size ASC
    LIMIT ${LIMIT} OFFSET ${offset}
  `)

  const totalRow = await db.get<{ n: number }>(sql`
    SELECT COUNT(*) n
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    JOIN brands b   ON b.id = p.brand_id
    WHERE 1=1
    ${searchClause}
    ${filterClause}
  `)
  const total = totalRow?.n ?? 0

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const summary = await db.get<{ total: number; low: number; zero: number }>(sql`
    SELECT
      COUNT(*) total,
      COUNT(CASE WHEN (stock - stock_reserved) <= 3 AND (stock - stock_reserved) > 0 THEN 1 END) low,
      COUNT(CASE WHEN (stock - stock_reserved) <= 0 THEN 1 END) zero
    FROM product_variants
  `)

  function filterHref(f: string) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (f !== 'all') params.set('filter', f)
    return `/estoque?${params.toString()}`
  }

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (filter !== 'all') params.set('filter', filter)
    if (p > 1) params.set('page', String(p))
    return `/estoque?${params.toString()}`
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left',
    fontSize: 11, color: '#4A5462',
    letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600,
  }

  const tdStyle: React.CSSProperties = {
    padding: '10px 16px', fontSize: 13,
  }

  const FILTERS = [
    { key: 'all',  label: `Todos (${summary?.total ?? 0})` },
    { key: 'low',  label: `Stock baixo (${summary?.low ?? 0})` },
    { key: 'zero', label: `Sem stock (${summary?.zero ?? 0})` },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 24, margin: 0 }}>
          Estoque{' '}
          <span style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 400 }}>
            ({total} variantes)
          </span>
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <form style={{ display: 'flex', gap: 8 }}>
          {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar produto ou SKU..."
            style={{
              padding: '9px 14px', borderRadius: 8, border: '1px solid #1E2530',
              background: '#0F1318', color: '#F8F9FB', fontSize: 13, width: 280, outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '9px 16px', borderRadius: 8, border: 'none',
              background: '#F26B1F', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Buscar
          </button>
        </form>

        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <Link
              key={f.key}
              href={filterHref(f.key)}
              style={{
                padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: '1px solid',
                borderColor: filter === f.key ? '#F26B1F' : '#1E2530',
                background: filter === f.key ? 'rgba(242,107,31,.12)' : 'transparent',
                color: filter === f.key ? '#F26B1F' : '#6B7280',
                textDecoration: 'none',
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2530' }}>
              <th style={thStyle}>Produto</th>
              <th style={thStyle}>Marca</th>
              <th style={thStyle}>SKU</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Tam.</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Stock</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Reservado</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Disponível</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Preço</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 48, textAlign: 'center', color: '#4A5462', fontSize: 14 }}>
                  Nenhuma variante encontrada.
                </td>
              </tr>
            )}
            {rows.map(v => {
              const avail = v.available
              return (
                <tr key={v.id} style={{ borderBottom: '1px solid #141922' }}>
                  <td style={tdStyle}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{v.product_name}</p>
                    {v.color && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6B7280' }}>{v.color}</p>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: '#9CA3AF' }}>{v.brand_name}</td>
                  <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6B7280' }}>
                    {v.sku}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{v.size}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{v.stock}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#6B7280' }}>{v.stock_reserved}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <span style={{
                      fontWeight: 700, color: availColor(avail),
                      padding: '2px 8px', borderRadius: 99,
                      background: `${availColor(avail)}18`,
                      fontSize: 13,
                    }}>
                      {avail}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#9CA3AF' }}>
                    {fmt(v.price_in_cents)}
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <AdjustForm variantId={v.id} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
          {page > 1 && (
            <Link href={pageHref(page - 1)} style={{
              padding: '7px 14px', borderRadius: 7, border: '1px solid #1E2530',
              color: '#9CA3AF', fontSize: 13, textDecoration: 'none',
            }}>
              ← Anterior
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1]
              return (
                <span key={p} style={{ display: 'contents' }}>
                  {prev && p - prev > 1 && (
                    <span style={{ padding: '7px 8px', color: '#4A5462', fontSize: 13 }}>…</span>
                  )}
                  <Link
                    href={pageHref(p)}
                    style={{
                      padding: '7px 14px', borderRadius: 7,
                      border: '1px solid',
                      borderColor: p === page ? '#F26B1F' : '#1E2530',
                      background: p === page ? 'rgba(242,107,31,.12)' : 'transparent',
                      color: p === page ? '#F26B1F' : '#9CA3AF',
                      fontSize: 13, textDecoration: 'none', fontWeight: p === page ? 700 : 400,
                    }}
                  >
                    {p}
                  </Link>
                </span>
              )
            })}
          {page < totalPages && (
            <Link href={pageHref(page + 1)} style={{
              padding: '7px 14px', borderRadius: 7, border: '1px solid #1E2530',
              color: '#9CA3AF', fontSize: 13, textDecoration: 'none',
            }}>
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
