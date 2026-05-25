import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ImageManager from './image-manager'
import { ProductEditForm } from './product-edit-form'
import { VariantPriceForm } from './variant-price-form'
import { fmt } from '@/lib/utils'

export default async function ProdutoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [produto] = await db.all<{
    id: string; name: string; slug: string; brand_name: string
    category: string; status: string; description: string
    line: string | null; badge: string | null
    meta_title: string | null; meta_description: string | null
  }>(sql`
    SELECT p.id, p.name, p.slug, b.name brand_name, c.name category,
           p.status, p.description, p.line, p.badge, p.meta_title, p.meta_description
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ${id} LIMIT 1
  `)
  if (!produto) notFound()

  const variantes = await db.all<{
    id: string; sku: string; size: string; color: string | null
    price_in_cents: number; price_promo_in_cents: number | null
    cost_in_cents: number | null
    stock: number; stock_reserved: number; available: number
  }>(sql`
    SELECT id, sku, size, color, price_in_cents, price_promo_in_cents, cost_in_cents, stock, stock_reserved, available
    FROM product_variants WHERE product_id = ${id} ORDER BY CAST(size AS INTEGER), size
  `)

  const imagens = await db.all<{
    id: string; url: string; alt: string; sort_order: number; is_primary: number
  }>(sql`
    SELECT id, url, alt, sort_order, is_primary
    FROM product_images WHERE product_id = ${id} ORDER BY sort_order ASC
  `)

  const badgeColors: Record<string, string> = {
    new: '#3B82F6', sale: '#E23B3B', bestseller: '#F59E0B', exclusive: '#8B5CF6',
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13 }}>
        <Link href="/produtos" style={{ color: '#6B7280', textDecoration: 'none' }}>← Produtos</Link>
        <span style={{ color: '#2A3340' }}>/</span>
        <span style={{ color: '#9CA3AF' }}>{produto.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 22, margin: 0 }}>{produto.name}</h1>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
          background: produto.status === 'published' ? '#2CB35A22' : produto.status === 'archived' ? '#E23B3B22' : '#F59E0B22',
          color: produto.status === 'published' ? '#2CB35A' : produto.status === 'archived' ? '#E23B3B' : '#F59E0B',
        }}>
          {produto.status}
        </span>
        {produto.badge && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: `${badgeColors[produto.badge] ?? '#6B7280'}22`, color: badgeColors[produto.badge] ?? '#6B7280' }}>
            {produto.badge}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Imagens */}
          <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 24 }}>
            <ImageManager productId={produto.id} initialImages={imagens} />
          </div>

          {/* Edit form */}
          <ProductEditForm
            productId={produto.id}
            initial={{
              name:             produto.name,
              description:      produto.description,
              line:             produto.line,
              badge:            produto.badge,
              status:           produto.status,
              meta_title:       produto.meta_title,
              meta_description: produto.meta_description,
            }}
          />
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Info estática */}
          <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, color: '#4A5462', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 14px', fontWeight: 700 }}>Produto</p>
            {([
              ['Marca', produto.brand_name],
              ['Categoria', produto.category],
              ['Slug', produto.slug],
            ] as [string, string][]).map(([label, val]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: 13, margin: 0, fontFamily: label === 'Slug' ? 'JetBrains Mono, monospace' : 'inherit', color: '#D1D5DB', wordBreak: 'break-all' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Variantes */}
          <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, color: '#4A5462', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 14px', fontWeight: 700 }}>
              Variantes <span style={{ color: '#6B7280', fontWeight: 400 }}>({variantes.length})</span>
            </p>
            {variantes.length === 0 ? (
              <p style={{ fontSize: 13, color: '#4A5462', margin: 0 }}>Nenhuma variante. Adiciona tamanhos ao criar.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {variantes.map(v => {
                  const disponivel = v.stock - v.stock_reserved
                  return (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: '#141922', border: '1px solid #1E2530' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{v.size}</span>
                          {v.color && <span style={{ fontSize: 11, color: '#6B7280' }}>{v.color}</span>}
                        </div>
                        <p style={{ fontSize: 10, color: '#4A5462', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>{v.sku}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: v.price_promo_in_cents ? '#2CB35A' : '#D1D5DB' }}>
                          {fmt(v.price_promo_in_cents ?? v.price_in_cents)}
                        </p>
                        {v.price_promo_in_cents && (
                          <p style={{ fontSize: 10, margin: '1px 0', color: '#4A5462', textDecoration: 'line-through' }}>{fmt(v.price_in_cents)}</p>
                        )}
                        <p style={{ fontSize: 11, margin: '2px 0 0', color: disponivel <= 0 ? '#E23B3B' : disponivel <= 3 ? '#F59E0B' : '#6B7280' }}>
                          estoque: {disponivel}
                        </p>
                        <VariantPriceForm
                          variantId={v.id}
                          priceInCents={v.price_in_cents}
                          promoInCents={v.price_promo_in_cents}
                          costInCents={v.cost_in_cents}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {variantes.length > 0 && (
              <Link href="/estoque" style={{ display: 'block', marginTop: 12, fontSize: 12, color: '#F26B1F', textDecoration: 'none', textAlign: 'center' }}>
                Ajustar estoque →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
