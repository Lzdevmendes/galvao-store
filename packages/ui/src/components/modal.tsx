'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '../lib/cn'
import type { ReactNode } from 'react'

export interface ModalProps {
  open:        boolean
  onClose:     () => void
  title?:      string
  description?: string
  children:    ReactNode
  size?:       'sm' | 'md' | 'lg' | 'xl'
  className?:  string
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)]',
            '-translate-x-1/2 -translate-y-1/2',
            'bg-[var(--bg-elev)] border border-[var(--border)] rounded-2xl shadow-2xl',
            'p-6 focus:outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            sizeMap[size],
            className,
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="mb-5">
              {title && (
                <Dialog.Title className="font-display text-xl font-black text-[var(--fg)] tracking-wide">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="mt-1 font-ui text-sm text-[var(--fg-muted)]">
                  {description}
                </Dialog.Description>
              )}
            </div>
          )}

          {children}

          {/* Close button */}
          <Dialog.Close
            className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--fg-muted)] hover:bg-[var(--bg-sunk)] hover:text-[var(--fg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)]"
            aria-label="Fechar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Modal sub-components ──────────────────────────────────

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mt-6 flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4', className)}>
      {children}
    </div>
  )
}

export function ModalSection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}
