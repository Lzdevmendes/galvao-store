import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-ui font-semibold transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:   'bg-[#F26B1F] hover:bg-[#D9551A] text-white shadow-sm',
        secondary: 'bg-[#0B0E12] hover:bg-[#1F252E] text-white',
        ghost:     'bg-transparent hover:bg-[var(--bg-sunk)] text-[var(--fg)] border border-[var(--border-strong)]',
        teal:      'bg-[#1FB5A8] hover:bg-[#168A80] text-white',
        link:      'underline-offset-4 hover:underline text-[#F26B1F] p-0 h-auto',
        danger:    'bg-[#E23B3B] hover:bg-red-700 text-white',
      },
      size: {
        sm:   'h-8  px-3 text-xs  rounded-[6px]  gap-1.5',
        md:   'h-10 px-4 text-sm  rounded-[10px] gap-2',
        lg:   'h-12 px-6 text-base rounded-[10px] gap-2',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export function Button({
  className, variant, size, asChild, loading, disabled, children, ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
        </svg>
      )}
      {children}
    </Comp>
  )
}
