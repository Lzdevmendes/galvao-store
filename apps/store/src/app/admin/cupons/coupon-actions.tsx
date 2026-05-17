'use client'

import { useState, useTransition } from 'react'
import { toggleCoupon, createCoupon } from './actions'

export function CouponActions({ mode, couponId, active }: {
  mode:      'toggle' | 'create'
  couponId?: string
  active?:   boolean
}) {
  const [pending, start] = useTransition()
  const [open, setOpen]  = useState(false)
  const [error, setError]= useState('')
  const [ok, setOk]      = useState('')

  if (mode === 'toggle' && couponId !== undefined && active !== undefined) {
    return (
      <button
        onClick={() => start(async () => { await toggleCoupon(couponId, active) })}
        disabled={pending}
        style={{
          fontSize: 11, padding: '4px 12px', borderRadius: 6, border: 'none',
          background: active ? '#E23B3B22' : '#2CB35A22',
          color: active ? '#E23B3B' : '#2CB35A',
          cursor: 'pointer', fontWeight: 700,
        }}
      >
        {pending ? '...' : active ? 'Desactivar' : 'Activar'}
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#F26B1F', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
      >
        + Novo Cupom
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }} onClick={e => { if (e.target === e.currentTarget) { setOpen(false); setError(''); setOk('') } }}>
          <form
            onSubmit={e => {
              e.preventDefault()
              setError('')
              start(async () => {
                const res = await createCoupon(new FormData(e.currentTarget as HTMLFormElement))
                if (res.success) { setOk('Cupom criado!'); setTimeout(() => { setOpen(false); setOk('') }, 1200) }
                else setError(res.error ?? 'Erro')
              })
            }}
            style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 16, padding: 28, width: 420, display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <h2 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 18, margin: 0 }}>Novo Cupom</h2>

            {[
              { name: 'code', label: 'Código *', placeholder: 'VERAO20', type: 'text' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input name={f.name} placeholder={f.placeholder} type={f.type} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1E2530', background: '#141922', color: '#F8F9FB', fontSize: 13, outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase' }}
                />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>Tipo *</label>
                <select name="type" required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1E2530', background: '#141922', color: '#F8F9FB', fontSize: 13, outline: 'none' }}>
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Fixo (R$)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>Valor *</label>
                <input name="value" type="number" min="1" step="0.01" placeholder="10" required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1E2530', background: '#141922', color: '#F8F9FB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>Pedido mín. (R$)</label>
                <input name="min_order" type="number" min="0" placeholder="100"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1E2530', background: '#141922', color: '#F8F9FB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>Máx. usos</label>
                <input name="max_uses" type="number" min="1" placeholder="∞"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1E2530', background: '#141922', color: '#F8F9FB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>Expira em</label>
              <input name="expires_at" type="date"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #1E2530', background: '#141922', color: '#F8F9FB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {error && <p style={{ fontSize: 12, color: '#E23B3B', margin: 0 }}>❌ {error}</p>}
            {ok    && <p style={{ fontSize: 12, color: '#2CB35A', margin: 0 }}>✅ {ok}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setOpen(false); setError(''); setOk('') }}
                style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #1E2530', background: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Cancelar
              </button>
              <button type="submit" disabled={pending}
                style={{ flex: 2, padding: '11px', borderRadius: 8, border: 'none', background: '#F26B1F', color: '#fff', cursor: pending ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700 }}>
                {pending ? 'A criar...' : 'Criar Cupom'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
