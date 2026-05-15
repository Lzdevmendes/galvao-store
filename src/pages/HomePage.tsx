import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Hero } from '../components/home/Hero';
import { TrustBar } from '../components/home/TrustBar';
import { BrandBanners } from '../components/home/BrandBanners';
import { CategoryTiles } from '../components/home/CategoryTiles';
import { Newsletter } from '../components/home/Newsletter';
import { ProductCard } from '../components/product/ProductCard';
import { getNewArrivals, getBestSellers, getSaleProducts } from '../data/products';

function SectionHead({ pre, title, accent, linkTo, linkLabel }: {
  pre?: string;
  title: string;
  accent?: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        {pre && <div className="text-[10px] font-bold font-ui text-brand-orange tracking-widest uppercase mb-1">{pre}</div>}
        <h2 className="font-display text-4xl lg:text-5xl text-(--fg) leading-none tracking-wide">
          {title}
          {accent && <span className="text-brand-orange">{accent}</span>}
        </h2>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1.5 text-sm font-semibold font-ui text-brand-orange hover:text-brand-orange-600 transition-colors"
        >
          {linkLabel ?? 'Ver tudo'} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export function HomePage() {
  const newArrivals = getNewArrivals();
  const bestSellers = getBestSellers();
  const saleProducts = getSaleProducts();

  return (
    <div>
      <Hero />
      <TrustBar />

      <main className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-14">
        {/* New Arrivals */}
        <section>
          <SectionHead
            pre="★ Recém-chegadas"
            title="LANÇA"
            accent="MENTOS."
            linkTo="/lancamentos"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Brand Banners */}
        <section>
          <SectionHead pre="Compre por marca" title="SUA " accent="MARCA." />
          <BrandBanners />
        </section>

        {/* Categories */}
        <section>
          <SectionHead pre="Onde você joga?" title="POR " accent="CATEGORIA." />
          <CategoryTiles />
        </section>

        {/* Newsletter */}
        <Newsletter />

        {/* Best Sellers */}
        <section>
          <SectionHead
            pre="★ Top 8 da semana"
            title="MAIS "
            accent="VENDIDAS."
            linkTo="/mais-vendidas"
            linkLabel="Ver ranking completo"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {bestSellers.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Sale */}
        {saleProducts.length > 0 && (
          <section>
            <SectionHead
              pre="Ofertas relâmpago"
              title="PROMOÇÕES "
              accent="ATIVAS."
              linkTo="/ofertas"
              linkLabel="Ver todas as ofertas"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {saleProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
