'use client'

import { useEffect } from 'react'

// Specular glint reativo ao ponteiro nas superfícies de vidro — realismo "Apple".
// Um único listener delegado (rAF-throttled) escreve --gx/--gy/--glint no elemento
// de vidro sob o cursor; o brilho radial é desenhado pelo CSS (::after). Desligado
// em dispositivos de toque (sem hover) — zero custo no mobile.
const SURFACES = 'header.site, nav.brands .row, .pcard, .mobile-tabbar'

export function GlassLight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return

    let raf = 0
    let queued: { el: HTMLElement; x: number; y: number } | null = null

    const flush = () => {
      raf = 0
      if (!queued) return
      const { el, x, y } = queued
      el.style.setProperty('--gx', `${x}%`)
      el.style.setProperty('--gy', `${y}%`)
    }

    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(SURFACES)
      if (!el) return
      const r = el.getBoundingClientRect()
      queued = {
        el,
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      }
      el.style.setProperty('--glint', '1')
      if (!raf) raf = requestAnimationFrame(flush)
    }

    const onOut = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(SURFACES)
      if (el && !el.contains(e.relatedTarget as Node | null)) {
        el.style.setProperty('--glint', '0')
      }
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
