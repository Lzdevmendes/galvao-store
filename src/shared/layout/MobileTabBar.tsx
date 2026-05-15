import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store'

export function MobileTabBar() {
  const { pathname } = useLocation()
  const { cartCount, wishlist } = useStore()
  const count = cartCount()

  const tabs = [
    {
      to: '/', label: 'Início',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12 L12 3 L21 12 M5 10 V20 H9 V15 H15 V20 H19 V10"/></svg>,
      match: (p: string) => p === '/',
    },
    {
      to: '/busca', label: 'Buscar',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
      match: (p: string) => p.startsWith('/busca') || p.startsWith('/produtos') || p.startsWith('/marca') || p.startsWith('/categoria'),
    },
    {
      to: '/favoritos', label: 'Favoritos',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>,
      badge: wishlist.length,
      match: (p: string) => p.startsWith('/favorito'),
    },
    {
      to: '/carrinho', label: 'Carrinho',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
      badge: count,
      match: (p: string) => p.startsWith('/carrinho'),
    },
    {
      to: '/conta', label: 'Conta',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      match: (p: string) => p.startsWith('/conta'),
    },
  ]

  return (
    <nav className="mobile-tabbar">
      {tabs.map(tab => (
        <Link
          key={tab.to}
          to={tab.to}
          className={tab.match(pathname) ? 'active' : ''}
          style={{ position: 'relative' }}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge && tab.badge > 0 ? (
            <span className="tab-badge">{tab.badge > 9 ? '9+' : tab.badge}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  )
}
