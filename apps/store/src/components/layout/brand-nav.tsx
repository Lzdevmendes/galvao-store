'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'

export interface BrandNavItem { label: string; href: string }

// Core category links — sempre presentes (categorias-base do catálogo)
const CATEGORY_LINKS: BrandNavItem[] = [
  { label: 'CAMPO',    href: '/categoria/campo'   },
  { label: 'SOCIETY',  href: '/categoria/society' },
  { label: 'FUTSAL',   href: '/categoria/futsal'  },
]

export function BrandNav({ brands = [] }: { brands?: BrandNavItem[] }) {
  const pathname = usePathname()
  const reduced  = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)

  // Ilha reativa ao scroll — assenta no topo, levanta/arredonda ao rolar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links: BrandNavItem[] = [
    { label: 'PRODUTOS', href: '/produtos' },
    ...brands,
    ...CATEGORY_LINKS,
  ]

  const isActive = (href: string) =>
    href === '/produtos'
      ? pathname === '/produtos'
      : pathname.startsWith(href)

  return (
    <nav className="brands" data-scrolled={scrolled}>
      <div className="container row">
        {links.map(l => {
          const active = isActive(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              className={active ? 'active' : undefined}
              style={{ position: 'relative' }}
            >
              {/* Pill que desliza suavemente para o item ativo */}
              {active && !reduced && (
                <motion.span
                  layoutId="brand-nav-indicator"
                  style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    background: 'rgba(242,107,31,.14)', borderRadius: 999,
                    boxShadow: 'inset 0 0 0 1px rgba(242,107,31,.18)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span>{l.label}</span>
            </Link>
          )
        })}

        <Link href="/ofertas" className="offer" style={{ marginLeft: 'auto' }}>
          ★ OFERTAS
        </Link>
      </div>
    </nav>
  )
}
