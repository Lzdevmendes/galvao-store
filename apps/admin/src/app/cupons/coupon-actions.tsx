'use client'

import { useState, useTransition } from 'react'
import { toggleCoupon, createCoupon } from './actions'

const F: React.CSSProperties = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #1E2530', background:'#141922', color:'#F8F9FB', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }
const L: React.CSSProperties = { fontSize:11, color:'#6B7280', textTransform:'uppercase', letterSpacing:'.08em', display:'block', marginBottom:6 }

export function CouponActions({
  mode, couponId, active, compact = false,
}: {
  mode:      'toggle' | 'create'
  couponId?: string
  active?:   boolean
  compact?:  boolean
}) {
  const [pending, start] = useTransition()
  const [open, setOpen]  = useState(false)
  const [error, setError]= useState('')
  const [ok, setOk]      = useState('')

  // ── Toggle no card ──────────────────────────────────────────────
  if (mode === 'toggle' && couponId !== undefined && active !== undefined) {
    if (compact) {
      return (
        <button
          title={active ? 'Pausar cupom' : 'Activar cupom'}
          onClick={() => start(async () => { await toggleCoupon(couponId, active) })}
          disabled={pending}
          style={{
            fontSize:11, padding:'3px 10px', borderRadius:999, border:'none',
            background: active ? 'rgba(226,59,59,.15)' : 'rgba(44,179,90,.15)',
            color: active ? '#E23B3B' : '#2CB35A',
            cursor: pending ? 'not-allowed' : 'pointer', fontWeight:700,
            fontFamily:'var(--font-ui,Space Grotesk,sans-serif)',
            transition:'opacity .15s', opacity: pending ? .6 : 1,
          }}
        >
          {pending ? '...' : active ? 'Pausar' : 'Activar'}
        </button>
      )
    }
    return (
      <button
        onClick={() => start(async () => { await toggleCoupon(couponId, active) })}
        disabled={pending}
        style={{
          fontSize:11, padding:'4px 12px', borderRadius:6, border:'none',
          background: active ? '#E23B3B22' : '#2CB35A22',
          color: active ? '#E23B3B' : '#2CB35A',
          cursor: 'pointer', fontWeight:700,
        }}
      >
        {pending ? '...' : active ? 'Desactivar' : 'Activar'}
      </button>
    )
  }

  // ── Botão criar + modal ─────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ padding:'10px 20px', borderRadius:8, border:'none', background:'#F26B1F', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}
      >
        <span style={{ fontSize:16, lineHeight:1 }}>+</span> Novo Cupom
      </button>

      {open && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16 }}
          onClick={e => { if (e.target === e.currentTarget) { setOpen(false); setError(''); setOk('') } }}
        >
          <form
            onSubmit={e => {
              e.preventDefault()
              setError('')
              start(async () => {
                const res = await createCoupon(new FormData(e.currentTarget as HTMLFormElement))
                if (res.success) { setOk('Cupom criado com sucesso!'); setTimeout(() => { setOpen(false); setOk('') }, 1200) }
                else setError(res.error ?? 'Erro ao criar cupom.')
              })
            }}
            style={{ background:'#0B0E12', border:'1px solid #1E2530', borderRadius:14, padding:28, width:460, maxWidth:'100%', display:'flex', flexDirection:'column', gap:16 }}
          >
            <div>
              <h2 style={{ fontFamily:'Archivo Black, sans-serif', fontSize:20, margin:'0 0 4px' }}>Novo Cupom</h2>
              <p style={{ fontSize:12, color:'#6B7280', margin:0 }}>Preencha os dados do cupom. O código será automaticamente maiúsculo.</p>
            </div>

            <div>
              <label style={L}>Código *</label>
              <input name="code" placeholder="VERAO20" required
                style={{ ...F, textTransform:'uppercase', fontFamily:'JetBrains Mono,monospace', fontSize:15, fontWeight:700, letterSpacing:'.06em' }}
              />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={L}>Tipo *</label>
                <select name="type" required style={F}>
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
              </div>
              <div>
                <label style={L}>Valor *</label>
                <input name="value" type="number" min="1" step="0.01" placeholder="10" required style={F} />
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={L}>Pedido mín. (R$)</label>
                <input name="min_order" type="number" min="0" placeholder="Sem mínimo" style={F} />
              </div>
              <div>
                <label style={L}>Máx. usos totais</label>
                <input name="max_uses" type="number" min="1" placeholder="Ilimitado" style={F} />
              </div>
            </div>

            <div>
              <label style={L}>Expira em</label>
              <input name="expires_at" type="date" style={F} />
            </div>

            {error && (
              <div style={{ background:'rgba(226,59,59,.1)', border:'1px solid rgba(226,59,59,.3)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#E23B3B' }}>
                {error}
              </div>
            )}
            {ok && (
              <div style={{ background:'rgba(44,179,90,.1)', border:'1px solid rgba(44,179,90,.3)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#2CB35A' }}>
                ✅ {ok}
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button
                type="button"
                onClick={() => { setOpen(false); setError(''); setOk('') }}
                style={{ flex:1, padding:12, borderRadius:8, border:'1px solid #1E2530', background:'none', color:'#9CA3AF', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                style={{ flex:2, padding:12, borderRadius:8, border:'none', background: pending ? '#6B4226' : '#F26B1F', color:'#fff', cursor: pending ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit', transition:'background .15s' }}
              >
                {pending ? 'A criar...' : 'Criar Cupom'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
