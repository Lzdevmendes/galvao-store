'use client'

import Link from 'next/link'

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', maxWidth: 520, margin: '0 auto' }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
      <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 26, margin: '0 0 12px', color: '#F8F9FB' }}>
        Erro ao carregar
      </h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 8, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 8px' }}>
        {error?.message ?? 'Ocorreu um erro inesperado nesta página.'}
      </p>
      <p style={{ fontSize: 12, color: '#4A5462', marginBottom: 32 }}>
        Os dados da loja não foram afectados.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={reset}
          style={{ padding: '11px 24px', borderRadius: 8, border: 'none', background: '#F26B1F', color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          ↺ Tentar novamente
        </button>
        <Link href="/" style={{ padding: '11px 24px', borderRadius: 8, border: '1px solid #1E2530', color: '#9CA3AF', textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14 }}>
          Dashboard
        </Link>
      </div>
    </div>
  )
}
