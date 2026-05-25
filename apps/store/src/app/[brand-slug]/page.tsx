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
      {/* Hero */}
      <div style={{ background: gradient, color: '#fff', padding: '56px 0 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', right:'-5%', top:'-30%', width:'50%', height:'160%', background:'radial-gradient(ellipse,rgba(242,107,31,.2) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          {brand.tagline && (
            <div style={{ fontFamily:'var(--font-ui)', fontSize:11, letterSpacing:'.32em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:14, fontWeight:700 }}>
              {brand.tagline}
            </div>
          )}
          <h1 style={{ fontFamily:'var(--font-stencil)', fontSize:'clamp(80px,10vw,140px)', lineHeight:.88, margin:'0 0 16px', letterSpacing:'.03em' }}>
            {brand.name.toUpperCase()}
          </h1>
        </div>
      </div>

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
            <p style={{ fontSize:40, marginBottom:12 }}>😕</p>
            <p>Nenhum produto com esses filtros. <a href={`/${slug}`} style={{ color:'var(--brand-orange)' }}>Ver todos</a></p>
          </div>
        ) : (
          <>
            <div className="grid-products" data-density="4">
              {products.map(p => <ProductCard key={p.id} p={p} />)}
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
