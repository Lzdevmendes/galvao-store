import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/conta'); }, 1200);
  };

  return (
    <div className="min-h-[80vh] flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-ink-950 p-10 shrink-0">
        <div className="font-display text-5xl text-brand-orange tracking-wider">GALVÃO'S<br />STORE</div>
        <div>
          <blockquote className="text-ink-300 text-lg leading-relaxed font-display tracking-wide">
            "NÃO É SÓ UMA<br />CHUTEIRA. É O<br /><span className="text-brand-orange">PRIMEIRO TOQUE."</span>
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            {[
              { label: '200+', sub: 'Modelos' },
              { label: '4,9★', sub: 'Avaliação' },
              { label: '12k+', sub: 'Clientes' },
            ].map(s => (
              <div key={s.label} className="flex-1 bg-ink-800 rounded-md p-3 text-center">
                <div className="font-display text-xl text-brand-orange">{s.label}</div>
                <div className="text-[10px] text-ink-500 font-ui">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="font-display text-3xl text-brand-orange tracking-wider mb-8 lg:hidden">GALVÃO'S</div>

          {mode === 'login' && (
            <>
              <h1 className="font-heading text-2xl text-(--fg) mb-1">Bem-vindo de volta</h1>
              <p className="text-sm text-(--fg-muted) mb-8">Entra na tua conta para continuar.</p>

              <form onSubmit={submit} className="space-y-4">
                <InputField
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="teu@email.com"
                  icon={<Mail size={15} />}
                />
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold font-ui text-(--fg-muted) uppercase tracking-wider">Senha</label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-brand-orange font-semibold hover:text-brand-orange-600">Esqueci a senha</button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--fg-faint)" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 pl-10 pr-10 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--fg-faint) hover:text-(--fg)">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Entrar <ArrowRight size={16} />
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-(--border)" /></div>
                <div className="relative text-center text-xs text-(--fg-faint) bg-(--bg) px-3 mx-auto w-fit">ou continua com</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="h-10 rounded-md border border-(--border) text-sm font-semibold font-ui text-(--fg) hover:bg-(--bg-sunk) transition-all flex items-center justify-center gap-2">
                  <span className="text-base">G</span> Google
                </button>
                <button className="h-10 rounded-md border border-(--border) text-sm font-semibold font-ui text-(--fg) hover:bg-(--bg-sunk) transition-all flex items-center justify-center gap-2">
                  <span className="text-base">f</span> Facebook
                </button>
              </div>

              <p className="text-center text-sm text-(--fg-muted) mt-6">
                Não tens conta?{' '}
                <button onClick={() => setMode('register')} className="text-brand-orange font-semibold hover:text-brand-orange-600">Criar agora</button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <>
              <h1 className="font-heading text-2xl text-(--fg) mb-1">Cria a tua conta</h1>
              <p className="text-sm text-(--fg-muted) mb-8">Junta-te a mais de 12.000 jogadores.</p>

              <form onSubmit={submit} className="space-y-4">
                <InputField label="Nome completo" value={name} onChange={setName} placeholder="João da Silva" icon={<User size={15} />} />
                <InputField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="teu@email.com" icon={<Mail size={15} />} />
                <div className="relative">
                  <label className="block text-xs font-semibold font-ui text-(--fg-muted) uppercase tracking-wider mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--fg-faint)" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full h-10 pl-10 pr-10 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--fg-faint)">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= Math.min(Math.floor(password.length / 2), 4) ? i <= 2 ? 'bg-brand-red' : i === 3 ? 'bg-brand-yellow' : 'bg-brand-green' : 'bg-(--border)'}`} />
                      ))}
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 accent-brand-orange" />
                  <span className="text-xs text-(--fg-muted)">
                    Aceito os <Link to="/termos" className="text-brand-orange">Termos de Uso</Link> e a{' '}
                    <Link to="/privacidade" className="text-brand-orange">Política de Privacidade</Link>
                  </span>
                </label>

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Criar conta <ArrowRight size={16} />
                </Button>
              </form>

              <p className="text-center text-sm text-(--fg-muted) mt-6">
                Já tens conta?{' '}
                <button onClick={() => setMode('login')} className="text-brand-orange font-semibold">Entrar</button>
              </p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <button onClick={() => setMode('login')} className="text-xs text-(--fg-muted) hover:text-brand-orange mb-6 flex items-center gap-1">← Voltar</button>
              <h1 className="font-heading text-2xl text-(--fg) mb-1">Recuperar senha</h1>
              <p className="text-sm text-(--fg-muted) mb-8">Enviamos um link de recuperação para o teu e-mail.</p>
              <form onSubmit={e => { e.preventDefault(); alert('E-mail enviado!'); setMode('login'); }} className="space-y-4">
                <InputField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="teu@email.com" icon={<Mail size={15} />} />
                <Button type="submit" fullWidth size="lg">Enviar link de recuperação</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, icon }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold font-ui text-(--fg-muted) uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--fg-faint)">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-10 ${icon ? 'pl-10' : 'pl-3'} pr-3 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all`}
        />
      </div>
    </div>
  );
}
