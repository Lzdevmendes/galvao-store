import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { catalog } from '../../infrastructure/catalog/products';
import { applyFilters, sortProducts, defaultFilters } from '../../core/usecases/filters';
import type { FilterState, SortOption } from '../../core/usecases/filters';
import type { Brand, Category } from '../../core/domain/product';
import { ProductCard } from '../../shared/product/ProductCard';

const BRANDS: Brand[] = ['Nike', 'Adidas', 'Puma', 'Umbro', 'New Balance', 'Joma'];
const CATS: Category[] = ['Campo (FG)', 'Society (SG)', 'Futsal', 'Tênis Casual', 'Corrida', 'Camisas', 'Meias'];
const SIZES = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
const SORTS: { value: SortOption; label: string }[] = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
  { value: 'mais-vendidos', label: 'Mais vendidos' },
  { value: 'lancamentos', label: 'Lançamentos' },
];

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', width: '100%', padding: 0 }}
      >
        <h4 style={{ margin: '16px 0 8px' }}>{title}</h4>
        <span style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 18 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && children}
    </div>
  );
}

export function ListingPage() {
  const { brand, category } = useParams<{ brand?: string; category?: string }>();
  const [sp] = useSearchParams();
  const query = sp.get('q') ?? '';

  const [sort, setSort] = useState<SortOption>('relevancia');
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    brands: brand ? [brand as Brand] : [],
    categories: category ? [category as Category] : [],
    query,
  });

  const toggle = <K extends 'brands' | 'categories' | 'sizes'>(key: K, val: FilterState[K] extends (infer U)[] ? U : never) => {
    setFilters(f => {
      const arr = f[key] as unknown[];
      return { ...f, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  };

  const results = useMemo(() => sortProducts(applyFilters(catalog, { ...filters, query: filters.query || query }), sort), [filters, sort, query]);

  const pageTitle = brand
    ? brand.charAt(0).toUpperCase() + brand.slice(1)
    : category
      ? category.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : query ? `"${query}"` : 'Todos os produtos';

  const activeCount = filters.brands.length + filters.categories.length + filters.sizes.length + (filters.onlyDiscount ? 1 : 0);

  return (
    <div className="container">
      <div className="listing-head">
        <div className="crumb">LOJA / {pageTitle.toUpperCase()}</div>
        <h1>{pageTitle.toUpperCase().replace(/ \w+$/, ' ')}<span className="o">{pageTitle.toUpperCase().split(' ').pop()}.</span></h1>
        <div className="meta">{results.length} produtos encontrados</div>
      </div>

      <div className="listing-body">
        {/* Sidebar */}
        <aside className="filter">
          {activeCount > 0 && (
            <button
              className="clear"
              onClick={() => setFilters(defaultFilters)}
              style={{ marginBottom: 12, display: 'block' }}
            >
              ✕ Limpar filtros ({activeCount})
            </button>
          )}

          <label className="opt">
            <input type="checkbox" checked={filters.onlyDiscount} onChange={e => setFilters(f => ({ ...f, onlyDiscount: e.target.checked }))} />
            Apenas em promoção
          </label>

          <FilterGroup title="Marca">
            {BRANDS.map(b => (
              <label key={b} className="opt">
                <input type="checkbox" checked={filters.brands.includes(b)} onChange={() => toggle('brands', b)} />
                {b}
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Categoria">
            {CATS.map(c => (
              <label key={c} className="opt">
                <input type="checkbox" checked={filters.categories.includes(c)} onChange={() => toggle('categories', c)} />
                {c}
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Tamanho (BR)">
            <div className="size-grid">
              {SIZES.map(s => (
                <button
                  key={s}
                  className={`sz-btn${filters.sizes.includes(s) ? ' active' : ''}`}
                  onClick={() => toggle('sizes', s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Preço máximo">
            <div style={{ padding: '4px 0 8px' }}>
              <input
                type="range" min={0} max={2000} step={50}
                value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: +e.target.value }))}
                style={{ width: '100%', accentColor: 'var(--brand-orange)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>
                <span>R$ 0</span>
                <span style={{ fontWeight: 700, color: 'var(--fg)' }}>
                  {filters.maxPrice >= 2000 ? 'Todos' : `até R$ ${filters.maxPrice}`}
                </span>
                <span>R$ 2.000</span>
              </div>
            </div>
          </FilterGroup>
        </aside>

        {/* Product grid */}
        <div>
          <div className="listing-toolbar">
            <div className="chips">
              {filters.brands.map(b => (
                <span key={b} className="chip">{b} <button onClick={() => toggle('brands', b)}>✕</button></span>
              ))}
              {filters.onlyDiscount && <span className="chip">Promoção <button onClick={() => setFilters(f => ({ ...f, onlyDiscount: false }))}>✕</button></span>}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as SortOption)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-muted)' }}>
              <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 72, opacity: .3 }}>:(</div>
              <p style={{ marginTop: 16 }}>Nenhum produto encontrado.</p>
              <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setFilters(defaultFilters)}>Limpar filtros</button>
            </div>
          ) : (
            <div className="grid" data-density="3">
              {results.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}
