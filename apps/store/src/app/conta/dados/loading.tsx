function Bone({ w, h, r = 6, style }: { w: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

export default function DadosLoading() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px 96px' }}>
      <Bone w={140} h={28} r={6} style={{ marginBottom: 32 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[['Nome completo', '100%'], ['E-mail', '100%'], ['Telefone', '60%'], ['CPF', '50%'], ['Data de nascimento', '50%']].map(([_, w], i) => (
          <div key={i}>
            <Bone w={100} h={11} r={4} style={{ marginBottom: 8 }} />
            <Bone w={w} h={44} r={8} />
          </div>
        ))}
        <Bone w={140} h={44} r={8} style={{ marginTop: 8 }} />
      </div>
    </div>
  )
}
