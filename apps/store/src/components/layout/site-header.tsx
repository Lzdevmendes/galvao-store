'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function SiteHeader({ cartCount = 0, wishlistCount = 0 }: {
  cartCount?: number
  wishlistCount?: number
}) {
  const [q, setQ] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) router.push(`/busca?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="site">
      <div className="container row">
        {/* Logo */}
        <Link href="/" className="logo">
          <div className="logo-wordmark">GALVÃO&apos;S</div>
          <div className="logo-sub">Store · Alta Performance</div>
        </Link>

        {/* Search */}
        <form className="search" onSubmit={handleSearch}>
          <svg className="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar chuteira, marca, modelo..."
          />
        </form>

        {/* Actions */}
        <div className="actions">
          <Link href="/conta" className="icon-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="small">Conta</span>
          </Link>

          <Link href="/favoritos" className="icon-btn" style={{ position: 'relative' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
            {wishlistCount > 0 && (
              <span style={{
                position:'absolute', top:-2, right:-2,
                background:'var(--brand-orange)', color:'#fff',
                borderRadius:'50%', width:16, height:16,
                fontSize:9, fontWeight:700, fontFamily:'var(--font-ui)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{wishlistCount}</span>
            )}
            <span className="small">Favoritos</span>
          </Link>

          <Link href="/carrinho" className="icon-btn cart-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="small">
              {cartCount > 0 ? `${cartCount} iten${cartCount > 1 ? 's' : ''}` : 'Carrinho'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
