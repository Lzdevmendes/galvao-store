function Bone({ w, h, r = 6, style }: { w: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

function OrderRowSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
      <Bone w={48} h={48} r={8} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Bone w={140} h={14} r={4} />
        <Bone w={200} h={12} r={4} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <Bone w={80} h={24} r={6} />
        <Bone w={60} h={12} r={4} />
      </div>
    </div>
  )
}

export default function PedidosLoading() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 96px' }}>
      <Bone w={160} h={28} r={6} style={{ marginBottom: 32 }} />
      {Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)}
    </div>
  )
}
