import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../core/domain/product';
import { getDiscountPct, getPixPrice, getInstallment, formatBRL } from '../../core/domain/product';
import { useStore } from '../store';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [imgErr, setImgErr] = useState(false);
  const isWished = wishlist.includes(product.id);
  const pct = getDiscountPct(product);
  const pix = getPixPrice(product.price);
  const inst = getInstallment(product.price);
  const firstAvail = product.sizes.find(s => s.available);

  return (
    <article className="pcard" onClick={() => navigate(`/produto/${product.slug}`)}>
      {/* Image area */}
      <div className="img">
        <div className="top-tags">
          {product.badge === 'new' && <span className="badge badge-new">LANÇAMENTO</span>}
          {product.badge === 'sale' && pct > 0 && <span className="badge badge-sale">-{pct}% OFF</span>}
          {product.badge === 'bestseller' && <span className="badge badge-orange">★ TOP</span>}
          {product.badge === 'exclusive' && <span className="badge badge-teal">EXCLUSIVO</span>}

          <button
            className={`heart${isWished ? ' wished' : ''}`}
            onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
            aria-label={isWished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
          </button>
        </div>

        {imgErr ? (
          <div style={{ width: '92%', height: '92%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-faint)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 3 18 18"/></svg>
          </div>
        ) : (
          <img src={product.images[0]?.url} alt={product.images[0]?.alt} onError={() => setImgErr(true)} />
        )}
      </div>

      {/* Info */}
      <div className="info">
        <div className="brand">{product.brand}</div>
        <div className="name">{product.name} <span style={{ fontWeight: 400, color: 'var(--fg-muted)' }}>"{product.colorway}"</span></div>

        <div className="price-row">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="from">{formatBRL(product.originalPrice)}</span>
          )}
          <span className="price">{formatBRL(product.price)}</span>
        </div>
        <div className="pix">
          12x {formatBRL(inst)} ou <strong>{formatBRL(pix)} no Pix</strong>
        </div>
      </div>

      {/* Quick add on hover — only shows via CSS :hover parent */}
      {firstAvail && (
        <button
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'var(--brand-orange)', color: '#fff',
            border: 'none', padding: '10px', fontFamily: 'var(--font-ui)',
            fontWeight: 700, fontSize: 12, letterSpacing: '.1em', cursor: 'pointer',
            opacity: 0, transition: 'opacity .2s',
          }}
          className="quick-add"
          onClick={e => { e.stopPropagation(); addToCart(product, firstAvail.size); }}
        >
          + ADICIONAR · TAM {firstAvail.size}
        </button>
      )}
    </article>
  );
}
