'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCartStore, cartTotalItems } from '@/store/cart'

const tabs = [
  { href:'/',          label:'Início',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12 12 3l9 9M5 10v10h4v-6h6v6h4V10"/></svg>,
    match: (p: string) => p === '/' },
  { href:'/busca',     label:'Buscar',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    match: (p: string) => p.startsWith('/busca') || p.startsWith('/produtos') },
  { href:'/favoritos', label:'Favoritos',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>,
    match: (p: string) => p.startsWith('/favoritos') },
  { href:'/carrinho',  label:'Carrinho',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>,
    match: (p: string) => p.startsWith('/carrinho') },
  { href:'/conta',     label:'Conta',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    match: (p: string) => p.startsWith('/conta') },
]

export function MobileTabBar() {
  const pathname  = usePathname()
  const itemCount = useCartStore(cartTotalItems)
  const toggleCart = useCartStore(s => s.toggleCart)

  return (
    <nav className="mobile-tabbar">
      {tabs.map(t => {
        const active = t.match(pathname)
        const isCart = t.href === '/carrinho'

        const inner = (
          <motion.span
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, width:'100%' }}
            whileTap={{ scale: .85 }}
          >
            <span style={{ position:'relative' }}>
              {t.icon}
              {isCart && itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position:'absolute', top:-5, right:-5,
                    background:'var(--brand-orange)', color:'#fff',
                    borderRadius:'50%', width:16, height:16, fontSize:9,
                    fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center',
                  }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </span>
            <span>{t.label}</span>
            {active && (
              <motion.div
                layoutId="tab-indicator"
                style={{ height:2, width:20, background:'var(--brand-orange)', borderRadius:1 }}
              />
            )}
          </motion.span>
        )

        if (isCart) {
          return (
            <button
              key={t.href}
              onClick={toggleCart}
              className={active ? 'active' : undefined}
              style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', padding:'4px 0', fontFamily:'var(--font-ui)', fontSize:10, color: active ? 'var(--brand-orange)' : 'var(--fg-muted)', fontWeight: active ? 700 : 500 }}
            >
              {inner}
            </button>
          )
        }

        return (
          <Link key={t.href} href={t.href} className={active ? 'active' : undefined}>
            {inner}
          </Link>
        )
      })}
    </nav>
  )
}
