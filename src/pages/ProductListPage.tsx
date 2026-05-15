import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { products } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import type { Brand, Category } from '../types';

type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'mais-vendidos' | 'lancamentos';

const sortLabels: Record<SortOption, string> = {
  relevancia: 'Relevância',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  'mais-vendidos': 'Mais vendidos',
  lancamentos: 'Lançamentos',
};

const allBrands: Brand[] = ['Nike', 'Adidas', 'Puma', 'Umbro', 'New Balance', 'Mizuno', 'Joma'];
const allCategories: Category[] = ['Campo (FG)', 'Society (SG)', 'Futsal', 'Tênis Casual', 'Corrida', 'Camisas', 'Meias', 'Acessórios'];
const allSizes = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46];

interface Filters {
  brands: Brand[];
  categories: Category[];
  sizes: number[];
  priceRange: [number, number];
  onlyDiscount: boolean;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-(--border) pb-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-sm font-bold font-ui text-(--fg) mb-3"
      >
        {title}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  );
}

export function ProductListPage() {
  const { brand, category } = useParams<{ brand?: string; category?: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [sort, setSort] = useState<SortOption>('relevancia');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    brands: brand ? [brand as Brand] : [],
    categories: category ? [category as Category] : [],
    sizes: [],
    priceRange: [0, 2000],
    onlyDiscount: false,
  });

  const toggleFilter = <K extends keyof Filters>(key: K, value: Filters[K] extends (infer U)[] ? U : never) => {
    setFilters(f => {
      const arr = f[key] as unknown[];
      const has = arr.includes(value);
      return { ...f, [key]: has ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (query) list = list.filter(p => [p.name, p.brand, p.colorway, p.category, ...p.tags].join(' ').toLowerCase().includes(query.toLowerCase()));
    if (filters.brands.length) list = list.filter(p => filters.brands.includes(p.brand));
    if (filters.categories.length) list = list.filter(p => filters.categories.includes(p.category));
    if (filters.sizes.length) list = list.filter(p => filters.sizes.some(s => p.sizes.find(ps => ps.size === s && ps.available)));
    if (filters.onlyDiscount) list = list.filter(p => p.originalPrice && p.originalPrice > p.price);
    list = list.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

    switch (sort) {
      case 'menor-preco': return list.sort((a, b) => a.price - b.price);
      case 'maior-preco': return list.sort((a, b) => b.price - a.price);
      case 'mais-vendidos': return list.sort((a, b) => b.reviewCount - a.reviewCount);
      case 'lancamentos': return list.filter(p => p.badge === 'new').concat(list.filter(p => p.badge !== 'new'));
      default: return list.sort((a, b) => b.rating - a.rating);
    }
  }, [filters, sort, query]);

  const activeFilterCount = filters.brands.length + filters.categories.length + filters.sizes.length + (filters.onlyDiscount ? 1 : 0);

  const pageTitle = brand
    ? brand.charAt(0).toUpperCase() + brand.slice(1)
    : category
      ? category.replace('-', ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
      : query
        ? `Resultados para "${query}"`
        : 'Todos os produtos';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-5xl text-(--fg) leading-none">
            {pageTitle.toUpperCase()}
          </h1>
          <p className="text-sm text-(--fg-muted) mt-1">{filtered.length} produtos encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="flex items-center gap-2 h-10 px-4 rounded-md border border-(--border) text-sm font-semibold font-ui text-(--fg) hover:border-brand-orange transition-all lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="h-10 px-3 bg-(--bg-elev) border border-(--border) rounded-md text-sm text-(--fg) font-ui focus:outline-none focus:border-brand-orange transition-all cursor-pointer"
          >
            {Object.entries(sortLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`w-56 shrink-0 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-36 space-y-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-ui text-(--fg) uppercase tracking-widest">Filtros</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters({ brands: [], categories: [], sizes: [], priceRange: [0, 2000], onlyDiscount: false })}
                  className="text-[11px] text-brand-orange font-semibold font-ui flex items-center gap-1 hover:text-brand-orange-600"
                >
                  <X size={12} />Limpar tudo
                </button>
              )}
            </div>

            <FilterGroup title="Ofertas">
              <label className="flex items-center gap-2 text-sm text-(--fg-muted) cursor-pointer hover:text-(--fg)">
                <input
                  type="checkbox"
                  checked={filters.onlyDiscount}
                  onChange={e => setFilters(f => ({ ...f, onlyDiscount: e.target.checked }))}
                  className="accent-brand-orange w-4 h-4 rounded"
                />
                Apenas em promoção
              </label>
            </FilterGroup>

            <FilterGroup title="Marca">
              <div className="space-y-2">
                {allBrands.map(b => (
                  <label key={b} className="flex items-center gap-2 text-sm text-(--fg-muted) cursor-pointer hover:text-(--fg)">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(b)}
                      onChange={() => toggleFilter('brands', b)}
                      className="accent-brand-orange w-4 h-4 rounded"
                    />
                    {b}
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Categoria">
              <div className="space-y-2">
                {allCategories.map(c => (
                  <label key={c} className="flex items-center gap-2 text-sm text-(--fg-muted) cursor-pointer hover:text-(--fg)">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(c)}
                      onChange={() => toggleFilter('categories', c)}
                      className="accent-brand-orange w-4 h-4 rounded"
                    />
                    {c}
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Tamanho (BR)">
              <div className="flex flex-wrap gap-2">
                {allSizes.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleFilter('sizes', s)}
                    className={`w-10 h-9 text-xs font-semibold font-ui rounded-sm border transition-all ${
                      filters.sizes.includes(s)
                        ? 'bg-brand-orange text-white border-brand-orange'
                        : 'border-(--border) text-(--fg-muted) hover:border-brand-orange hover:text-brand-orange'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FilterGroup>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="font-display text-6xl text-(--border-strong) mb-4">:(</div>
              <p className="text-(--fg-muted)">Nenhum produto encontrado com esses filtros.</p>
              <button
                onClick={() => setFilters({ brands: [], categories: [], sizes: [], priceRange: [0, 2000], onlyDiscount: false })}
                className="mt-4 text-sm font-semibold font-ui text-brand-orange hover:text-brand-orange-600"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
