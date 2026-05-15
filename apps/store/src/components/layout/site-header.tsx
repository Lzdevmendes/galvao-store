'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore, cartTotalItems } from '@/store/cart'

export function SiteHeader() {
  const [q, setQ] = useState('')
  const router    = useRouter()
  const itemCount = useCartStore(cartTotalItems)
  const toggleCart = useCartStore(s => s.toggleCart)

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

          <Link href="/favoritos" className="icon-btn" style={{ position:'relative' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
            <span className="small">Favoritos</span>
          </Link>

          <button onClick={toggleCart} className="icon-btn cart-btn" style={{ position:'relative', background:'var(--brand-orange)', color:'#fff', border:'none' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {itemCount > 0 && (
              <span style={{
                position:'absolute', top:-6, right:-6,
                background:'#0B0E12', color:'#fff',
                borderRadius:'50%', width:18, height:18,
                fontSize:10, fontWeight:700, fontFamily:'var(--font-ui)',
                display:'flex', alignItems:'center', justifyContent:'center',
                border:'2px solid var(--brand-orange)',
              }}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
            <span className="small">
              {itemCount > 0 ? `${itemCount} iten${itemCount > 1 ? 's' : ''}` : 'Carrinho'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
