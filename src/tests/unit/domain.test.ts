import { describe, it, expect } from 'vitest';
import { getDiscountPct, getPixPrice, getInstallment, formatBRL } from '../../core/domain/product';
import type { Product } from '../../core/domain/product';

const p = (price: number, originalPrice?: number): Product => ({
  id: 'x', slug: 'x', brand: 'Nike', name: 'T', colorway: 'T', sku: 'x',
  category: 'Campo (FG)', images: [], price, originalPrice, sizes: [],
  description: '', features: [], specs: {}, rating: 5, reviewCount: 0,
  inStock: true, tags: [],
});

describe('product domain helpers', () => {
  it('returns 0 discount when no originalPrice', () => {
    expect(getDiscountPct(p(500))).toBe(0);
  });

  it('calculates discount percentage correctly', () => {
    expect(getDiscountPct(p(500, 625))).toBe(20);
  });

  it('returns 0 when originalPrice equals price', () => {
    expect(getDiscountPct(p(500, 500))).toBe(0);
  });

  it('applies 5% PIX discount', () => {
    expect(getPixPrice(500)).toBe(475);
  });

  it('calculates 12x installment', () => {
    expect(getInstallment(600)).toBe(50);
  });

  it('formats BRL correctly', () => {
    expect(formatBRL(529.99)).toContain('529');
    expect(formatBRL(529.99)).toContain('R$');
  });
});
