'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { fmt } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { NotifyMeButton } from '@/components/catalog/notify-me-button'
// spring importado para uso futuro (size variants)
import '@/lib/motion'

interface Variant {
  id: string
  sku: string
  size: string
  color: string
  price_in_cents: number
  price_promo_in_cents: number | null
  stock: number
  available: boolean
}

interface SizePickerProps {
  variants: Variant[]
  productId: string
  productSlug: string
  productName: string
  brandName: string
  imageUrl: string
}

export function SizePicker({ variants, productId, productSlug, productName, brandName, imageUrl }: SizePickerProps) {
  const router   = useRouter()
  const addItem  = useCartStore(s => s.addItem)
  const reduced  = useReducedMotion()

  const colors = [...new Set(variants.map(v => v.color))]
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? '')
  const [selectedSize,  setSelectedSize]  = useState<string | null>(null)
  const [addedFeedback, setAddedFeedback] = useState(false)

  const colorVariants    = variants.filter(v => v.color === selectedColor)
  const selectedVariant  = colorVariants.find(v => v.size === selectedSize) ?? null
  const displayVariant   = selectedVariant ?? colorVariants[0]

  const hasValidPromo = (v: Variant) =>
    v.price_promo_in_cents != null && v.price_promo_in_cents < v.price_in_cents

  const activePrice = (v: Variant) =>
    hasValidPromo(v) ? v.price_promo_in_cents! : v.price_in_cents

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addItem({
      variantId:         selectedVariant.id,
      productId,
      productSlug,
      productName,
      brandName,
      imageUrl,
      size:              selectedVariant.size,
      color:             selectedVariant.color,
      priceInCents:      selectedVariant.price_in_cents,
      pricePromoInCents: selectedVariant.price_promo_in_cents,
    })
    // Feedback visual — botão vira ✓ por 1.4s
    if (!reduced) {
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 1400)
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  return (
    <div>
      {/* Price */}
      {displayVariant && (
        <div style={{ marginBottom: 28 }}>
          {hasValidPromo(displayVariant) && (
            <div style={{ fontFamily:'var(--font-ui)', fontSize:14, color:'var(--fg-muted)', textDecoration:'line-through', marginBottom:2 }}>
              {fmt(displayVariant.price_in_cents)}
            </div>
          )}
          <div style={{ fontFamily:'var(--font-stencil)', fontSize:48, lineHeight:1, color:'var(--brand-green)', letterSpacing:'.02em' }}>
            {fmt(activePrice(displayVariant))}
          </div>
          <div style={{ fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)', marginTop:6 }}>
            12× de {fmt(activePrice(displayVariant) / 12)} sem juros
            {' · '}
            <strong style={{ color:'var(--brand-green)' }}>
              {fmt(activePrice(displayVariant) * 0.95)} no Pix (5% OFF)
            </strong>
          </div>
        </div>
      )}

      {/* Color selector */}
      {colors.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily:'var(--font-ui)', fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--fg-muted)', marginBottom:10 }}>
            Cor: <span style={{ color:'var(--fg)' }}>{selectedColor}</span>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {colors.map(c => (
              <button
                key={c}
                onClick={() => { setSelectedColor(c); setSelectedSize(null) }}
                style={{
                  padding:'8px 16px', borderRadius:8, fontSize:13, fontFamily:'var(--font-ui)', fontWeight:600, cursor:'pointer', transition:'all .15s',
                  border:      selectedColor === c ? '2px solid var(--brand-orange)' : '2px solid var(--border-strong)',
                  background:  selectedColor === c ? 'var(--brand-orange)' : 'transparent',
                  color:       selectedColor === c ? '#fff' : 'var(--fg)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector — sz-grid para grid 4-col no mobile */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily:'var(--font-ui)', fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--fg-muted)', marginBottom:10 }}>
          Tamanho{selectedSize ? `: ${selectedSize}` : ''}
        </div>
        <div className="sz-grid" style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {colorVariants.map(v => {
            const isSelected = selectedSize === v.size
            return (
              <motion.button
                key={v.size}
                onClick={() => setSelectedSize(v.size)}
                title={!v.available ? `Tamanho ${v.size} esgotado` : v.stock === 1 ? 'Última unidade!' : undefined}
                whileTap={reduced || !v.available ? {} : { scale: 0.88 }}
                // Multi-keyframe requer type: 'tween' — spring só suporta 2 frames
                animate={isSelected && !reduced ? { scale: [1, 1.14, 0.95, 1] } : { scale: 1 }}
                transition={{ type: 'tween', duration: 0.32, ease: 'easeOut' }}
                style={{
                  width:48, height:42, borderRadius:8, fontSize:13, fontFamily:'var(--font-mono)', fontWeight:600,
                  cursor:        v.available ? 'pointer' : 'not-allowed',
                  opacity:       v.available ? 1 : .4,
                  textDecoration:v.available ? 'none' : 'line-through',
                  border:     isSelected ? '2px solid var(--brand-orange)' : '2px solid var(--border-strong)',
                  background: isSelected ? (v.available ? '#0B0E12' : '#1a0a00') : 'transparent',
                  color:      isSelected ? '#fff' : v.available ? 'var(--fg)' : 'var(--fg-faint)',
                  boxShadow:  isSelected ? '0 0 0 3px rgba(242,107,31,.2)' : 'none',
                  transition: 'border-color .12s, background .12s, color .12s, box-shadow .12s',
                }}
              >
                {v.size}
              </motion.button>
            )
          })}
        </div>
        {!selectedSize && (
          <div style={{ marginTop:8, fontFamily:'var(--font-ui)', fontSize:12, color:'var(--brand-orange)' }}>
            Selecione um tamanho
          </div>
        )}
      </div>

      {/* CTAs */}
      {selectedVariant && !selectedVariant.available ? (
        <div style={{ marginTop: 4 }}>
          <NotifyMeButton variantId={selectedVariant.id} productName={productName} />
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <motion.button
            disabled={!selectedSize}
            onClick={handleAddToCart}
            whileTap={reduced || !selectedSize ? {} : { scale: 0.97 }}
            // Usar tween para multi-keyframe (spring não suporta >2 frames)
            animate={addedFeedback && !reduced ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            style={{
              width:'100%', padding:'18px', borderRadius:12, fontSize:16, fontFamily:'var(--font-ui)', fontWeight:700,
              cursor:     selectedSize ? 'pointer' : 'not-allowed',
              border:     'none',
              background: addedFeedback ? '#2CB35A' : selectedSize ? 'var(--brand-orange)' : 'var(--border)',
              color:      '#fff', opacity: selectedSize ? 1 : .6,
              transition: 'background .28s ease',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={addedFeedback ? 'added' : 'default'}
                initial={reduced ? {} : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? {} : { opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                style={{ display:'block' }}
              >
                {addedFeedback ? '✓ Adicionado!' : 'Adicionar ao carrinho'}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            disabled={!selectedSize}
            onClick={handleBuyNow}
            whileTap={reduced || !selectedSize ? {} : { scale: 0.97 }}
            style={{
              width:'100%', padding:'18px', borderRadius:12, fontSize:16, fontFamily:'var(--font-ui)', fontWeight:700,
              cursor:     selectedSize ? 'pointer' : 'not-allowed',
              border:     '2px solid var(--ink-950)',
              background: selectedSize ? '#0B0E12' : 'transparent',
              color:      selectedSize ? '#fff' : 'var(--fg-muted)',
            }}
          >
            Comprar agora
          </motion.button>
        </div>
      )}

      {selectedVariant && selectedVariant.available && selectedVariant.stock <= 3 && (
        <div style={{ marginTop:12, fontFamily:'var(--font-ui)', fontSize:12, color:'#E23B3B', fontWeight:600 }}>
          ⚠️ Restam apenas {selectedVariant.stock} unidade{selectedVariant.stock > 1 ? 's' : ''}!
        </div>
      )}

      {/* ── Mobile CTA fixo — só aparece em ≤768px (via CSS) ── */}
      <div className="pdp-mobile-cta">
        <button
          className="wish"
          aria-label="Favoritar"
          style={{ background:'none', border:'1.5px solid var(--border-strong)', cursor:'pointer' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
          </svg>
        </button>
        <button
          className="buy"
          disabled={!selectedSize}
          onClick={handleBuyNow}
          style={{ opacity: selectedSize ? 1 : .6, cursor: selectedSize ? 'pointer' : 'not-allowed' }}
        >
          <span>{selectedSize ? 'Comprar agora' : 'Selecione o tamanho'}</span>
          {displayVariant && (
            <span style={{ fontSize:11, opacity:.9, fontFamily:'var(--font-mono)', fontWeight:500 }}>
              {fmt(activePrice(displayVariant))} · 12× {fmt(activePrice(displayVariant) / 12)}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
