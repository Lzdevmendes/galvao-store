'use client'

import { useEffect } from 'react'

export function SWRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    // Em dev, os chunks de /_next/static/ não têm hash estável entre edições —
    // o cache-first do SW acaba servindo JS desatualizado contra HTML novo do
    // SSR, causando hydration mismatch. SW só faz sentido em produção.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister())
      })
      return
    }
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('[SW] registro falhou', err)
    })
  }, [])

  return null
}
