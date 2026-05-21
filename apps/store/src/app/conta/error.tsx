'use client'

import Link from 'next/link'

export default function ContaError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container" style={{ paddingTop: 64, paddingBottom: 96, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
      <p style={{ fontSize: 40, marginBottom: 16 }}>🔒</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, marginBottom: 12 }}>
        Erro na sua conta
      </h1>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', marginBottom: 28, lineHeight: 1.6 }}>
        {error.message ?? 'Não foi possível carregar esta página. Tente novamente.'}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={reset}
          style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: 10, border: 'none', background: 'var(--brand-orange)', color: '#fff', cursor: 'pointer' }}
        >
          Tentar novamente
        </button>
        <Link href="/conta" style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, padding: '12px 28px', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--fg-muted)', textDecoration: 'none' }}>
          Voltar à conta
        </Link>
      </div>
    </div>
  )
}
