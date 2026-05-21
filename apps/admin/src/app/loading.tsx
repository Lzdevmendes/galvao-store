import { Sk, SkCard, SkRow, skStyle } from '@/components/skeleton'

export default function DashboardLoading() {
  return (
    <>
      <style>{skStyle}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Sk w={200} h={28} mb={8} />
        <Sk w={320} h={14} />
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        <SkCard h={110} />
        <SkCard h={110} />
        <SkCard h={110} />
        <SkCard h={110} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 24 }}>
        <SkCard h={280} />
        <SkCard h={280} />
      </div>

      {/* Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530' }}>
            <Sk w={160} h={14} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>{Array.from({ length: 6 }).map((_, i) => <SkRow key={i} cols={5} />)}</tbody>
          </table>
        </div>
        <SkCard h={360} />
      </div>
    </>
  )
}
