function Sk({ w = '100%', h = 16, r = 6, mb = 0 }: { w?: string | number; h?: number; r?: number; mb?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, marginBottom: mb, background: 'linear-gradient(90deg, var(--bg-sunk) 25%, var(--bg-elev) 50%, var(--bg-sunk) 75%)', backgroundSize: '200% 100%', animation: 'sk-sh 1.4s infinite' }} />
}

function SkCard() {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden' }}>
      <Sk h={240} r={12} mb={12} />
      <Sk w="60%" h={12} mb={8} />
      <Sk w="80%" h={16} mb={8} />
      <Sk w="40%" h={20} r={4} />
    </div>
  )
}

export default function BuscaLoading() {
  return (
    <>
      <style>{`@keyframes sk-sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="container page-pad" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <Sk w={280} h={28} mb={8} r={8} />
        <Sk w={180} h={14} mb={32} />
        <div className="grid-products" data-density="4">
          {Array.from({ length: 8 }).map((_, i) => <SkCard key={i} />)}
        </div>
      </div>
    </>
  )
}
