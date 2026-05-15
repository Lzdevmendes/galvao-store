import { useNavigate } from 'react-router-dom';

const cats = [
  {
    slug: 'campo', name: 'Campo (FG)', count: '189 modelos',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18 L21 18 L19 21 L5 21 Z M5 13 Q 12 8 19 13 L19 18 L5 18 Z"/></svg>,
  },
  {
    slug: 'society', name: 'Society (SG)', count: '76 modelos',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18 L21 18 L19 21 L5 21 Z M5 13 Q 12 9 19 13 L19 18 L5 18 Z"/><circle cx="9" cy="20" r="1"/><circle cx="15" cy="20" r="1"/></svg>,
  },
  {
    slug: 'futsal', name: 'Futsal', count: '54 modelos',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M3 16 L21 16 L21 19 L3 19 Z M5 11 Q 12 8 19 11 L19 16 L5 16 Z"/></svg>,
  },
  {
    slug: 'tenis-casual', name: 'Tênis Casual', count: '123 modelos',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 17 Q12 11 21 17 L21 19 L3 19 Z"/><path d="M8 14 L8 11 L16 11 L16 14"/></svg>,
  },
  {
    slug: 'corrida', name: 'Corrida', count: '87 modelos',
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 17 Q12 11 21 17 L21 19 L3 19 Z"/><path d="M5 14 L8 11 L13 13 L18 11"/></svg>,
  },
];

export function CategoryTiles() {
  const nav = useNavigate();
  return (
    <div className="cat-row">
      {cats.map(c => (
        <div key={c.slug} className="cat-tile" onClick={() => nav(`/categoria/${c.slug}`)}>
          <div className="ico">{c.icon}</div>
          <div className="name">{c.name}</div>
          <div className="count">{c.count}</div>
        </div>
      ))}
    </div>
  );
}
