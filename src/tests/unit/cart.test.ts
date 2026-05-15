import { describe, it, expect } from 'vitest';
import { addToCart, removeFromCart, updateQty, cartTotal, cartCount } from '../../core/usecases/cart';
import type { Product } from '../../core/domain/product';

const mockProduct = (id = 'p1', price = 100): Product => ({
  id, slug: id, brand: 'Nike', name: 'Test', colorway: 'Black', sku: id,
  category: 'Campo (FG)', images: [], price, sizes: [], description: '',
  features: [], specs: {}, rating: 4.5, reviewCount: 10, inStock: true, tags: [],
});

describe('cart usecases', () => {
  it('adds a new item to an empty cart', () => {
    const cart = addToCart([], mockProduct(), 42);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
    expect(cart[0].size).toBe(42);
  });

  it('increments quantity when same product+size already in cart', () => {
    const p = mockProduct();
    const cart = addToCart([{ product: p, size: 42, quantity: 1 }], p, 42);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('adds as separate item when same product but different size', () => {
    const p = mockProduct();
    const cart = addToCart([{ product: p, size: 42, quantity: 1 }], p, 43);
    expect(cart).toHaveLength(2);
  });

  it('removes item from cart', () => {
    const p = mockProduct();
    const cart = removeFromCart([{ product: p, size: 42, quantity: 1 }], p.id, 42);
    expect(cart).toHaveLength(0);
  });

  it('updates quantity', () => {
    const p = mockProduct();
    const cart = updateQty([{ product: p, size: 42, quantity: 1 }], p.id, 42, 3);
    expect(cart[0].quantity).toBe(3);
  });

  it('removes item when quantity is set to 0', () => {
    const p = mockProduct();
    const cart = updateQty([{ product: p, size: 42, quantity: 2 }], p.id, 42, 0);
    expect(cart).toHaveLength(0);
  });

  it('calculates cart total correctly', () => {
    const p1 = mockProduct('p1', 100);
    const p2 = mockProduct('p2', 200);
    const total = cartTotal([
      { product: p1, size: 42, quantity: 2 },
      { product: p2, size: 41, quantity: 1 },
    ]);
    expect(total).toBe(400);
  });

  it('counts total items in cart', () => {
    const p = mockProduct();
    const count = cartCount([
      { product: p, size: 42, quantity: 3 },
      { product: p, size: 41, quantity: 2 },
    ]);
    expect(count).toBe(5);
  });
});
