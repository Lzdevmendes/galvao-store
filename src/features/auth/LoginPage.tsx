import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function LoginPage() {
  const nav = useNavigate()
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); nav('/conta') }, 1000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', border: '1px solid var(--border-strong)',
    borderRadius: 'var(--r-md)', fontSize: 15, background: 'var(--bg-elev)',
    color: 'var(--fg)', fontFamily: 'inherit', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700,
    letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-muted)', display: 'block', marginBottom: 6,
  }

  return (
    <div className="auth-layout">
      {/* Brand panel */}
      <div className="auth-brand">
        <div className="wordmark">GALVÃO'S<br />STORE</div>
        <div>
          <blockquote>
            "NÃO É SÓ UMA<br />CHUTEIRA.<br />É O <em>PRIMEIRO<br />TOQUE.</em>"
          </blockquote>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 32 }}>
            {[{ n: '200+', s: 'Modelos' }, { n: '4.9★', s: 'Avaliação' }, { n: '12k+', s: 'Clientes' }].map(s => (
              <div key={s.n} style={{ background: 'var(--ink-900)', borderRadius: 'var(--r-md)', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--brand-orange)' }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="auth-form">
        <div className="auth-card">
          {mode === 'login' && (
            <>
              <h2>Bem-vindo de volta</h2>
              <p className="subtitle">Entra na tua conta para continuar.</p>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teu@email.com" style={inputStyle} required />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Senha</label>
                    <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Esqueci a senha</button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={inputStyle} required />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 12 }}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar →'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--fg-muted)' }}>
                Não tens conta?{' '}
                <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', fontWeight: 600, cursor: 'pointer' }}>Criar agora</button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <>
              <h2>Criar conta</h2>
              <p className="subtitle">Junta-te a 12.430 jogadores.</p>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nome completo</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="João da Silva" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teu@email.com" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Senha</label>
                  <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="Mínimo 8 caracteres" style={inputStyle} required />
                  {pass.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= Math.min(Math.floor(pass.length / 2), 4) ? i <= 2 ? 'var(--brand-red)' : i === 3 ? 'var(--brand-yellow)' : 'var(--brand-green)' : 'var(--border)' }} />
                      ))}
                    </div>
                  )}
                </div>
                <label style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--fg-muted)', cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input type="checkbox" required style={{ accentColor: 'var(--brand-orange)', marginTop: 2 }} />
                  <span>Aceito os <Link to="/termos" style={{ color: 'var(--brand-orange)' }}>Termos</Link> e a <Link to="/privacidade" style={{ color: 'var(--brand-orange)' }}>Política de Privacidade</Link></span>
                </label>
                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar conta →'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--fg-muted)' }}>
                Já tens conta?{' '}
                <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', fontWeight: 600, cursor: 'pointer' }}>Entrar</button>
              </p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', marginBottom: 24, fontSize: 13 }}>← Voltar</button>
              <h2>Recuperar senha</h2>
              <p className="subtitle">Enviamos um link de recuperação para o teu e-mail.</p>
              <form onSubmit={e => { e.preventDefault(); alert('Link enviado!'); setMode('login') }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teu@email.com" style={inputStyle} required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block">Enviar link →</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
