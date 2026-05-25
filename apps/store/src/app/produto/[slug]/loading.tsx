export default function ProdutoLoading() {
  return (
    <div className="container page-pad" style={{ paddingTop: 32, paddingBottom: 96 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32 }}>
        <Bone w={40} h={14} r={4} />
        <Bone w={6}  h={14} r={4} />
        <Bone w={60} h={14} r={4} />
        <Bone w={6}  h={14} r={4} />
        <Bone w={120} h={14} r={4} />
      </div>

      {/* Grid PDP */}
      <div className="rg-pdp">
        {/* Galeria */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Bone w="100%" h={480} r={16} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[0,1,2,3].map(i => <Bone key={i} w={80} h={80} r={8} />)}
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Bone w={80}   h={12} r={4} />
          <Bone w="85%"  h={32} r={6} />
          <Bone w="55%"  h={32} r={6} />

          <div style={{ marginTop: 8 }}>
            <Bone w={130} h={30} r={6} />
            <Bone w={90}  h={16} r={4} style={{ marginTop: 8 }} />
          </div>

          {/* Tamanhos */}
          <div style={{ marginTop: 8 }}>
            <Bone w={64} h={12} r={4} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {[0,1,2,3,4,5].map(i => <Bone key={i} w={52} h={44} r={8} />)}
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Bone w="68%" h={52} r={10} />
            <Bone w="28%" h={52} r={10} />
          </div>

          {/* Descrição */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <Bone w="100%" h={14} r={4} />
            <Bone w="90%"  h={14} r={4} style={{ marginTop: 8 }} />
            <Bone w="72%"  h={14} r={4} style={{ marginTop: 8 }} />
            <Bone w="80%"  h={14} r={4} style={{ marginTop: 8 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Bone({ w, h, r = 6, style }: {
  w: number | string
  h: number | string
  r?: number
  style?: React.CSSProperties
}) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h, borderRadius: r, ...style }}
    />
  )
}
