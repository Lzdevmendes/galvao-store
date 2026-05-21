function Sk({ w = '100%', h = 16, r = 6, mb = 0 }: { w?: string | number; h?: number; r?: number; mb?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, marginBottom: mb, background: 'linear-gradient(90deg, var(--bg-sunk) 25%, var(--bg-elev) 50%, var(--bg-sunk) 75%)', backgroundSize: '200% 100%', animation: 'sk-sh 1.4s infinite' }} />
}

export default function CheckoutLoading() {
  return (
    <>
      <style>{`@keyframes sk-sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 96, maxWidth: 900, margin: '0 auto' }}>
        {/* Steps */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          {[1,2,3,4].map(i => <Sk key={i} w={120} h={8} r={99} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
          <div>
            <Sk h={28} w={200} mb={24} />
            {[1,2,3,4].map(i => (<div key={i} style={{ marginBottom: 16 }}><Sk w={80} h={11} mb={8} /><Sk h={46} r={10} /></div>))}
            <Sk h={52} r={12} />
          </div>
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <Sk w={140} h={16} mb={20} />
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Sk w={52} h={52} r={8} />
                <div style={{ flex: 1 }}><Sk w="70%" h={12} mb={8} /><Sk w="40%" h={10} /></div>
                <Sk w={60} h={12} />
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
              {[1,2,3].map(i => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><Sk w="35%" h={12} /><Sk w="25%" h={12} /></div>)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
