import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Guia de Tamanhos — Galvão\'s Store' }

const sizes = [
  { br: '36', eu: '36', us: '4', cm: '22.5' },
  { br: '37', eu: '37', us: '5', cm: '23.5' },
  { br: '38', eu: '38', us: '6', cm: '24.0' },
  { br: '39', eu: '39', us: '7', cm: '24.5' },
  { br: '40', eu: '40', us: '7.5', cm: '25.5' },
  { br: '41', eu: '41', us: '8.5', cm: '26.0' },
  { br: '42', eu: '42', us: '9', cm: '26.5' },
  { br: '43', eu: '43', us: '10', cm: '27.5' },
  { br: '44', eu: '44', us: '10.5', cm: '28.0' },
  { br: '45', eu: '45', us: '11.5', cm: '29.0' },
  { br: '46', eu: '46', us: '12', cm: '29.5' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, marginBottom: 16, color: 'var(--fg)' }}>{title}</h2>
      {children}
    </section>
  )
}

export default function TamanhosPage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 800 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 8, fontWeight: 700 }}>
          Guia de Tamanhos
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px' }}>
          ENCONTRE O<span style={{ color: 'var(--brand-orange)' }}> TAMANHO CERTO</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.7, maxWidth: 600 }}>
          Use este guia para encontrar o tamanho ideal. Em dúvida entre dois números, recomendamos sempre o maior.
        </p>
      </div>

      <Section title="Como medir seu pé">
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <ol style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 2, margin: 0, paddingLeft: 20 }}>
            <li>Coloque uma folha de papel no chão e apoie o pé sobre ela</li>
            <li>Com um lápis, trace o contorno completo do pé</li>
            <li>Meça a distância do calcanhar até a ponta do dedo mais longo</li>
            <li>Use a medida em centímetros na tabela abaixo</li>
          </ol>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-faint)' }}>
          💡 Dica: meça sempre no final do dia — os pés tendem a inchar levemente ao longo do dia.
        </p>
      </Section>

      <Section title="Tabela de Conversão">
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
            <thead>
              <tr style={{ background: 'var(--bg-sunk)' }}>
                {['BR', 'EU', 'US', 'cm'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((s, i) => (
                <tr key={s.br} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-sunk)' }}>
                  <td style={{ padding: '12px 20px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: 'var(--brand-orange)' }}>{s.br}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 14 }}>{s.eu}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 14 }}>{s.us}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-muted)' }}>{s.cm} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Dicas por modalidade">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { icon: '⚽', title: 'Chuteiras Campo / Society', tip: 'Escolha o tamanho exato. Modelos de couro tendem a moldar ao pé com o uso.' },
            { icon: '🏟️', title: 'Chuteiras Futsal', tip: 'Prefira meio número acima se tiver o pé mais largo.' },
            { icon: '👟', title: 'Tênis de Corrida', tip: 'Deixe 1 cm de espaço entre o dedo e a ponta do tênis.' },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--fg)' }}>{item.title}</h3>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6, margin: 0 }}>{item.tip}</p>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/categoria/campo" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 8, background: 'var(--brand-orange)', color: '#fff', textDecoration: 'none' }}>
          Ver Chuteiras →
        </Link>
        <Link href="/contato" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, padding: '12px 24px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--fg-muted)', textDecoration: 'none' }}>
          Dúvidas? Fale conosco
        </Link>
      </div>
    </div>
  )
}
