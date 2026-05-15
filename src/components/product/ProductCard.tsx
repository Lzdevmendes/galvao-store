import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { Badge, DiscountBadge } from '../ui/Badge';
import { useStore } from '../../store';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isWished = wishlist.includes(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const pixPrice = product.price * 0.95;
  const installment = product.price / 12;
  const availableSizes = product.sizes.filter(s => s.available);
  const firstAvailableSize = availableSizes[0];

  return (
    <article
      className={`group relative flex flex-col bg-(--bg-elev) rounded-lg overflow-hidden border border-(--border) hover:border-brand-orange/40 hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/produto/${product.slug}`)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-(--bg-sunk) overflow-hidden">
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {product.badge && <Badge type={product.badge} />}
          {hasDiscount && <DiscountBadge original={product.originalPrice!} current={product.price} />}
        </div>

        <button
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150
            ${isWished
              ? 'bg-brand-orange text-white'
              : 'bg-(--bg-elev)/80 text-(--fg-muted) hover:text-brand-orange hover:bg-(--bg-elev)'
            }`}
          onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
          aria-label={isWished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart size={14} fill={isWished ? 'currentColor' : 'none'} />
        </button>

        {imgError ? (
          <div className="w-full h-full flex items-center justify-center text-(--fg-faint)">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m3 3 18 18" />
            </svg>
          </div>
        ) : (
          <img
            src={product.images[0]?.url}
            alt={product.images[0]?.alt || product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        {/* Quick add overlay */}
        {hovered && firstAvailableSize && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-brand-orange text-white text-xs font-semibold font-ui py-2.5 text-center tracking-wide"
            onClick={e => {
              e.stopPropagation();
              addToCart(product, firstAvailableSize.size);
            }}
          >
            + ADICIONAR · TAM {firstAvailableSize.size}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3.5 flex-1">
        <div className="text-[10px] font-bold font-ui text-(--fg-faint) uppercase tracking-widest">
          {product.brand}
        </div>
        <div className="text-sm font-semibold text-(--fg) leading-snug line-clamp-2">
          {product.name} <span className="text-(--fg-muted) font-normal">"{product.colorway}"</span>
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-0.5">
          {hasDiscount && (
            <div className="text-[11px] text-(--fg-faint) line-through">
              {product.originalPrice!.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          )}
          <div className="text-base font-bold font-ui text-(--fg)">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-[11px] text-(--fg-muted)">
            12x {installment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ou{' '}
            <span className="text-brand-green font-semibold">
              {pixPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no Pix
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
