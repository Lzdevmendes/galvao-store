function Bone({ w, h, r = 6, style }: { w: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

function CouponSkeleton() {
  return (
    <div style={{ border: '1.5px dashed var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Bone w={120} h={20} r={6} />
        <Bone w={200} h={12} r={4} />
        <Bone w={100} h={11} r={4} />
      </div>
      <Bone w={80} h={36} r={8} />
    </div>
  )
}

export default function CuponsLoading() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 96px' }}>
      <Bone w={120} h={28} r={6} style={{ marginBottom: 32 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => <CouponSkeleton key={i} />)}
      </div>
    </div>
  )
}
