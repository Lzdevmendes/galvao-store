import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import {
  queryProducts, queryAvailableSizes, queryBrandLines, queryProductsCount,
  PAGE_SIZE, type CatalogFilters,
} from '@/lib/catalog-query'
import { ProductCard } from '@/components/catalog/product-card'
import { FilterSortBar } from '@/components/catalog/filter-sort-bar'

export const revalidate = 300

interface BrandRow {
  id: string; slug: string; name: string; tagline: string | null; gradient_css: string | null
}

type SearchParams = Promise<{ linha?: string; tamanho?: string; sort?: string; page?: string }>

export async function generateStaticParams() {
  const rows = await db.all<{ slug: string }>(sql`SELECT slug FROM brands WHERE active = 1`)
  return rows.map(b => ({ 'brand-slug': b.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ 'brand-slug': string }> }
): Promise<Metadata> {
  const { 'brand-slug': slug } = await params
  const [brand] = await db.all<BrandRow>(sql`SELECT * FROM brands WHERE slug = ${slug} AND active = 1`)
  if (!brand) return {}
  return {
    title: `${brand.name} — Chuteiras e Tênis`,
    description: `Todos os modelos ${brand.name} na Galvão's Store. Frete grátis acima de R$ 399.`,
  }
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ 'brand-slug': string }>
  searchParams: SearchParams
}) {
  const { 'brand-slug': slug } = await params
  const { linha = '', tamanho = '', sort = 'relevancia', page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  const [brand] = await db.all<BrandRow>(sql`
    SELECT id, slug, name, tagline, gradient_css
    FROM   brands WHERE slug = ${slug} AND active = 1
  `)
  if (!brand) notFound()

  const filters: CatalogFilters = {
    brandId: brand.id,
    line:    linha || undefined,
    size:    tamanho || undefined,
    sort, page,
  }

  const [products, total, sizes, lines] = await Promise.all([
    queryProducts(filters),
    queryProductsCount({ brandId: brand.id, line: linha || undefined, size: tamanho || undefined }),
    queryAvailableSizes({ brandId: brand.id, line: linha || undefined }),
    queryBrandLines(brand.id),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const gradient = brand.gradient_css ?? 'linear-gradient(135deg,#0B0E12,#1F252E)'
  const minPrice = products.length > 0 ? Math.min(...products.map(p => p.min_promo ?? p.min_price)) : null

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (linha) params.set('linha', linha)
    if (tamanho) params.set('tamanho', tamanho)
    if (sort !== 'relevancia') params.set('sort', sort)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `/${slug}${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      {/* Header Mobile compacto */}
      <div className="lhead-m">
        <div className="crumb">PRODUTOS · {brand.name.toUpperCase()}</div>
        <h1>{brand.name.toUpperCase()}<span className="o">.</span></h1>
        <div className="sub">{total} produtos{lines.length > 0 ? ` · ${lines.join(' · ')}` : ''}</div>
      </div>

      {/* Hero Desktop — com stripe de cor da marca + meta stats */}
      <div className={`bhero ${slug}`} style={{ background: gradient }}>
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:48, alignItems:'center' }}>
            <div>
              {brand.tagline && (
                <div style={{ fontFamily:'var(--font-ui)', fontSize:11, letterSpacing:'.32em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:14, fontWeight:700 }}>
                  {brand.tagline}
                </div>
              )}
              <h1 style={{ fontFamily:'var(--font-stencil)', fontSize:'clamp(80px,10vw,140px)', lineHeight:.88, margin:0, letterSpacing:'.03em' }}>
                {brand.name.toUpperCase()}
              </h1>
              {/* Meta stats */}
              <div className="bhero-meta">
                <div className="bhero-meta-item">
                  <div className="k">Produtos</div>
                  <div className="v">{total}</div>
                </div>
                {lines.length > 0 && (
                  <div className="bhero-meta-item">
                    <div className="k">Linhas</div>
                    <div className="v">{lines.length}</div>
                  </div>
                )}
                {minPrice && (
                  <div className="bhero-meta-item">
                    <div className="k">A partir de</div>
                    <div className="v">R$ {(minPrice / 100).toFixed(0)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Stripe de cor — identidade visual da marca */}
        <div className="bhero-stripe" />
      </div>

      {/* Brand lines nav */}
      {lines.length > 0 && (
        <div className="brandlines">
          <div className="container">
            <div className="brandlines-row">
              <a href={`/${slug}`} className={!linha ? 'active' : ''}>Todos</a>
              {lines.map(l => (
                <a key={l} href={`/${slug}?linha=${encodeURIComponent(l)}${tamanho ? `&tamanho=${tamanho}` : ''}`} className={linha === l ? 'active' : ''}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <FilterSortBar
        total={total}
        availableSizes={sizes}
        lines={lines}
        currentLine={linha}
        currentSize={tamanho}
        currentSort={sort}
      />

      {/* Grid */}
      <div className="container" style={{ paddingTop:40, paddingBottom:96 }}>
        {products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'var(--fg-muted)' }}>
            {linha || tamanho ? (
              <>
                <p style={{ fontSize:40, marginBottom:12 }}>😕</p>
                <p>Nenhum produto com esses filtros. <a href={`/${slug}`} style={{ color:'var(--brand-orange)' }}>Ver todos</a></p>
              </>
            ) : (
              <>
                <p style={{ fontSize:40, marginBottom:12 }}>⚽</p>
                <p>Em breve, novidades {brand.name} na Galvão&apos;s. <a href="/produtos" style={{ color:'var(--brand-orange)' }}>Ver catálogo completo</a></p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid-products" data-density="4">
              {products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} index={i} />)}
            </div>
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
            )}
          </>
        )}
      </div>
    </>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, buildHref }: { page: number; totalPages: number; buildHref: (p: number) => string }) {
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= totalPages - 3) return totalPages - 6 + i
    return page - 3 + i
  })

  return (
    <nav style={{ display:'flex', justifyContent:'center', gap:8, marginTop:48, flexWrap:'wrap' }}>
      {page > 1 && (
        <Link href={buildHref(page - 1)} style={chipStyle(false)}>← Anterior</Link>
      )}
      {pages.map(p => (
        <Link key={p} href={buildHref(p)} style={chipStyle(p === page)}>{p}</Link>
      ))}
      {page < totalPages && (
        <Link href={buildHref(page + 1)} style={chipStyle(false)}>Próxima →</Link>
      )}
    </nav>
  )
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding:'8px 14px', borderRadius:8, fontSize:13, fontFamily:'var(--font-ui)', fontWeight:600,
    border: active ? '1.5px solid var(--brand-orange)' : '1.5px solid var(--border)',
    background: active ? 'var(--brand-orange)' : 'var(--bg-elev)',
    color: active ? '#fff' : 'var(--fg-muted)',
    textDecoration:'none',
  }
}
