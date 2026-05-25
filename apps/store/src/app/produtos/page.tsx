import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { queryProducts, queryAvailableSizes, type CatalogFilters } from '@/lib/catalog-query'
import { ProductCard } from '@/components/catalog/product-card'
import { FilterSortBar } from '@/components/catalog/filter-sort-bar'

export const revalidate = 300

export const metadata: Metadata = {
  title: "Todos os Produtos — Galvão's Store",
  description: 'Chuteiras, tênis e acessórios Nike, Adidas, Puma, Umbro. Frete grátis acima de R$ 399.',
}

type SearchParams = Promise<{ marca?: string; categoria?: string; tamanho?: string; sort?: string }>

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { marca = '', categoria = '', tamanho = '', sort = 'relevancia' } = await searchParams

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
    sort,
  }

  const [products, sizes, brands, categories] = await Promise.all([
    queryProducts(filters),
    queryAvailableSizes({ brandId, categoryId }),
    await db.all<{ slug: string; name: string }>(sql`
      SELECT slug, name FROM brands WHERE active = 1 ORDER BY name
    `),
    await db.all<{ slug: string; name: string }>(sql`
      SELECT c.slug, c.name FROM categories c
      JOIN products p ON p.category_id = c.id AND p.status = 'published'
      GROUP BY c.id ORDER BY c.sort_order
    `),
  ])

  return (
    <>
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
        total={products.length}
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
          <div className="grid-products" data-density="4">
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </>
  )
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
