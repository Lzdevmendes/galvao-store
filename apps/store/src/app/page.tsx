import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Galvão's Store — Chuteiras de Alta Performance",
}

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0B0E12 0%, #1F252E 100%)',
        color: '#fff',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, letterSpacing: '.32em', color: '#F26B1F', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
              PRONTA ENTREGA · LANÇAMENTO 2026
            </div>
            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(72px, 9vw, 132px)', lineHeight: .92, margin: '0 0 24px', letterSpacing: '.005em' }}>
              JOGO<br /><span style={{ color: '#1FB5A8' }}>RÁPIDO.</span>
            </h1>
            <p style={{ fontSize: 16, color: '#C4CAD2', maxWidth: 480, marginBottom: 32, lineHeight: 1.5 }}>
              Phantom GX III, F50 Elite, Future 8 Ultimate. As chuteiras que fizeram a temporada já estão na Galvão&apos;s.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="/produtos" style={{ display: 'inline-flex', alignItems: 'center', background: '#F26B1F', color: '#fff', padding: '16px 28px', borderRadius: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                Comprar agora
              </a>
              <a href="/lancamentos" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,.1)', color: '#fff', padding: '16px 28px', borderRadius: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,.2)' }}>
                Ver lançamentos
              </a>
            </div>
          </div>
        </div>
        {/* Orange glow */}
        <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '60%', height: '140%', background: 'radial-gradient(ellipse, rgba(242,107,31,.35) 0%, transparent 60%)', pointerEvents: 'none' }} />
      </section>

      {/* Coming soon placeholder */}
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: 'var(--fg-faint)', letterSpacing: '.05em' }}>
          FASE 2 — STOREFRONT EM DESENVOLVIMENTO
        </div>
        <p style={{ color: 'var(--fg-muted)', marginTop: 16, fontFamily: 'Space Grotesk, sans-serif' }}>
          Next.js 15 · Supabase · Mercado Pago · Correios API
        </p>
      </div>
    </main>
  )
}
