'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { label: 'PRODUTOS',  href: '/produtos' },
  { label: 'NIKE',     href: '/nike' },
  { label: 'ADIDAS',   href: '/adidas' },
  { label: 'PUMA',     href: '/puma' },
  { label: 'UMBRO',    href: '/umbro' },
  { label: 'CAMPO',    href: '/categoria/campo' },
  { label: 'SOCIETY',  href: '/categoria/society' },
  { label: 'FUTSAL',   href: '/categoria/futsal' },
]

export function BrandNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/produtos'
      ? pathname === '/produtos'
      : pathname.startsWith(href)

  return (
    <nav className="brands">
      <div className="container row">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={isActive(l.href) ? 'active' : undefined}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/ofertas" className="offer" style={{ marginLeft: 'auto' }}>
          ★ OFERTAS
        </Link>
      </div>
    </nav>
  )
}
