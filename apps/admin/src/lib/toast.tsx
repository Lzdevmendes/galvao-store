'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; msg: string; type: ToastType }

const icons: Record<ToastType, string> = { success: '✅', error: '❌', info: 'ℹ️' }
const colors: Record<ToastType, string> = { success: '#2CB35A', error: '#E23B3B', info: '#3B82F6' }

const Ctx = createContext<{ add: (msg: string, type: ToastType) => void }>({ add: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const add = useCallback((msg: string, type: ToastType) => {
    const id = ++counter.current
    setToasts(p => [...p.slice(-2), { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <Ctx.Provider value={{ add }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 10,
            background: '#1E2530', border: `1px solid ${colors[t.type]}44`,
            color: '#F8F9FB', fontSize: 13, fontWeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,.4)',
            animation: 'toast-in .2s ease',
            minWidth: 240, maxWidth: 360,
          }}>
            <span>{icons[t.type]}</span>
            <span style={{ flex: 1 }}>{t.msg}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
          </div>
        ))}
      </div>
      <style>{`@keyframes toast-in { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </Ctx.Provider>
  )
}

export function useToast() {
  const { add } = useContext(Ctx)
  return {
    success: (msg: string) => add(msg, 'success'),
    error:   (msg: string) => add(msg, 'error'),
    info:    (msg: string) => add(msg, 'info'),
  }
}
