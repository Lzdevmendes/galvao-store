import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../shared/store'
import { formatBRL, getPixPrice } from '../../core/domain/product'
import { useToast } from '../../shared/ui/Toast'

type Step = 'address' | 'payment' | 'review'
type PayMethod = 'pix' | 'credit' | 'boleto'

const PIX_CODE = '00020126580014br.gov.bcb.pix0136a629c8b9-4f12-4d23-9e8a-7b3c5d2e1f455204000053039865802BR5915GALVAOS COMERCIO6009SAO PAULO62070503***6304E2A1'

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input {...props} />
    </div>
  )
}

export function CheckoutPage() {
  const nav = useNavigate()
  const { cart, cartTotal, clearCart } = useStore()
  const total = cartTotal()
  const pix = getPixPrice(total)

  const [step, setStep] = useState<Step>('address')
  const [pay, setPay] = useState<PayMethod>('pix')
  const [done, setDone] = useState(false)
  const [orderNum] = useState(() => `GS-${Date.now().toString().slice(-6)}`)
  const [copied, setCopied] = useState(false)

  const { toast } = useToast()
  const [addr, setAddr] = useState({ name: '', email: '', phone: '', cep: '', street: '', number: '', complement: '', district: '', city: '', state: 'SP' })
  const [cepLoading, setCepLoading] = useState(false)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '', inst: '12' })

  const setA = (k: keyof typeof addr) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddr(a => ({ ...a, [k]: e.target.value }))
  const setC = (k: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setCard(c => ({ ...c, [k]: e.target.value }))

  // ViaCEP — preenche endereço automático
  const lookupCep = useCallback(async (raw: string) => {
    const cep = raw.replace(/\D/g, '')
    if (cep.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) { toast('CEP não encontrado', 'error'); return }
      setAddr(a => ({ ...a, street: data.logradouro, district: data.bairro, city: data.localidade, state: data.uf }))
      toast('Endereço preenchido automaticamente', 'success')
    } catch {
      toast('Erro ao buscar CEP', 'error')
    } finally {
      setCepLoading(false)
    }
  }, [toast])

  const placeOrder = () => { clearCart(); setDone(true) }

  if (cart.length === 0 && !done) { nav('/carrinho'); return null }

  if (done) return (
    <div className="container">
      <div className="order-success">
        <div className="check-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1>OBRIGADO!</h1>
        <div className="order-id">PEDIDO #{orderNum}</div>
        <p style={{ color: 'var(--fg-muted)', marginTop: 12, maxWidth: 480, margin: '12px auto' }}>
          Confirmação enviada para {addr.email || 'o teu e-mail'}. Acompanha o teu pedido em <Link to="/conta" style={{ color: 'var(--brand-orange)' }}>Minha Conta</Link>.
        </p>

        {pay === 'pix' && (
          <div style={{ maxWidth: 540, margin: '32px auto', textAlign: 'left' }}>
            <div className="pix-box">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Pagar com Pix</h3>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div className="qr">
                  <svg viewBox="0 0 80 80" width="120" height="120">
                    <defs><pattern id="qr1" patternUnits="userSpaceOnUse" width="6" height="6">
                      <rect width="3" height="3" fill="black"/><rect x="3" y="3" width="3" height="3" fill="black"/>
                    </pattern></defs>
                    <rect width="80" height="80" fill="url(#qr1)"/>
                    <rect x="0" y="0" width="22" height="22" fill="white"/><rect x="3" y="3" width="16" height="16" fill="black"/><rect x="7" y="7" width="8" height="8" fill="white"/>
                    <rect x="58" y="0" width="22" height="22" fill="white"/><rect x="61" y="3" width="16" height="16" fill="black"/><rect x="65" y="7" width="8" height="8" fill="white"/>
                    <rect x="0" y="58" width="22" height="22" fill="white"/><rect x="3" y="61" width="16" height="16" fill="black"/><rect x="7" y="65" width="8" height="8" fill="white"/>
                    <rect x="30" y="30" width="20" height="20" fill="white"/><rect x="33" y="33" width="14" height="14" fill="black"/><rect x="36" y="36" width="8" height="8" fill="white"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--brand-green)' }}>{formatBRL(pix)}</div>
                  <div style={{ fontSize: 12, color: 'var(--brand-orange)', fontWeight: 700, marginBottom: 12 }}>5% OFF já aplicado</div>
                  <div className="pix-code">{PIX_CODE.slice(0, 48)}...</div>
                  <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard.writeText(PIX_CODE); setCopied(true) }}>
                    {copied ? '✓ Copiado!' : '📋 Copiar código'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={() => nav('/')}>Continuar comprando</button>
          <button className="btn btn-ghost" onClick={() => nav('/conta')}>Ver meus pedidos</button>
        </div>
      </div>
    </div>
  )

  const STEPS = [
    { key: 'address' as Step, label: 'Endereço' },
    { key: 'payment' as Step, label: 'Pagamento' },
    { key: 'review' as Step, label: 'Revisão' },
  ]
  const si = STEPS.findIndex(s => s.key === step)

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      {/* Steps */}
      <div className="steps" style={{ marginBottom: 40 }}>
        {STEPS.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step${i === si ? ' active' : i < si ? ' done' : ''}`}>
              <div className="num">{i < si ? '✓' : i + 1}</div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13 }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`step-line${i < si ? ' done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        {/* Form */}
        <div>
          {step === 'address' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>Dados de entrega</h2>
              <div className="form-row">
                <Field label="Nome completo" value={addr.name} onChange={setA('name')} placeholder="João da Silva" />
                <Field label="E-mail" type="email" value={addr.email} onChange={setA('email')} placeholder="joao@email.com" />
              </div>
              <div className="form-row">
                <Field label="Telefone" value={addr.phone} onChange={setA('phone')} placeholder="(11) 99999-0000" />
                <div className="form-group">
                  <label>CEP</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={addr.cep}
                      onChange={e => { setA('cep')(e); if (e.target.value.replace(/\D/g,'').length === 8) lookupCep(e.target.value) }}
                      placeholder="00000-000"
                      maxLength={9}
                      style={{ paddingRight: cepLoading ? 36 : undefined }}
                    />
                    {cepLoading && <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>⏳</span>}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div style={{ gridColumn: 'span 2' }}><Field label="Rua / Avenida" value={addr.street} onChange={setA('street')} placeholder="Preenchido automaticamente pelo CEP" /></div>
              </div>
              <div className="form-row">
                <Field label="Número" value={addr.number} onChange={setA('number')} placeholder="1000" />
                <Field label="Complemento" value={addr.complement} onChange={setA('complement')} placeholder="Ap. 42 (opcional)" />
              </div>
              <div className="form-row">
                <Field label="Bairro" value={addr.district} onChange={setA('district')} placeholder="Centro" />
                <Field label="Cidade" value={addr.city} onChange={setA('city')} placeholder="São Paulo" />
              </div>
              <button className="btn btn-primary btn-lg" style={{ marginTop: 8 }} onClick={() => {
                if (!addr.name || !addr.email || !addr.cep || !addr.street) { toast('Preenche todos os campos obrigatórios', 'error'); return }
                setStep('payment')
              }}>
                Continuar para pagamento →
              </button>
            </>
          )}

          {step === 'payment' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>Forma de pagamento</h2>
              <div className="pay-methods">
                {[
                  { key: 'pix' as PayMethod, icon: '⚡', name: 'Pix', sub: '5% OFF' },
                  { key: 'credit' as PayMethod, icon: '💳', name: 'Cartão', sub: '12x sem juros' },
                  { key: 'boleto' as PayMethod, icon: '🏦', name: 'Boleto', sub: '1-3 dias úteis' },
                ].map(m => (
                  <div key={m.key} className={`pay-method${pay === m.key ? ' active' : ''}`} onClick={() => setPay(m.key)}>
                    <div className="icon">{m.icon}</div>
                    <div className="name">{m.name}</div>
                    <div className="sub">{m.sub}</div>
                  </div>
                ))}
              </div>

              {pay === 'credit' && (
                <div style={{ marginBottom: 24 }}>
                  <div className="form-row"><div style={{ gridColumn: 'span 2' }}><Field label="Número do cartão" value={card.number} onChange={setC('number')} placeholder="0000 0000 0000 0000" maxLength={19} /></div></div>
                  <Field label="Nome no cartão" value={card.name} onChange={setC('name')} placeholder="JOÃO DA SILVA" />
                  <div className="form-row">
                    <Field label="Validade" value={card.expiry} onChange={setC('expiry')} placeholder="MM/AA" maxLength={5} />
                    <Field label="CVV" value={card.cvv} onChange={setC('cvv')} placeholder="123" maxLength={4} type="password" />
                  </div>
                  <div className="form-group">
                    <label>Parcelas</label>
                    <select value={card.inst} onChange={setC('inst')} style={{ padding: 12, border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', background: 'var(--bg-elev)', color: 'var(--fg)', fontFamily: 'inherit' }}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}× de {formatBRL(total / n)} {n === 1 ? '(à vista)' : 'sem juros'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {pay === 'pix' && (
                <div style={{ background: 'rgba(44,179,90,.08)', border: '1px solid rgba(44,179,90,.2)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 24, fontSize: 13 }}>
                  <strong style={{ color: 'var(--brand-green)' }}>✓ Melhor opção</strong> — economizes {formatBRL(total * .05)} com o desconto Pix.
                  <br />O QR Code será gerado após confirmar o pedido.
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep('address')}>← Voltar</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep('review')}>Revisar pedido →</button>
              </div>
            </>
          )}

          {step === 'review' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>Revisão do pedido</h2>

              {/* Address summary */}
              <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: 13 }}>ENDEREÇO DE ENTREGA</strong>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep('address')}>Editar</button>
                </div>
                <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.6 }}>
                  {addr.name} · {addr.street}, {addr.number} — {addr.city}/{addr.state}
                </p>
              </div>

              {/* Payment summary */}
              <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: 13 }}>PAGAMENTO</strong>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep('payment')}>Editar</button>
                </div>
                <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: 0 }}>
                  {pay === 'pix' ? `Pix — ${formatBRL(pix)} (5% OFF)` : pay === 'credit' ? `Cartão ${card.inst}× de ${formatBRL(total / parseInt(card.inst))}` : `Boleto — ${formatBRL(total)}`}
                </p>
              </div>

              {/* Items */}
              <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: 24 }}>
                {cart.map(item => (
                  <div key={`${item.product.id}-${item.size}`} style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid var(--border)' }}>
                    <img src={item.product.images[0]?.url} alt="" style={{ width: 56, height: 56, objectFit: 'contain', background: 'var(--ink-100)', borderRadius: 'var(--r-sm)', mixBlendMode: 'multiply' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product.name} "{item.product.colorway}"</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Tam {item.size} · ×{item.quantity}</div>
                    </div>
                    <strong style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{formatBRL(item.product.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep('payment')}>← Voltar</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={placeOrder}>
                  🔒 Confirmar pedido · {formatBRL(pay === 'pix' ? pix : total)}
                </button>
              </div>
              <p style={{ fontSize: 11, color: 'var(--fg-faint)', textAlign: 'center', marginTop: 10 }}>
                Ao confirmar, aceitas os nossos Termos e Política de Privacidade.
              </p>
            </>
          )}
        </div>

        {/* Order sidebar */}
        <div>
          <div className="order-summary" style={{ position: 'sticky', top: 140 }}>
            <h3>Resumo ({cart.length} iten{cart.length > 1 ? 's' : ''})</h3>
            {cart.map(item => (
              <div key={`${item.product.id}-${item.size}`} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 13 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={item.product.images[0]?.url} alt="" style={{ width: 40, height: 40, objectFit: 'contain', background: 'var(--ink-100)', borderRadius: 'var(--r-sm)', mixBlendMode: 'multiply' }} />
                  <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: 'var(--fg)', color: 'var(--bg)', borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                </div>
                <span style={{ flex: 1, color: 'var(--fg-muted)' }}>{item.product.name}</span>
                <strong>{formatBRL(item.product.price * item.quantity)}</strong>
              </div>
            ))}
            <div className="total"><span>Total</span><span style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{formatBRL(total)}</span></div>
            {pay === 'pix' && <div className="pix-price row" style={{ justifyContent: 'space-between', marginTop: 4 }}><span>No Pix</span><strong>{formatBRL(pix)}</strong></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
