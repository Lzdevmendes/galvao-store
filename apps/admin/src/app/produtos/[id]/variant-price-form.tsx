'use client'

import { useState, useTransition } from 'react'
import { updateVariantPrice } from './actions'
import { useToast } from '@/lib/toast'

const INP: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 6,
  border: '1px solid #1E2530', background: '#141922',
  color: '#F8F9FB', fontSize: 13, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

function toCents(raw: string): number | null {
  const n = parseFloat(raw.replace(',', '.'))
  if (isNaN(n) || n < 0) return null
  return Math.round(n * 100)
}

export function VariantPriceForm({
  variantId,
  priceInCents,
  promoInCents,
  costInCents,
}: {
  variantId: string
  priceInCents: number
  promoInCents: number | null
  costInCents: number | null
}) {
  const [open, setOpen]   = useState(false)
  const [price, setPrice] = useState((priceInCents / 100).toFixed(2))
  const [promo, setPromo] = useState(promoInCents != null ? (promoInCents / 100).toFixed(2) : '')
  const [cost, setCost]   = useState(costInCents != null ? (costInCents / 100).toFixed(2) : '')
  const [pending, start]  = useTransition()
  const toast             = useToast()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const p = toCents(price)
    if (!p || p <= 0) { toast.error('Preço inválido.'); return }
    const prm = promo.trim() ? toCents(promo) : null
    if (promo.trim() && prm === null) { toast.error('Promoção inválida.'); return }
    if (prm !== null && prm >= p) { toast.error('Promoção deve ser menor que o preço normal.'); return }
    const cst = cost.trim() ? toCents(cost) : null
    if (cost.trim() && cst === null) { toast.error('Custo inválido.'); return }
    start(async () => {
      const res = await updateVariantPrice(variantId, p, prm, cst)
      if (res.error) { toast.error(res.error) }
      else { toast.success('Preço actualizado.'); setOpen(false) }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: 11, padding: '3px 8px', borderRadius: 5,
          border: '1px solid #1E2530', background: 'none',
          color: '#6B7280', cursor: 'pointer', fontWeight: 600, marginTop: 4,
        }}
      >
        Editar preço
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: '#6B7280', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Preço (R$)
          </label>
          <input style={INP} value={price} onChange={e => setPrice(e.target.value)} placeholder="199.90" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: '#6B7280', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Promo (R$)
          </label>
          <input style={INP} value={promo} onChange={e => setPromo(e.target.value)} placeholder="Opcional" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: '#2CB35A', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Custo (R$)
          </label>
          <input style={INP} value={cost} onChange={e => setCost(e.target.value)} placeholder="Opcional" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: '5px', borderRadius: 5, border: '1px solid #1E2530', background: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
          Cancelar
        </button>
        <button type="submit" disabled={pending} style={{ flex: 2, padding: '5px', borderRadius: 5, border: 'none', background: pending ? '#2A323D' : '#F26B1F', color: '#fff', cursor: pending ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 700 }}>
          {pending ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
