import { Link, useLocation } from 'react-router-dom';

const links = [
  { label: 'PRODUTOS', to: '/produtos' },
  { label: 'NIKE', to: '/marca/nike' },
  { label: 'ADIDAS', to: '/marca/adidas' },
  { label: 'PUMA', to: '/marca/puma' },
  { label: 'UMBRO', to: '/marca/umbro' },
  { label: 'CAMPO', to: '/categoria/campo' },
  { label: 'SOCIETY', to: '/categoria/society' },
  { label: 'FUTSAL', to: '/categoria/futsal' },
];

export function BrandNav() {
  const location = useLocation();

  return (
    <nav className="bg-(--bg-elev) border-b border-(--border) sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {links.map(link => {
            const active = location.pathname === link.to || (link.to !== '/produtos' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  shrink-0 px-3.5 py-3.5 text-[11px] font-bold font-ui tracking-widest border-b-2 transition-all duration-150 whitespace-nowrap
                  ${active
                    ? 'text-brand-orange border-brand-orange'
                    : 'text-(--fg-muted) border-transparent hover:text-(--fg) hover:border-(--border-strong)'
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/ofertas"
            className="shrink-0 ml-auto px-3.5 py-3.5 text-[11px] font-bold font-ui tracking-widest text-brand-orange border-b-2 border-transparent hover:border-brand-orange transition-all whitespace-nowrap"
          >
            ★ OFERTAS
          </Link>
        </div>
      </div>
    </nav>
  );
}
