export default function BuscaLoading() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 96 }}>
      {/* Barra de filtros skeleton */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: 80, height: 32, borderRadius: 8, background: 'var(--bg-elev)', border: '1px solid var(--border)' }} />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid-products" data-density="4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ aspectRatio: '1/1', borderRadius: 12, background: 'var(--bg-elev)', border: '1px solid var(--border)' }} />
            <div style={{ height: 12, width: '40%', borderRadius: 4, background: 'var(--border)' }} />
            <div style={{ height: 16, width: '80%', borderRadius: 4, background: 'var(--border)' }} />
            <div style={{ height: 20, width: '50%', borderRadius: 4, background: 'var(--border)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
