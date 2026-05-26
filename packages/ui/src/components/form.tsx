'use client'

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/cn'

// ── FormField wrapper ─────────────────────────────────────

export interface FormFieldProps {
  label?:    string
  error?:    string
  hint?:     string
  required?: boolean
  children:  ReactNode
  className?: string
}

export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fg-muted)]">
          {label}
          {required && <span className="ml-0.5 text-[var(--brand-orange)]">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="font-ui text-xs text-red-500 leading-tight">{error}</p>
      )}
      {!error && hint && (
        <p className="font-ui text-xs text-[var(--fg-faint)] leading-tight">{hint}</p>
      )}
    </div>
  )
}

// ── Base input styles ─────────────────────────────────────

const inputBase = (error?: string) => cn(
  'w-full rounded-[10px] border px-3.5 py-3 font-ui text-sm text-[var(--fg)]',
  'bg-[var(--bg)] outline-none transition-colors placeholder:text-[var(--fg-faint)]',
  'focus:ring-2 focus:ring-[var(--brand-orange)] focus:border-[var(--brand-orange)]',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  error
    ? 'border-red-400 bg-red-50/5 focus:ring-red-400'
    : 'border-[var(--border)] hover:border-[var(--border-strong)]',
)

// ── TextInput ─────────────────────────────────────────────

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(inputBase(error), className)}
      {...props}
    />
  )
)
TextInput.displayName = 'TextInput'

// ── Textarea ──────────────────────────────────────────────

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(inputBase(error), 'min-h-[96px] resize-y', className)}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

// ── Select ────────────────────────────────────────────────

export interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?:       string
  placeholder?: string
  options:      { value: string; label: string; disabled?: boolean }[]
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ error, placeholder, options, className, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(inputBase(error), 'appearance-none pr-9 cursor-pointer', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {/* Chevron icon */}
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]"
        width="14" height="14" viewBox="0 0 14 14" fill="none"
      >
        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
)
SelectInput.displayName = 'SelectInput'

// ── Checkbox ──────────────────────────────────────────────

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label:  string
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const checkId = id ?? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`
    return (
      <div className={cn('flex items-start gap-2.5', className)}>
        <input
          ref={ref}
          id={checkId}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-[var(--brand-orange)]"
          {...props}
        />
        <div>
          <label htmlFor={checkId} className="cursor-pointer font-ui text-sm text-[var(--fg)]">
            {label}
          </label>
          {error && <p className="mt-0.5 font-ui text-xs text-red-500">{error}</p>}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

// ── FormRow (2-column layout helper) ─────────────────────

export function FormRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>
      {children}
    </div>
  )
}

// ── FormSection (labelled group) ──────────────────────────

export function FormSection({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <fieldset className={cn('flex flex-col gap-4 border-0 p-0 m-0', className)}>
      {title && (
        <legend className="font-display text-lg font-black tracking-wide text-[var(--fg)] mb-1">
          {title}
        </legend>
      )}
      {children}
    </fieldset>
  )
}
