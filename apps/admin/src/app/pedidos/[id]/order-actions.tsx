'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from './actions'

const STATUS_TRANSITIONS: Record<string, { value: string; label: string; color: string }[]> = {
  pending_payment: [
    { value: 'paid',      label: '✅ Marcar como Pago',       color: '#2CB35A' },
    { value: 'cancelled', label: '❌ Cancelar',                color: '#E23B3B' },
  ],
  paid: [
    { value: 'processing', label: '📦 Em Processamento',       color: '#3B82F6' },
    { value: 'cancelled',  label: '❌ Cancelar',                color: '#E23B3B' },
  ],
  processing: [
    { value: 'shipped',   label: '🚚 Marcar como Enviado',     color: '#1FB5A8' },
    { value: 'cancelled', label: '❌ Cancelar',                 color: '#E23B3B' },
  ],
  shipped: [
    { value: 'delivered', label: '🏠 Marcar como Entregue',    color: '#2CB35A' },
  ],
}

interface Props {
  orderId: string
  currentStatus: string
  currentTracking?: string | null
}

export function OrderActions({ orderId, currentStatus, currentTracking }: Props) {
  const [trackingCode, setTrackingCode] = useState(currentTracking ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, startTransition] = useTransition()

  const transitions = STATUS_TRANSITIONS[currentStatus] ?? []

  const handleAction = (status: string) => {
    setError('')
    setSuccess('')
    startTransition(async () => {
      const res = await updateOrderStatus({ orderId, status, trackingCode: trackingCode || undefined })
      if (res.success) setSuccess(`Status actualizado para "${status}" com sucesso!`)
      else setError(res.error ?? 'Erro desconhecido')
    })
  }

  if (transitions.length === 0) return null

  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 15, margin: '0 0 16px' }}>
        Actualizar Status
      </h3>

      {/* Tracking code (só para shipped) */}
      {(currentStatus === 'processing' || currentStatus === 'paid') && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
            Código de Rastreio (obrigatório para &quot;Enviado&quot;)
          </label>
          <input
            value={trackingCode}
            onChange={e => setTrackingCode(e.target.value.toUpperCase())}
            placeholder="Ex: BR123456789BR"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #1E2530', background: '#141922',
              color: '#F8F9FB', fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {transitions.map(t => (
          <button key={t.value} onClick={() => handleAction(t.value)} disabled={pending}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: pending ? '#1E2530' : t.color,
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: pending ? 'not-allowed' : 'pointer', transition: 'opacity .15s',
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? 'A processar...' : t.label}
          </button>
        ))}
      </div>

      {error   && <p style={{ marginTop: 12, fontSize: 13, color: '#E23B3B' }}>❌ {error}</p>}
      {success && <p style={{ marginTop: 12, fontSize: 13, color: '#2CB35A' }}>✅ {success}</p>}
    </div>
  )
}
