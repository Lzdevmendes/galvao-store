import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBySlug, catalog } from '../../infrastructure/catalog/products'
import { useStore } from '../../shared/store'
import { formatBRL, getDiscountPct, getPixPrice, getInstallment } from '../../core/domain/product'
import { ProductCard } from '../../shared/product/ProductCard'

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const product = slug ? getBySlug(slug) : undefined
  const { wishlist, toggleWishlist, addToCart } = useStore()

  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [tab, setTab] = useState<'desc' | 'specs' | 'reviews' | 'trocas'>('desc')
  const [cep, setCep] = useState('')
  const [sizeErr, setSizeErr] = useState(false)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 96, color: 'var(--brand-orange)', lineHeight: 1 }}>404</div>
        <p style={{ color: 'var(--fg-muted)', margin: '16px 0 24px' }}>Produto não encontrado.</p>
        <button className="btn btn-primary" onClick={() => navigate('/produtos')}>Ver todos os produtos</button>
      </div>
    )
  }

  const isWished = wishlist.includes(product.id)
  const pct = getDiscountPct(product)
  const pix = getPixPrice(product.price)
  const inst = getInstallment(product.price)

  const handleBuy = () => {
    if (!selectedSize) { setSizeErr(true); return }
    addToCart(product, selectedSize)
    navigate('/carrinho')
  }

  const handleAdd = () => {
    if (!selectedSize) { setSizeErr(true); return }
    addToCart(product, selectedSize)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const related = catalog
    .filter(p => p.id !== product.id && (p.brand === product.brand || p.category === product.category))
    .slice(0, 4)

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="crumb">
        <Link to="/">Início</Link>
        <span className="sep">/</span>
        <Link to={`/marca/${product.brand.toLowerCase()}`}>{product.brand}</Link>
        <span className="sep">/</span>
        <Link to={`/categoria/${product.category.toLowerCase().split(' ')[0]}`}>{product.category}</Link>
        <span className="sep">/</span>
        <span className="now">{product.name} "{product.colorway}"</span>
      </div>

      <div className="pdp">
        {/* Gallery */}
        <div className="gallery">
          <div className="thumbs">
            {product.images.map((img, i) => (
              <div key={i} className={`thumb${selectedImg === i ? ' active' : ''}`} onClick={() => setSelectedImg(i)}>
                <img src={img.url} alt={img.alt} />
              </div>
            ))}
          </div>

          <div className="main-img">
            {product.badge && pct > 0 && (
              <span className="badge badge-sale" style={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}>−{pct}% OFF</span>
            )}
            <img src={product.images[selectedImg]?.url} alt={product.images[selectedImg]?.alt} />
            <button className="zoom" title="Ampliar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pdp-info">
          <div className="brand-row">
            <div className="brand">{product.brand}{product.line ? ` · Linha ${product.line}` : ''}</div>
            <button
              className="heart"
              onClick={() => toggleWishlist(product.id)}
              style={{ background: 'none', border: '1px solid var(--border-strong)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isWished ? 'var(--brand-red)' : 'var(--fg-muted)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
              </svg>
            </button>
          </div>

          <h1>{product.name} <span style={{ fontWeight: 400, color: 'var(--fg-muted)' }}>"{product.colorway}"</span></h1>
          <div className="sku">SKU {product.sku} · Cód. Fabricante {product.sku}</div>

          <div className="rating">
            <span className="stars">{'★'.repeat(Math.round(product.rating))}</span>
            <span><strong style={{ color: 'var(--fg)' }}>{product.rating}</strong> · {product.reviewCount} avaliações ·{' '}
              <a style={{ color: 'var(--brand-orange)', fontWeight: 600 }}>Ver tudo</a>
            </span>
          </div>

          {/* Price block */}
          <div className="price-block">
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="from">De {formatBRL(product.originalPrice)}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="price">{formatBRL(product.price)}</span>
              {pct > 0 && <span className="save">ECONOMIZE {formatBRL(product.originalPrice! - product.price)}</span>}
            </div>
            <div className="pix-line">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              No Pix: <strong>{formatBRL(pix)}</strong> (mais 5% OFF)
            </div>
            <div className="install">
              ou em <strong>12x de {formatBRL(inst)}</strong> sem juros no cartão ·{' '}
              <a style={{ color: 'var(--brand-orange)', fontWeight: 600 }}>ver parcelas</a>
            </div>
          </div>

          {/* Sizes */}
          <div className="option">
            <div className="label-row">
              <span>Tamanho (BR)</span>
              <a style={{ color: 'var(--brand-orange)', fontWeight: 600, fontSize: 12 }}>Tabela de tamanhos</a>
            </div>
            <div className="sizes-grid">
              {product.sizes.map(({ size, available }) => (
                <button
                  key={size}
                  className={`sz${selectedSize === size ? ' active' : ''}${!available ? ' out' : ''}`}
                  disabled={!available}
                  onClick={() => { setSelectedSize(size); setSizeErr(false) }}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeErr && (
              <p style={{ color: 'var(--brand-red)', fontSize: 13, marginTop: 8 }}>
                ⚠ Seleciona um tamanho antes de continuar.
              </p>
            )}
          </div>

          {/* Stock warning */}
          {selectedSize && product.sizes.find(s => s.size === selectedSize)?.stock === 1 && (
            <div className="stock-msg">⚡ Última unidade no tamanho {selectedSize} · garante já</div>
          )}

          {/* CTAs */}
          <div className="cta-stack">
            <button className="btn btn-primary" onClick={handleBuy}>
              Comprar agora · {formatBRL(product.price)}
            </button>
            <button className="btn btn-secondary" onClick={handleAdd}>
              {added ? '✓ Adicionado ao carrinho!' : 'Adicionar ao carrinho'}
            </button>
          </div>

          {/* Shipping calculator */}
          <div className="ship-calc">
            <div className="h">📦 Calcular frete e prazo</div>
            <div className="cep-row">
              <input
                value={cep}
                onChange={e => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="00000-000"
              />
              <button className="btn btn-ghost btn-sm">Calcular</button>
            </div>
            <div className="opt"><span>SEDEX · 2 dias úteis</span><strong>GRÁTIS</strong></div>
            <div className="opt"><span>SEDEX 10 · próximo dia útil</span><span>R$ 39,90</span></div>
            <div className="opt"><span>Retirada em loja (SP)</span><strong style={{ color: 'var(--brand-green)' }}>GRÁTIS</strong></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: 0, marginTop: 32 }}>
        {([
          { key: 'desc', label: 'Descrição' },
          { key: 'specs', label: 'Especificações' },
          { key: 'reviews', label: `Avaliações (${product.reviewCount})` },
          { key: 'trocas', label: 'Trocas & devoluções' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '14px 20px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14,
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.key ? '2px solid var(--brand-orange)' : '2px solid transparent',
              color: tab === t.key ? 'var(--brand-orange)' : 'var(--fg-muted)',
              marginBottom: -1, transition: 'all .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px 0 64px' }}>
        {tab === 'desc' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
            <div>
              <p style={{ color: 'var(--fg-muted)', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16 }}>Recomendada para</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {product.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 14, color: 'var(--fg-muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-green)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {product.images[1] && (
              <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--ink-100)', aspectRatio: '4/5' }}>
                <img src={product.images[1].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
              </div>
            )}
          </div>
        )}

        {tab === 'specs' && (
          <div style={{ maxWidth: 560 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20 }}>Especificações técnicas</h3>
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--fg-muted)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fg-muted)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 72, color: 'var(--brand-yellow)', lineHeight: 1 }}>{product.rating}</div>
            <p>{product.reviewCount} avaliações verificadas</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Sistema de avaliações em breve.</p>
          </div>
        )}

        {tab === 'trocas' && (
          <div style={{ maxWidth: 560, fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.7 }}>
            <p><strong style={{ color: 'var(--fg)' }}>Troca gratuita em até 30 dias</strong> após o recebimento.</p>
            <p style={{ marginTop: 12 }}>O produto deve estar na embalagem original, sem sinais de uso, com etiquetas.</p>
            <p style={{ marginTop: 12 }}>Solicite em <Link to="/conta" style={{ color: 'var(--brand-orange)', fontWeight: 600 }}>Minha Conta → Pedidos</Link>.</p>
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginBottom: 80 }}>
          <div className="section-head">
            <div className="left">
              <h2>PRODUTOS <span className="o">RELACIONADOS.</span></h2>
            </div>
          </div>
          <div className="grid" data-density="4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
