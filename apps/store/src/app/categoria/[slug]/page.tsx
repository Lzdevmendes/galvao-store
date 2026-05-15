import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ProductCard, type ProductCardData } from '@/components/catalog/product-card'

export const revalidate = 300

interface CategoryRow {
  id: string; slug: string; name: string; surface_type: string | null; description: string | null
}

export async function generateStaticParams() {
  const cats = db.all<{ slug: string }>(sql`SELECT slug FROM categories`)
  return cats.map(c => ({ slug: c.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const [cat] = db.all<CategoryRow>(sql`SELECT * FROM categories WHERE slug = ${slug}`)
  if (!cat) return {}
  return {
    title: `${cat.name} — Chuteiras e Tênis`,
    description: `Melhores ${cat.name.toLowerCase()} Nike, Adidas, Puma. Frete grátis acima de R$ 399.`,
  }
}

export default async function CategoriaPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const [cat] = db.all<CategoryRow>(sql`SELECT * FROM categories WHERE slug = ${slug}`)
  if (!cat) notFound()

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
    WHERE p.category_id = ${cat.id} AND p.status = 'published'
    GROUP BY p.id
    ORDER BY p.rating DESC, p.review_count DESC
  `)

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg,#0B0E12,#1F252E)', color: '#fff', padding: '48px 0 40px' }}>
        <div className="container">
          {cat.surface_type && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.28em', color: 'var(--brand-teal)', marginBottom: 12, fontWeight: 700 }}>
              {cat.surface_type}
            </div>
          )}
          <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(56px,8vw,112px)', lineHeight: .9, margin: '0 0 12px' }}>
            {cat.name.toUpperCase()}
          </h1>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
            {products.length} {products.length === 1 ? 'produto' : 'produtos'}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '96px 0', color: 'var(--fg-muted)' }}>
            <p>Nenhum produto nesta categoria ainda.</p>
          </div>
        ) : (
          <div className="grid-products" data-density="4">
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </>
  )
}
