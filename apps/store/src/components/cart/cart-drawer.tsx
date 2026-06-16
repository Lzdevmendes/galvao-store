'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, cartSubtotal, type CartItem } from '@/store/cart'
import { fmt } from '@/lib/utils'

const FREE_SHIPPING_THRESHOLD = 39900 // R$ 399

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty } = useCartStore()
  const subtotal = useCartStore(cartSubtotal)
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const freeShipping = remaining <= 0
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            onClick={closeCart}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:200, backdropFilter:'blur(3px)' }}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
        style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: 420, maxWidth: '100vw',
          background: 'var(--glass-sheen), var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-filter-lg)',
          WebkitBackdropFilter: 'var(--glass-filter-lg)',
          borderLeft: '1px solid var(--glass-border)',
          zIndex: 201, display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--glass-shadow-lg)',
        }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:900 }}>
            Carrinho {items.length > 0 && <span style={{ fontFamily:'var(--font-ui)', fontSize:13, fontWeight:600, color:'var(--fg-muted)', marginLeft:6 }}>({items.length} {items.length === 1 ? 'item' : 'itens'})</span>}
          </div>
          <button onClick={closeCart} style={{ background:'none', border:'none', cursor:'pointer', padding:8, color:'var(--fg-muted)', fontSize:20, lineHeight:1 }}>✕</button>
        </div>

        {/* Frete grátis bar */}
        <div style={{ padding:'12px 24px', background:'var(--bg-sunk)', borderBottom:'1px solid var(--border)' }}>
          {freeShipping ? (
            <div style={{ fontFamily:'var(--font-ui)', fontSize:12, fontWeight:700, color:'var(--brand-green)' }}>
              ✓ Você ganhou frete grátis!
            </div>
          ) : (
            <>
              <div style={{ fontFamily:'var(--font-ui)', fontSize:12, color:'var(--fg-muted)', marginBottom:6 }}>
                Falta <strong style={{ color:'var(--fg)' }}>{fmt(remaining)}</strong> para frete grátis
              </div>
              <div style={{ height:4, background:'var(--border)', borderRadius:99 }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'var(--brand-green)', borderRadius:99, transition:'width .4s' }} />
              </div>
            </>
          )}
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          {items.length === 0 ? (
            <div style={{ textAlign:'center', paddingTop:64, color:'var(--fg-muted)' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
              <p style={{ fontFamily:'var(--font-ui)', fontSize:14 }}>Seu carrinho está vazio</p>
              <button onClick={closeCart} style={{ marginTop:16, padding:'10px 20px', borderRadius:8, background:'var(--brand-orange)', color:'#fff', border:'none', fontFamily:'var(--font-ui)', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Continuar comprando
              </button>
            </div>
          ) : (
            items.map(item => <CartItemRow key={item.variantId} item={item} onRemove={removeItem} onQty={updateQty} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding:'20px 24px', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <span style={{ fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)' }}>Subtotal</span>
              <span style={{ fontFamily:'var(--font-stencil)', fontSize:28, color:'var(--brand-green)' }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ fontFamily:'var(--font-ui)', fontSize:11, color:'var(--fg-muted)', textAlign:'right' }}>
              ou <strong style={{ color:'var(--brand-green)' }}>{fmt(Math.round(subtotal * 0.95))} no Pix (5% OFF)</strong>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              style={{ display:'block', textAlign:'center', padding:'16px', borderRadius:12, background:'var(--brand-orange)', color:'#fff', fontFamily:'var(--font-ui)', fontWeight:700, fontSize:16, textDecoration:'none' }}
            >
              Finalizar compra →
            </Link>
            <button
              onClick={closeCart}
              style={{ background:'transparent', border:'none', fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)', cursor:'pointer', textDecoration:'underline' }}
            >
              Continuar comprando
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}

function CartItemRow({ item, onRemove, onQty }: {
  item: CartItem
  onRemove: (id: string) => void
  onQty: (id: string, q: number) => void
}) {
  const activePrice = item.pricePromoInCents != null && item.pricePromoInCents < item.priceInCents
    ? item.pricePromoInCents : item.priceInCents

  return (
    <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
      {/* Imagem */}
      <div style={{ width:72, height:72, background:'#fff', borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        {item.imageUrl && (
          <Image src={item.imageUrl} alt={item.productName} width={68} height={68} style={{ width:'90%', height:'90%', objectFit:'contain', mixBlendMode:'multiply' }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-ui)', fontSize:11, color:'var(--fg-muted)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:2 }}>
          {item.brandName}
        </div>
        <div style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:13, lineHeight:1.3, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {item.productName}
        </div>
        <div style={{ fontFamily:'var(--font-ui)', fontSize:12, color:'var(--fg-muted)', marginBottom:8 }}>
          Tam. {item.size} · {item.color}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          {/* Qty controls */}
          <div style={{ display:'flex', alignItems:'center', gap:0, border:'1px solid var(--border-strong)', borderRadius:8, overflow:'hidden' }}>
            <button onClick={() => onQty(item.variantId, item.quantity - 1)} style={{ width:32, height:30, background:'none', border:'none', cursor:'pointer', fontSize:16, color:'var(--fg)', fontFamily:'var(--font-ui)' }}>−</button>
            <span style={{ width:28, textAlign:'center', fontFamily:'var(--font-mono)', fontSize:13 }}>{item.quantity}</span>
            <button onClick={() => onQty(item.variantId, item.quantity + 1)} style={{ width:32, height:30, background:'none', border:'none', cursor:'pointer', fontSize:16, color:'var(--fg)', fontFamily:'var(--font-ui)' }}>+</button>
          </div>

          {/* Preço */}
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:900, color:'var(--brand-green)' }}>
              {fmt(activePrice * item.quantity)}
            </div>
            {item.quantity > 1 && (
              <div style={{ fontFamily:'var(--font-ui)', fontSize:11, color:'var(--fg-faint)' }}>
                {fmt(activePrice)} cada
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove */}
      <button onClick={() => onRemove(item.variantId)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-faint)', padding:4, fontSize:16, flexShrink:0, marginTop:2 }} title="Remover">
        ✕
      </button>
    </div>
  )
}
