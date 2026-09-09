'use client'

import { useEffect } from 'react'

export function SWRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('[SW] registro falhou', err)
    })
  }, [])

  return null
}
