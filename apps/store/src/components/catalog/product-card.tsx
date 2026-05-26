'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { fmt } from '@/lib/utils'
import { WishlistButton } from './wishlist-button'

export interface ProductCardData {
  id: string
  slug: string
  name: string
  brand_name: string
  badge: string | null
  image_url: string
  image_alt: string
  min_price: number
  min_promo: number | null
}

export function ProductCard({ p, initialFavorited, priority }: { p: ProductCardData; initialFavorited?: boolean; priority?: boolean }) {
  const hasValidPromo = p.min_promo != null && p.min_promo < p.min_price
  const active = hasValidPromo ? p.min_promo! : p.min_price
  const pix    = Math.round(active * 0.95)
  const inst   = Math.round(active / 12)

  const badgeEl =
    p.badge === 'new'        ? <span style={{ background:'#0B0E12', color:'#fff', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)', letterSpacing:'.04em' }}>LANÇAMENTO</span>
  : p.badge === 'sale'       ? <span style={{ background:'#E23B3B', color:'#fff', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)' }}>OFERTA</span>
  : p.badge === 'bestseller' ? <span style={{ background:'#FFC83A', color:'#0B0E12', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)' }}>★ TOP</span>
  : p.badge === 'exclusive'  ? <span style={{ background:'#0B0E12', color:'#fff', border:'1px solid #F26B1F', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)' }}>EXCLUSIVO</span>
  : null

  return (
    <motion.div
      className="pcard"
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,.12)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <Link href={`/produto/${p.slug}`} style={{ display:'block', textDecoration:'none', color:'inherit' }}>
        <div className="img">
          <div className="top-tags">
            {badgeEl}
            <WishlistButton productId={p.id} initialFavorited={initialFavorited ?? false} />
          </div>
          {p.image_url && (
            <Image
              src={p.image_url} alt={p.image_alt}
              width={400} height={400}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              style={{ width:'92%', height:'92%', objectFit:'contain', mixBlendMode:'multiply' }}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
            />
          )}
        </div>
        <div className="info">
          <div className="brand">{p.brand_name}</div>
          <div className="name">{p.name}</div>
          <div className="price-row">
            {hasValidPromo && <span className="from">{fmt(p.min_price)}</span>}
            <span className="price">{fmt(active)}</span>
          </div>
          <div className="pix">
            12× {fmt(inst)} ou <strong>{fmt(pix)} no Pix</strong>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
