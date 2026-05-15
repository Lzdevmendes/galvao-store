import Link from 'next/link'
import Image from 'next/image'
import { fmt } from '@/lib/utils'

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

export function ProductCard({ p }: { p: ProductCardData }) {
  const hasValidPromo = p.min_promo != null && p.min_promo < p.min_price
  const active = hasValidPromo ? p.min_promo! : p.min_price
  const pix    = active * 0.95
  const inst   = active / 12

  const badgeEl =
    p.badge === 'new'        ? <span style={{ background:'#0B0E12', color:'#fff', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)', letterSpacing:'.04em' }}>LANÇAMENTO</span>
  : p.badge === 'sale'       ? <span style={{ background:'#E23B3B', color:'#fff', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)' }}>OFERTA</span>
  : p.badge === 'bestseller' ? <span style={{ background:'#FFC83A', color:'#0B0E12', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)' }}>★ TOP</span>
  : p.badge === 'exclusive'  ? <span style={{ background:'#0B0E12', color:'#fff', border:'1px solid #F26B1F', padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, fontFamily:'var(--font-ui)' }}>EXCLUSIVO</span>
  : null

  return (
    <Link href={`/produto/${p.slug}`} className="pcard" style={{ display:'block' }}>
      <div className="img">
        {badgeEl && <div className="top-tags">{badgeEl}</div>}
        {p.image_url && (
          <Image
            src={p.image_url} alt={p.image_alt}
            width={400} height={400}
            style={{ width:'92%', height:'92%', objectFit:'contain', mixBlendMode:'multiply' }}
            loading="lazy"
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
  )
}
