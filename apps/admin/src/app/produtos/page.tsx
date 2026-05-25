import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

type PageProps = { searchParams: Promise<{ q?: string }> }

export default async function AdminProdutos({ searchParams }: PageProps) {
  const sp = await searchParams
  const q  = sp.q?.trim() ?? ''

  const produtos = await db.all<{
    id: string; slug: string; name: string; brand_name: string
    category_name: string; status: string
    variant_count: number; total_stock: number; low_stock_count: number
    min_price: number; max_price: number
  }>(sql`
    SELECT p.id, p.slug, p.name, b.name brand_name, c.name category_name,
           p.status,
           COUNT(pv.id) variant_count,
           COALESCE(SUM(pv.stock - pv.stock_reserved), 0) total_stock,
           COUNT(CASE WHEN pv.stock - pv.stock_reserved <= 2 THEN 1 END) low_stock_count,
           MIN(pv.price_in_cents) min_price,
           MAX(pv.price_in_cents) max_price
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    ${q ? sql`WHERE p.name LIKE ${'%'+q+'%'} OR b.name LIKE ${'%'+q+'%'}` : sql``}
    GROUP BY p.id
    ORDER BY p.name ASC
  `)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 24, margin: 0 }}>
          Produtos <span style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 400 }}>({produtos.length})</span>
        </h1>
      </div>

      <form style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <input name="q" defaultValue={q} placeholder="Buscar produto ou marca..."
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
              {['Produto', 'Marca', 'Cat.', 'Variantes', 'Stock', 'Preço', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: '#4A5462', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #141922', opacity: p.status === 'archived' ? 0.5 : 1 }}>
                <td style={{ padding: '12px 20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B7280', margin: '2px 0 0' }}>{p.slug}</p>
                </td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: '#9CA3AF' }}>{p.brand_name}</td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' }}>{p.category_name}</td>
                <td style={{ padding: '12px 20px', fontSize: 13 }}>{p.variant_count}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: p.total_stock <= 0 ? '#E23B3B' : p.low_stock_count > 0 ? '#F59E0B' : '#2CB35A' }}>
                    {p.total_stock}
                  </span>
                  {p.low_stock_count > 0 && (
                    <span style={{ fontSize: 10, color: '#F59E0B', marginLeft: 6 }}>({p.low_stock_count} baixo)</span>
                  )}
                </td>
                <td style={{ padding: '12px 20px', fontSize: 13 }}>
                  {p.min_price === p.max_price ? fmt(p.min_price) : `${fmt(p.min_price)} – ${fmt(p.max_price)}`}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: p.status === 'published' ? '#2CB35A22' : p.status === 'archived' ? '#E23B3B22' : '#F59E0B22',
                    color:      p.status === 'published' ? '#2CB35A'   : p.status === 'archived' ? '#E23B3B'   : '#F59E0B',
                  }}>
                    {p.status === 'published' ? 'Publicado' : p.status === 'archived' ? 'Arquivado' : 'Rascunho'}
                  </span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <Link href={`/produtos/${p.id}`} style={{ fontSize: 12, color: '#F26B1F', textDecoration: 'none', fontWeight: 600 }}>
                    Editar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
