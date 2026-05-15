import { useNavigate } from 'react-router-dom';

const categories = [
  { name: 'Campo (FG)', slug: 'campo', count: 189, icon: '⚽', desc: 'Grama natural e sintética firme' },
  { name: 'Society (SG)', slug: 'society', count: 76, icon: '🏟️', desc: 'Grama sintética e campos múltiplos' },
  { name: 'Futsal', slug: 'futsal', count: 54, icon: '🏅', desc: 'Quadras e pisos lisos' },
  { name: 'Tênis Casual', slug: 'tenis-casual', count: 123, icon: '👟', desc: 'Estilo e conforto para o dia a dia' },
  { name: 'Corrida', slug: 'corrida', count: 87, icon: '🏃', desc: 'Performance para treinos e provas' },
  { name: 'Camisas', slug: 'camisas', count: 45, icon: '👕', desc: 'Oficiais e torcedores' },
  { name: 'Meias', slug: 'meias', count: 32, icon: '🧦', desc: 'Alta performance e conforto' },
  { name: 'Acessórios', slug: 'acessorios', count: 28, icon: '🎽', desc: 'Caneleiras, bags e mais' },
];

export function CategoryTiles() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {categories.map(cat => (
        <button
          key={cat.slug}
          onClick={() => navigate(`/categoria/${cat.slug}`)}
          className="bg-(--bg-elev) border border-(--border) rounded-lg p-4 flex flex-col gap-2 hover:border-brand-orange/40 hover:shadow-md hover:bg-(--bg-sunk) transition-all duration-200 text-left group"
        >
          <div className="text-2xl">{cat.icon}</div>
          <div className="text-sm font-bold font-ui text-(--fg) group-hover:text-brand-orange transition-colors">
            {cat.name}
          </div>
          <div className="text-[11px] text-(--fg-faint)">{cat.desc}</div>
          <div className="text-[10px] font-semibold font-ui text-brand-teal mt-auto">
            {cat.count} modelos →
          </div>
        </button>
      ))}
    </div>
  );
}
