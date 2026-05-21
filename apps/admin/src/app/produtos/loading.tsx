import { Sk, SkRow, skStyle } from '@/components/skeleton'

export default function ProdutosLoading() {
  return (
    <>
      <style>{skStyle}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Sk w={150} h={28} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Sk w={300} h={38} r={8} />
        <Sk w={80} h={38} r={8} />
      </div>
      <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E2530' }}>
              {['Produto','Marca','Cat.','Variantes','Stock','Preço','Status',''].map(h => (
                <th key={h} style={{ padding: '10px 20px' }}><Sk h={10} /></th>
              ))}
            </tr>
          </thead>
          <tbody>{Array.from({ length: 10 }).map((_, i) => <SkRow key={i} cols={8} />)}</tbody>
        </table>
      </div>
    </>
  )
}
