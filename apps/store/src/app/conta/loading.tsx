export default function ContaLoading() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
      {/* Header skeleton */}
      <div style={{
        background: 'linear-gradient(135deg,#0B0E12,#1F252E)',
        borderRadius: 16, padding: '40px 40px 32px', marginBottom: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1F252E' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 180, height: 28, borderRadius: 6, background: '#1F252E' }} />
            <div style={{ width: 140, height: 14, borderRadius: 4, background: '#1F252E' }} />
          </div>
        </div>
      </div>

      {/* Menu skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            background: 'var(--bg-elev)', border: '1px solid var(--border)',
            borderRadius: 14, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--border)', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: '60%', height: 14, borderRadius: 4, background: 'var(--border)' }} />
              <div style={{ width: '80%', height: 12, borderRadius: 4, background: 'var(--border)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
