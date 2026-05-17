export default function Loading() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--brand-orange)',
          animation: 'spin .7s linear infinite',
        }} />
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>Carregando...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
