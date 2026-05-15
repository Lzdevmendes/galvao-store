import type { Product, Brand, Category } from '../domain/product';

export type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'mais-vendidos' | 'lancamentos';

export interface FilterState {
  brands: Brand[];
  categories: Category[];
  sizes: number[];
  maxPrice: number;
  onlyDiscount: boolean;
  query: string;
}

export const defaultFilters: FilterState = {
  brands: [],
  categories: [],
  sizes: [],
  maxPrice: 2000,
  onlyDiscount: false,
  query: '',
};

export function applyFilters(products: Product[], filters: FilterState): Product[] {
  return products.filter(p => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const match = [p.name, p.brand, p.colorway, p.category, ...p.tags].join(' ').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
    if (filters.categories.length && !filters.categories.includes(p.category)) return false;
    if (filters.sizes.length && !filters.sizes.some(s => p.sizes.find(ps => ps.size === s && ps.available))) return false;
    if (p.price > filters.maxPrice) return false;
    if (filters.onlyDiscount && !(p.originalPrice && p.originalPrice > p.price)) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products];
  switch (sort) {
    case 'menor-preco':   return list.sort((a, b) => a.price - b.price);
    case 'maior-preco':   return list.sort((a, b) => b.price - a.price);
    case 'mais-vendidos': return list.sort((a, b) => b.reviewCount - a.reviewCount);
    case 'lancamentos':   return list.sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0));
    default:              return list.sort((a, b) => b.rating - a.rating);
  }
}
