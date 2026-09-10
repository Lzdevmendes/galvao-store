'use client'

import { useState, useTransition } from 'react'
import {
  createImportSource, toggleImportSource, testImportSource, runImportNow,
  createPriceRule, deletePriceRule, retryPendingItem, discardPendingItem,
} from './actions'

const inp: React.CSSProperties = {
  padding: '9px 12px', borderRadius: 8, border: '1px solid #1E2530',
  background: '#141922', color: '#F8F9FB', fontSize: 13, outline: 'none',
  fontFamily: 'Space Grotesk, sans-serif', boxSizing: 'border-box',
}
const label: React.CSSProperties = { fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }
const btnPrimary: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 8, border: 'none', background: '#F26B1F',
  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
}
const btnGhost: React.CSSProperties = {
  padding: '5px 10px', borderRadius: 6, border: '1px solid #1E2530', background: 'transparent',
  color: '#9CA3AF', fontSize: 11, fontWeight: 600, cursor: 'pointer', marginRight: 6,
}
const btnDanger: React.CSSProperties = { ...btnGhost, color: '#E23B3B', borderColor: '#E23B3B44' }

function Msg({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p style={{ color: '#E23B3B', fontSize: 12, marginTop: 8 }}>{error}</p>
  if (ok) return <p style={{ color: '#2CB35A', fontSize: 12, marginTop: 8 }}>{ok}</p>
  return null
}

export function RunAllButton() {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({})

  return (
    <div style={{ textAlign: 'right' }}>
      <button
        style={{ ...btnPrimary, opacity: pending ? .6 : 1, cursor: pending ? 'not-allowed' : 'pointer' }}
        disabled={pending}
        onClick={() => start(async () => {
          setMsg({})
          const res = await runImportNow()
          setMsg(res.success ? { ok: res.summary } : { error: res.error })
        })}
      >
        {pending ? 'Buscando…' : 'Buscar novidades agora'}
      </button>
      <Msg {...msg} />
    </div>
  )
}

export function TestSourceButton({ sourceId }: { sourceId: string }) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({})
  return (
    <span>
      <button style={btnGhost} disabled={pending} onClick={() => start(async () => {
        setMsg({})
        const res = await testImportSource(sourceId)
        setMsg(res.success ? { ok: res.summary } : { error: res.error })
      })}>
        {pending ? 'Testando…' : 'Testar agora'}
      </button>
      {(msg.ok || msg.error) && <Msg {...msg} />}
    </span>
  )
}

export function ToggleSourceButton({ sourceId, active }: { sourceId: string; active: boolean }) {
  const [pending, start] = useTransition()
  return (
    <button
      style={{ ...btnGhost, color: active ? '#E23B3B' : '#2CB35A' }}
      disabled={pending}
      onClick={() => start(async () => { await toggleImportSource(sourceId, !active) })}
    >
      {pending ? '...' : active ? 'Desativar' : 'Ativar'}
    </button>
  )
}

export function CreateSourceForm() {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({})

  return (
    <form
      action={(fd) => start(async () => {
        setMsg({})
        const res = await createImportSource(fd)
        setMsg(res.success ? { ok: 'Fonte criada — está inativa, teste antes de ativar.' } : { error: res.error })
      })}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, alignItems: 'end' }}
    >
      <div><label style={label}>Nome</label><input name="name" required style={{ ...inp, width: '100%' }} /></div>
      <div><label style={label}>URL (https://)</label><input name="base_url" type="url" required style={{ ...inp, width: '100%' }} /></div>
      <div><label style={label}>Parser key</label><input name="parser_key" required placeholder="ex: nike-atacado" style={{ ...inp, width: '100%' }} /></div>
      <div><label style={label}>Pacing (ms)</label><input name="request_delay_ms" type="number" defaultValue={1500} min={500} style={{ ...inp, width: '100%' }} /></div>
      <button type="submit" disabled={pending} style={{ ...btnPrimary, opacity: pending ? .6 : 1 }}>{pending ? 'Salvando…' : 'Adicionar fonte'}</button>
      <div style={{ gridColumn: '1/-1' }}><Msg {...msg} /></div>
    </form>
  )
}

export function CreatePriceRuleForm({ brands }: { brands: { id: string; name: string }[] }) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({})

  return (
    <form
      action={(fd) => start(async () => {
        setMsg({})
        const res = await createPriceRule(fd)
        setMsg(res.success ? { ok: 'Regra criada.' } : { error: res.error })
      })}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, alignItems: 'end' }}
    >
      <div>
        <label style={label}>Tipo</label>
        <select name="match_type" required style={{ ...inp, width: '100%' }}>
          <option value="sku">SKU exato</option>
          <option value="name_contains">Nome contém</option>
        </select>
      </div>
      <div><label style={label}>Valor</label><input name="match_value" required placeholder="ex: phantom-gx" style={{ ...inp, width: '100%' }} /></div>
      <div>
        <label style={label}>Marca (opcional)</label>
        <select name="brand_id" style={{ ...inp, width: '100%' }}>
          <option value="">qualquer</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div><label style={label}>Preço (R$)</label><input name="price" required placeholder="529,99" style={{ ...inp, width: '100%' }} /></div>
      <div><label style={label}>Promo (R$)</label><input name="price_promo" placeholder="opcional" style={{ ...inp, width: '100%' }} /></div>
      <button type="submit" disabled={pending} style={{ ...btnPrimary, opacity: pending ? .6 : 1 }}>{pending ? 'Salvando…' : 'Adicionar regra'}</button>
      <div style={{ gridColumn: '1/-1' }}><Msg {...msg} /></div>
    </form>
  )
}

export function DeletePriceRuleButton({ ruleId }: { ruleId: string }) {
  const [pending, start] = useTransition()
  return (
    <button style={btnDanger} disabled={pending} onClick={() => {
      if (!confirm('Remover esta regra de preço?')) return
      start(async () => { await deletePriceRule(ruleId) })
    }}>
      {pending ? '...' : 'Remover'}
    </button>
  )
}

export function RetryPendingButton({ pendingId }: { pendingId: string }) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({})
  return (
    <span>
      <button style={btnGhost} disabled={pending} onClick={() => start(async () => {
        setMsg({})
        const res = await retryPendingItem(pendingId)
        setMsg(res.success ? { ok: 'Publicado.' } : { error: res.error })
      })}>
        {pending ? '...' : 'Tentar de novo'}
      </button>
      {(msg.ok || msg.error) && <Msg {...msg} />}
    </span>
  )
}

export function DiscardPendingButton({ pendingId }: { pendingId: string }) {
  const [pending, start] = useTransition()
  return (
    <button style={btnDanger} disabled={pending} onClick={() => {
      if (!confirm('Descartar este item pendente?')) return
      start(async () => { await discardPendingItem(pendingId) })
    }}>
      {pending ? '...' : 'Descartar'}
    </button>
  )
}
