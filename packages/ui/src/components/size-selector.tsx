'use client'
import { cn } from '../lib/cn'

interface SizeOption {
  size: string
  available: boolean
  stock?: number
}

interface SizeSelectorProps {
  sizes: SizeOption[]
  selected: string | null
  onSelect: (size: string) => void
  className?: string
}

export function SizeSelector({ sizes, selected, onSelect, className }: SizeSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {sizes.map(({ size, available, stock }) => (
        <button
          key={size}
          disabled={!available}
          onClick={() => onSelect(size)}
          className={cn(
            'w-12 h-11 rounded-[6px] border text-[13px] font-mono font-semibold transition-all duration-150',
            !available
              ? 'opacity-30 cursor-not-allowed border-[var(--border)] text-[var(--fg-faint)] line-through'
              : selected === size
                ? 'border-[#F26B1F] bg-[#0B0E12] text-white shadow-[0_0_0_3px_rgba(242,107,31,.18)]'
                : 'border-[var(--border-strong)] text-[var(--fg)] hover:border-[#0B0E12] hover:text-[#0B0E12]'
          )}
          title={!available ? `Tamanho ${size} esgotado` : stock === 1 ? 'Última unidade!' : undefined}
        >
          {size}
        </button>
      ))}
    </div>
  )
}
