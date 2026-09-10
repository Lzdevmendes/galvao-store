import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { queryProducts, queryAvailableSizes, queryProductsCount, PAGE_SIZE, type CatalogFilters } from '@/lib/catalog-query'
import { ProductCard } from '@/components/catalog/product-card'
import { FilterSortBar } from '@/components/catalog/filter-sort-bar'

export const revalidate = 300

export const metadata: Metadata = {
  title: "Todos os Produtos — Galvão's Store",
  description: 'Chuteiras, tênis e acessórios Nike, Adidas, Puma, Umbro. Frete grátis acima de R$ 399.',
}

type SearchParams = Promise<{ marca?: string; categoria?: string; tamanho?: string; sort?: string; page?: string }>

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { marca = '', categoria = '', tamanho = '', sort = 'relevancia', page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  // Resolve IDs a partir de slugs
  const brandId = marca
    ? (await db.all<{ id: string }>(sql`SELECT id FROM brands WHERE slug = ${marca} AND active = 1`))[0]?.id
    : undefined
  const categoryId = categoria
    ? (await db.all<{ id: string }>(sql`SELECT id FROM categories WHERE slug = ${categoria}`))[0]?.id
    : undefined

  const filters: CatalogFilters = {
    brandId, categoryId,
    size: tamanho || undefined,
    sort, page,
  }

  const [products, total, sizes, brands, categories] = await Promise.all([
    queryProducts(filters),
    queryProductsCount({ brandId, categoryId, size: tamanho || undefined }),
    queryAvailableSizes({ brandId, categoryId }),
    db.all<{ slug: string; name: string }>(sql`
      SELECT slug, name FROM brands WHERE active = 1 ORDER BY name
    `),
    db.all<{ slug: string; name: string }>(sql`
      SELECT c.slug, c.name FROM categories c
      JOIN products p ON p.category_id = c.id AND p.status = 'published'
      GROUP BY c.id ORDER BY c.sort_order
    `),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (marca) params.set('marca', marca)
    if (categoria) params.set('categoria', categoria)
    if (tamanho) params.set('tamanho', tamanho)
    if (sort !== 'relevancia') params.set('sort', sort)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `/produtos${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      {/* Header Mobile compacto */}
      <div className="lhead-m">
        <div className="crumb">CATÁLOGO COMPLETO</div>
        <h1>PRODUTOS<span className="o">.</span></h1>
        <div className="sub">{total} {total === 1 ? 'produto' : 'produtos'}</div>
      </div>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0B0E12,#1F252E)', color:'#fff', padding:'48px 0 40px' }}>
        <div className="container">
          <div style={{ fontFamily:'var(--font-ui)', fontSize:11, letterSpacing:'.32em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:12, fontWeight:700 }}>
            Catálogo completo
          </div>
          <h1 style={{ fontFamily:'var(--font-stencil)', fontSize:'clamp(56px,8vw,108px)', lineHeight:.9, margin:0 }}>
            TODOS OS<br /><span style={{ color:'var(--brand-orange)' }}>PRODUTOS.</span>
          </h1>
        </div>
      </div>

      {/* Filtros de marca + categoria */}
      <div style={{ background:'var(--bg-elev)', borderBottom:'1px solid var(--border)', padding:'12px 0' }}>
        <div className="container" style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-ui)', fontSize:12, fontWeight:700, color:'var(--fg-muted)', marginRight:4 }}>Marca:</span>
          <BrandFilter slug={''} label="Todas" active={!marca} />
          {brands.map(b => <BrandFilter key={b.slug} slug={b.slug} label={b.name} active={marca === b.slug} />)}
          <span style={{ fontFamily:'var(--font-ui)', fontSize:12, fontWeight:700, color:'var(--fg-muted)', marginLeft:8, marginRight:4 }}>Categoria:</span>
          <CatFilter slug={''} label="Todas" active={!categoria} />
          {categories.map(c => <CatFilter key={c.slug} slug={c.slug} label={c.name} active={categoria === c.slug} />)}
        </div>
      </div>

      {/* Sort + tamanho */}
      <FilterSortBar
        total={total}
        availableSizes={sizes}
        currentSize={tamanho}
        currentSort={sort}
      />

      {/* Grid */}
      <div className="container" style={{ paddingTop:40, paddingBottom:96 }}>
        {products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'var(--fg-muted)' }}>
            <p style={{ fontSize:40, marginBottom:12 }}>😕</p>
            <p>Nenhum produto com esses filtros. <Link href="/produtos" style={{ color:'var(--brand-orange)' }}>Ver todos</Link></p>
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

// ── Chips de filtro (links para manter SEO) ────────────────────────────────

function BrandFilter({ slug, label, active }: { slug: string; label: string; active: boolean }) {
  const href = slug ? `/produtos?marca=${slug}` : '/produtos'
  return (
    <Link href={href} style={{
      padding:'5px 12px', borderRadius:8, fontSize:12, fontFamily:'var(--font-ui)', fontWeight:600,
      border:      active ? '1.5px solid var(--brand-orange)' : '1.5px solid var(--border)',
      background:  active ? 'var(--brand-orange)' : 'transparent',
      color:       active ? '#fff' : 'var(--fg-muted)',
      textDecoration: 'none',
    }}>
      {label}
    </Link>
  )
}

function CatFilter({ slug, label, active }: { slug: string; label: string; active: boolean }) {
  const href = slug ? `/produtos?categoria=${slug}` : '/produtos'
  return (
    <Link href={href} style={{
      padding:'5px 12px', borderRadius:8, fontSize:12, fontFamily:'var(--font-ui)', fontWeight:600,
      border:      active ? '1.5px solid var(--brand-teal)' : '1.5px solid var(--border)',
      background:  active ? 'var(--brand-teal)' : 'transparent',
      color:       active ? '#fff' : 'var(--fg-muted)',
      textDecoration: 'none',
    }}>
      {label}
    </Link>
  )
}
