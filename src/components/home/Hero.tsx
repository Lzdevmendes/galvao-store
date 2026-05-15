import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative bg-ink-950 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(242,107,31,0.3) 35px, rgba(242,107,31,0.3) 36px)',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text */}
          <div className="flex flex-col gap-5 order-2 lg:order-1">
            <div className="text-[10px] font-bold font-ui text-brand-teal tracking-widest uppercase border border-brand-teal/30 bg-brand-teal/10 rounded-pill px-3 py-1 w-fit">
              PRONTA ENTREGA · LANÇAMENTO 2026
            </div>
            <h1 className="font-display text-7xl lg:text-9xl text-white leading-none tracking-wide">
              JOGO<br />
              <span className="text-brand-orange">RÁPIDO.</span>
            </h1>
            <p className="text-ink-300 text-base leading-relaxed max-w-md">
              Phantom GX III, F50 Elite, Future 8 Ultimate. As chuteiras que fizeram a temporada já estão na Galvão's. Pega antes de acabar.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button size="lg" onClick={() => navigate('/produtos')}>
                Comprar agora
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('/lancamentos')}
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                Ver lançamentos
              </Button>
            </div>
          </div>

          {/* Product image */}
          <div className="relative order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-4 rounded-full bg-brand-orange/10 blur-3xl" />
              <img
                src="/products/phantom-gx3/01.jpg"
                alt="Nike Phantom GX III Elite"
                className="relative w-full h-full object-cover rounded-xl shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 40px rgba(242,107,31,0.3))' }}
              />
              <div className="absolute bottom-4 right-4 bg-brand-orange/90 backdrop-blur-sm text-white rounded-md px-3 py-2 shadow-lg">
                <div className="text-[9px] font-ui font-bold tracking-widest text-white/80">A PARTIR DE</div>
                <div className="text-lg font-bold font-ui leading-none">R$ 529,99</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
