const items = [
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>,
    title: '12x sem juros', sub: 'no cartão de crédito',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><rect width="18" height="12" x="3" y="9" rx="2"/></svg>,
    title: 'Compra 100% segura', sub: 'site protegido por SSL',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 6 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6"/><path d="M3 10h18"/></svg>,
    title: 'Frete grátis Brasil', sub: 'acima de R$ 399',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>,
    title: '5% OFF no Pix', sub: 'aprovação imediata',
  },
];

export function TrustBar() {
  return (
    <div className="trust">
      <div className="container">
        <div className="row">
          {items.map(({ icon, title, sub }) => (
            <div key={title} className="item">
              {icon}
              <div><div className="t">{title}</div><div className="s">{sub}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
