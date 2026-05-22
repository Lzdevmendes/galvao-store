'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: '#0B0E12', color: '#F8F9FB', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <div style={{ padding: '48px 24px', maxWidth: 440 }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>⚡</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, letterSpacing: '.02em' }}>
            ERRO CRÍTICO
          </h1>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 32, lineHeight: 1.65 }}>
            Ocorreu um erro grave no servidor. A equipa já foi notificada.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{ fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: 10, border: 'none', background: '#F26B1F', color: '#fff', cursor: 'pointer' }}
            >
              Tentar novamente
            </button>
            <a href="/" style={{ fontSize: 14, fontWeight: 600, padding: '12px 28px', borderRadius: 10, border: '1px solid #2A3340', color: '#9CA3AF', textDecoration: 'none', display: 'inline-block' }}>
              Página inicial
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
