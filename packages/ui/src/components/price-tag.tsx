import { cn } from '../lib/cn'

// Converte centavos → string BRL
export const fmt = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface PriceTagProps {
  priceInCents: number
  promoInCents?: number | null
  installments?: number   // padrão 12
  showPix?: boolean
  className?: string
}

export function PriceTag({
  priceInCents,
  promoInCents,
  installments = 12,
  showPix = true,
  className,
}: PriceTagProps) {
  const active = promoInCents ?? priceInCents
  const hasDiscount = promoInCents != null && promoInCents < priceInCents
  const pix = active * 0.95
  const inst = active / installments

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {hasDiscount && (
        <span className="text-[12px] text-[var(--fg-faint)] line-through font-body">
          {fmt(priceInCents)}
        </span>
      )}
      <span
        className="font-display text-[22px] leading-none"
        style={{ color: '#2CB35A' }}
      >
        {fmt(active)}
      </span>
      <span className="text-[11px] font-ui text-[var(--fg-muted)]">
        12× {fmt(inst)}{showPix && (
          <> ou <strong style={{ color: '#2CB35A' }}>{fmt(pix)} no Pix</strong></>
        )}
      </span>
    </div>
  )
}

// Variante grande para PDP
export function PriceTagLarge({ priceInCents, promoInCents, className }: Omit<PriceTagProps,'installments'|'showPix'>) {
  const active = promoInCents ?? priceInCents
  const hasDiscount = promoInCents != null && promoInCents < priceInCents
  const pix = active * 0.95
  const inst = active / 12
  const saving = priceInCents - active

  return (
    <div className={cn('rounded-[10px] border border-[var(--border)] p-5 flex flex-col gap-2', 'bg-[var(--bg-elev)]', className)}>
      {hasDiscount && (
        <div className="text-sm text-[var(--fg-faint)] line-through">{fmt(priceInCents)}</div>
      )}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[40px] leading-none" style={{ color: '#2CB35A' }}>
          {fmt(active)}
        </span>
        {hasDiscount && saving > 0 && (
          <span className="text-[12px] font-bold font-ui text-white bg-[#E23B3B] px-2 py-0.5 rounded-full">
            ECONOMIZE {fmt(saving)}
          </span>
        )}
      </div>
      {/* PIX */}
      <div className="flex items-center gap-2 text-[13px] font-semibold font-ui rounded-[6px] px-3 py-2.5"
        style={{ background:'rgba(31,181,168,.12)', color:'#168A80' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        No Pix: <strong>{fmt(pix)}</strong> (mais 5% OFF)
      </div>
      <div className="text-[13px] text-[var(--fg-muted)]">
        ou em <strong className="text-[var(--fg)]">12× de {fmt(inst)}</strong> sem juros no cartão
      </div>
    </div>
  )
}
