import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ProductCard, type ProductCardData } from '@/components/catalog/product-card'

export const revalidate = 300

interface BrandRow {
  id: string; slug: string; name: string; tagline: string | null
  gradient_css: string | null; description: string | null
}

export async function generateStaticParams() {
  const brands = db.all<{ slug: string }>(sql`SELECT slug FROM brands WHERE active = 1`)
  return brands.map(b => ({ 'brand-slug': b.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ 'brand-slug': string }> }
): Promise<Metadata> {
  const { 'brand-slug': slug } = await params
  const [brand] = db.all<BrandRow>(sql`SELECT * FROM brands WHERE slug = ${slug} AND active = 1`)
  if (!brand) return {}
  return {
    title: `${brand.name} — Chuteiras e Tênis`,
    description: `${brand.tagline ?? ''} Todos os modelos ${brand.name} na Galvão's Store. Frete grátis acima de R$ 399.`,
  }
}

export default async function BrandPage(
  { params }: { params: Promise<{ 'brand-slug': string }> }
) {
  const { 'brand-slug': slug } = await params

  const [brand] = db.all<BrandRow>(sql`
    SELECT id, slug, name, tagline, gradient_css, description
    FROM brands WHERE slug = ${slug} AND active = 1
  `)
  if (!brand) notFound()

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
    WHERE p.brand_id = ${brand.id} AND p.status = 'published'
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `)

  const lines = db.all<{ line: string }>(sql`
    SELECT DISTINCT line FROM products
    WHERE brand_id = ${brand.id} AND line IS NOT NULL AND status = 'published'
    ORDER BY line
  `)

  const gradient = brand.gradient_css ?? 'linear-gradient(135deg,#0B0E12,#1F252E)'

  return (
    <>
      {/* Hero */}
      <div style={{ background: gradient, color: '#fff', padding: '64px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-5%', top: '-30%', width: '50%', height: '160%', background: 'radial-gradient(ellipse,rgba(242,107,31,.2) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {brand.tagline && (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 16, fontWeight: 700 }}>
              {brand.tagline}
            </div>
          )}
          <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(80px,10vw,144px)', lineHeight: .88, margin: '0 0 20px', letterSpacing: '.03em' }}>
            {brand.name.toUpperCase()}
          </h1>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
            {products.length} {products.length === 1 ? 'produto' : 'produtos'} disponíveis
          </div>
        </div>
      </div>

      {/* Sub-lines nav */}
      {lines.length > 0 && (
        <div style={{ background: 'var(--bg-elev)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
              <Link
                href={`/${slug}`}
                style={{ padding: '14px 20px', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--brand-orange)', borderBottom: '2px solid var(--brand-orange)', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Todos
              </Link>
              {lines.map(l => (
                <Link
                  key={l.line}
                  href={`/${slug}?linha=${encodeURIComponent(l.line)}`}
                  style={{ padding: '14px 20px', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)', borderBottom: '2px solid transparent', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {l.line}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '96px 0', color: 'var(--fg-muted)' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>😕</p>
            <p>Nenhum produto disponível para {brand.name} no momento.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>
                {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
              </div>
            </div>
            <div className="grid-products" data-density="4">
              {products.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </>
        )}
      </div>
    </>
  )
}
