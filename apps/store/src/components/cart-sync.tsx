'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/store/cart'

export function CartSync() {
  const { items, addItem, updateQty } = useCartStore()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        try {
          const res = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          })
          if (!res.ok) return
          const { items: merged } = await res.json() as { items: CartItem[] }
          // Merge DB items into local cart: add items not already present
          for (const dbItem of merged) {
            const local = useCartStore.getState().items.find(i => i.variantId === dbItem.variantId)
            if (!local) {
              addItem({ ...dbItem, quantity: undefined as never } as Omit<CartItem, 'quantity'>)
              if (dbItem.quantity > 1) updateQty(dbItem.variantId, dbItem.quantity)
            }
          }
        } catch { /* silent — cart sync is best effort */ }
      }
    })

    return () => subscription.unsubscribe()
  // Subscreve auth uma única vez no mount; `items` é lido via getState dentro do callback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
