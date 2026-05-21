import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ProductCard, type ProductCardData } from '@/components/catalog/product-card'

export const metadata: Metadata = { title: 'Ofertas — Galvão\'s Store' }

export default async function OfertasPage() {
  const products = db.all<ProductCardData>(sql`
    SELECT p.id, p.slug, p.name, b.name as brand_name, p.badge,
           COALESCE(pi.url, '') as image_url, COALESCE(pi.alt, p.name) as image_alt,
           MIN(pv.price_in_cents) as min_price, MIN(pv.price_promo_in_cents) as min_promo
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.available = 1
    WHERE p.status = 'published'
      AND (p.badge = 'sale' OR pv.price_promo_in_cents IS NOT NULL)
    GROUP BY p.id
    ORDER BY p.name ASC
  `)

  return (
    <div className="container page-pad" style={{ paddingTop: 40, paddingBottom: 96 }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 8, fontWeight: 700 }}>
          Promoções
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
          ★ OFERTAS
        </h1>
        {products.length > 0 && (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 8 }}>
            {products.length} produto{products.length !== 1 ? 's' : ''} em promoção
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Nenhuma oferta no momento</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)' }}>Novas promoções em breve. Cadastre-se para ser avisado!</p>
        </div>
      ) : (
        <div className="grid-products" data-density="4">
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  )
}
