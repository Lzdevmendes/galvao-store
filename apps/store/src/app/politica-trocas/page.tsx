import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Trocas e Devoluções — Galvão\'s Store' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, marginBottom: 12, color: 'var(--fg)' }}>{title}</h2>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.8 }}>{children}</div>
    </section>
  )
}

export default function PoliticaTrocasPage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 760 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 8, fontWeight: 700 }}>
          Política da Loja
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px' }}>
          TROCAS E<span style={{ color: 'var(--brand-orange)' }}> DEVOLUÇÕES</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.7 }}>
          Sua satisfação é nossa prioridade. Confira as condições para trocar ou devolver um produto.
        </p>
      </div>

      {/* Prazo destacado */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg-elev), var(--bg-sunk))', border: '1px solid var(--brand-orange)44', borderRadius: 14, padding: '24px 28px', marginBottom: 40, display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ fontSize: 40 }}>⏱️</div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--brand-orange)', margin: '0 0 4px' }}>7 dias corridos</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', margin: 0 }}>Prazo para solicitar troca ou devolução a partir da data de recebimento do pedido (CDC, art. 49)</p>
        </div>
      </div>

      <Section title="Quando posso trocar ou devolver?">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li style={{ marginBottom: 8 }}>Produto recebido com defeito de fabricação</li>
          <li style={{ marginBottom: 8 }}>Tamanho incorreto em relação ao pedido</li>
          <li style={{ marginBottom: 8 }}>Produto diferente do que foi anunciado</li>
          <li style={{ marginBottom: 8 }}>Desistência da compra em até 7 dias (direito de arrependimento)</li>
        </ul>
      </Section>

      <Section title="Condições do produto">
        <p>Para que a troca ou devolução seja aceita, o produto deve estar:</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <li style={{ marginBottom: 8 }}>Na embalagem original, sem sinais de uso</li>
          <li style={{ marginBottom: 8 }}>Com todas as etiquetas intactas</li>
          <li style={{ marginBottom: 8 }}>Acompanhado da nota fiscal</li>
          <li style={{ marginBottom: 8 }}>Sem odores, sujeira ou danos causados pelo comprador</li>
        </ul>
      </Section>

      <Section title="Como solicitar">
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          <li style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--fg)' }}>Acesse sua conta</strong> — vá em{' '}
            <Link href="/conta/pedidos" style={{ color: 'var(--brand-orange)' }}>Meus Pedidos</Link> e localize o pedido.
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--fg)' }}>Entre em contato</strong> — envie mensagem pelo{' '}
            <Link href="/contato" style={{ color: 'var(--brand-orange)' }}>formulário de contato</Link> ou WhatsApp informando o número do pedido e o motivo.
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--fg)' }}>Aguarde aprovação</strong> — nossa equipe analisará em até 2 dias úteis e enviará as instruções de devolução.
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--fg)' }}>Envie o produto</strong> — após aprovação, poste o produto nos Correios (custeado por nós em caso de defeito ou erro nosso).
          </li>
          <li>
            <strong style={{ color: 'var(--fg)' }}>Receba o reembolso ou troca</strong> — processado em até 5 dias úteis após o recebimento do produto.
          </li>
        </ol>
      </Section>

      <Section title="Reembolso">
        <p>O reembolso será realizado pelo mesmo meio de pagamento utilizado:</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <li style={{ marginBottom: 8 }}><strong style={{ color: 'var(--fg)' }}>PIX:</strong> estorno em até 1 dia útil</li>
          <li style={{ marginBottom: 8 }}><strong style={{ color: 'var(--fg)' }}>Cartão de crédito:</strong> estorno na fatura em até 2 ciclos</li>
          <li style={{ marginBottom: 8 }}><strong style={{ color: 'var(--fg)' }}>Boleto:</strong> reembolso via transferência bancária em até 5 dias úteis</li>
        </ul>
      </Section>

      <Section title="Não aceitamos devolução em casos de">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li style={{ marginBottom: 8 }}>Produtos com sinais de uso ou desgaste</li>
          <li style={{ marginBottom: 8 }}>Solicitações fora do prazo de 7 dias</li>
          <li style={{ marginBottom: 8 }}>Danos causados por uso inadequado</li>
          <li style={{ marginBottom: 8 }}>Produtos personalizados sob encomenda</li>
        </ul>
      </Section>

      <div style={{ marginTop: 48, padding: '24px 28px', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: 'var(--fg)', margin: '0 0 4px' }}>Ainda com dúvidas?</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', margin: 0 }}>Nossa equipe responde em até 24h</p>
        </div>
        <Link href="/contato" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 8, background: 'var(--brand-orange)', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Fale conosco →
        </Link>
      </div>
    </div>
  )
}
