import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-ui text-[11px] font-bold tracking-wide',
  {
    variants: {
      variant: {
        sale:       'bg-[#E23B3B] text-white',
        new:        'bg-[#0B0E12] text-white',
        orange:     'bg-[#F26B1F] text-white',
        teal:       'bg-[#D2F1ED] text-[#168A80]',
        stock:      'bg-[#2CB35A] text-white',
        soft:       'bg-[var(--bg-sunk)] text-[var(--fg)] border border-[var(--border)]',
        bestseller: 'bg-[#FFC83A] text-[#0B0E12]',
        exclusive:  'bg-[#0B0E12] text-white border border-[#F26B1F]',
      },
    },
    defaultVariants: { variant: 'new' },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

// Badge de desconto calculado automaticamente
export function DiscountBadge({ original, current, className }: {
  original: number; current: number; className?: string
}) {
  const pct = Math.round((1 - current / original) * 100)
  return <Badge variant="sale" className={className}>-{pct}% OFF</Badge>
}

// Badge de PIX — preço com 5% OFF
export function PixBadge({ price, className }: { price: number; className?: string }) {
  const pix = price * 0.95
  return (
    <span className={cn('flex items-center gap-1.5 text-xs font-ui', className)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2CB35A" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span style={{ color: 'var(--fg-muted)' }}>
        No Pix: <strong style={{ color: '#2CB35A' }}>
          {pix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </strong> (5% OFF)
      </span>
    </span>
  )
}
