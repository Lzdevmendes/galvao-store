import { useState, useEffect, useCallback, createContext, useContext } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'cart'

interface Toast {
  id: number
  type: ToastType
  message: string
  sub?: string
}

interface ToastCtx {
  toast: (msg: string, type?: ToastType, sub?: string) => void
  cartToast: (productName: string) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {}, cartToast: () => {} })

let uid = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) =>
    setToasts(t => t.filter(x => x.id !== id)), [])

  const toast = useCallback((message: string, type: ToastType = 'info', sub?: string) => {
    const id = ++uid
    setToasts(t => [...t.slice(-3), { id, type, message, sub }])
    setTimeout(() => remove(id), 3500)
  }, [remove])

  const cartToast = useCallback((productName: string) => {
    toast(productName, 'cart', 'Adicionado ao carrinho ✓')
  }, [toast])

  return (
    <ToastContext.Provider value={{ toast, cartToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 90, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />)}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const icons: Record<ToastType, string> = {
    success: '✓', error: '✕', info: 'ℹ', cart: '🛒',
  }
  const colors: Record<ToastType, string> = {
    success: 'var(--brand-green)',
    error:   'var(--brand-red)',
    info:    'var(--brand-teal)',
    cart:    'var(--brand-orange)',
  }

  return (
    <div
      onClick={onClose}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-elev)', border: '1px solid var(--border)',
        borderLeft: `3px solid ${colors[t.type]}`,
        borderRadius: 'var(--r-md)', padding: '10px 14px',
        boxShadow: 'var(--sh-lg)', maxWidth: 320, pointerEvents: 'auto',
        cursor: 'pointer', userSelect: 'none',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform .25s cubic-bezier(.175,.885,.32,1.275), opacity .2s',
      }}
    >
      <span style={{ color: colors[t.type], fontSize: 16, flexShrink: 0, lineHeight: 1 }}>
        {icons[t.type]}
      </span>
      <div style={{ minWidth: 0 }}>
        {t.sub && (
          <div style={{ fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 700, color: colors[t.type], letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 1 }}>
            {t.sub}
          </div>
        )}
        <div style={{ fontSize: 13, fontFamily: 'var(--font-ui)', color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {t.message}
        </div>
      </div>
    </div>
  )
}

export const useToast = () => useContext(ToastContext)
