import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const revalidate = 300

export const metadata: Metadata = {
  title: "Galvão's Store — Chuteiras de Alta Performance",
  description: 'Nike, Adidas, Puma, Umbro. Frete grátis acima de R$ 399. 12x sem juros. 5% OFF no Pix.',
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface ProductRow {
  id: string; slug: string; name: string; brand_name: string; badge: string | null
  image_url: string; image_alt: string
  min_price: number; min_promo: number | null
}

async function getFeatured(limit = 4, badge?: string): Promise<ProductRow[]> {
  const rows = badge
    ? db.all<ProductRow>(sql`
        SELECT p.id, p.slug, p.name, b.name as brand_name, p.badge,
               COALESCE(pi.url, '/products/placeholder.jpg') as image_url,
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
    : db.all<ProductRow>(sql`
        SELECT p.id, p.slug, p.name, b.name as brand_name, p.badge,
               COALESCE(pi.url, '/products/placeholder.jpg') as image_url,
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
  return rows
}

function ProductCard({ p }: { p: ProductRow }) {
  const active = p.min_promo ?? p.min_price
  const pix    = active * 0.95
  const inst   = active / 12

  const badgeEl = p.badge === 'new'        ? <span style={{ background:'#0B0E12', color:'#fff', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)', letterSpacing:'.04em' }}>LANÇAMENTO</span>
                : p.badge === 'sale'        ? <span style={{ background:'#E23B3B', color:'#fff', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)' }}>OFERTA</span>
                : p.badge === 'bestseller'  ? <span style={{ background:'#FFC83A', color:'#0B0E12', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)' }}>★ TOP</span>
                : p.badge === 'exclusive'   ? <span style={{ background:'#0B0E12', color:'#fff', border:'1px solid #F26B1F', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)' }}>EXCLUSIVO</span>
                : null

  return (
    <Link href={`/produto/${p.slug}`} className="pcard" style={{ display:'block' }}>
      <div className="img">
        {badgeEl && <div className="top-tags">{badgeEl}</div>}
        <Image
          src={p.image_url} alt={p.image_alt}
          width={400} height={400}
          style={{ width:'92%', height:'92%', objectFit:'contain', mixBlendMode:'multiply' }}
          loading="lazy"
        />
      </div>
      <div className="info">
        <div className="brand">{p.brand_name}</div>
        <div className="name">{p.name}</div>
        <div className="price-row">
          {p.min_promo && p.min_promo < p.min_price && (
            <span className="from">{fmt(p.min_price)}</span>
          )}
          <span className="price">{fmt(active)}</span>
        </div>
        <div className="pix">
          12× {fmt(inst)} ou <strong>{fmt(pix)} no Pix</strong>
        </div>
      </div>
    </Link>
  )
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

export default async function HomePage() {
  const [arrivals, bestSellers] = await Promise.all([
    getFeatured(4, 'new'),
    getFeatured(8),
  ])

  const heroProduct = arrivals[0]

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="row">
            <div>
              <div className="pre">PRONTA ENTREGA · LANÇAMENTO 2026</div>
              <h1>JOGO<br /><span className="t">RÁPIDO.</span></h1>
              <p>Phantom GX III, F50 Elite, Future 8 Ultimate. As chuteiras que fizeram a temporada já estão na Galvão&apos;s.</p>
              <div className="ctas">
                <Link href="/produtos" className="btn btn-primary btn-lg">Comprar agora</Link>
                <Link href="/lancamentos" className="btn btn-lg" style={{ background:'rgba(255,255,255,.1)', color:'#fff', border:'1px solid rgba(255,255,255,.2)' }}>Ver lançamentos</Link>
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
            <SectionHead pre="★ Recém-chegadas" title="LANÇA" accent="MENTOS." href="/lancamentos" />
            <div className="grid-products" data-density="4">
              {arrivals.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </>
        )}

        {/* ── Marcas ── */}
        <SectionHead pre="Compre por marca" title="SUA " accent="MARCA." />
        <div className="brand-row">
          {[
            { slug:'nike',   cls:'nike',   label:'NIKE',   count:142 },
            { slug:'adidas', cls:'adidas', label:'ADIDAS', count:98  },
            { slug:'puma',   cls:'puma',   label:'PUMA',   count:64  },
            { slug:'umbro',  cls:'umbro',  label:'UMBRO',  count:38  },
          ].map(b => (
            <Link key={b.slug} href={`/${b.slug}`} className={`brand-banner ${b.cls}`}>
              <div className="logo">{b.label}</div>
              <div className="meta">
                <div className="count">{b.count} produtos</div>
                <div className="arrow">→</div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Categorias ── */}
        <SectionHead pre="Onde você joga?" title="POR " accent="CATEGORIA." />
        <div className="cat-row">
          {[
            { slug:'campo',        name:'Campo (FG)',   count:'189 modelos', icon:'⚽' },
            { slug:'society',      name:'Society (SG)', count:'76 modelos',  icon:'🏟️' },
            { slug:'futsal',       name:'Futsal',       count:'54 modelos',  icon:'🏅' },
            { slug:'tenis-casual', name:'Tênis Casual', count:'123 modelos', icon:'👟' },
            { slug:'corrida',      name:'Corrida',      count:'87 modelos',  icon:'🏃' },
          ].map(c => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="cat-tile" style={{ display:'block' }}>
              <div className="ico" style={{ fontSize:28 }}>{c.icon}</div>
              <div className="name">{c.name}</div>
              <div className="count">{c.count}</div>
            </Link>
          ))}
        </div>

        {/* ── Newsletter ── */}
        <div style={{ margin:'48px 0' }}>
          <div className="cta-banner">
            <div>
              <h3>BORA<br />JOGAR.</h3>
              <p>Cadastra teu e-mail. Avisamos em primeira mão dos lançamentos e ofertas relâmpago.</p>
            </div>
            <div className="right">
              <input type="email" placeholder="seu@email.com" required
                style={{ width:'100%', padding:'14px 16px', border:'1px solid rgba(255,255,255,.3)', borderRadius:10, background:'rgba(255,255,255,.15)', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none', marginBottom:10, display:'block' }} />
              <button className="btn btn-lg" style={{ background:'#fff', color:'#0B0E12', width:'100%' }}>Quero entrar →</button>
              <p style={{ marginTop:8, fontSize:12, opacity:.8 }}>Já são 12.430 craques no time.</p>
            </div>
          </div>
        </div>

        {/* ── Mais vendidas ── */}
        <SectionHead pre="★ Top 8 da semana" title="MAIS " accent="VENDIDAS." href="/mais-vendidas" linkLabel="Ver ranking completo →" />
        <div className="grid-products" data-density="4" style={{ marginBottom:96 }}>
          {bestSellers.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </>
  )
}
