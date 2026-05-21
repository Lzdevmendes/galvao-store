import { Sk, SkCard, skStyle } from '@/components/skeleton'

export default function RelatoriosLoading() {
  return (
    <>
      <style>{skStyle}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
        <div><Sk w={140} h={28} mb={8} /><Sk w={200} h={14} /></div>
        <Sk w={200} h={38} r={8} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <SkCard key={i} h={90} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <SkCard h={280} />
        <SkCard h={280} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SkCard h={220} />
        <SkCard h={220} />
      </div>
    </>
  )
}
