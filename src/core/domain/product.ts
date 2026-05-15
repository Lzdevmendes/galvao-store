export type Brand = 'Nike' | 'Adidas' | 'Puma' | 'Umbro' | 'New Balance' | 'Joma';
export type Category = 'Campo (FG)' | 'Society (SG)' | 'Futsal' | 'Tênis Casual' | 'Corrida' | 'Camisas' | 'Meias';
export type BadgeType = 'new' | 'sale' | 'bestseller' | 'exclusive';

export interface ProductImage {
  url: string;
  alt: string;
}

export interface SizeStock {
  size: number;
  available: boolean;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  brand: Brand;
  line?: string;
  name: string;
  colorway: string;
  sku: string;
  category: Category;
  badge?: BadgeType;
  images: ProductImage[];
  price: number;
  originalPrice?: number;
  sizes: SizeStock[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tags: string[];
}

export interface CartItem {
  product: Product;
  size: number;
  quantity: number;
}

export type Theme = 'light' | 'dark';

export function getDiscountPct(product: Product): number {
  if (!product.originalPrice || product.originalPrice <= product.price) return 0;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

export function getPixPrice(price: number): number {
  return +(price * 0.95).toFixed(2);
}

export function getInstallment(price: number, n = 12): number {
  return +(price / n).toFixed(2);
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
