import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export function Input({ label, error, icon, iconEnd, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold font-ui text-(--fg-muted) uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-(--fg-faint) pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full h-10 bg-(--bg-sunk) border border-(--border) rounded-md
            text-(--fg) text-sm font-body placeholder:text-(--fg-faint)
            transition-all duration-150
            focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20
            ${icon ? 'pl-10' : 'pl-3'}
            ${iconEnd ? 'pr-10' : 'pr-3'}
            ${error ? 'border-brand-red focus:border-brand-red focus:ring-brand-red/20' : ''}
            ${className}
          `}
          {...props}
        />
        {iconEnd && (
          <span className="absolute right-3 text-(--fg-faint)">
            {iconEnd}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-brand-red">{error}</p>}
    </div>
  );
}
