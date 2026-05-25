import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { queryProducts, queryAvailableSizes, type CatalogFilters } from '@/lib/catalog-query'
import { ProductCard } from '@/components/catalog/product-card'
import { FilterSortBar } from '@/components/catalog/filter-sort-bar'

export const revalidate = 300

interface CategoryRow {
  id: string; slug: string; name: string; surface_type: string | null
}

type SearchParams = Promise<{ tamanho?: string; sort?: string }>

export async function generateStaticParams() {
  const rows = await db.all<{ slug: string }>(sql`SELECT slug FROM categories`)
  return rows.map(c => ({ slug: c.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const [cat] = await db.all<CategoryRow>(sql`SELECT * FROM categories WHERE slug = ${slug}`)
  if (!cat) return {}
  return {
    title: `${cat.name} — Galvão's Store`,
    description: `Melhores ${cat.name.toLowerCase()} Nike, Adidas, Puma na Galvão's Store. Frete grátis acima de R$ 399.`,
  }
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: SearchParams
}) {
  const { slug } = await params
  const { tamanho = '', sort = 'relevancia' } = await searchParams

  const [cat] = await db.all<CategoryRow>(sql`SELECT * FROM categories WHERE slug = ${slug}`)
  if (!cat) notFound()

  const filters: CatalogFilters = {
    categoryId: cat.id,
    size:       tamanho || undefined,
    sort,
  }

  const [products, sizes] = await Promise.all([
    queryProducts(filters),
    queryAvailableSizes({ categoryId: cat.id }),
  ])

  return (
    <>
      <div style={{ background:'linear-gradient(135deg,#0B0E12,#1F252E)', color:'#fff', padding:'48px 0 40px' }}>
        <div className="container">
          {cat.surface_type && (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.28em', color:'var(--brand-teal)', marginBottom:12, fontWeight:700 }}>
              {cat.surface_type}
            </div>
          )}
          <h1 style={{ fontFamily:'var(--font-stencil)', fontSize:'clamp(56px,8vw,108px)', lineHeight:.9, margin:0 }}>
            {cat.name.toUpperCase()}
          </h1>
        </div>
      </div>

      <FilterSortBar
        total={products.length}
        availableSizes={sizes}
        currentSize={tamanho}
        currentSort={sort}
      />

      <div className="container" style={{ paddingTop:40, paddingBottom:96 }}>
        {products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'var(--fg-muted)' }}>
            <p>Nenhum produto nesta categoria ainda.</p>
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
