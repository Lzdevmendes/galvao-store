'use client'

import { useState, useEffect } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      style={{
        padding: '10px 14px', borderRadius: 10,
        border: `1.5px solid ${copied ? 'var(--brand-green)' : 'var(--border)'}`,
        background: copied ? 'rgba(44,179,90,.1)' : 'none',
        cursor: 'pointer',
        color: copied ? 'var(--brand-green)' : 'var(--fg-muted)',
        fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        transition: 'all .2s',
      }}
    >
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  )
}

export function PixTimer({ expiresAt }: { expiresAt: string }) {
  const [diff, setDiff] = useState(() => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)))

  useEffect(() => {
    if (diff <= 0) return
    const id = setInterval(() => {
      setDiff(d => {
        if (d <= 1) { clearInterval(id); return 0 }
        return d - 1
      })
    }, 1000)
    return () => clearInterval(id)
  // Arranca o countdown do PIX uma única vez no mount.
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const m = String(Math.floor(diff / 60)).padStart(2, '0')
  const s = String(diff % 60).padStart(2, '0')
  const expired = diff === 0
  const urgent  = diff < 300 && diff > 0

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px',
      background: expired ? 'rgba(226,59,59,.1)' : urgent ? 'rgba(255,200,58,.1)' : 'var(--bg-sunk)',
      borderRadius: 99,
    }}>
      <span style={{ fontSize: 14 }}>{expired ? '⌛' : '⏱'}</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
        color: expired ? 'var(--brand-red)' : urgent ? '#F59E0B' : 'var(--fg)',
      }}>
        {expired ? 'Expirado' : `${m}:${s}`}
      </span>
      {!expired && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)' }}>restantes</span>}
    </div>
  )
}
