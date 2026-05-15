import { describe, it, expect } from 'vitest';
import { applyFilters, sortProducts, defaultFilters } from '../../core/usecases/filters';
import type { Product } from '../../core/domain/product';

const p = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1', slug: 'p1', brand: 'Nike', name: 'Phantom GX', colorway: 'Black', sku: 'p1',
  category: 'Campo (FG)', images: [], price: 500, sizes: [{ size: 42, available: true, stock: 2 }],
  description: '', features: [], specs: {}, rating: 4.5, reviewCount: 50,
  inStock: true, tags: ['campo'], ...overrides,
});

describe('filters usecases', () => {
  it('returns all products with default filters', () => {
    const products = [p(), p({ id: 'p2', brand: 'Adidas' })];
    expect(applyFilters(products, defaultFilters)).toHaveLength(2);
  });

  it('filters by brand', () => {
    const products = [p({ brand: 'Nike' }), p({ id: 'p2', brand: 'Adidas' })];
    const result = applyFilters(products, { ...defaultFilters, brands: ['Nike'] });
    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('Nike');
  });

  it('filters by category', () => {
    const products = [p({ category: 'Campo (FG)' }), p({ id: 'p2', category: 'Futsal' })];
    const result = applyFilters(products, { ...defaultFilters, categories: ['Futsal'] });
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Futsal');
  });

  it('filters by available size', () => {
    const products = [
      p({ sizes: [{ size: 42, available: true, stock: 1 }] }),
      p({ id: 'p2', sizes: [{ size: 44, available: true, stock: 1 }] }),
    ];
    const result = applyFilters(products, { ...defaultFilters, sizes: [42] });
    expect(result).toHaveLength(1);
  });

  it('filters by query string', () => {
    const products = [p({ name: 'Phantom GX' }), p({ id: 'p2', name: 'F50 Elite' })];
    const result = applyFilters(products, { ...defaultFilters, query: 'phantom' });
    expect(result).toHaveLength(1);
  });

  it('filters only discounted products', () => {
    const products = [p({ price: 400, originalPrice: 500 }), p({ id: 'p2', price: 300 })];
    const result = applyFilters(products, { ...defaultFilters, onlyDiscount: true });
    expect(result).toHaveLength(1);
  });

  it('sorts by lowest price', () => {
    const products = [p({ price: 500 }), p({ id: 'p2', price: 300 })];
    const result = sortProducts(products, 'menor-preco');
    expect(result[0].price).toBe(300);
  });

  it('sorts by highest price', () => {
    const products = [p({ price: 300 }), p({ id: 'p2', price: 700 })];
    const result = sortProducts(products, 'maior-preco');
    expect(result[0].price).toBe(700);
  });
});
