'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CONSENT_KEY = 'galvao_cookie_consent'
const ANON_KEY    = 'galvao_anon_id'

export default function PrivacyForm({ marketingOptIn }: { marketingOptIn: boolean }) {
  const router = useRouter()
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(marketingOptIn)
  const [saving, setSaving]       = useState(false)
  const [savedMsg, setSavedMsg]   = useState('')
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY)
      if (saved) {
        const d = JSON.parse(saved) as { analytics?: boolean; marketing?: boolean }
        setAnalytics(!!d.analytics)
        setMarketing(prev => d.marketing ?? prev)
      }
    } catch { /* ignore */ }
  }, [])

  const savePreferences = async () => {
    setSaving(true); setSavedMsg('')
    try {
      let anonId = localStorage.getItem(ANON_KEY)
      if (!anonId) { anonId = crypto.randomUUID(); localStorage.setItem(ANON_KEY, anonId) }
      const data = { necessary: true, analytics, marketing, acceptedAt: new Date().toISOString() }
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data))
      if (analytics) window.dispatchEvent(new Event('consent:analytics'))
      if (marketing) window.dispatchEvent(new Event('consent:marketing'))
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analytics, marketing, anonId }),
      })
      setSavedMsg('Preferências salvas.')
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Apagar sua conta é irreversível. Seus dados pessoais serão anonimizados e você será desconectado. Continuar?')) return
    setDeleting(true)
    try {
      const res = await fetch('/api/conta/deletar', { method: 'POST' })
      if (res.ok) { router.push('/'); router.refresh() }
      else { alert('Não foi possível apagar a conta agora. Tente novamente.'); setDeleting(false) }
    } catch {
      alert('Erro de rede. Tente novamente.'); setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Preferências de consentimento */}
      <section style={card}>
        <h2 style={cardTitle}>Preferências de cookies</h2>
        <Row label="Analíticos" desc="Google Analytics e Clarity — uso agregado para melhorar o site."
             checked={analytics} onChange={setAnalytics} />
        <Row label="Marketing" desc="Anúncios personalizados (Meta Pixel)."
             checked={marketing} onChange={setMarketing} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <button onClick={savePreferences} disabled={saving} style={btnPrimary}>
            {saving ? 'Salvando…' : 'Salvar preferências'}
          </button>
          {savedMsg && <span style={{ fontSize: 13, color: 'var(--brand-green)' }}>{savedMsg}</span>}
        </div>
      </section>

      {/* Direitos do titular */}
      <section style={card}>
        <h2 style={cardTitle}>Seus dados</h2>
        <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Você pode baixar uma cópia de todos os seus dados ou solicitar a eliminação da conta.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/api/conta/exportar" style={btnSecondary}>Exportar meus dados</a>
          <button onClick={deleteAccount} disabled={deleting} style={btnDanger}>
            {deleting ? 'Apagando…' : 'Apagar minha conta'}
          </button>
        </div>
      </section>
    </div>
  )
}

function Row({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
      <div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        aria-label={`${label}: ${checked ? 'ativado' : 'desativado'}`}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--brand-orange)' : 'var(--border)',
          position: 'relative', flexShrink: 0, transition: 'background .2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        }} />
      </button>
    </div>
  )
}

const card: React.CSSProperties = { background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }
const cardTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, margin: '0 0 16px' }
const btnPrimary: React.CSSProperties = { padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--brand-orange)', color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const btnSecondary: React.CSSProperties = { padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }
const btnDanger: React.CSSProperties = { padding: '10px 20px', borderRadius: 8, border: '1px solid var(--brand-red)', background: 'transparent', color: 'var(--brand-red)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
