import { Sk, SkRow, skStyle } from '@/components/skeleton'

export default function CuponsLoading() {
  return (
    <>
      <style>{skStyle}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Sk w={120} h={28} />
        <Sk w={130} h={40} r={8} />
      </div>
      <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2530' }}>
              {['Código','Tipo','Valor','Uso mín.','Usos','Validade','Status',''].map(h => (
                <th key={h} style={{ padding: '10px 20px' }}><Sk h={10} /></th>
              ))}
            </tr>
          </thead>
          <tbody>{Array.from({ length: 6 }).map((_, i) => <SkRow key={i} cols={8} />)}</tbody>
        </table>
      </div>
    </>
  )
}
