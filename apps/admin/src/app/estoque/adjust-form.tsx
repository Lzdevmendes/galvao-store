'use client'

import { useState, useTransition } from 'react'
import { adjustStock } from './actions'

const REASONS = [
  { value: 'purchase',   label: 'Compra'        },
  { value: 'return',     label: 'Devolução'      },
  { value: 'adjustment', label: 'Ajuste manual'  },
  { value: 'import',     label: 'Importação'     },
] as const

type Reason = typeof REASONS[number]['value']

const INPUT_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #1E2530',
  background: '#141922',
  color: '#F8F9FB',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

export function AdjustForm({ variantId }: { variantId: string }) {
  const [open, setOpen]       = useState(false)
  const [delta, setDelta]     = useState<number>(0)
  const [reason, setReason]   = useState<Reason>('adjustment')
  const [note, setNote]       = useState('')
  const [error, setError]     = useState('')
  const [ok, setOk]           = useState('')
  const [pending, start]      = useTransition()

  function reset() {
    setDelta(0)
    setReason('adjustment')
    setNote('')
    setError('')
    setOk('')
    setOpen(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setOk('')
    start(async () => {
      const res = await adjustStock(variantId, delta, reason, note)
      if (res.success) {
        setOk('Estoque ajustado.')
        setTimeout(reset, 1200)
      } else {
        setError(res.error ?? 'Erro desconhecido.')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #1E2530',
          background: 'none', color: '#F26B1F', cursor: 'pointer', fontWeight: 600,
        }}
      >
        Ajustar
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: 14, background: '#141922',
        border: '1px solid #1E2530', borderRadius: 8,
        minWidth: 260,
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 4 }}>
            Quantidade
          </label>
          <input
            type="number"
            value={delta}
            onChange={e => setDelta(Number(e.target.value))}
            placeholder="+5 ou -2"
            style={INPUT_STYLE}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 4 }}>
            Motivo
          </label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value as Reason)}
            style={INPUT_STYLE}
          >
            {REASONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 4 }}>
          Nota (opcional)
        </label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="ex: NF 12345"
          style={INPUT_STYLE}
        />
      </div>

      {error && <p style={{ fontSize: 11, color: '#E23B3B', margin: 0 }}>{error}</p>}
      {ok    && <p style={{ fontSize: 11, color: '#2CB35A', margin: 0 }}>{ok}</p>}

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={reset}
          style={{
            flex: 1, padding: '7px', borderRadius: 6, border: '1px solid #1E2530',
            background: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending || delta === 0}
          style={{
            flex: 2, padding: '7px', borderRadius: 6, border: 'none',
            background: pending || delta === 0 ? '#2A323D' : '#F26B1F',
            color: '#fff', cursor: pending || delta === 0 ? 'not-allowed' : 'pointer',
            fontSize: 12, fontWeight: 700,
          }}
        >
          {pending ? 'A guardar...' : 'Confirmar'}
        </button>
      </div>
    </form>
  )
}
