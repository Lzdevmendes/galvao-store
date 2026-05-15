export type Brand = 'Nike' | 'Adidas' | 'Puma' | 'Umbro' | 'New Balance' | 'Mizuno' | 'Joma';
export type Category = 'Campo (FG)' | 'Society (SG)' | 'Futsal' | 'Tênis Casual' | 'Corrida' | 'Camisas' | 'Meias' | 'Acessórios';
export type BadgeType = 'new' | 'sale' | 'bestseller' | 'exclusive' | 'lowstock';

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

export type Theme = 'dark' | 'light';
export type Density = 'compact' | 'default' | 'comfortable';
