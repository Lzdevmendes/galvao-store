import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  variantId:         string
  productId:         string
  productSlug:       string
  productName:       string
  brandName:         string
  imageUrl:          string
  size:              string
  color:             string
  priceInCents:      number
  pricePromoInCents: number | null
  quantity:          number
}

interface CartState {
  items:       CartItem[]
  isOpen:      boolean
  // Actions
  addItem:     (item: Omit<CartItem, 'quantity'>) => void
  removeItem:  (variantId: string) => void
  updateQty:   (variantId: string, quantity: number) => void
  clear:       () => void
  openCart:    () => void
  closeCart:   () => void
  toggleCart:  () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:  [],
      isOpen: false,

      addItem: (newItem) => {
        const existing = get().items.find(i => i.variantId === newItem.variantId)
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            isOpen: true,
          }))
        } else {
          set(s => ({ items: [...s.items, { ...newItem, quantity: 1 }], isOpen: true }))
        }
      },

      removeItem: (variantId) =>
        set(s => ({ items: s.items.filter(i => i.variantId !== variantId) })),

      updateQty: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set(s => ({
          items: s.items.map(i => i.variantId === variantId ? { ...i, quantity } : i),
        }))
      },

      clear:       () => set({ items: [] }),
      openCart:    () => set({ isOpen: true }),
      closeCart:   () => set({ isOpen: false }),
      toggleCart:  () => set(s => ({ isOpen: !s.isOpen })),
    }),
    {
      name:    'galvao_cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem:    () => null,
          setItem:    () => {},
          removeItem: () => {},
        }
      ),
      // Não persistir o estado de UI (isOpen)
      partialize: (s) => ({ items: s.items }),
    }
  )
)

// ── Selectors ──────────────────────────────────────────────────────────────
export const cartTotalItems = (s: CartState) =>
  s.items.reduce((acc, i) => acc + i.quantity, 0)

export const cartSubtotal = (s: CartState) =>
  s.items.reduce((acc, i) => {
    const price = i.pricePromoInCents != null && i.pricePromoInCents < i.priceInCents
      ? i.pricePromoInCents
      : i.priceInCents
    return acc + price * i.quantity
  }, 0)
