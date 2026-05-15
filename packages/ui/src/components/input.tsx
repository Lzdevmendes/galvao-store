'use client'
import { Label } from '@radix-ui/react-label'
import { cn } from '../lib/cn'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconEnd?: ReactNode
}

const inputBase = [
  'w-full h-10 bg-[var(--bg-sunk)] border border-[var(--border-strong)] rounded-[10px]',
  'text-[var(--fg)] text-sm font-body placeholder:text-[var(--fg-faint)]',
  'transition-all duration-150 outline-none',
  'focus:border-[#F26B1F] focus:ring-2 focus:ring-[#F26B1F]/20',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

export function Input({ label, error, hint, icon, iconEnd, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label
          htmlFor={inputId}
          className="text-[11px] font-bold font-ui text-[var(--fg-muted)] uppercase tracking-widest"
        >
          {label}
        </Label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-[var(--fg-faint)] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            inputBase,
            icon ? 'pl-10' : 'pl-3',
            iconEnd ? 'pr-10' : 'pr-3',
            error ? 'border-[#E23B3B] focus:border-[#E23B3B] focus:ring-[#E23B3B]/20' : '',
            className
          )}
          {...props}
        />
        {iconEnd && (
          <span className="absolute right-3 text-[var(--fg-faint)]">{iconEnd}</span>
        )}
      </div>
      {hint  && !error && <p className="text-[11px] text-[var(--fg-muted)]">{hint}</p>}
      {error && <p className="text-[11px] text-[#E23B3B]">{error}</p>}
    </div>
  )
}

// Preço formata de centavos para BRL display
export const centsToBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
