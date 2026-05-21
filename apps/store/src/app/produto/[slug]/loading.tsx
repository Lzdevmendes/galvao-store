function Sk({ w = '100%', h = 16, r = 6, mb = 0 }: { w?: string | number; h?: number; r?: number; mb?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, marginBottom: mb, background: 'linear-gradient(90deg, var(--bg-sunk) 25%, var(--bg-elev) 50%, var(--bg-sunk) 75%)', backgroundSize: '200% 100%', animation: 'sk-sh 1.4s infinite' }} />
}

export default function PdpLoading() {
  return (
    <>
      <style>{`@keyframes sk-sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="container page-pad" style={{ paddingTop: 32, paddingBottom: 96 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <Sk w={60} h={12} /><Sk w={8} h={12} /><Sk w={80} h={12} /><Sk w={8} h={12} /><Sk w={160} h={12} />
        </div>

        <div className="rg-pdp">
          {/* Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Sk h={420} r={12} mb={8} />
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4].map(i => <Sk key={i} w={80} h={80} r={8} />)}
            </div>
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Sk w={80} h={14} /><Sk w={60} h={14} />
            </div>
            <Sk w="80%" h={36} r={8} mb={24} />
            <Sk w={120} h={20} mb={6} />
            <Sk w={180} h={48} r={8} mb={4} />
            <Sk w={200} h={14} mb={32} />
            <Sk w={100} h={14} mb={12} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              {[1,2,3,4,5,6,7].map(i => <Sk key={i} w={48} h={42} r={8} />)}
            </div>
            <Sk h={56} r={12} mb={12} />
            <Sk h={56} r={12} />
          </div>
        </div>
      </div>
    </>
  )
}
