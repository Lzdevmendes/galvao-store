'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCartStore, cartTotalItems } from '@/store/cart'

export function SiteHeader() {
  const [q, setQ]               = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef               = useRef<HTMLInputElement>(null)
  const router                  = useRouter()
  const itemCount               = useCartStore(cartTotalItems)
  const toggleCart              = useCartStore(s => s.toggleCart)
  const [scrolled, setScrolled] = useState(false)

  // Focar no input quando a search abre no mobile
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Estado de scroll — header transparente sobre o hero (home) vira frosted ao rolar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      router.push(`/busca?q=${encodeURIComponent(q.trim())}`)
      setSearchOpen(false)
      setQ('')
    }
  }

  return (
    <header className="site" data-scrolled={scrolled}>
      <div className="container">
        {/* ── Linha principal: logo + search + actions ── */}
        <div className="row" style={{ gap: 16 }}>

          {/* Logo */}
          <Link href="/" className="logo" aria-label="Galvão's Store — Início">
            <Image src="/logo.svg" alt="" width={36} height={36} priority
              style={{ borderRadius: '50%', flexShrink: 0 }} />
            <div className="logo-text">
              <div className="logo-wordmark">GALVÃO&apos;S</div>
              <div className="logo-sub">Store · Alta Performance</div>
            </div>
          </Link>

          {/* Search — desktop: sempre visível / mobile: oculto por padrão */}
          <form className={`search${searchOpen ? ' search--open' : ''}`} onSubmit={handleSearch}>
            <svg className="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              ref={searchRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar chuteira, marca, modelo..."
              aria-label="Buscar produtos"
              type="search"
            />
            {searchOpen && (
              <button type="button" className="search-close" onClick={() => { setSearchOpen(false); setQ('') }}
                aria-label="Fechar busca">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </form>

          {/* Actions */}
          <div className="actions">
            {/* Lupa mobile — abre o search */}
            <button className="icon-btn search-toggle" onClick={() => setSearchOpen(v => !v)}
              aria-label="Buscar" aria-expanded={searchOpen}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </button>

            <Link href="/conta" className="icon-btn" aria-label="Minha conta">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="small">Conta</span>
            </Link>

            <button onClick={toggleCart} className="icon-btn cart-btn" aria-label={`Carrinho, ${itemCount} itens`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span className="cart-badge" aria-hidden="true">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="small">
                {itemCount > 0 ? `${itemCount} iten${itemCount > 1 ? 's' : ''}` : 'Carrinho'}
              </span>
            </button>
          </div>
        </div>

        {/* Search expandido no mobile — barra full-width abaixo do header */}
        {searchOpen && (
          <form className="search-mobile" onSubmit={handleSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar chuteira, marca, modelo..."
              aria-label="Buscar produtos"
              type="search"
              autoFocus
            />
          </form>
        )}
      </div>
    </header>
  )
}
