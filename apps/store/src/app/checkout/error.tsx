'use client'

export default function CheckoutError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container" style={{ paddingTop: 80, paddingBottom: 96, textAlign: 'center', maxWidth: 480 }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
        Erro no checkout
      </h1>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        {error.message ?? 'Ocorreu um erro ao processar o seu pedido. Nenhum valor foi cobrado.'}
      </p>
      <button
        onClick={reset}
        style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, padding: '14px 32px', borderRadius: 10, border: 'none', background: 'var(--brand-orange)', color: '#fff', cursor: 'pointer' }}
      >
        Tentar novamente
      </button>
    </div>
  )
}
