function Sk({ w = '100%', h = 16, r = 6, mb = 0 }: { w?: string | number; h?: number; r?: number; mb?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, marginBottom: mb, background: 'linear-gradient(90deg, var(--bg-sunk) 25%, var(--bg-elev) 50%, var(--bg-sunk) 75%)', backgroundSize: '200% 100%', animation: 'sk-sh 1.4s infinite' }} />
}

function SkCard() {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden' }}>
      <Sk h={240} r={12} mb={12} />
      <Sk w="50%" h={12} mb={8} />
      <Sk w="75%" h={16} mb={8} />
      <Sk w="40%" h={20} r={4} />
    </div>
  )
}

export default function BrandLoading() {
  return (
    <>
      <style>{`@keyframes sk-sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {/* Hero */}
      <Sk h={220} r={0} mb={40} />
      <div className="container page-pad" style={{ paddingBottom: 96 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {[1,2,3,4,5].map(i => <Sk key={i} w={90} h={36} r={99} />)}
        </div>
        <div className="grid-products" data-density="4">
          {Array.from({ length: 8 }).map((_, i) => <SkCard key={i} />)}
        </div>
      </div>
    </>
  )
}
