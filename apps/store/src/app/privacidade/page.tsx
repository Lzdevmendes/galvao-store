import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Política de Privacidade — Galvão\'s Store' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, marginBottom: 12, color: 'var(--fg)' }}>{title}</h2>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.8 }}>{children}</div>
    </section>
  )
}

export default function PrivacidadePage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 760 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 8, fontWeight: 700 }}>
          Legal · LGPD
        </div>
        <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(36px,5vw,56px)', margin: '0 0 8px' }}>
          POLÍTICA DE<br /><span style={{ color: 'var(--brand-orange)' }}>PRIVACIDADE.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>
          Última actualização: Maio de 2026
        </p>
      </div>

      <Section title="1. Quem somos">
        <p>A <strong style={{ color: 'var(--fg)' }}>Galvão&apos;s Store</strong> é uma loja virtual de artigos esportivos, com sede em Caraguatatuba/SP. Somos responsáveis pelo tratamento dos seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
      </Section>

      <Section title="2. Dados que coletamos">
        <p><strong style={{ color: 'var(--fg)' }}>Dados de cadastro:</strong> nome completo, CPF, e-mail, telefone e data de nascimento.</p>
        <p><strong style={{ color: 'var(--fg)' }}>Dados de endereço:</strong> CEP, logradouro, número, bairro, cidade e estado — necessários para entrega.</p>
        <p><strong style={{ color: 'var(--fg)' }}>Dados de pagamento:</strong> processados pela Mercado Pago. Não armazenamos dados de cartão de crédito.</p>
        <p><strong style={{ color: 'var(--fg)' }}>Dados de navegação:</strong> cookies, IP, páginas visitadas, tempo de sessão — com seu consentimento.</p>
      </Section>

      <Section title="3. Para que usamos seus dados">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {[
            'Processar e entregar seus pedidos',
            'Enviar e-mails transacionais (confirmação, rastreio)',
            'Atendimento ao cliente via WhatsApp',
            'Melhorar a experiência no site (analytics)',
            'Personalizar anúncios (com consentimento)',
            'Cumprir obrigações legais e fiscais',
          ].map(item => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      </Section>

      <Section title="4. Base legal do tratamento">
        <p>Tratamos seus dados com base em: <strong style={{ color: 'var(--fg)' }}>execução de contrato</strong> (pedidos), <strong style={{ color: 'var(--fg)' }}>consentimento</strong> (marketing e analytics), <strong style={{ color: 'var(--fg)' }}>interesse legítimo</strong> (segurança e prevenção de fraudes) e <strong style={{ color: 'var(--fg)' }}>obrigação legal</strong> (nota fiscal).</p>
      </Section>

      <Section title="5. Compartilhamento de dados">
        <p>Seus dados podem ser compartilhados apenas com:</p>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {[
            'Mercado Pago — processamento de pagamentos',
            'Correios / transportadoras — entrega dos pedidos',
            'Resend — envio de e-mails transacionais',
            'Google Analytics — análise de uso (com consentimento)',
            'Meta Platforms — publicidade (com consentimento)',
          ].map(item => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
        <p>Não vendemos seus dados a terceiros.</p>
      </Section>

      <Section title="6. Seus direitos (LGPD)">
        <p>Você tem o direito de: confirmar o tratamento, acessar seus dados, corrigir dados incorretos, eliminar dados desnecessários, portar seus dados, revogar o consentimento e se opor ao tratamento. Para exercer qualquer direito, entre em contacto pelo e-mail <strong style={{ color: 'var(--fg)' }}>privacidade@galvaosstore.com.br</strong>.</p>
      </Section>

      <Section title="7. Cookies">
        <p>Utilizamos cookies necessários (sessão, carrinho, autenticação) e, com seu consentimento, cookies analíticos e de marketing. Pode gerir as suas preferências a qualquer momento pelo banner de cookies no rodapé do site.</p>
      </Section>

      <Section title="8. Segurança">
        <p>Utilizamos HTTPS, criptografia de dados sensíveis, autenticação segura via Supabase e controles de acesso. Em caso de incidente de segurança, notificaremos os afetados conforme exigido pela LGPD.</p>
      </Section>

      <Section title="9. Contato">
        <p>Dúvidas sobre privacidade: <strong style={{ color: 'var(--fg)' }}>privacidade@galvaosstore.com.br</strong><br />Encarregado de Dados (DPO): equipa interna Galvão&apos;s Store.</p>
      </Section>
    </div>
  )
}
