import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Termos de Uso — Galvão\'s Store' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, marginBottom: 12 }}>{title}</h2>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.8 }}>{children}</div>
    </section>
  )
}

export default function TermosPage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 760 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 8, fontWeight: 700 }}>
          Legal
        </div>
        <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(36px,5vw,56px)', margin: '0 0 8px' }}>
          TERMOS DE<br /><span style={{ color: 'var(--brand-orange)' }}>USO.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>Última actualização: Maio de 2026</p>
      </div>

      <Section title="1. Aceitação dos termos">
        <p>Ao acessar e utilizar o site da Galvão&apos;s Store, você concorda com estes Termos de Uso. Se não concordar, por favor não utilize nossos serviços.</p>
      </Section>

      <Section title="2. Cadastro e conta">
        <p>Para realizar compras é necessário criar uma conta com dados verdadeiros. Você é responsável pela confidencialidade da sua senha e por todas as atividades realizadas na sua conta.</p>
      </Section>

      <Section title="3. Produtos e preços">
        <p>Nos reservamos o direito de alterar preços e disponibilidade de produtos sem aviso prévio. Em caso de erro de preço identificado após a compra, entraremos em contacto para confirmar ou cancelar o pedido.</p>
      </Section>

      <Section title="4. Pagamento">
        <p>Aceitamos PIX (5% de desconto), cartão de crédito em até 12x e boleto bancário. O processamento é realizado pelo Mercado Pago, em ambiente seguro.</p>
      </Section>

      <Section title="5. Entrega">
        <p>Os prazos de entrega são estimados e podem variar por fatores externos (greves, condições climáticas, endereços de difícil acesso). Não nos responsabilizamos por atrasos causados pelos Correios ou transportadoras.</p>
      </Section>

      <Section title="6. Trocas e devoluções">
        <p>Você tem <strong style={{ color: 'var(--fg)' }}>7 dias corridos</strong> após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor (Art. 49). O produto deve estar em perfeito estado, sem uso e na embalagem original.</p>
      </Section>

      <Section title="7. Propriedade intelectual">
        <p>Todo o conteúdo do site (textos, imagens, logotipos) é de propriedade da Galvão&apos;s Store ou de seus parceiros. É proibida a reprodução sem autorização prévia.</p>
      </Section>

      <Section title="8. Limitação de responsabilidade">
        <p>Nossa responsabilidade está limitada ao valor do produto adquirido. Não nos responsabilizamos por danos indiretos ou lucros cessantes.</p>
      </Section>

      <Section title="9. Lei aplicável">
        <p>Estes termos são regidos pelas leis brasileiras. Qualquer litígio será submetido ao Foro da Comarca de Caraguatatuba/SP.</p>
      </Section>

      <Section title="10. Contato">
        <p>contato@galvaosstore.com.br</p>
      </Section>
    </div>
  )
}
