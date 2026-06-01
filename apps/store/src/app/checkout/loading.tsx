function Bone({ w, h, r = 6, style }: { w: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

export default function CheckoutLoading() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 960 }}>
      {/* Steps */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {[1, 2, 3].map(i => <Bone key={i} w="32%" h={6} r={3} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        {/* Form skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <Bone w={160} h={20} r={6} style={{ marginBottom: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i}>
                  <Bone w={80} h={11} r={4} style={{ marginBottom: 8 }} />
                  <Bone w="100%" h={44} r={8} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <Bone w={120} h={20} r={6} style={{ marginBottom: 20 }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <Bone w={48} h={48} r={8} />
                <div style={{ flex: 1 }}>
                  <Bone w="70%" h={14} r={4} style={{ marginBottom: 6 }} />
                  <Bone w="40%" h={12} r={4} />
                </div>
                <Bone w={60} h={20} r={4} />
              </div>
            ))}
          </div>
        </div>

        {/* Order summary skeleton */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <Bone w={140} h={20} r={6} style={{ marginBottom: 20 }} />
          {[1, 2].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <Bone w={56} h={56} r={8} />
              <div style={{ flex: 1 }}>
                <Bone w="80%" h={13} r={4} style={{ marginBottom: 6 }} />
                <Bone w="50%" h={11} r={4} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Bone w={80} h={13} r={4} />
                <Bone w={60} h={13} r={4} />
              </div>
            ))}
          </div>
          <Bone w="100%" h={48} r={10} style={{ marginTop: 20 }} />
        </div>
      </div>
    </div>
  )
}
