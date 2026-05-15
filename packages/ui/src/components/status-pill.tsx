import { cn } from '../lib/cn'

type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  pending_payment: { label: 'Aguardando pagamento', cls: 'bg-[rgba(255,200,58,.18)] text-[#B8870E]' },
  paid:            { label: 'Pago',                 cls: 'bg-[rgba(44,179,90,.12)] text-[#2CB35A]' },
  processing:      { label: 'Em separação',         cls: 'bg-[rgba(255,200,58,.18)] text-[#B8870E]' },
  shipped:         { label: 'Enviado',              cls: 'bg-[rgba(31,181,168,.15)] text-[#168A80]' },
  delivered:       { label: 'Entregue',             cls: 'bg-[rgba(44,179,90,.12)] text-[#2CB35A]' },
  cancelled:       { label: 'Cancelado',            cls: 'bg-[rgba(226,59,59,.1)] text-[#E23B3B]' },
  refunded:        { label: 'Reembolsado',          cls: 'bg-[var(--bg-sunk)] text-[var(--fg-muted)]' },
}

interface StatusPillProps {
  status: OrderStatus | string
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  const cfg = STATUS_CONFIG[status as OrderStatus] ?? { label: status, cls: 'bg-[var(--bg-sunk)] text-[var(--fg-muted)]' }
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-ui',
      cfg.cls, className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}
