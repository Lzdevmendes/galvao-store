'use client'

import { useState } from 'react'

export function NotifyMeButton({ variantId, productName }: { variantId: string; productName: string }) {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/avise-me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, variantId, productName }),
    })
    const data = await res.json()
    if (res.ok) setSent(true)
    else setError(data.error ?? 'Erro ao registar.')
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        ✅ Avisaremos quando voltar ao estoque!
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Este tamanho está sem estoque. Deixe seu e-mail e avisamos quando voltar.</p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-orange"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? '...' : 'Avisar'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  )
}
