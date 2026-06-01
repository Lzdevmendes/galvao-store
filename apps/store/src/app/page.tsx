import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { ProductCard, type ProductCardData } from '@/components/catalog/product-card'
import { queryBrandsWithCount, queryCategoriesWithCount } from '@/lib/catalog-query'
import { fmt } from '@/lib/utils'
import { HomeAnimations } from '@/components/home-animations'
import { HomeNewsletter } from '@/components/home-newsletter'

export const revalidate = 300

export const metadata: Metadata = {
  title: "Galvão's Store — Chuteiras de Alta Performance",
  description: 'Nike, Adidas, Puma, Umbro. Frete grátis acima de R$ 399. 12x sem juros. 5% OFF no Pix.',
}

async function getFeatured(limit = 4, badge?: string): Promise<ProductCardData[]> {
  return badge
    ? await db.all<ProductCardData>(sql`
        SELECT p.id, p.slug, p.name, b.name as brand_name, p.badge,
               COALESCE(pi.url, '') as image_url,
               COALESCE(pi.alt, p.name) as image_alt,
               MIN(v.price_in_cents) as min_price,
               MIN(v.price_promo_in_cents) as min_promo
        FROM products p
        JOIN brands b ON b.id = p.brand_id
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
        LEFT JOIN product_variants v ON v.product_id = p.id AND v.available = 1
        WHERE p.status = 'published' AND p.badge = ${badge}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      `)
    : await db.all<ProductCardData>(sql`
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
        ORDER BY p.rating DESC, p.review_count DESC
        LIMIT ${limit}
      `)
}

function SectionHead({ pre, title, accent, href, linkLabel }: {
  pre?: string; title: string; accent: string; href?: string; linkLabel?: string
}) {
  return (
    <div className="section-head">
      <div className="left">
        {pre && <div className="pre">{pre}</div>}
        <h2>{title}<span className="o">{accent}</span></h2>
      </div>
      {href && <div className="right"><Link href={href}>{linkLabel ?? 'Ver tudo →'}</Link></div>}
    </div>
  )
}

const CATEGORY_ICON: Record<string, string> = {
  campo:        '⚽',
  society:      '🏟️',
  futsal:       '🏅',
  'tenis-casual':'👟',
  corrida:      '🏃',
  camisas:      '👕',
  meias:        '🧦',
}

export default async function HomePage() {
  const [arrivals, bestSellers, brands, categories] = await Promise.all([
    getFeatured(4, 'new'),
    getFeatured(8),
    queryBrandsWithCount(4),
    queryCategoriesWithCount(),
  ])

  const heroProduct = arrivals[0]

  return (
    <>
      <HomeAnimations />

      {/* ── Hero Desktop ── */}
      <section className="hero hero-desktop">
        <div className="container">
          <div className="row">
            <div>
              <div className="pre">PRONTA ENTREGA · LANÇAMENTO 2026</div>
              <h1>JOGO<br /><span className="t">RÁPIDO.</span></h1>
              <p>Phantom GX III, F50 Elite, Future 8 Ultimate. As chuteiras que fizeram a temporada já estão na Galvão&apos;s.</p>
              <div className="ctas">
                <Link href="/produtos" className="btn btn-primary btn-lg">Comprar agora</Link>
                <Link href="/busca?sort=lancamentos" className="btn btn-lg" style={{ background:'rgba(255,255,255,.1)', color:'#fff', border:'1px solid rgba(255,255,255,.2)' }}>Ver lançamentos</Link>
              </div>
            </div>
            <div className="photo">
              {heroProduct && (
                <Image src={heroProduct.image_url} alt={heroProduct.image_alt} width={500} height={500} priority style={{ width:'95%', height:'auto' }} />
              )}
              {heroProduct && (
                <div className="price-tag">
                  <span className="small">A PARTIR DE</span>
                  {fmt(heroProduct.min_promo ?? heroProduct.min_price)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Hero Mobile — foto rotacionada, compacto ── */}
      <div className="mhero-wrap">
        <div className="mhero" style={{ position:'relative', overflow:'hidden' }}>
          <div className="pre">PRONTA ENTREGA · 2026</div>
          <h1>JOGO<br /><span className="t">RÁPIDO.</span></h1>
          <p style={{ maxWidth:180 }}>Phantom GX III, F50 Elite e Future 8. Já tão aqui.</p>
          <Link href="/produtos" className="btn">Comprar →</Link>
          {heroProduct && (
            <div className="mhero-photo">
              <Image src={heroProduct.image_url} alt={heroProduct.image_alt} width={200} height={200} priority />
            </div>
          )}
        </div>

        {/* Category circles — scroll horizontal */}
        <div className="mcats">
          {[
            { href:'/categoria/campo',    label:'Campo',    icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18L21 18L19 21L5 21ZM5 13Q12 8 19 13L19 18L5 18Z"/></svg> },
            { href:'/categoria/society',  label:'Society',  icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="20" r="1.5"/><circle cx="15" cy="20" r="1.5"/><path d="M5 13Q12 9 19 13L19 18L5 18Z"/></svg> },
            { href:'/categoria/futsal',   label:'Futsal',   icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M3 16L21 16L21 19L3 19ZM5 11Q12 8 19 11L19 16L5 16Z"/></svg> },
            { href:'/categoria/corrida',  label:'Corrida',  icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 17Q12 11 21 17L21 19L3 19Z"/><path d="M5 14L8 11L13 13L18 11"/></svg> },
            { href:'/produtos',           label:'Casual',   icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 17Q12 11 21 17L21 19L3 19Z"/></svg> },
          ].map(({ href, label, icon }) => (
            <Link key={label} href={href} className="mcat" style={{ textDecoration:'none', color:'var(--fg)' }}>
              <div className="circ">{icon}</div>
              <div className="name">{label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div className="trust">
        <div className="container">
          <div className="row">
            {[
              { icon:'💳', t:'12x sem juros',      s:'no cartão de crédito' },
              { icon:'🔒', t:'Compra 100% segura',  s:'site protegido por SSL' },
              { icon:'📦', t:'Frete grátis Brasil', s:'acima de R$ 399' },
              { icon:'✓',  t:'5% OFF no Pix',       s:'aprovação imediata' },
            ].map(({ icon, t, s }) => (
              <div key={t} className="item">
                <span style={{ fontSize:28 }}>{icon}</span>
                <div><div className="t">{t}</div><div className="s">{s}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── Lançamentos ── */}
        {arrivals.length > 0 && (
          <>
            <SectionHead pre="★ Recém-chegadas" title="LANÇA" accent="MENTOS." href="/busca?sort=lancamentos" />
            <div className="grid-products" data-density="4">
              {arrivals.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}
            </div>
          </>
        )}

        {/* ── Marcas — contagens reais da DB ── */}
        <SectionHead pre="Compre por marca" title="SUA " accent="MARCA." />
        <div className="brand-row">
          {brands.map(b => (
            <Link key={b.slug} href={`/${b.slug}`} className={`brand-banner ${b.slug}`}>
              <div className="logo">{b.name.toUpperCase()}</div>
              <div className="meta">
                <div className="count">{b.count} {b.count === 1 ? 'produto' : 'produtos'}</div>
                <div className="arrow">→</div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Categorias — contagens reais da DB ── */}
        <SectionHead pre="Onde você joga?" title="POR " accent="CATEGORIA." />
        <div className="cat-row">
          {categories.slice(0, 5).map(c => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="cat-tile" style={{ display:'block' }}>
              <div className="ico" style={{ fontSize:28 }}>{CATEGORY_ICON[c.slug] ?? '👟'}</div>
              <div className="name">{c.name}</div>
              <div className="count">{c.count} {c.count === 1 ? 'modelo' : 'modelos'}</div>
            </Link>
          ))}
        </div>

        {/* ── Newsletter ── */}
        <div style={{ margin:'48px 0' }}>
          <HomeNewsletter />
        </div>

        {/* ── Mais vendidas ── */}
        <SectionHead pre="★ Top 8 da semana" title="MAIS " accent="VENDIDAS." href="/produtos" linkLabel="Ver catálogo completo →" />
        <div className="grid-products" data-density="4" style={{ marginBottom:96 }}>
          {bestSellers.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </>
  )
}
