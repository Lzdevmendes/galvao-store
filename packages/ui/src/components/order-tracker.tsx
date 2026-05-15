import { cn } from '../lib/cn'

const STEPS = [
  { key: 'pending_payment', label: 'Pedido criado' },
  { key: 'paid',            label: 'Pagamento confirmado' },
  { key: 'processing',      label: 'Em separação' },
  { key: 'shipped',         label: 'Em trânsito' },
  { key: 'delivered',       label: 'Entregue' },
] as const

type Status = typeof STEPS[number]['key'] | 'cancelled'

interface OrderTrackerProps {
  status: Status
  className?: string
}

const ORDER: Record<string, number> = {
  pending_payment: 0, paid: 1, processing: 2, shipped: 3, delivered: 4,
}

export function OrderTracker({ status, className }: OrderTrackerProps) {
  if (status === 'cancelled') {
    return (
      <div className={cn('flex items-center gap-2 text-[#E23B3B] text-sm font-semibold font-ui', className)}>
        <span className="w-2 h-2 rounded-full bg-[#E23B3B]" />
        Pedido cancelado
      </div>
    )
  }

  const activeIdx = ORDER[status] ?? 0

  return (
    <div className={cn('flex items-start gap-0', className)}>
      {STEPS.map(({ key, label }, i) => {
        const done    = i < activeIdx
        const current = i === activeIdx
        return (
          <div key={key} className="flex items-start flex-1 flex-col">
            <div className="flex items-center w-full">
              {/* Dot */}
              <div className={cn(
                'w-3 h-3 rounded-full border-2 shrink-0 transition-all',
                done    ? 'bg-[#2CB35A] border-[#2CB35A]'  : '',
                current ? 'bg-[#F26B1F] border-[#F26B1F] shadow-[0_0_0_4px_rgba(242,107,31,.2)]' : '',
                !done && !current ? 'bg-[var(--bg-elev)] border-[var(--border-strong)]' : '',
              )} />
              {/* Line */}
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 transition-colors',
                  done ? 'bg-[#2CB35A]' : 'bg-[var(--border)]'
                )} />
              )}
            </div>
            <span className={cn(
              'mt-2 text-[10px] font-ui leading-tight max-w-[72px]',
              done    ? 'text-[#2CB35A] font-bold' : '',
              current ? 'text-[#F26B1F] font-bold' : '',
              !done && !current ? 'text-[var(--fg-faint)]' : '',
            )}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
