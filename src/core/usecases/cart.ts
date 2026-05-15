import type { CartItem, Product } from '../domain/product';

export function addToCart(cart: CartItem[], product: Product, size: number): CartItem[] {
  const existing = cart.find(i => i.product.id === product.id && i.size === size);
  if (existing) {
    return cart.map(i =>
      i.product.id === product.id && i.size === size
        ? { ...i, quantity: i.quantity + 1 }
        : i
    );
  }
  return [...cart, { product, size, quantity: 1 }];
}

export function removeFromCart(cart: CartItem[], productId: string, size: number): CartItem[] {
  return cart.filter(i => !(i.product.id === productId && i.size === size));
}

export function updateQty(cart: CartItem[], productId: string, size: number, qty: number): CartItem[] {
  if (qty <= 0) return removeFromCart(cart, productId, size);
  return cart.map(i =>
    i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i
  );
}

export function cartTotal(cart: CartItem[]): number {
  return +cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toFixed(2);
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}
