import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ImageManager from './image-manager'
import { fmt } from '@/lib/utils'

export default async function ProdutoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const produtos = db.all<{
    id: string; name: string; slug: string; brand_name: string
    category: string; status: string; description: string
  }>(sql`
    SELECT p.id, p.name, p.slug, b.name brand_name, c.name category, p.status, p.description
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ${id} LIMIT 1
  `)
  const produto = produtos[0]
  if (!produto) notFound()

  const variantes = db.all<{
    id: string; sku: string; size: string; color: string | null
    price_in_cents: number; price_promo_in_cents: number | null
    stock: number; stock_reserved: number; available: number
  }>(sql`
    SELECT id, sku, size, color, price_in_cents, price_promo_in_cents, stock, stock_reserved, available
    FROM product_variants WHERE product_id = ${id} ORDER BY size ASC
  `)

  const imagens = db.all<{
    id: string; url: string; alt: string; sort_order: number; is_primary: number
  }>(sql`
    SELECT id, url, alt, sort_order, is_primary
    FROM product_images WHERE product_id = ${id} ORDER BY sort_order ASC
  `)

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13 }}>
        <Link href="/produtos" style={{ color: '#6B7280', textDecoration: 'none' }}>← Produtos</Link>
        <span style={{ color: '#2A3340' }}>/</span>
        <span style={{ color: '#9CA3AF' }}>{produto.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 22, margin: 0 }}>{produto.name}</h1>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
          background: produto.status === 'published' ? '#2CB35A22' : produto.status === 'archived' ? '#E23B3B22' : '#F59E0B22',
          color: produto.status === 'published' ? '#2CB35A' : produto.status === 'archived' ? '#E23B3B' : '#F59E0B',
        }}>
          {produto.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Imagens */}
        <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 24 }}>
          <ImageManager productId={produto.id} initialImages={imagens} />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Info */}
          <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, color: '#4A5462', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 14px' }}>Produto</p>
            {[
              ['Marca', produto.brand_name],
              ['Categoria', produto.category],
              ['Slug', produto.slug],
            ].map(([label, val]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: 13, margin: 0, fontFamily: label === 'Slug' ? 'JetBrains Mono, monospace' : 'inherit', color: '#D1D5DB' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Variantes */}
          <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, color: '#4A5462', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 14px' }}>
              Variantes <span style={{ color: '#6B7280', fontWeight: 400 }}>({variantes.length})</span>
            </p>
            {variantes.length === 0 ? (
              <p style={{ fontSize: 13, color: '#4A5462', margin: 0 }}>Nenhuma variante.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {variantes.map(v => {
                  const disponivel = v.stock - v.stock_reserved
                  return (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 8, background: '#141922', border: '1px solid #1E2530' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{v.size}</span>
                        {v.color && <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 6 }}>{v.color}</span>}
                        <p style={{ fontSize: 11, color: '#4A5462', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>{v.sku}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: v.price_promo_in_cents ? '#2CB35A' : '#D1D5DB' }}>
                          {fmt(v.price_promo_in_cents ?? v.price_in_cents)}
                        </p>
                        <p style={{ fontSize: 11, margin: '2px 0 0', color: disponivel <= 0 ? '#E23B3B' : disponivel <= 3 ? '#F59E0B' : '#6B7280' }}>
                          stock: {disponivel}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
