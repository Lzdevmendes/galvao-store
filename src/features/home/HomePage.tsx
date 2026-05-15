import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { BrandBanners } from './components/BrandBanners';
import { CategoryTiles } from './components/CategoryTiles';
import { Newsletter } from './components/Newsletter';
import { SectionHead } from '../../shared/ui/SectionHead';
import { ProductCard } from '../../shared/product/ProductCard';
import { getNewArrivals, getBestSellers } from '../../infrastructure/catalog/products';
import { usePageTitle } from '../../shared/ui/usePageTitle';

export function HomePage() {
  usePageTitle();
  const arrivals = getNewArrivals();
  const best = getBestSellers();

  return (
    <>
      <Hero />
      <TrustBar />

      <div className="container">
        {/* Lançamentos */}
        <SectionHead pre="★ Recém-chegadas" title="LANÇA" accent="MENTOS." linkTo="/lancamentos" />
        <div className="grid" data-density="4">
          {arrivals.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* Marcas */}
        <SectionHead pre="Compre por marca" title="SUA " accent="MARCA." />
        <BrandBanners />

        {/* Categorias */}
        <SectionHead pre="Onde você joga?" title="POR " accent="CATEGORIA." />
        <CategoryTiles />

        {/* Newsletter */}
        <div style={{ margin: '48px 0' }}>
          <Newsletter />
        </div>

        {/* Mais vendidas */}
        <SectionHead pre="★ Top 8 da semana" title="MAIS " accent="VENDIDAS." linkTo="/mais-vendidas" linkLabel="Ver ranking completo →" />
        <div className="grid" data-density="4">
          {best.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        <div style={{ height: 96 }} />
      </div>

      {/* Footer spacer replaced by footer in layout */}
    </>
  );
}
