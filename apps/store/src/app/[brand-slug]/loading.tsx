function Bone({ w, h, r = 6, style }: { w: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

export default function BrandLoading() {
  return (
    <div className="container page-pad" style={{ paddingTop: 0, paddingBottom: 96 }}>
      {/* Hero banner da marca */}
      <Bone w="100%" h={280} r={0} style={{ marginBottom: 40 }} />

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        {[100, 120, 90, 110].map((w, i) => <Bone key={i} w={w} h={38} r={8} />)}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Bone w="100%" h={280} r={12} />
            <Bone w="40%"  h={11}  r={4} />
            <Bone w="80%"  h={16}  r={4} />
            <Bone w="55%"  h={20}  r={4} />
          </div>
        ))}
      </div>
    </div>
  )
}
