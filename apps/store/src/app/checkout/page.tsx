'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore, cartSubtotal } from '@/store/cart'
import { fmt, pixPrice, installment } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { calculateShipping, validateCoupon, createOrder } from './actions'
import type { ShippingOption } from './actions'

// ── Helpers ────────────────────────────────────────────────────────────────

const maskCep   = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
const maskPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
const maskCpf   = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

type FormData = {
  name: string; email: string; phone: string; cpf: string
  cep: string; street: string; number: string; complement: string
  district: string; city: string; state: string
  shippingMethod: string; shippingInCents: number; estimatedDays: number
  paymentMethod: 'pix' | 'credit_card' | 'boleto'
  couponCode: string; couponDiscountInCents: number; couponId: string
}

const EMPTY: FormData = {
  name: '', email: '', phone: '', cpf: '',
  cep: '', street: '', number: '', complement: '',
  district: '', city: '', state: '',
  shippingMethod: '', shippingInCents: 0, estimatedDays: 0,
  paymentMethod: 'pix',
  couponCode: '', couponDiscountInCents: 0, couponId: '',
}

// ── Styles reutilizáveis ───────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1.5px solid var(--border)', background: 'var(--bg)',
  color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
  color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.08em',
  display: 'block', marginBottom: 6,
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900,
  color: 'var(--fg)', marginBottom: 20, letterSpacing: '.02em',
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router   = useRouter()
  const { items, clear } = useCartStore()
  const subtotal = useCartStore(cartSubtotal)

  const [step, setStep]                 = useState(1)
  const [form, setForm]                 = useState<FormData>(EMPTY)
  const [shippingOpts, setShippingOpts] = useState<ShippingOption[]>([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [cepLoading, setCepLoading]     = useState(false)
  const [couponInput, setCouponInput]   = useState('')
  const [couponMsg, setCouponMsg]       = useState('')
  const [couponOk, setCouponOk]         = useState(false)

  // Pré-preencher com dados do Supabase se logado
  useEffect(() => {
    if (items.length === 0) { router.push('/'); return }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const meta = user.user_metadata ?? {}
      setForm(f => ({
        ...f,
        name:  meta.full_name  ?? f.name,
        email: user.email      ?? f.email,
        phone: meta.phone      ?? f.phone,
      }))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback((key: keyof FormData, value: string | number) => {
    setForm(f => ({ ...f, [key]: value }))
    setError('')
  }, [])

  // ViaCEP lookup
  const lookupCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCepLoading(true)
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(f => ({
          ...f,
          street:   data.logradouro ?? f.street,
          district: data.bairro     ?? f.district,
          city:     data.localidade ?? f.city,
          state:    data.uf         ?? f.state,
        }))
      }
    } catch { /* silent */ } finally {
      setCepLoading(false)
    }
  }, [])

  // Aplicar cupom
  const applyCoupon = useCallback(async () => {
    if (!couponInput.trim()) return
    setCouponMsg('Verificando...')
    const res = await validateCoupon(couponInput.trim(), subtotal)
    if (res.valid) {
      setForm(f => ({ ...f, couponCode: couponInput.trim(), couponDiscountInCents: res.discountInCents, couponId: res.couponId }))
      setCouponMsg(`✓ Cupom aplicado: -${fmt(res.discountInCents)}`)
      setCouponOk(true)
    } else {
      setForm(f => ({ ...f, couponCode: '', couponDiscountInCents: 0, couponId: '' }))
      setCouponMsg(res.error)
      setCouponOk(false)
    }
  }, [couponInput, subtotal])

  // Avançar para frete — busca opções
  const goToShipping = useCallback(async () => {
    setLoading(true)
    const opts = await calculateShipping(form.cep)
    setShippingOpts(opts)
    if (opts.length > 0 && !form.shippingMethod) {
      setForm(f => ({ ...f, shippingMethod: opts[0].method, shippingInCents: opts[0].priceInCents, estimatedDays: opts[0].days }))
    }
    setLoading(false)
    setStep(3)
  }, [form.cep, form.shippingMethod])

  // Finalizar pedido
  const submitOrder = useCallback(async () => {
    setLoading(true)
    setError('')
    const result = await createOrder({
      ...form,
      shippingMethod: form.shippingMethod as 'sedex' | 'pac' | 'local_delivery',
      cartItems: items.map(i => ({
        variantId:         i.variantId,
        productName:       i.productName,
        brandName:         i.brandName,
        imageUrl:          i.imageUrl,
        size:              i.size,
        color:             i.color,
        priceInCents:      i.priceInCents,
        pricePromoInCents: i.pricePromoInCents,
        quantity:          i.quantity,
      })),
      couponCode:            form.couponCode || undefined,
      couponDiscountInCents: form.couponDiscountInCents || undefined,
      couponId:              form.couponId   || undefined,
    })

    if (!result.success) { setError(result.error); setLoading(false); return }

    clear()
    const params = new URLSearchParams({ method: result.paymentMethod })
    if (result.pixQr)         params.set('qr',      result.pixQr)
    if (result.pixKey)        params.set('key',     result.pixKey)
    if (result.pixExpiresAt)  params.set('exp',     result.pixExpiresAt)
    if (result.boletoUrl)     params.set('burl',    result.boletoUrl)
    if (result.boletoBarCode) params.set('bcode',   result.boletoBarCode)

    router.push(`/pedido/${result.orderId}?${params}`)
  }, [form, items, clear, router])

  // ── Totais ─────────────────────────────────────────────────────────────

  const pixDisc    = form.paymentMethod === 'pix' ? Math.round(subtotal * 0.05) : 0
  const totalDisc  = form.couponDiscountInCents + pixDisc
  const total      = subtotal - totalDisc + form.shippingInCents

  // ── Validações por step ────────────────────────────────────────────────

  const step1Ok = form.name.trim().length >= 2 && form.email.includes('@')
  const step2Ok = form.cep.length === 9 && form.street.trim() && form.number.trim() && form.city.trim()
  const step3Ok = !!form.shippingMethod

  const steps = [
    { n: 1, label: 'Identificação' },
    { n: 2, label: 'Endereço' },
    { n: 3, label: 'Frete' },
    { n: 4, label: 'Pagamento' },
  ]

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>

      {/* Título */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, marginBottom: 32, letterSpacing: '.04em' }}>
        CHECKOUT
      </h1>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <button
              onClick={() => step > s.n && setStep(s.n)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                cursor: step > s.n ? 'pointer' : 'default', padding: 0,
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-ui)', flexShrink: 0,
                background: step > s.n ? 'var(--brand-green)' : step === s.n ? 'var(--brand-orange)' : 'var(--bg-sunk)',
                color: step >= s.n ? '#fff' : 'var(--fg-muted)',
                border: step === s.n ? '2px solid var(--brand-orange)' : '2px solid transparent',
              }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{
                fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: step === s.n ? 700 : 400,
                color: step === s.n ? 'var(--fg)' : step > s.n ? 'var(--brand-green)' : 'var(--fg-faint)',
                display: 'none',
              }}
                className="step-label"
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > s.n ? 'var(--brand-green)' : 'var(--border)', margin: '0 8px' }} />
            )}
          </div>
        ))}
      </div>

      {/* Layout principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

        {/* ── Formulário ──────────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-elev)', borderRadius: 16, padding: 32, border: '1px solid var(--border)' }}>

          {/* ── STEP 1: Identificação ─────────────────────────────────── */}
          {step === 1 && (
            <div>
              <p style={sectionTitle}>Seus dados</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Nome completo *</label>
                  <input style={fieldStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="João Silva" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>E-mail *</label>
                  <input style={fieldStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="joao@email.com" />
                </div>
                <div>
                  <label style={labelStyle}>Telefone</label>
                  <input style={fieldStyle} value={form.phone} onChange={e => set('phone', maskPhone(e.target.value))} placeholder="(11) 99999-0000" />
                </div>
                <div>
                  <label style={labelStyle}>CPF</label>
                  <input style={fieldStyle} value={form.cpf} onChange={e => set('cpf', maskCpf(e.target.value))} placeholder="000.000.000-00" />
                </div>
              </div>
              <BtnPrimary
                label="Continuar para Endereço"
                onClick={() => { if (!step1Ok) { setError('Preencha nome e e-mail.'); return } setError(''); setStep(2) }}
                disabled={!step1Ok}
                style={{ marginTop: 24 }}
              />
              {error && <ErrMsg msg={error} />}
            </div>
          )}

          {/* ── STEP 2: Endereço ──────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <p style={sectionTitle}>Endereço de entrega</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>CEP *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={fieldStyle}
                      value={form.cep}
                      onChange={e => {
                        const v = maskCep(e.target.value)
                        set('cep', v)
                        if (v.length === 9) lookupCep(v)
                      }}
                      placeholder="00000-000"
                    />
                    {cepLoading && (
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--fg-muted)' }}>...</span>
                    )}
                  </div>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Rua / Logradouro *</label>
                  <input style={fieldStyle} value={form.street} onChange={e => set('street', e.target.value)} placeholder="Rua das Flores" />
                </div>
                <div>
                  <label style={labelStyle}>Número *</label>
                  <input style={fieldStyle} value={form.number} onChange={e => set('number', e.target.value)} placeholder="123" />
                </div>
                <div>
                  <label style={labelStyle}>Complemento</label>
                  <input style={fieldStyle} value={form.complement} onChange={e => set('complement', e.target.value)} placeholder="Apto 42" />
                </div>
                <div>
                  <label style={labelStyle}>Bairro *</label>
                  <input style={fieldStyle} value={form.district} onChange={e => set('district', e.target.value)} placeholder="Centro" />
                </div>
                <div>
                  <label style={labelStyle}>Cidade *</label>
                  <input style={fieldStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="São Paulo" />
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <input style={{ ...fieldStyle, width: 80 }} maxLength={2} value={form.state} onChange={e => set('state', e.target.value.toUpperCase())} placeholder="SP" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <BtnGhost label="← Voltar" onClick={() => setStep(1)} />
                <BtnPrimary
                  label={loading ? 'Calculando...' : 'Continuar para Frete'}
                  onClick={goToShipping}
                  disabled={!step2Ok || loading}
                  style={{ flex: 1 }}
                />
              </div>
              {error && <ErrMsg msg={error} />}
            </div>
          )}

          {/* ── STEP 3: Frete ─────────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <p style={sectionTitle}>Opções de entrega</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {shippingOpts.map(opt => (
                  <label
                    key={opt.method}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
                      border: `2px solid ${form.shippingMethod === opt.method ? 'var(--brand-orange)' : 'var(--border)'}`,
                      background: form.shippingMethod === opt.method ? 'rgba(242,107,31,.06)' : 'var(--bg)',
                      transition: 'border-color .15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="radio"
                        name="shipping"
                        checked={form.shippingMethod === opt.method}
                        onChange={() => setForm(f => ({ ...f, shippingMethod: opt.method, shippingInCents: opt.priceInCents, estimatedDays: opt.days }))}
                        style={{ accentColor: 'var(--brand-orange)' }}
                      />
                      <div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14 }}>{opt.label}</div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)' }}>{opt.description}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: opt.priceInCents === 0 ? 'var(--brand-green)' : 'var(--fg)' }}>
                      {opt.priceInCents === 0 ? 'Grátis' : fmt(opt.priceInCents)}
                    </div>
                  </label>
                ))}
              </div>

              {/* Cupom */}
              <div style={{ marginTop: 28, padding: '20px', background: 'var(--bg-sunk)', borderRadius: 12 }}>
                <p style={{ ...labelStyle, marginBottom: 10 }}>Cupom de desconto</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...fieldStyle, flex: 1 }}
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg('') }}
                    placeholder="Ex: GALVAO10"
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    disabled={couponOk}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponOk || !couponInput.trim()}
                    style={{
                      padding: '12px 18px', borderRadius: 10, border: 'none', cursor: couponOk ? 'default' : 'pointer',
                      background: couponOk ? 'var(--brand-green)' : 'var(--brand-orange)', color: '#fff',
                      fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
                    }}
                  >
                    {couponOk ? '✓ OK' : 'Aplicar'}
                  </button>
                </div>
                {couponMsg && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, marginTop: 6, color: couponOk ? 'var(--brand-green)' : 'var(--brand-orange)' }}>
                    {couponMsg}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <BtnGhost label="← Voltar" onClick={() => setStep(2)} />
                <BtnPrimary
                  label="Continuar para Pagamento"
                  onClick={() => { if (!step3Ok) { setError('Selecione um frete.'); return } setStep(4) }}
                  disabled={!step3Ok}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 4: Pagamento ─────────────────────────────────────── */}
          {step === 4 && (
            <div>
              <p style={sectionTitle}>Forma de pagamento</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {/* PIX */}
                <PayMethod
                  selected={form.paymentMethod === 'pix'}
                  onSelect={() => set('paymentMethod', 'pix')}
                  icon="📱"
                  label="PIX"
                  badge="5% OFF"
                  description={`${fmt(pixPrice(subtotal - form.couponDiscountInCents + form.shippingInCents))} à vista`}
                />
                {/* Boleto */}
                <PayMethod
                  selected={form.paymentMethod === 'boleto'}
                  onSelect={() => set('paymentMethod', 'boleto')}
                  icon="📄"
                  label="Boleto Bancário"
                  description="Vence em 3 dias úteis"
                />
                {/* Cartão */}
                <PayMethod
                  selected={form.paymentMethod === 'credit_card'}
                  onSelect={() => set('paymentMethod', 'credit_card')}
                  icon="💳"
                  label="Cartão de Crédito"
                  description={`12x de ${fmt(installment(total))} sem juros`}
                />
              </div>

              {/* Info do método selecionado */}
              {form.paymentMethod === 'pix' && (
                <div style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--brand-green)', fontWeight: 600, marginBottom: 4 }}>
                    Pagamento via PIX
                  </p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)' }}>
                    O QR Code será gerado após confirmar o pedido. Válido por 30 minutos.
                  </p>
                </div>
              )}
              {form.paymentMethod === 'boleto' && (
                <div style={{ background: 'rgba(250,204,21,.08)', border: '1px solid rgba(250,204,21,.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#CA8A04', fontWeight: 600, marginBottom: 4 }}>
                    Pagamento via Boleto
                  </p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)' }}>
                    O boleto será gerado após confirmar. CPF é obrigatório. Compensação em 1–3 dias úteis.
                  </p>
                </div>
              )}
              {form.paymentMethod === 'credit_card' && (
                <div style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#6366F1', fontWeight: 600, marginBottom: 4 }}>
                    Cartão de Crédito — Em breve
                  </p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)' }}>
                    O pagamento com cartão estará disponível em breve. Use PIX ou Boleto por enquanto.
                  </p>
                </div>
              )}

              {error && <ErrMsg msg={error} style={{ marginBottom: 16 }} />}

              <div style={{ display: 'flex', gap: 12 }}>
                <BtnGhost label="← Voltar" onClick={() => setStep(3)} />
                <button
                  onClick={submitOrder}
                  disabled={loading || form.paymentMethod === 'credit_card'}
                  style={{
                    flex: 1, padding: '16px', borderRadius: 12, border: 'none',
                    cursor: loading || form.paymentMethod === 'credit_card' ? 'not-allowed' : 'pointer',
                    background: loading || form.paymentMethod === 'credit_card' ? 'var(--border)' : 'var(--brand-orange)',
                    color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16,
                  }}
                >
                  {loading ? 'Processando...' : `Confirmar pedido — ${fmt(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Resumo lateral ──────────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: 'var(--bg-elev)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, marginBottom: 20 }}>
              RESUMO DO PEDIDO
            </p>

            {/* Itens */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {items.map(item => {
                const price = item.pricePromoInCents != null && item.pricePromoInCents < item.priceInCents
                  ? item.pricePromoInCents : item.priceInCents
                return (
                  <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: 'var(--fg)' }}>
                        {item.productName}
                      </p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)' }}>
                        Tam. {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {fmt(price * item.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Totais */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Row label="Subtotal" value={fmt(subtotal)} />
              {form.couponDiscountInCents > 0 && (
                <Row label={`Cupom (${form.couponCode})`} value={`-${fmt(form.couponDiscountInCents)}`} green />
              )}
              {pixDisc > 0 && <Row label="Desconto PIX 5%" value={`-${fmt(pixDisc)}`} green />}
              {form.shippingInCents > 0
                ? <Row label="Frete" value={fmt(form.shippingInCents)} />
                : form.shippingMethod && <Row label="Frete" value="Grátis" green />
              }

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <Row label="TOTAL" value={fmt(total)} large />
                {form.paymentMethod === 'pix' && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--brand-green)', textAlign: 'right', marginTop: 4 }}>
                    {fmt(pixPrice(total - pixDisc))} no PIX (desconto já aplicado)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)' }}>
              Compra 100% segura — SSL + Mercado Pago
            </span>
          </div>
        </div>
      </div>

      {/* CSS para step labels em desktop */}
      <style>{`
        @media(min-width:640px){ .step-label{ display:inline !important } }
        @media(max-width:768px){
          .checkout-grid{ grid-template-columns:1fr !important }
        }
      `}</style>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BtnPrimary({ label, onClick, disabled, style }: {
  label: string; onClick: () => void; disabled?: boolean; style?: React.CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'block', width: '100%', padding: '15px 24px', borderRadius: 12, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? 'var(--border)' : 'var(--brand-orange)',
        color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15,
        ...style,
      }}
    >
      {label}
    </button>
  )
}

function BtnGhost({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 20px', borderRadius: 12, border: '1.5px solid var(--border)',
        background: 'none', cursor: 'pointer', color: 'var(--fg-muted)',
        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function ErrMsg({ msg, style }: { msg: string; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: 'var(--font-ui)', fontSize: 13, color: '#EF4444',
      marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,.08)',
      borderRadius: 8, ...style,
    }}>
      {msg}
    </p>
  )
}

function PayMethod({ selected, onSelect, icon, label, badge, description }: {
  selected: boolean; onSelect: () => void
  icon: string; label: string; badge?: string; description: string
}) {
  return (
    <label
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
        borderRadius: 12, cursor: 'pointer',
        border: `2px solid ${selected ? 'var(--brand-orange)' : 'var(--border)'}`,
        background: selected ? 'rgba(242,107,31,.06)' : 'var(--bg)',
        transition: 'border-color .15s',
      }}
    >
      <input type="radio" name="payment" checked={selected} onChange={onSelect} style={{ accentColor: 'var(--brand-orange)' }} />
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14 }}>{label}</span>
          {badge && (
            <span style={{ background: 'var(--brand-green)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99, fontFamily: 'var(--font-ui)' }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{description}</p>
      </div>
    </label>
  )
}

function Row({ label, value, green, large }: { label: string; value: string; green?: boolean; large?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: large ? 14 : 13, fontWeight: large ? 700 : 400, color: large ? 'var(--fg)' : 'var(--fg-muted)' }}>
        {label}
      </span>
      <span style={{ fontFamily: large ? 'var(--font-display)' : 'var(--font-ui)', fontSize: large ? 22 : 13, fontWeight: large ? 900 : 600, color: green ? 'var(--brand-green)' : large ? 'var(--brand-orange)' : 'var(--fg)' }}>
        {value}
      </span>
    </div>
  )
}
