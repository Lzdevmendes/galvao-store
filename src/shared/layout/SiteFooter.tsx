import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site">
      <div className="container">
        <div className="foot-grid">
          <div>
            <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 36, color: 'var(--brand-orange)', letterSpacing: '.04em', marginBottom: 12 }}>GALVÃO'S</div>
            <p style={{ fontSize: 13, color: 'var(--ink-400)', lineHeight: 1.6, maxWidth: 280 }}>
              Chuteiras de alta performance para quem leva o jogo a sério. Nike, Adidas, Puma, Umbro e muito mais.
            </p>
          </div>
          <div>
            <h4>Catálogo</h4>
            <ul>
              {['Chuteiras Campo', 'Chuteiras Society', 'Chuteiras Futsal', 'Tênis de Corrida', 'Camisas Oficiais', 'Meias'].map(i => (
                <li key={i}><a href="#">{i}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Marcas</h4>
            <ul>
              {['Nike', 'Adidas', 'Puma', 'Umbro', 'New Balance', 'Joma'].map(b => (
                <li key={b}><Link to={`/marca/${b.toLowerCase()}`}>{b}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Atendimento</h4>
            <ul>
              {['Trocas e Devoluções', 'Rastrear Pedido', 'Tamanhos', 'Política de Privacidade', 'Termos de Uso'].map(i => (
                <li key={i}><a href="#">{i}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="legal">
          <span>© 2026 Galvão's Store · CNPJ 00.000.000/0001-00</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Pix', 'Visa', 'Master', 'Boleto'].map(m => (
              <span key={m} style={{ padding: '3px 8px', background: 'var(--ink-800)', color: 'var(--ink-300)', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 700 }}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
