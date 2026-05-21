function Sk({ w = '100%', h = 16, r = 6, mb = 0 }: { w?: string | number; h?: number; r?: number; mb?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, marginBottom: mb, background: 'linear-gradient(90deg, var(--bg-sunk) 25%, var(--bg-elev) 50%, var(--bg-sunk) 75%)', backgroundSize: '200% 100%', animation: 'sk-sh 1.4s infinite' }} />
}

export default function PedidosContaLoading() {
  return (
    <>
      <style>{`@keyframes sk-sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <Sk w={180} h={26} mb={24} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Sk w={140} h={14} />
              <Sk w={80} h={24} r={99} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[1,2,3].map(j => (
                <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Sk w={48} h={48} r={8} />
                  <div><Sk w={100} h={12} mb={6} /><Sk w={60} h={10} /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
