function Bone({ w, h, r = 6, style }: { w: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

function CardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Bone w="100%" h={280} r={12} />
      <Bone w="40%"  h={11}  r={4} />
      <Bone w="80%"  h={16}  r={4} />
      <Bone w="55%"  h={20}  r={4} />
    </div>
  )
}

export default function ProdutosLoading() {
  return (
    <div className="container page-pad" style={{ paddingTop: 32, paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Bone w={200} h={36} r={6} />
        <Bone w={280} h={14} r={4} style={{ marginTop: 10 }} />
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        {[120, 100, 110, 90, 130].map((w, i) => <Bone key={i} w={w} h={38} r={8} />)}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
        {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}
