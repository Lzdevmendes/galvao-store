type BadgeVariant = 'orange' | 'teal' | 'sale' | 'new' | 'stock' | 'soft'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClass: Record<BadgeVariant, string> = {
  orange: 'badge badge-orange',
  teal:   'badge badge-teal',
  sale:   'badge badge-sale',
  new:    'badge badge-new',
  stock:  'badge badge-stock',
  soft:   'badge badge-soft',
}

export function Badge({ variant = 'soft', children, className }: BadgeProps) {
  return (
    <span className={`${variantClass[variant]}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  )
}
