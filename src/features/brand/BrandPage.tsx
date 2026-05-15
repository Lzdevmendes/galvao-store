import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { catalog } from '../../infrastructure/catalog/products'
import { applyFilters, sortProducts, defaultFilters } from '../../core/usecases/filters'
import type { SortOption } from '../../core/usecases/filters'
import { ProductCard } from '../../shared/product/ProductCard'
import type { Brand } from '../../core/domain/product'

interface BrandConfig {
  cls: string
  name: string
  tagline: string
  description: string
  heroImg: string
  lines: { label: string; slug: string }[]
  startingFrom: string
}

const brandConfigs: Record<string, BrandConfig> = {
  nike: {
    cls: 'nike',
    name: 'NIKE.',
    tagline: 'Just do it · Brasil · 142 produtos',
    description: 'Phantom GX, Mercurial, Tiempo. As chuteiras que vestem os melhores do mundo. Tecnologia Air Zoom, Vaporposite+ e ACC para o jogador que exige o máximo.',
    heroImg: '/products/phantom-gx3/01.jpg',
    lines: [
      { label: 'Todas', slug: '' },
      { label: 'Phantom', slug: 'phantom' },
      { label: 'Mercurial', slug: 'mercurial' },
      { label: 'Tiempo', slug: 'tiempo' },
      { label: 'Superfly', slug: 'superfly' },
      { label: 'Pegasus', slug: 'pegasus' },
    ],
    startingFrom: 'R$ 399',
  },
  adidas: {
    cls: 'adidas',
    name: 'ADIDAS.',
    tagline: 'Three stripes · Brasil · 98 produtos',
    description: 'F50, Predator, Copa Pure. As três listras vestiram seleções e ganharam copas. Linha completa para quem joga o futebol que move o mundo.',
    heroImg: '/products/f50-elite/01.jpg',
    lines: [
      { label: 'Todas', slug: '' },
      { label: 'F50', slug: 'f50' },
      { label: 'Predator', slug: 'predator' },
      { label: 'Copa Pure', slug: 'copa' },
      { label: 'X Crazyfast', slug: 'crazyfast' },
    ],
    startingFrom: 'R$ 289',
  },
  puma: {
    cls: 'puma',
    name: 'PUMA.',
    tagline: 'Forever Faster · Brasil · 64 produtos',
    description: 'Future 8, King Platinum, Ultra. A Puma revolucionou o fit com FUZIONFIT+ e a leveza com MATRYXEVO. Para quem joga com estilo.',
    heroImg: '/products/future8/01.jpg',
    lines: [
      { label: 'Todas', slug: '' },
      { label: 'Future', slug: 'future' },
      { label: 'King', slug: 'king' },
      { label: 'Ultra', slug: 'ultra' },
    ],
    startingFrom: 'R$ 249',
  },
  umbro: {
    cls: 'umbro',
    name: 'UMBRO.',
    tagline: 'Est. 1924 · Brasil · 38 produtos',
    description: 'Tocco, Veloce, Medusae. Um século de futebol inglês numa chuteira. Para o jogador que respeita a história do jogo.',
    heroImg: '/products/predator-accuracy/01.jpg',
    lines: [
      { label: 'Todas', slug: '' },
      { label: 'Tocco', slug: 'tocco' },
      { label: 'Veloce', slug: 'veloce' },
    ],
    startingFrom: 'R$ 189',
  },
}

const brandMeta: Record<string, { products: number; news: number; sale: number }> = {
  nike:   { products: 142, news: 18, sale: 32 },
  adidas: { products: 98,  news: 14, sale: 27 },
  puma:   { products: 64,  news: 8,  sale: 15 },
  umbro:  { products: 38,  news: 4,  sale: 9  },
}

export function BrandPage() {
  const { brand = 'nike' } = useParams<{ brand: string }>()
  const cfg = brandConfigs[brand.toLowerCase()] ?? brandConfigs.nike
  const meta = brandMeta[brand.toLowerCase()] ?? brandMeta.nike

  const [activeLine, setActiveLine] = useState('')
  const [sort, setSort] = useState<SortOption>('relevancia')
  const [sizes, setSizes] = useState<number[]>([])

  const toggleSize = (s: number) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const products = useMemo(() => {
    let list = applyFilters(catalog, {
      ...defaultFilters,
      brands: [brand.charAt(0).toUpperCase() + brand.slice(1) as Brand],
      sizes,
      query: activeLine,
    })
    return sortProducts(list, sort)
  }, [brand, activeLine, sort, sizes])

  return (
    <>
      {/* Brand Hero */}
      <div className={`bhero ${cfg.cls}`}>
        <div className="container">
          <div className="bhero-row">
            <div>
              <div className="pre">{cfg.tagline}</div>
              <h1>{cfg.name}</h1>
              <p>{cfg.description}</p>
              <div className="meta-row">
                {[
                  { k: 'Produtos',    v: meta.products.toString() },
                  { k: 'Lançamentos', v: meta.news.toString() },
                  { k: 'Em promoção', v: meta.sale.toString() },
                  { k: 'A partir de', v: cfg.startingFrom },
                ].map(m => (
                  <div key={m.k} className="meta-stat">
                    <div className="k">{m.k}</div>
                    <div className="v">{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bhero-photo">
              <img src={cfg.heroImg} alt={cfg.name} />
            </div>
          </div>
        </div>
        <div className="stripe" />
      </div>

      {/* Brand lines sub-nav */}
      <div className="brandlines">
        <div className="container">
          <div className="brandlines-row">
            {cfg.lines.map(l => (
              <button
                key={l.slug}
                className={`line-btn${activeLine === l.slug ? ' active' : ''}`}
                onClick={() => setActiveLine(l.slug)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listing */}
      <div className="container">
        <div className="listing-toolbar" style={{ marginTop: 24 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-muted)' }}>
            {products.length} produtos
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Size quick filters */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[40, 41, 42, 43, 44].map(s => (
                <button
                  key={s}
                  className={`sz-btn${sizes.includes(s) ? ' active' : ''}`}
                  onClick={() => toggleSize(s)}
                  style={{ fontSize: 11, padding: '4px 8px' }}
                >
                  {s}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              style={{ padding: '8px 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', background: 'var(--bg-elev)', color: 'var(--fg)', fontFamily: 'inherit', fontSize: 13 }}
            >
              <option value="relevancia">Relevância</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
              <option value="lancamentos">Lançamentos</option>
              <option value="mais-vendidos">Mais vendidos</option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)' }}>
            <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 64, opacity: .2 }}>:(</div>
            <p style={{ marginTop: 12 }}>Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid" data-density="4" style={{ marginTop: 16 }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </>
  )
}
