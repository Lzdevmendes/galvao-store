'use client'

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
    <nav className="brands">
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
              {l.label}
              {/* Indicador laranja que desliza suavemente para o item ativo */}
              {active && !reduced && (
                <motion.span
                  layoutId="brand-nav-indicator"
                  style={{
                    position: 'absolute', bottom: -1, left: 0, right: 0,
                    height: 2, background: 'var(--brand-orange)', borderRadius: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
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
