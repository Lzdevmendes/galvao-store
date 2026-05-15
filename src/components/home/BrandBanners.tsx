import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const brands = [
  { name: 'NIKE', slug: 'nike', count: 142, bg: 'bg-ink-950', text: 'text-white', accent: '#F26B1F' },
  { name: 'ADIDAS', slug: 'adidas', count: 98, bg: 'bg-white', text: 'text-ink-950', accent: '#000' },
  { name: 'PUMA', slug: 'puma', count: 64, bg: 'bg-ink-900', text: 'text-white', accent: '#F26B1F' },
  { name: 'UMBRO', slug: 'umbro', count: 38, bg: 'bg-[#003366]', text: 'text-white', accent: '#fff' },
];

export function BrandBanners() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {brands.map(brand => (
        <button
          key={brand.slug}
          onClick={() => navigate(`/marca/${brand.slug}`)}
          className={`${brand.bg} ${brand.text} rounded-lg p-5 flex flex-col gap-3 hover:scale-[1.02] hover:shadow-xl transition-all duration-200 cursor-pointer text-left`}
        >
          <div
            className="font-display text-4xl lg:text-5xl tracking-wider leading-none"
            style={{ color: brand.accent }}
          >
            {brand.name}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs opacity-70">{brand.count} produtos</span>
            <ArrowRight size={16} className="opacity-70" />
          </div>
        </button>
      ))}
    </div>
  );
}
