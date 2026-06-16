'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Marca data-hero no <html> nas páginas com hero escuro (home + marcas) — ativa o overlay
// (header transparente + hero full-bleed). Reage à navegação SPA; o load inicial é coberto
// por um script inline no <head> (sem flash).
export function HeroMarker({ paths }: { paths: string[] }) {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    if (paths.includes(pathname)) root.setAttribute('data-hero', 'true')
    else root.removeAttribute('data-hero')
  }, [pathname, paths])

  return null
}
