import { Link, useLocation } from 'react-router-dom';

const links = [
  { label: 'PRODUTOS',  to: '/produtos' },
  { label: 'NIKE',      to: '/marca/nike' },
  { label: 'ADIDAS',   to: '/marca/adidas' },
  { label: 'PUMA',     to: '/marca/puma' },
  { label: 'UMBRO',    to: '/marca/umbro' },
  { label: 'CAMPO',    to: '/categoria/campo' },
  { label: 'SOCIETY',  to: '/categoria/society' },
  { label: 'FUTSAL',   to: '/categoria/futsal' },
];

export function BrandNav() {
  const { pathname } = useLocation();

  return (
    <nav className="brands">
      <div className="container row">
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={pathname === l.to || (l.to !== '/produtos' && pathname.startsWith(l.to)) ? 'active' : undefined}
          >
            {l.label}
          </Link>
        ))}
        <Link to="/ofertas" className="offer" style={{ marginLeft: 'auto' }}>★ OFERTAS</Link>
      </div>
    </nav>
  );
}
