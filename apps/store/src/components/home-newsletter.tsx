'use client'

import { useState } from 'react'

export function HomeNewsletter() {
  const [email, setEmail]   = useState('')
  const [state, setState]   = useState<'idle' | 'loading' | 'ok' | 'already' | 'error'>('idle')

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || state === 'loading' || state === 'ok') return
    setState('loading')
    try {
      const res  = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok)       { setState('error'); return }
      setState(data.already ? 'already' : 'ok')
    } catch {
      setState('error')
    }
  }

  const done = state === 'ok' || state === 'already'

  return (
    <div className="cta-banner">
      <div>
        <h3>BORA<br />JOGAR.</h3>
        <p>Cadastra teu e-mail. Avisamos em primeira mão dos lançamentos e ofertas relâmpago.</p>
      </div>
      <div className="right">
        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
            <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 4px' }}>
              {state === 'already' ? 'Você já está na lista!' : 'Você está no time!'}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(255,255,255,.7)', margin: 0 }}>
              Fique de olho na caixa de entrada.
            </p>
          </div>
        ) : (
          <form onSubmit={subscribe}>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (state !== 'idle') setState('idle') }}
              placeholder="seu@email.com"
              required
              disabled={state === 'loading'}
              style={{ width: '100%', padding: '14px 16px', border: '1px solid rgba(255,255,255,.3)', borderRadius: 10, background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 10, display: 'block', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="btn btn-lg"
              style={{ background: '#fff', color: '#0B0E12', width: '100%', cursor: state === 'loading' ? 'wait' : 'pointer', opacity: state === 'loading' ? .7 : 1 }}
            >
              {state === 'loading' ? 'Aguarde...' : 'Quero entrar →'}
            </button>
            {state === 'error' && (
              <p style={{ marginTop: 8, fontSize: 12, color: '#FCA5A5' }}>Tenta novamente em instantes.</p>
            )}
            <p style={{ marginTop: 8, fontSize: 12, opacity: .8 }}>Já são 12.430 craques no time.</p>
          </form>
        )}
      </div>
    </div>
  )
}
