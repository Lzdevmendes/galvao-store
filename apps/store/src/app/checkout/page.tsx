'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore, cartSubtotal } from '@/store/cart'
import { fmt, installment, maskCep, maskPhone, maskCpf, isCpfValid } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { calculateShipping, validateCoupon, createOrder } from './actions'
import type { ShippingOption } from './actions'

// ── Validators ─────────────────────────────────────────────────────────────

function isEmailValid(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function isPhoneValid(v: string) { return v.replace(/\D/g, '').length >= 10 }
function isCepValid(v: string)   { return v.replace(/\D/g, '').length === 8 }

function validateStep1(f: FormData): Record<string, string> {
  const e: Record<string, string> = {}
  if (!f.name.trim() || f.name.trim().split(' ').filter(Boolean).length < 2)
    e.name = 'Informe nome e sobrenome'
  if (!isEmailValid(f.email))
    e.email = 'E-mail inválido'
  if (!isPhoneValid(f.phone))
    e.phone = 'Telefone obrigatório — mínimo 10 dígitos'
  if (!isCpfValid(f.cpf))
    e.cpf = 'CPF obrigatório — preencha todos os 11 dígitos'
  return e
}

function validateStep2(f: FormData): Record<string, string> {
  const e: Record<string, string> = {}
  if (!isCepValid(f.cep))       e.cep      = 'CEP inválido'
  if (!f.street.trim())         e.street   = 'Rua obrigatória'
  if (!f.number.trim())         e.number   = 'Número obrigatório'
  if (!f.district.trim())       e.district = 'Bairro obrigatório'
  if (!f.city.trim())           e.city     = 'Cidade obrigatória'
  if (f.state.trim().length !== 2) e.state = 'UF inválida (ex: SP)'
  return e
}

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Styles ─────────────────────────────────────────────────────────────────

const field = (err?: string): React.CSSProperties => ({
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: `1.5px solid ${err ? '#EF4444' : 'var(--border)'}`,
  background: err ? 'rgba(239,68,68,.04)' : 'var(--bg)',
  color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
})

const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
  color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.08em',
  display: 'block', marginBottom: 6,
}

const secTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900,
  color: 'var(--fg)', marginBottom: 20, letterSpacing: '.02em',
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router   = useRouter()
  const { items, clear } = useCartStore()
  const subtotal = useCartStore(cartSubtotal)

  const [step, setStep]                 = useState(1)
  const [form, setForm]                 = useState<FormData>(EMPTY)
  const [errors, setErrors]             = useState<Record<string, string>>({})
  const [shippingOpts, setShippingOpts] = useState<ShippingOption[]>([])
  const [loading, setLoading]           = useState(false)
  const [submitError, setSubmitError]   = useState('')
  const [idempotencyKey]                = useState(() => crypto.randomUUID())
  const [cepLoading, setCepLoading]     = useState(false)
  const [couponInput, setCouponInput]   = useState('')
  const [couponMsg, setCouponMsg]       = useState('')
  const [couponOk, setCouponOk]         = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => {
    if (items.length === 0) { router.push('/'); return }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const meta = user.user_metadata ?? {}
      setForm(f => ({
        ...f,
        name:  meta.full_name ?? f.name,
        email: user.email     ?? f.email,
        phone: meta.phone     ?? f.phone,
      }))
    })
  // Inicialização única no mount (hidrata o formulário com user/carrinho).
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const set = useCallback((key: keyof FormData, value: string | number) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => { const next = { ...e }; delete next[key as string]; return next })
  }, [])

  // ViaCEP — autocomplete de endereço por CEP
  const lookupCep = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      if (data.erro) {
        setErrors(e => ({ ...e, cep: 'CEP não encontrado.' }))
      } else {
        setForm(f => ({
          ...f,
          street:   data.logradouro || f.street,
          district: data.bairro     || f.district,
          city:     data.localidade || f.city,
          state:    data.uf         || f.state,
        }))
        setErrors(e => {
          const next = { ...e }
          delete next.cep; delete next.street; delete next.district; delete next.city; delete next.state
          return next
        })
      }
    } catch {
      // Se a CSP ou rede bloquear, não quebra o fluxo — usuário preenche manualmente
    } finally {
      setCepLoading(false)
    }
  }, [])

  // Avançar step 1 → 2
  const goStep2 = useCallback(() => {
    const e = validateStep1(form)
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep(2)
  }, [form])

  // Avançar step 2 → 3 (busca frete)
  const goStep3 = useCallback(async () => {
    const e = validateStep2(form)
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    const shippingItems = items.map(i => ({
      variantId: i.variantId, quantity: i.quantity,
      priceInCents: i.priceInCents, pricePromoInCents: i.pricePromoInCents,
    }))
    const opts = await calculateShipping(form.cep, shippingItems)
    setShippingOpts(opts)
    if (opts.length > 0 && !form.shippingMethod) {
      setForm(f => ({ ...f, shippingMethod: opts[0].method, shippingInCents: opts[0].priceInCents, estimatedDays: opts[0].days }))
    }
    setLoading(false)
    setStep(3)
  }, [form, items])

  // Avançar step 3 → 4
  const goStep4 = useCallback(() => {
    if (!form.shippingMethod) { setErrors({ shipping: 'Selecione uma opção de frete' }); return }
    setErrors({})
    setStep(4)
  }, [form.shippingMethod])

  // Aplicar cupom
  const applyCoupon = useCallback(async () => {
    if (!couponInput.trim()) return
    setCouponMsg('Verificando...')
    const res = await validateCoupon(couponInput.trim(), subtotal)
    if (res.valid) {
      setForm(f => ({ ...f, couponCode: couponInput.trim(), couponDiscountInCents: res.discountInCents, couponId: res.couponId }))
      setCouponMsg(`✓ Desconto de ${fmt(res.discountInCents)} aplicado`)
      setCouponOk(true)
    } else {
      setForm(f => ({ ...f, couponCode: '', couponDiscountInCents: 0, couponId: '' }))
      setCouponMsg(res.error)
      setCouponOk(false)
    }
  }, [couponInput, subtotal])

  // Submeter pedido
  const submitOrder = useCallback(async () => {
    if (form.paymentMethod === 'boleto' && !isCpfValid(form.cpf)) {
      setSubmitError('CPF obrigatório para pagamento via boleto.')
      return
    }
    if (!acceptedTerms) {
      setSubmitError('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.')
      return
    }
    setLoading(true)
    setSubmitError('')
    const result = await createOrder({
      ...form,
      shippingMethod: form.shippingMethod as 'sedex' | 'pac' | 'local_delivery',
      cartItems: items.map(i => ({
        variantId: i.variantId, productName: i.productName, brandName: i.brandName,
        imageUrl: i.imageUrl, size: i.size, color: i.color,
        priceInCents: i.priceInCents, pricePromoInCents: i.pricePromoInCents, quantity: i.quantity,
      })),
      couponCode:            form.couponCode            || undefined,
      couponDiscountInCents: form.couponDiscountInCents || undefined,
      couponId:              form.couponId              || undefined,
      idempotencyKey,
      acceptedTerms,
    })
    if (!result.success) { setSubmitError(result.error); setLoading(false); return }
    clear()
    const params = new URLSearchParams({ method: result.paymentMethod })
    if (result.pixQr)         params.set('qr',    result.pixQr)
    if (result.pixKey)        params.set('key',   result.pixKey)
    if (result.pixExpiresAt)  params.set('exp',   result.pixExpiresAt)
    if (result.boletoUrl)     params.set('burl',  result.boletoUrl)
    if (result.boletoBarCode) params.set('bcode', result.boletoBarCode)
    router.push(`/pedido/${result.orderId}?${params}`)
  }, [form, items, clear, router, acceptedTerms])

  // ── Totais ─────────────────────────────────────────────────────────────

  const pixDisc   = form.paymentMethod === 'pix' ? Math.round(subtotal * 0.05) : 0
  const totalDisc = form.couponDiscountInCents + pixDisc
  const total     = subtotal - totalDisc + form.shippingInCents

  const steps = [
    { n: 1, label: 'Identificação' },
    { n: 2, label: 'Endereço' },
    { n: 3, label: 'Frete' },
    { n: 4, label: 'Pagamento' },
  ]

  return (
    <div className="container page-pad" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, marginBottom: 32, letterSpacing: '.04em' }}>
        CHECKOUT
      </h1>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <button
              onClick={() => step > s.n && setStep(s.n)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: step > s.n ? 'pointer' : 'default', padding: 0 }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-ui)', flexShrink: 0,
                background: step > s.n ? 'var(--brand-green)' : step === s.n ? 'var(--brand-orange)' : 'var(--bg-sunk)',
                color: step >= s.n ? '#fff' : 'var(--fg-muted)',
              }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: step === s.n ? 700 : 400, color: step === s.n ? 'var(--fg)' : step > s.n ? 'var(--brand-green)' : 'var(--fg-faint)', display: 'none' }} className="step-label">
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.n ? 'var(--brand-green)' : 'var(--border)', margin: '0 8px' }} />}
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="rg-sidebar">

        {/* ── Formulário ────────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-elev)', borderRadius: 16, padding: 'clamp(16px,4vw,32px)', border: '1px solid var(--border)' }}>

          {/* STEP 1 — Identificação */}
          {step === 1 && (
            <div>
              <p style={secTitle}>Seus dados</p>
              <div className="rg-form-2">

                <Field label="Nome completo *" error={errors.name} style={{ gridColumn: '1/-1' }}>
                  <input style={field(errors.name)} value={form.name}
                    onChange={e => set('name', e.target.value)} placeholder="João Silva" />
                </Field>

                <Field label="E-mail *" error={errors.email} style={{ gridColumn: '1/-1' }}>
                  <input style={field(errors.email)} type="email" value={form.email}
                    onChange={e => set('email', e.target.value)} placeholder="joao@email.com" />
                </Field>

                <Field label="Telefone *" error={errors.phone}>
                  <input style={field(errors.phone)} value={form.phone}
                    onChange={e => set('phone', maskPhone(e.target.value))} placeholder="(11) 99999-0000" />
                </Field>

                <Field label="CPF *" error={errors.cpf}>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...field(errors.cpf), paddingRight: 36 }}
                      value={form.cpf}
                      onChange={e => set('cpf', maskCpf(e.target.value))}
                      placeholder="000.000.000-00"
                    />
                    {form.cpf.replace(/\D/g, '').length === 11 && (
                      <span style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 16,
                      }}>
                        {isCpfValid(form.cpf) ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                  {form.cpf.replace(/\D/g, '').length === 11 && !isCpfValid(form.cpf) && !errors.cpf && (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#EF4444', marginTop: 4, marginBottom: 0 }}>
                      CPF inválido — verifique os dígitos
                    </p>
                  )}
                </Field>

              </div>
              <BtnPrimary label="Continuar para Endereço →" onClick={goStep2} style={{ marginTop: 24 }} />
            </div>
          )}

          {/* STEP 2 — Endereço */}
          {step === 2 && (
            <div>
              <p style={secTitle}>Endereço de entrega</p>
              <div className="rg-form-cep">

                <Field label="CEP *" error={errors.cep}>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={field(errors.cep)}
                      value={form.cep}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="00000-000"
                      onChange={e => {
                        const v = maskCep(e.target.value)
                        set('cep', v)
                        if (v.length === 9) lookupCep(v)
                      }}
                      onBlur={e => {
                        // cobre paste e preenchimento automático
                        const v = maskCep(e.target.value)
                        if (v.length === 9 && !form.street) lookupCep(v)
                      }}
                    />
                    {cepLoading && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--fg-muted)' }}>...</span>}
                  </div>
                </Field>

                <Field label="Rua / Logradouro *" error={errors.street}>
                  <input style={field(errors.street)} value={form.street}
                    onChange={e => set('street', e.target.value)} placeholder="Rua das Flores" />
                </Field>

                <Field label="Número *" error={errors.number}>
                  <input style={field(errors.number)} value={form.number}
                    onChange={e => set('number', e.target.value)} placeholder="123" />
                </Field>

                <Field label="Complemento" error={undefined}>
                  <input style={field()} value={form.complement}
                    onChange={e => set('complement', e.target.value)} placeholder="Apto 42 (opcional)" />
                </Field>

                <Field label="Bairro *" error={errors.district}>
                  <input style={field(errors.district)} value={form.district}
                    onChange={e => set('district', e.target.value)} placeholder="Centro" />
                </Field>

                <Field label="Cidade *" error={errors.city}>
                  <input style={field(errors.city)} value={form.city}
                    onChange={e => set('city', e.target.value)} placeholder="São Paulo" />
                </Field>

                <Field label="UF *" error={errors.state}>
                  <input style={{ ...field(errors.state), width: 80 }} maxLength={2} value={form.state}
                    onChange={e => set('state', e.target.value.toUpperCase())} placeholder="SP" />
                </Field>

              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <BtnGhost label="← Voltar" onClick={() => setStep(1)} />
                <BtnPrimary label={loading ? 'Calculando frete...' : 'Continuar para Frete →'}
                  onClick={goStep3} loading={loading} style={{ flex: 1 }} />
              </div>
            </div>
          )}

          {/* STEP 3 — Frete */}
          {step === 3 && (
            <div>
              <p style={secTitle}>Opções de entrega</p>

              {errors.shipping && <ErrMsg msg={errors.shipping} style={{ marginBottom: 16 }} />}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {shippingOpts.map(opt => (
                  <label key={opt.method} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${form.shippingMethod === opt.method ? 'var(--brand-orange)' : 'var(--border)'}`,
                    background: form.shippingMethod === opt.method ? 'rgba(242,107,31,.06)' : 'var(--bg)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="radio" name="shipping" checked={form.shippingMethod === opt.method}
                        onChange={() => { setForm(f => ({ ...f, shippingMethod: opt.method, shippingInCents: opt.priceInCents, estimatedDays: opt.days })); setErrors(e => { const n = { ...e }; delete n.shipping; return n }) }}
                        style={{ accentColor: 'var(--brand-orange)' }} />
                      <div>
                        <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, margin: 0 }}>{opt.label}</p>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: 0 }}>{opt.description}</p>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: opt.priceInCents === 0 ? 'var(--brand-green)' : 'var(--fg)' }}>
                      {opt.priceInCents === 0 ? 'Grátis' : fmt(opt.priceInCents)}
                    </span>
                  </label>
                ))}
              </div>

              {/* Cupom */}
              <div style={{ marginTop: 24, padding: 20, background: 'var(--bg-sunk)', borderRadius: 12 }}>
                <p style={{ ...lbl, marginBottom: 10 }}>Cupom de desconto</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontSize: 14, outline: 'none' }}
                    value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg('') }}
                    placeholder="Ex: GALVAO10" onKeyDown={e => e.key === 'Enter' && applyCoupon()} disabled={couponOk} />
                  <button onClick={applyCoupon} disabled={couponOk || !couponInput.trim()}
                    style={{ padding: '12px 18px', borderRadius: 10, border: 'none', cursor: couponOk ? 'default' : 'pointer', background: couponOk ? 'var(--brand-green)' : 'var(--brand-orange)', color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
                    {couponOk ? '✓ OK' : 'Aplicar'}
                  </button>
                </div>
                {couponMsg && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, marginTop: 6, color: couponOk ? 'var(--brand-green)' : '#EF4444' }}>{couponMsg}</p>}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <BtnGhost label="← Voltar" onClick={() => setStep(2)} />
                <BtnPrimary label="Continuar para Pagamento →" onClick={goStep4} style={{ flex: 1 }} />
              </div>
            </div>
          )}

          {/* STEP 4 — Pagamento */}
          {step === 4 && (
            <div>
              <p style={secTitle}>Forma de pagamento</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <PayMethod selected={form.paymentMethod === 'pix'} onSelect={() => set('paymentMethod', 'pix')}
                  icon="📱" label="PIX" badge="5% OFF"
                  description={`${fmt(subtotal - form.couponDiscountInCents - Math.round(subtotal * 0.05) + form.shippingInCents)} à vista`} />
                <PayMethod selected={form.paymentMethod === 'boleto'} onSelect={() => set('paymentMethod', 'boleto')}
                  icon="📄" label="Boleto Bancário" description="Vence em 3 dias úteis — requer CPF" />
                <PayMethod selected={form.paymentMethod === 'credit_card'} onSelect={() => set('paymentMethod', 'credit_card')}
                  icon="💳" label="Cartão de Crédito" description={`12x de ${fmt(installment(total))} sem juros`} />
              </div>

              {/* Info método */}
              {form.paymentMethod === 'pix' && (
                <InfoBox color="green" text="QR Code gerado após confirmar. Válido por 30 minutos." />
              )}
              {form.paymentMethod === 'boleto' && (
                <InfoBox color="yellow" text="Boleto gerado após confirmar. Compensação em 1–3 dias úteis. CPF obrigatório." />
              )}
              {form.paymentMethod === 'credit_card' && (
                <InfoBox color="indigo" text="Pagamento com cartão em breve. Por enquanto use PIX ou Boleto." />
              )}

              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 20,
                fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }}
                />
                <span>
                  Li e concordo com os{' '}
                  <Link href="/termos" target="_blank" style={{ color: 'var(--brand-orange)', fontWeight: 600 }}>Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" target="_blank" style={{ color: 'var(--brand-orange)', fontWeight: 600 }}>Política de Privacidade</Link>.
                </span>
              </label>

              {submitError && <ErrMsg msg={submitError} style={{ marginTop: 16 }} />}

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <BtnGhost label="← Voltar" onClick={() => setStep(3)} />
                <button
                  onClick={submitOrder}
                  disabled={loading || form.paymentMethod === 'credit_card' || !acceptedTerms}
                  style={{
                    flex: 1, padding: 16, borderRadius: 12, border: 'none',
                    cursor: loading || form.paymentMethod === 'credit_card' || !acceptedTerms ? 'not-allowed' : 'pointer',
                    background: loading || form.paymentMethod === 'credit_card' || !acceptedTerms ? 'var(--border)' : 'var(--brand-orange)',
                    color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16,
                  }}
                >
                  {loading ? 'Processando...' : `Confirmar pedido — ${fmt(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Resumo lateral ────────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: 'var(--bg-elev)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, marginBottom: 20 }}>RESUMO</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {items.map(item => {
                const price = item.pricePromoInCents != null && item.pricePromoInCents < item.priceInCents
                  ? item.pricePromoInCents : item.priceInCents
                return (
                  <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, margin: 0 }}>{item.productName}</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', margin: 0 }}>Tam. {item.size} · Qty {item.quantity}</p>
                    </div>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(price * item.quantity)}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SRow label="Subtotal" value={fmt(subtotal)} />
              {form.couponDiscountInCents > 0 && <SRow label={`Cupom (${form.couponCode})`} value={`-${fmt(form.couponDiscountInCents)}`} green />}
              {pixDisc > 0 && <SRow label="Desconto PIX 5%" value={`-${fmt(pixDisc)}`} green />}
              {form.shippingInCents > 0 ? <SRow label="Frete" value={fmt(form.shippingInCents)} /> : form.shippingMethod ? <SRow label="Frete" value="Grátis" green /> : null}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                <SRow label="TOTAL" value={fmt(total)} large />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13 }}>🔒</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)' }}>Compra 100% segura — SSL + Mercado Pago</span>
          </div>
        </div>
      </div>

      <style>{`
        @media(min-width:480px){ .step-label{ display:inline !important } }
        @media(max-width:479px){ .step-circle{ width:22px !important; height:22px !important; font-size:10px !important; } }
      `}</style>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Field({ label, error, children, style }: {
  label: string; error?: string; children: React.ReactNode; style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <label style={lbl}>{label}</label>
      {children}
      {error && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#EF4444', marginTop: 4, marginBottom: 0 }}>{error}</p>}
    </div>
  )
}

function BtnPrimary({ label, onClick, loading, style }: {
  label: string; onClick: () => void; loading?: boolean; style?: React.CSSProperties
}) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ display: 'block', width: '100%', padding: '15px 24px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'var(--border)' : 'var(--brand-orange)', color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, ...style }}>
      {label}
    </button>
  )
}

function BtnGhost({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ padding: '14px 20px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>
      {label}
    </button>
  )
}

function ErrMsg({ msg, style }: { msg: string; style?: React.CSSProperties }) {
  return (
    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#EF4444', padding: '10px 14px', background: 'rgba(239,68,68,.08)', borderRadius: 8, margin: 0, ...style }}>
      {msg}
    </p>
  )
}

function InfoBox({ color, text }: { color: 'green' | 'yellow' | 'indigo'; text: string }) {
  const colors = {
    green:  { bg: 'rgba(34,197,94,.08)',  border: 'rgba(34,197,94,.2)',  fg: 'var(--brand-green)' },
    yellow: { bg: 'rgba(250,204,21,.08)', border: 'rgba(250,204,21,.2)', fg: '#CA8A04'             },
    indigo: { bg: 'rgba(99,102,241,.08)', border: 'rgba(99,102,241,.2)', fg: '#6366F1'             },
  }[color]
  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '14px 18px' }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: 0 }}>{text}</p>
    </div>
  )
}

function PayMethod({ selected, onSelect, icon, label, badge, description }: {
  selected: boolean; onSelect: () => void; icon: string; label: string; badge?: string; description: string
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${selected ? 'var(--brand-orange)' : 'var(--border)'}`, background: selected ? 'rgba(242,107,31,.06)' : 'var(--bg)' }}>
      <input type="radio" name="payment" checked={selected} onChange={onSelect} style={{ accentColor: 'var(--brand-orange)' }} />
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14 }}>{label}</span>
          {badge && <span style={{ background: 'var(--brand-green)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99, fontFamily: 'var(--font-ui)' }}>{badge}</span>}
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2, marginBottom: 0 }}>{description}</p>
      </div>
    </label>
  )
}

function SRow({ label, value, green, large }: { label: string; value: string; green?: boolean; large?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: large ? 14 : 13, fontWeight: large ? 700 : 400, color: large ? 'var(--fg)' : 'var(--fg-muted)' }}>{label}</span>
      <span style={{ fontFamily: large ? 'var(--font-display)' : 'var(--font-ui)', fontSize: large ? 22 : 13, fontWeight: large ? 900 : 600, color: green ? 'var(--brand-green)' : large ? 'var(--brand-orange)' : 'var(--fg)' }}>{value}</span>
    </div>
  )
}
