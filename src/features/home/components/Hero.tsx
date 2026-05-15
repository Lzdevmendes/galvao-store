import { useNavigate } from 'react-router-dom';

export function Hero() {
  const nav = useNavigate();
  return (
    <div className="hero">
      <div className="container">
        <div className="row">
          {/* Text side */}
          <div>
            <div className="pre">PRONTA ENTREGA · LANÇAMENTO 2026</div>
            <h1>JOGO<br /><span className="t">RÁPIDO.</span></h1>
            <p>Phantom GX III, F50, Future 8 Ultimate. As chuteiras que fizeram a temporada já estão na Galvão's. Pega antes de acabar.</p>
            <div className="ctas">
              <button className="btn btn-primary btn-lg" onClick={() => nav('/produtos')}>Comprar agora</button>
              <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,.1)', color: 'var(--white)', border: '1px solid rgba(255,255,255,.2)' }} onClick={() => nav('/lancamentos')}>Ver lançamentos</button>
            </div>
          </div>

          {/* Photo side */}
          <div className="photo">
            <img src="/products/phantom-gx3/01.jpg" alt="Nike Phantom GX III Elite" />
            <div className="price-tag">
              <span className="small">A PARTIR DE</span>
              R$ 529,99
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
