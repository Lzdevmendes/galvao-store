import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
      <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 28, margin: '0 0 12px', color: '#F8F9FB' }}>
        Página não encontrada
      </h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32, lineHeight: 1.6 }}>
        O recurso que procura não existe ou foi removido.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ padding: '12px 28px', borderRadius: 10, background: '#F26B1F', color: '#fff', textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14 }}>
          Ir ao Dashboard
        </Link>
        <Link href="/pedidos" style={{ padding: '12px 28px', borderRadius: 10, border: '1px solid #1E2530', color: '#9CA3AF', textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14 }}>
          Ver Pedidos
        </Link>
      </div>
    </div>
  )
}
