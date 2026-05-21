'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function NavProgress() {
  const pathname  = usePathname()
  const [visible, setVisible] = useState(false)
  const [width,   setWidth]   = useState(0)
  const prev  = useRef(pathname)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pathname === prev.current) return
    prev.current = pathname

    // Inicia
    setVisible(true)
    setWidth(20)

    // Progresso simulado
    const t1 = setTimeout(() => setWidth(60),  80)
    const t2 = setTimeout(() => setWidth(85),  300)
    // Completa
    const t3 = setTimeout(() => setWidth(100), 600)
    const t4 = setTimeout(() => { setVisible(false); setWidth(0) }, 900)

    timer.current = t4
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [pathname])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      height: 3, pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        width: `${width}%`,
        background: 'linear-gradient(90deg, #F26B1F, #F59E0B)',
        transition: width === 100 ? 'width .2s ease-out' : 'width .3s ease',
        boxShadow: '0 0 10px #F26B1F88',
      }} />
    </div>
  )
}
