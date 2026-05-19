import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ProductCard, type ProductCardData } from '@/components/catalog/product-card'
import { SizePicker } from './size-picker'
import { ProductGallery } from './product-gallery'
import { WishlistButton } from '@/components/catalog/wishlist-button'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 300

interface ProductRow {
  id: string; slug: string; name: string; badge: string | null; line: string | null
  description: string; features: string; specs: string
  brand_id: string; brand_name: string; brand_slug: string; brand_gradient: string | null
  category_name: string; category_slug: string
}

interface ImageRow {
  id: string; url: string; alt: string; is_primary: boolean; sort_order: number
}

interface VariantRow {
  id: string; sku: string; size: string; color: string
  price_in_cents: number; price_promo_in_cents: number | null
  stock: number; available: boolean
}

export async function generateStaticParams() {
  const products = db.all<{ slug: string }>(sql`SELECT slug FROM products WHERE status = 'published'`)
  return products.map(p => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://galvaosstore.com.br'

  const [p] = db.all<ProductRow & { meta_title: string | null; meta_description: string | null; meta_image: string | null; primary_image: string | null }>(sql`
    SELECT p.*, b.name as brand_name,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    WHERE p.slug = ${slug}
  `)
  if (!p) return { title: 'Produto não encontrado' }

  const title       = p.meta_title       ?? `${p.name} | Galvão's Store`
  const description = (p.meta_description ?? p.description).slice(0, 160)
  const image       = p.meta_image ?? p.primary_image

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/produto/${slug}`,
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: p.name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

export default async function ProdutoPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const [product] = db.all<ProductRow>(sql`
    SELECT p.id, p.slug, p.name, p.badge, p.line, p.description, p.features, p.specs,
           p.brand_id,
           b.name as brand_name, b.slug as brand_slug, b.gradient_css as brand_gradient,
           c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ${slug} AND p.status = 'published'
  `)
  if (!product) notFound()

  const images = db.all<ImageRow>(sql`
    SELECT id, url, alt, is_primary, sort_order FROM product_images
    WHERE product_id = ${product.id}
    ORDER BY is_primary DESC, sort_order ASC
  `)

  const variants = db.all<VariantRow>(sql`
    SELECT id, sku, size, color, price_in_cents, price_promo_in_cents, stock, available
    FROM product_variants
    WHERE product_id = ${product.id}
    ORDER BY color, CAST(size AS INTEGER)
  `)

  const related = db.all<ProductCardData>(sql`
    SELECT p.id, p.slug, p.name, b.name as brand_name, p.badge,
           COALESCE(pi.url, '') as image_url, COALESCE(pi.alt, p.name) as image_alt,
           MIN(v.price_in_cents) as min_price, MIN(v.price_promo_in_cents) as min_promo
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    LEFT JOIN product_variants v ON v.product_id = p.id AND v.available = 1
    WHERE p.brand_id = ${product.brand_id} AND p.id != ${product.id} AND p.status = 'published'
    GROUP BY p.id
    ORDER BY RANDOM()
    LIMIT 4
  `)

  const features: string[] = JSON.parse(product.features ?? '[]')
  const specs: Record<string, string> = JSON.parse(product.specs ?? '{}')
  const primaryImage = images.find(i => i.is_primary) ?? images[0]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const initialFavorited = user ? db.all(sql`
    SELECT w.id FROM wishlists w
    JOIN product_variants pv ON pv.id = w.variant_id
    WHERE w.user_id = ${user.id} AND pv.product_id = ${product.id}
    LIMIT 1
  `).length > 0 : false

  const badgeEl =
    product.badge === 'new'        ? <span style={{ background:'#0B0E12', color:'#fff', padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:700, fontFamily:'var(--font-ui)', letterSpacing:'.04em' }}>LANÇAMENTO</span>
  : product.badge === 'sale'       ? <span style={{ background:'#E23B3B', color:'#fff', padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:700, fontFamily:'var(--font-ui)' }}>OFERTA</span>
  : product.badge === 'bestseller' ? <span style={{ background:'#FFC83A', color:'#0B0E12', padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:700, fontFamily:'var(--font-ui)' }}>★ MAIS VENDIDO</span>
  : null

  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://galvaosstore.com.br'
  const minVariant = variants.reduce((a, b) => (a.price_in_cents < b.price_in_cents ? a : b), variants[0])

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand_name },
    category: product.category_name,
    image: images.map(i => `${BASE}${i.url}`),
    sku: variants[0]?.sku ?? product.slug,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      lowPrice: minVariant ? (minVariant.price_promo_in_cents ?? minVariant.price_in_cents) / 100 : 0,
      offerCount: variants.filter(v => v.available && v.stock > 0).length,
      availability: variants.some(v => v.available && v.stock > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: product.brand_name, item: `${BASE}/${product.brand_slug}` },
      { '@type': 'ListItem', position: 3, name: product.name,       item: `${BASE}/produto/${product.slug}` },
    ],
  }

  return (
    <div className="container page-pad" style={{ paddingTop: 32, paddingBottom: 96 }}>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', marginBottom: 32 }}>
        <Link href="/" style={{ color: 'var(--fg-muted)' }}>Início</Link>
        <span>›</span>
        <Link href={`/${product.brand_slug}`} style={{ color: 'var(--fg-muted)' }}>{product.brand_name}</Link>
        <span>›</span>
        <span style={{ color: 'var(--fg)' }}>{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="rg-pdp">

        {/* ── Gallery ── */}
        <div>
          <ProductGallery images={images} />
        </div>

        {/* ── Info ── */}
        <div>
          {/* Brand + line */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <Link href={`/${product.brand_slug}`} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              {product.brand_name}
            </Link>
            {product.line && (
              <>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-faint)' }}>{product.line}</span>
              </>
            )}
            {badgeEl && <div style={{ marginLeft: 'auto' }}>{badgeEl}</div>}
          </div>

          {/* Name + Wishlist */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, lineHeight: 1.15, margin: 0, color: 'var(--fg)', flex: 1 }}>
              {product.name}
            </h1>
            <WishlistButton
              productId={product.id}
              initialFavorited={initialFavorited}
              isLoggedIn={isLoggedIn}
            />
          </div>

          {/* Size picker + Price + CTAs (client component) */}
          <SizePicker
            variants={variants}
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            brandName={product.brand_name}
            imageUrl={primaryImage?.url ?? ''}
          />

          {/* Description */}
          <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.65, margin: 0 }}>
              {product.description}
            </p>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 12 }}>
                Destaques
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
                    <span style={{ color: 'var(--brand-orange)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specs */}
          {Object.keys(specs).length > 0 && (
            <div style={{ marginTop: 24, background: 'var(--bg-sunk)', borderRadius: 12, padding: '16px 20px' }}>
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 12 }}>
                Especificações
              </h3>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 24px', margin: 0 }}>
                {Object.entries(specs).map(([k, v]) => (
                  <>
                    <dt key={`k-${k}`} style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600 }}>{k}</dt>
                    <dd key={`v-${k}`} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg)', margin: 0 }}>{v}</dd>
                  </>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div style={{ marginTop: 80 }}>
          <div className="section-head">
            <div className="left">
              <div className="pre">Da mesma marca</div>
              <h2>TAMBÉM VÃO<span className="o"> GOSTAR.</span></h2>
            </div>
            <div className="right">
              <Link href={`/${product.brand_slug}`}>Ver todos da {product.brand_name} →</Link>
            </div>
          </div>
          <div className="grid-products" data-density="4">
            {related.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
