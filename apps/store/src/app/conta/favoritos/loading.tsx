function Bone({ w, h, r = 6, style }: { w: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

export default function FavoritosLoading() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 96px' }}>
      <Bone w={140} h={28} r={6} style={{ marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Bone w="100%" h={240} r={12} />
            <Bone w="40%"  h={11}  r={4} />
            <Bone w="80%"  h={16}  r={4} />
            <Bone w="50%"  h={18}  r={4} />
          </div>
        ))}
      </div>
    </div>
  )
}
