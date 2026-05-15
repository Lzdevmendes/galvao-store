import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Sun, Moon, X, Menu } from 'lucide-react';
import { useStore } from '../../store';

export function Header() {
  const { theme, toggleTheme, cartCount, wishlist } = useStore();
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const count = cartCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/busca?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-(--bg-elev) border-b border-(--border) shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-2 mr-2">
          <div className="font-display text-2xl text-brand-orange tracking-wider leading-none">
            GALVÃO'S
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[8px] font-bold font-ui text-(--fg-muted) tracking-widest uppercase">STORE</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--fg-faint)" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar chuteira, marca, modelo..."
            className="w-full h-10 pl-10 pr-4 bg-(--bg-sunk) border border-(--border) rounded-full text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
          />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-md flex items-center justify-center text-(--fg-muted) hover:bg-(--bg-sunk) hover:text-(--fg) transition-all"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/conta" className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md hover:bg-(--bg-sunk) transition-all">
            <User size={20} className="text-(--fg-muted)" />
            <span className="text-[9px] font-ui font-semibold text-(--fg-faint) hidden sm:block">Conta</span>
          </Link>

          <Link to="/favoritos" className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-md hover:bg-(--bg-sunk) transition-all">
            <Heart size={20} className="text-(--fg-muted)" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-brand-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center font-ui">
                {wishlist.length}
              </span>
            )}
            <span className="text-[9px] font-ui font-semibold text-(--fg-faint) hidden sm:block">Favoritos</span>
          </Link>

          <Link
            to="/carrinho"
            className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md bg-brand-orange text-white hover:bg-brand-orange-600 transition-all ml-1"
          >
            <ShoppingBag size={20} />
            <span className="text-[9px] font-ui font-semibold hidden sm:block">
              {count > 0 ? `${count} iten${count > 1 ? 's' : ''}` : 'Carrinho'}
            </span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-ink-950 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-ui">
                {count}
              </span>
            )}
          </Link>

          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-(--fg-muted) hover:bg-(--bg-sunk) rounded-md ml-1 transition-all"
            onClick={() => setMobileMenuOpen(o => !o)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--fg-faint)" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full h-10 pl-10 pr-4 bg-(--bg-sunk) border border-(--border) rounded-full text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange transition-all"
          />
        </form>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-(--border) bg-(--bg-elev) px-4 py-3 flex flex-col gap-2">
          {['PRODUTOS', 'NIKE', 'ADIDAS', 'PUMA', 'UMBRO', 'CAMPO', 'SOCIETY', 'FUTSAL'].map(item => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className="text-sm font-semibold font-ui text-(--fg-muted) hover:text-brand-orange py-1.5 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link to="/ofertas" className="text-sm font-bold font-ui text-brand-orange py-1.5">★ OFERTAS</Link>
        </div>
      )}
    </header>
  );
}
