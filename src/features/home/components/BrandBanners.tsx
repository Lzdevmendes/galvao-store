import { useNavigate } from 'react-router-dom';

const brands = [
  { key: 'nike',   label: 'NIKE',   count: 142, cls: 'nike' },
  { key: 'adidas', label: 'ADIDAS', count: 98,  cls: 'adidas' },
  { key: 'puma',   label: 'PUMA',   count: 64,  cls: 'puma' },
  { key: 'umbro',  label: 'UMBRO',  count: 38,  cls: 'umbro' },
];

export function BrandBanners() {
  const nav = useNavigate();
  return (
    <div className="brand-row">
      {brands.map(b => (
        <div key={b.key} className={`brand-banner ${b.cls}`} onClick={() => nav(`/marca/${b.key}`)}>
          <div className="logo">{b.label}</div>
          <div className="meta">
            <div className="count">{b.count} produtos</div>
            <div className="arrow">→</div>
          </div>
        </div>
      ))}
    </div>
  );
}
