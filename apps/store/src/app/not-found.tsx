import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Página não encontrada — Galvão\'s Store' }

export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(100px,18vw,180px)', lineHeight: 1, color: 'var(--brand-orange)', opacity: .15 }}>
          404
        </div>
        <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(36px,6vw,56px)', margin: '-32px 0 16px', lineHeight: 1 }}>
          FORA DE<br /><span style={{ color: 'var(--brand-orange)' }}>CAMPO.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: 32 }}>
          A página que você procura foi para outro time. Mas a nossa loja está cheia de chuteiras esperando por você.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary btn-lg">Ir para a Home</Link>
          <Link href="/produtos" className="btn btn-ghost btn-lg">Ver catálogo</Link>
        </div>
      </div>
    </div>
  )
}
