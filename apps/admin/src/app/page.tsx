export default function AdminPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0E12', color: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 72, color: '#F26B1F', letterSpacing: '.06em' }}>GALVÃO&apos;S</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.2em', color: '#4A5462' }}>ADMIN PANEL — FASE 5 EM DESENVOLVIMENTO</div>
      <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
        {[
          { label: 'Next.js 15', color: '#fff' },
          { label: 'Drizzle ORM', color: '#1FB5A8' },
          { label: 'Supabase Auth', color: '#2CB35A' },
          { label: 'Mercado Pago', color: '#F26B1F' },
        ].map(t => (
          <span key={t.label} style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: t.color, letterSpacing: '.1em' }}>{t.label}</span>
        ))}
      </div>
    </div>
  )
}
