'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitReviews } from './actions'

type Item = { product_id: string; product_name: string; brand_name: string; image_url: string | null }

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          style={{ fontSize: 24, color: n <= value ? '#F59E0B' : '#D1D5DB', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          ★
        </button>
      ))}
    </div>
  )
}

export function ReviewForm({ orderId, customerId, items }: { orderId: string; customerId: string; items: Item[] }) {
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [bodies, setBodies]   = useState<Record<string, string>>({})
  const [pending, start]      = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const reviews = items.map(i => ({
      productId:  i.product_id,
      rating:     ratings[i.product_id] ?? 5,
      body:       bodies[i.product_id] ?? '',
    }))
    start(async () => {
      await submitReviews({ orderId, customerId, reviews })
      router.push('/conta/pedidos?avaliado=1')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {items.map(item => (
        <div key={item.product_id} className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-3">
            {item.image_url && (
              <img src={item.image_url} alt={item.product_name}
                className="h-14 w-14 rounded-lg object-cover" />
            )}
            <div>
              <p className="font-semibold">{item.product_name}</p>
              <p className="text-sm text-muted-foreground">{item.brand_name}</p>
            </div>
          </div>
          <Stars
            value={ratings[item.product_id] ?? 0}
            onChange={v => setRatings(p => ({ ...p, [item.product_id]: v }))}
          />
          <textarea
            value={bodies[item.product_id] ?? ''}
            onChange={e => setBodies(p => ({ ...p, [item.product_id]: e.target.value }))}
            placeholder="Conte como foi sua experiência... (opcional)"
            rows={3}
            className="mt-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-orange"
          />
        </div>
      ))}

      <button type="submit" disabled={pending || items.some(i => !ratings[i.product_id])}
        className="rounded-xl bg-brand-orange py-3 font-bold text-white disabled:opacity-50">
        {pending ? 'Enviando...' : 'Enviar avaliações'}
      </button>
    </form>
  )
}
