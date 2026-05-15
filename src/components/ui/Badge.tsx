import type { BadgeType } from '../../types';

const configs: Record<BadgeType, { label: string; className: string }> = {
  new: { label: 'LANÇAMENTO', className: 'bg-brand-teal text-white' },
  sale: { label: 'OFERTA', className: 'bg-brand-orange text-white' },
  bestseller: { label: '★ TOP VENDA', className: 'bg-brand-yellow text-ink-950' },
  exclusive: { label: 'EXCLUSIVO', className: 'bg-ink-950 text-white border border-brand-orange' },
  lowstock: { label: '⚡ ÚLTIMA UNIDADE', className: 'bg-brand-red text-white' },
};

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

export function Badge({ type, className = '' }: BadgeProps) {
  const cfg = configs[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest font-ui ${cfg.className} ${className}`}>
      {cfg.label}
    </span>
  );
}

interface DiscountBadgeProps {
  original: number;
  current: number;
  className?: string;
}

export function DiscountBadge({ original, current, className = '' }: DiscountBadgeProps) {
  const pct = Math.round((1 - current / original) * 100);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide font-ui bg-brand-orange text-white ${className}`}>
      -{pct}% OFF
    </span>
  );
}

interface PixBadgeProps {
  price: number;
  className?: string;
}

export function PixBadge({ price, className = '' }: PixBadgeProps) {
  const pixPrice = price * 0.95;
  return (
    <div className={`flex items-center gap-1.5 text-xs text-(--fg-muted) ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-green">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>No Pix: <strong className="text-brand-green font-semibold">
        {pixPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </strong> (5% OFF)</span>
    </div>
  );
}
