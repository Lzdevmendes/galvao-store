import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setDone(true);
  };

  return (
    <div className="cta-banner">
      <div>
        <h3>BORA<br />JOGAR.</h3>
        <p>Cadastra teu e-mail. Avisamos em primeira mão dos lançamentos e ofertas relâmpago. Vai chuteira pro Pix antes da galera ver.</p>
      </div>
      <div className="right">
        {done ? (
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>
            ✓ VOCÊ ESTÁ NO TIME!
          </div>
        ) : (
          <form onSubmit={submit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%', padding: '14px 16px', marginBottom: 10,
                border: '1px solid rgba(255,255,255,.3)', borderRadius: 'var(--r-md)',
                background: 'rgba(255,255,255,.15)', color: '#fff',
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-lg" style={{ background: 'var(--white)', color: 'var(--ink-950)', width: '100%' }}>
              Quero entrar →
            </button>
          </form>
        )}
        <p className="small">Já são 12.430 craques no time.</p>
      </div>
    </div>
  );
}
