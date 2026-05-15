import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, Theme } from '../types';

interface StoreState {
  theme: Theme;
  cart: CartItem[];
  wishlist: string[];
  toggleTheme: () => void;
  addToCart: (product: Product, size: number) => void;
  removeFromCart: (productId: string, size: number) => void;
  updateQuantity: (productId: string, size: number, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  cartCount: () => number;
  cartTotal: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      cart: [],
      wishlist: [],

      toggleTheme: () => set(s => {
        const next = s.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        return { theme: next };
      }),

      addToCart: (product, size) => set(s => {
        const existing = s.cart.find(i => i.product.id === product.id && i.size === size);
        if (existing) {
          return { cart: s.cart.map(i =>
            i.product.id === product.id && i.size === size
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )};
        }
        return { cart: [...s.cart, { product, size, quantity: 1 }] };
      }),

      removeFromCart: (productId, size) => set(s => ({
        cart: s.cart.filter(i => !(i.product.id === productId && i.size === size)),
      })),

      updateQuantity: (productId, size, quantity) => set(s => ({
        cart: quantity <= 0
          ? s.cart.filter(i => !(i.product.id === productId && i.size === size))
          : s.cart.map(i => i.product.id === productId && i.size === size ? { ...i, quantity } : i),
      })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (productId) => set(s => ({
        wishlist: s.wishlist.includes(productId)
          ? s.wishlist.filter(id => id !== productId)
          : [...s.wishlist, productId],
      })),

      cartCount: () => get().cart.reduce((acc, i) => acc + i.quantity, 0),

      cartTotal: () => get().cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    }),
    { name: 'galvao-store' }
  )
);
