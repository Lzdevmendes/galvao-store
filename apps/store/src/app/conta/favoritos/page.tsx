import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ProductCard, type ProductCardData } from '@/components/catalog/product-card'

export default async function FavoritosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const products = await db.all<ProductCardData>(sql`
    SELECT p.id, p.slug, p.name, b.name AS brand_name, p.badge,
           COALESCE(pi.url, '') AS image_url, COALESCE(pi.alt, p.name) AS image_alt,
           MIN(v.price_in_cents) AS min_price, MIN(v.price_promo_in_cents) AS min_promo
    FROM wishlists w
    JOIN product_variants pv ON pv.id = w.variant_id
    JOIN products p ON p.id = pv.product_id
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    LEFT JOIN product_variants v ON v.product_id = p.id AND v.available = 1
    WHERE w.user_id = ${user.id}
    GROUP BY p.id
    ORDER BY w.created_at DESC
  `)

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/conta" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', textDecoration: 'none' }}>← Minha Conta</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '.04em', marginTop: 8, marginBottom: 0 }}>FAVORITOS</h1>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❤️</div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--fg-muted)', marginBottom: 20 }}>Nenhum produto favorito ainda.</p>
          <Link href="/produtos" style={{ display: 'inline-block', padding: '14px 28px', background: 'var(--brand-orange)', color: '#fff', borderRadius: 10, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  )
}
