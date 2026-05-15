import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, Theme } from '../core/domain/product';
import { addToCart, removeFromCart, updateQty, cartTotal, cartCount } from '../core/usecases/cart';

interface Store {
  theme: Theme;
  cart: CartItem[];
  wishlist: string[];
  toggleTheme: () => void;
  addToCart: (product: Product, size: number) => void;
  removeFromCart: (id: string, size: number) => void;
  updateQty: (id: string, size: number, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  cartCount: () => number;
  cartTotal: () => number;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      theme: 'light',
      cart: [],
      wishlist: [],

      toggleTheme: () => set(s => {
        const next: Theme = s.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        return { theme: next };
      }),

      addToCart: (product, size) => set(s => ({ cart: addToCart(s.cart, product, size) })),
      removeFromCart: (id, size) => set(s => ({ cart: removeFromCart(s.cart, id, size) })),
      updateQty: (id, size, qty) => set(s => ({ cart: updateQty(s.cart, id, size, qty) })),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (id) => set(s => ({
        wishlist: s.wishlist.includes(id)
          ? s.wishlist.filter(x => x !== id)
          : [...s.wishlist, id],
      })),
      cartCount: () => cartCount(get().cart),
      cartTotal: () => cartTotal(get().cart),
    }),
    { name: 'galvao-store-v2' }
  )
);
