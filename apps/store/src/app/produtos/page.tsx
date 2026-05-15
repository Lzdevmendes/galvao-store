import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ProductCard, type ProductCardData } from '@/components/catalog/product-card'

export const revalidate = 300

export const metadata: Metadata = {
  title: "Todos os Produtos — Galvão's Store",
  description: 'Chuteiras, tênis e acessórios Nike, Adidas, Puma, Umbro. Frete grátis acima de R$ 399.',
}

export default async function ProdutosPage() {
  const products = db.all<ProductCardData>(sql`
    SELECT p.id, p.slug, p.name, b.name as brand_name, p.badge,
           COALESCE(pi.url, '') as image_url,
           COALESCE(pi.alt, p.name) as image_alt,
           MIN(v.price_in_cents) as min_price,
           MIN(v.price_promo_in_cents) as min_promo
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    LEFT JOIN product_variants v ON v.product_id = p.id AND v.available = 1
    WHERE p.status = 'published'
    GROUP BY p.id
    ORDER BY p.rating DESC, p.review_count DESC, p.created_at DESC
  `)

  return (
    <>
      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg,#0B0E12,#1F252E)', color: '#fff', padding: '48px 0 40px' }}>
        <div className="container">
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 12, fontWeight: 700 }}>
            Catálogo completo
          </div>
          <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(56px,8vw,112px)', lineHeight: .9, margin: 0 }}>
            TODOS OS<br /><span style={{ color: 'var(--brand-orange)' }}>PRODUTOS.</span>
          </h1>
        </div>
      </div>

      {/* Grid */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>
            {products.length} {products.length === 1 ? 'produto' : 'produtos'}
          </div>
        </div>
        <div className="grid-products" data-density="4">
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </>
  )
}
