function Bone({ w, h, r = 6, style }: { w: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

function AddressCardSkeleton() {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Bone w={80} h={22} r={6} />
        <Bone w={60} h={22} r={6} />
      </div>
      <Bone w="90%" h={14} r={4} />
      <Bone w="65%" h={14} r={4} />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Bone w={80} h={32} r={6} />
        <Bone w={80} h={32} r={6} />
      </div>
    </div>
  )
}

export default function EnderecosLoading() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px 96px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Bone w={140} h={28} r={6} />
        <Bone w={160} h={40} r={8} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2].map(i => <AddressCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
