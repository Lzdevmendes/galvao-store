import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export function SiteHeader() {
  const { theme, toggleTheme, cartCount, wishlist } = useStore();
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const count = cartCount();

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/busca?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="site">
      <div className="container row">
        {/* Logo */}
        <Link to="/" className="logo">
          <div>
            <div className="logo-wordmark">GALVÃO'S</div>
            <div className="logo-sub">Store · Alta Performance</div>
          </div>
        </Link>

        {/* Search */}
        <form className="search" onSubmit={search}>
          <svg className="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar chuteira, marca, modelo..."
          />
        </form>

        {/* Actions */}
        <div className="actions">
          <button onClick={toggleTheme} className="icon-btn" title="Alternar tema">
            {theme === 'light'
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>

          <Link to="/conta" className="icon-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="small">Conta</span>
          </Link>

          <Link to="/favoritos" className="icon-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
            <span className="small">{wishlist.length > 0 ? `${wishlist.length}` : 'Favoritos'}</span>
          </Link>

          <Link to="/carrinho" className="icon-btn cart-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="small">{count > 0 ? `${count} iten${count > 1 ? 's' : ''}` : 'Carrinho'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
