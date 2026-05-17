'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else window.location.href = '/'
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 8,
    border: '1px solid #1E2530', background: '#0F1318',
    color: '#F8F9FB', fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Space Grotesk, sans-serif',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B0E12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>
      <form onSubmit={login} style={{ width: 380, background: '#0F1318', border: '1px solid #1E2530', borderRadius: 16, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: '#F26B1F', letterSpacing: '.06em' }}>GALVÃO&apos;S</div>
          <div style={{ fontSize: 11, color: '#4A5462', letterSpacing: '.2em', marginTop: 4 }}>ADMIN PANEL</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inp} placeholder="admin@galvaosstore.com.br" />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inp} />
        </div>

        {error && <p style={{ fontSize: 13, color: '#E23B3B', marginBottom: 16 }}>❌ {error}</p>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 8, border: 'none', background: loading ? '#1E2530' : '#F26B1F', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
