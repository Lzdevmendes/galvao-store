import { useState } from 'react';
import { Zap } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="bg-ink-950 rounded-xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
      {/* Bg decoration */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-brand-teal/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex-1 relative">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-brand-orange" />
          <span className="text-[10px] font-bold font-ui text-brand-orange tracking-widest uppercase">Ofertas relâmpago</span>
        </div>
        <h2 className="font-display text-5xl lg:text-7xl text-white leading-none tracking-wide mb-3">
          BORA<br />JOGAR.
        </h2>
        <p className="text-ink-400 text-sm leading-relaxed max-w-sm">
          Cadastra teu e-mail. Avisamos em primeira mão dos lançamentos e ofertas relâmpago. Vai chuteira pro Pix antes da galera ver.
        </p>
      </div>

      <div className="flex-1 relative w-full">
        {submitted ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">⚽</div>
            <div className="font-display text-2xl text-brand-orange mb-2">VOCÊ ESTÁ NO TIME!</div>
            <p className="text-ink-400 text-sm">Primeiro a saber de tudo. Fique de olho no seu e-mail.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="flex-1 h-12 px-4 bg-ink-800 border border-ink-700 rounded-md text-white text-sm placeholder:text-ink-600 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
              />
              <button
                type="submit"
                className="h-12 px-5 bg-brand-orange hover:bg-brand-orange-600 text-white font-semibold font-ui text-sm rounded-md transition-all whitespace-nowrap"
              >
                Quero entrar →
              </button>
            </form>
            <p className="text-[11px] text-ink-600 mt-2">
              Já são 12.430 craques no time. Sem spam, prometemos.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
