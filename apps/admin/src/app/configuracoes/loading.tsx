import { Sk, skStyle } from '@/components/skeleton'

function SkSection({ fields = 2 }: { fields?: number }) {
  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 28, marginBottom: 20 }}>
      <Sk w={160} h={16} mb={24} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Sk w={100} h={10} mb={8} />
            <Sk h={42} r={8} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ConfiguracoesLoading() {
  return (
    <>
      <style>{skStyle}</style>
      <div style={{ marginBottom: 28 }}>
        <Sk w={160} h={28} mb={8} />
        <Sk w={300} h={14} />
      </div>
      <SkSection fields={4} />
      <SkSection fields={2} />
      <SkSection fields={2} />
      <Sk w={180} h={46} r={8} />
    </>
  )
}
