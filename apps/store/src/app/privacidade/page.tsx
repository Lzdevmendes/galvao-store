import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Galvão\'s Store',
  description: 'Como coletamos, usamos e protegemos seus dados pessoais conforme a LGPD.',
}

const UPDATED = 'Junho de 2026'
const EMAIL_PRIVACY = 'privacidade@galvaosstore.com.br'
const EMAIL_CONTACT = 'contato@galvaosstore.com.br'
const WHATSAPP = '(12) 9 9999-9999'

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 40, scrollMarginTop: 80 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, marginBottom: 12, color: 'var(--fg)' }}>
        {title}
      </h2>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.9 }}>
        {children}
      </div>
    </section>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: 6 }}>{children}</li>
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>{children}</strong>
}

export default function PrivacidadePage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 780 }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 8, fontWeight: 700 }}>
          Legal · LGPD · Lei nº 13.709/2018
        </div>
        <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(36px,5vw,56px)', margin: '0 0 8px' }}>
          POLÍTICA DE<br /><span style={{ color: 'var(--brand-orange)' }}>PRIVACIDADE.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', marginTop: 8 }}>
          Última actualização: {UPDATED} — versão 2.0
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 12, lineHeight: 1.8 }}>
          Esta Política explica de forma clara e objectiva como a <Strong>Galvão&apos;s Store</Strong> coleta, usa, armazena e protege
          seus dados pessoais. Leia com atenção antes de usar nosso site.
        </p>
      </div>

      {/* Índice rápido */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 24px', marginBottom: 48 }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 12 }}>Índice</p>
        <ol style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', lineHeight: 2.2, margin: 0, paddingLeft: 20 }}>
          {[
            ['#controlador', '1. Quem somos (Controlador de Dados)'],
            ['#dados', '2. Dados que coletamos'],
            ['#finalidades', '3. Para que usamos seus dados'],
            ['#base-legal', '4. Base legal do tratamento (LGPD)'],
            ['#compartilhamento', '5. Compartilhamento com terceiros'],
            ['#retencao', '6. Prazo de retenção e eliminação'],
            ['#cookies', '7. Cookies e tecnologias de rastreamento'],
            ['#menores', '8. Proteção de menores de idade'],
            ['#seguranca', '9. Segurança da informação'],
            ['#direitos', '10. Seus direitos como titular'],
            ['#dpo', '11. Encarregado de Dados (DPO)'],
            ['#incidentes', '12. Incidentes de segurança'],
            ['#transferencia', '13. Transferência internacional'],
            ['#alteracoes', '14. Alterações nesta Política'],
          ].map(([href, label]) => (
            <li key={href}><a href={href} style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>{label}</a></li>
          ))}
        </ol>
      </div>

      <Section id="controlador" title="1. Quem somos — Controlador de Dados">
        <p>
          <Strong>Galvão&apos;s Store</Strong> é uma loja virtual de artigos esportivos (chuteiras e tênis), sediada em
          Caraguatatuba/SP, Brasil. Somos o <Strong>Controlador de Dados</Strong> responsável pelo tratamento das suas
          informações pessoais, nos termos da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>
        <p style={{ marginTop: 10 }}>
          <Strong>Contato do Controlador:</Strong><br />
          E-mail: {EMAIL_PRIVACY}<br />
          WhatsApp: {WHATSAPP}
        </p>
      </Section>

      <Section id="dados" title="2. Dados que coletamos">
        <p><Strong>2.1 Dados fornecidos por você:</Strong></p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 16px' }}>
          <Li><Strong>Cadastro:</Strong> nome completo, CPF, e-mail, telefone e data de nascimento.</Li>
          <Li><Strong>Endereço de entrega:</Strong> CEP, logradouro, número, complemento, bairro, cidade e estado.</Li>
          <Li><Strong>Pagamento:</Strong> os dados do cartão são processados exclusivamente pelo Mercado Pago — não armazenamos nem temos acesso ao número completo do cartão. Para PIX e boleto, armazenamos apenas o ID da transação.</Li>
          <Li><Strong>Comunicações:</Strong> mensagens enviadas por e-mail ou WhatsApp para nosso atendimento.</Li>
        </ul>
        <p><Strong>2.2 Dados coletados automaticamente:</Strong></p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li><Strong>Navegação:</Strong> endereço IP, tipo de navegador, sistema operacional, páginas visitadas, tempo de sessão.</Li>
          <Li><Strong>Cookies:</Strong> cookies necessários (sessão, autenticação, carrinho) e, com seu consentimento, cookies analíticos e de marketing.</Li>
          <Li><Strong>Rastreamento de conversão:</Strong> Google Analytics, Meta Pixel e Microsoft Clarity — somente com seu consentimento explícito.</Li>
        </ul>
      </Section>

      <Section id="finalidades" title="3. Para que usamos seus dados">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--fg)', fontWeight: 700 }}>Finalidade</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--fg)', fontWeight: 700 }}>Base Legal</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Processar e entregar seus pedidos', 'Execução de contrato'],
              ['Emitir nota fiscal (quando aplicável)', 'Obrigação legal'],
              ['Enviar e-mails transacionais (confirmação, rastreio, cancelamento)', 'Execução de contrato'],
              ['Atendimento ao cliente via WhatsApp e e-mail', 'Execução de contrato / Interesse legítimo'],
              ['Prevenir fraudes e proteger a segurança da plataforma', 'Interesse legítimo / Obrigação legal'],
              ['Análise de uso do site (Google Analytics, Clarity)', 'Consentimento'],
              ['Marketing e remarketing (Meta Pixel, Google Ads)', 'Consentimento'],
              ['Newsletter e comunicações promocionais', 'Consentimento'],
              ['Personalização de experiência e recomendações', 'Consentimento'],
              ['Cumprimento de ordens judiciais ou requisições legais', 'Obrigação legal'],
            ].map(([fin, base]) => (
              <tr key={fin} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px' }}>{fin}</td>
                <td style={{ padding: '10px 12px', color: 'var(--fg)' }}>{base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section id="base-legal" title="4. Base legal do tratamento (LGPD)">
        <p>Nos termos do art. 7º da LGPD, processamos seus dados com base em:</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li><Strong>Consentimento (art. 7º, I):</Strong> para marketing, analytics e cookies não essenciais. Você pode revogar a qualquer momento.</Li>
          <Li><Strong>Execução de contrato (art. 7º, V):</Strong> para processar pedidos, pagamentos e entregas.</Li>
          <Li><Strong>Obrigação legal (art. 7º, II):</Strong> para emissão de nota fiscal, retenção de registros fiscais e cumprimento de determinações judiciais.</Li>
          <Li><Strong>Interesse legítimo (art. 7º, IX):</Strong> para prevenção de fraudes, segurança da plataforma e atendimento ao cliente.</Li>
        </ul>
      </Section>

      <Section id="compartilhamento" title="5. Compartilhamento com terceiros">
        <p>Seus dados são compartilhados apenas com os parceiros estritamente necessários para operar nossos serviços:</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 16px' }}>
          <Li><Strong>Mercado Pago (MercadoLibre S.A.):</Strong> processamento de pagamentos. <a href="https://www.mercadopago.com.br/privacidade" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-orange)' }}>Política de privacidade →</a></Li>
          <Li><Strong>Correios e transportadoras (Melhor Envio):</Strong> nome, endereço e telefone para entrega.</Li>
          <Li><Strong>Resend Inc.:</Strong> envio de e-mails transacionais. Dados armazenados nos EUA (cláusulas contratuais padrão).</Li>
          <Li><Strong>Supabase Inc.:</Strong> autenticação e armazenamento de imagens. Dados armazenados nos EUA (cláusulas contratuais padrão).</Li>
          <Li><Strong>Google LLC:</Strong> Analytics (com anonimização de IP). Sujeito a transferência internacional (EUA).</Li>
          <Li><Strong>Meta Platforms Inc.:</Strong> publicidade (com consentimento). Sujeito a transferência internacional (EUA).</Li>
          <Li><Strong>Sentry (Functional Software Inc.):</Strong> monitoramento de erros técnicos. Sem dados pessoais identificáveis.</Li>
        </ul>
        <p><Strong>Não vendemos, alugamos nem cedemos seus dados pessoais a terceiros para fins comerciais.</Strong></p>
        <p style={{ marginTop: 10 }}>Podemos divulgar dados quando exigido por lei, ordem judicial ou autoridade competente (ANPD, Procon, Ministério Público).</p>
      </Section>

      <Section id="retencao" title="6. Prazo de retenção e eliminação de dados">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--fg)', fontWeight: 700 }}>Tipo de dado</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--fg)', fontWeight: 700 }}>Prazo de retenção</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--fg)', fontWeight: 700 }}>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Dados de pedidos (nome, endereço, valores)', '5 anos após a compra', 'Obrigação fiscal (Código Tributário Nacional)'],
              ['Dados de cadastro de conta', 'Até exclusão da conta + 6 meses', 'Interesse legítimo / contestações'],
              ['Dados de pagamento (ID de transação)', '5 anos', 'Obrigação fiscal'],
              ['Logs de acesso (IP, data/hora)', '6 meses', 'Marco Civil da Internet (art. 15)'],
              ['Dados de marketing/newsletter', 'Até revogação do consentimento', 'Consentimento revogável'],
              ['Cookies analíticos', '13 meses', 'Padrão Google Analytics'],
              ['Dados de suporte (chats, e-mails)', '2 anos após resolução', 'Interesse legítimo'],
            ].map(([tipo, prazo, motivo]) => (
              <tr key={tipo} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px' }}>{tipo}</td>
                <td style={{ padding: '10px 12px', color: 'var(--fg)' }}>{prazo}</td>
                <td style={{ padding: '10px 12px' }}>{motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 14 }}>
          Após o prazo, os dados são eliminados de forma segura ou anonimizados. Para solicitar eliminação antecipada
          (nos casos permitidos por lei), envie e-mail para <Strong>{EMAIL_PRIVACY}</Strong>.
        </p>
      </Section>

      <Section id="cookies" title="7. Cookies e tecnologias de rastreamento">
        <p><Strong>Cookies necessários</Strong> (sem necessidade de consentimento):</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 16px' }}>
          <Li>Sessão de autenticação (Supabase)</Li>
          <Li>Carrinho de compras</Li>
          <Li>Preferências de consentimento (cookie-consent)</Li>
        </ul>
        <p><Strong>Cookies opcionais</Strong> (exigem seu consentimento):</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 16px' }}>
          <Li>Google Analytics — análise de navegação (pode ser desativado em <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-orange)' }}>tools.google.com/dlpage/gaoptout</a>)</Li>
          <Li>Meta Pixel — rastreamento de conversões para anúncios no Facebook/Instagram</Li>
          <Li>Microsoft Clarity — mapas de calor e gravação de sessão (com máscaras de PII)</Li>
        </ul>
        <p>
          Você pode gerir suas preferências a qualquer momento clicando em &quot;Configurações de Cookies&quot; no
          rodapé do site ou nas configurações do seu navegador.
        </p>
      </Section>

      <Section id="menores" title="8. Proteção de menores de idade">
        <p>
          Nosso site é destinado a pessoas com <Strong>18 anos ou mais</Strong>. Não coletamos intencionalmente
          dados de menores de 14 anos. Se tomarmos conhecimento de que dados de um menor foram coletados sem o
          consentimento adequado dos responsáveis legais, eliminaremos essas informações imediatamente.
        </p>
        <p style={{ marginTop: 10 }}>
          Adolescentes entre 14 e 17 anos podem usar o site com o <Strong>consentimento expresso de um responsável legal</Strong>,
          que responde solidariamente pelas obrigações assumidas. Para compras, o responsável deve realizar o
          cadastro e o pagamento.
        </p>
      </Section>

      <Section id="seguranca" title="9. Segurança da informação">
        <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li><Strong>HTTPS obrigatório</Strong> em todo o site (TLS 1.3)</Li>
          <Li><Strong>HSTS</Strong> com preload (max-age 2 anos) — impede downgrade de conexão</Li>
          <Li><Strong>Tokenização de cartão</Strong> via Mercado Pago — nenhum dado de cartão toca nossos servidores</Li>
          <Li><Strong>Autenticação segura</Strong> via Supabase Auth (bcrypt, tokens JWT com rotação)</Li>
          <Li><Strong>Rate limiting</Strong> em todas as rotas sensíveis (login, newsletter, formulários)</Li>
          <Li><Strong>Content Security Policy (CSP)</Strong> para prevenir XSS</Li>
          <Li><Strong>Acesso ao painel admin</Strong> restrito a e-mails autorizados com autenticação obrigatória</Li>
          <Li><Strong>Logs de auditoria</Strong> de alterações críticas no banco de dados</Li>
          <Li><Strong>Backups regulares</Strong> do banco de dados</Li>
        </ul>
        <p style={{ marginTop: 14 }}>
          Nenhum sistema é 100% seguro. Em caso de incidente, notificaremos os titulares afetados e a ANPD
          conforme os prazos legais (ver Seção 12).
        </p>
      </Section>

      <Section id="direitos" title="10. Seus direitos como titular (LGPD, art. 18)">
        <p>Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 16px' }}>
          <Li><Strong>Confirmação e acesso:</Strong> saber se tratamos seus dados e obter uma cópia.</Li>
          <Li><Strong>Correção:</Strong> solicitar a atualização de dados incompletos, inexatos ou desatualizados.</Li>
          <Li><Strong>Eliminação:</Strong> pedir a exclusão dos dados tratados com base em consentimento (exceto quando a lei exige retenção).</Li>
          <Li><Strong>Portabilidade:</Strong> receber seus dados em formato estruturado e interoperável.</Li>
          <Li><Strong>Revogação do consentimento:</Strong> retirar o consentimento a qualquer momento (ex: cancelar newsletter).</Li>
          <Li><Strong>Oposição:</Strong> se opor ao tratamento baseado em interesse legítimo, quando não justificado.</Li>
          <Li><Strong>Revisão de decisões automatizadas:</Strong> solicitar revisão humana de decisões tomadas exclusivamente por algoritmos.</Li>
          <Li><Strong>Informação sobre compartilhamento:</Strong> saber com quais terceiros seus dados foram compartilhados.</Li>
        </ul>
        <p>
          Para exercer qualquer direito, envie e-mail para <Strong>{EMAIL_PRIVACY}</Strong> com o assunto
          &quot;[LGPD] Exercício de Direito&quot;. Responderemos em até <Strong>15 dias úteis</Strong>, conforme exigido pela lei.
          Podemos solicitar verificação de identidade antes de processar seu pedido.
        </p>
        <p style={{ marginTop: 10 }}>
          Se não obtiver resposta satisfatória, você pode reclamar à <Strong>ANPD</Strong> (Autoridade Nacional de
          Proteção de Dados) em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-orange)' }}>gov.br/anpd</a> ou
          ao <Strong>Procon</Strong> do seu município.
        </p>
      </Section>

      <Section id="dpo" title="11. Encarregado de Dados (DPO)">
        <p>
          Nos termos do art. 41 da LGPD, o nosso Encarregado de Proteção de Dados (Data Protection Officer)
          pode ser contactado em:
        </p>
        <p style={{ marginTop: 10 }}>
          <Strong>E-mail:</Strong> {EMAIL_PRIVACY}<br />
          <Strong>Assunto:</Strong> [DPO] + descrição da solicitação<br />
          <Strong>Prazo de resposta:</Strong> até 15 dias úteis
        </p>
        <p style={{ marginTop: 10 }}>
          O DPO é responsável por receber comunicações dos titulares e da ANPD, orientar funcionários
          sobre práticas de privacidade e supervisionar o cumprimento desta Política.
        </p>
      </Section>

      <Section id="incidentes" title="12. Incidentes de segurança">
        <p>
          Em caso de vazamento, acesso não autorizado ou outro incidente que possa causar risco ou dano
          relevante aos titulares, nos comprometemos a:
        </p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li>Comunicar a ANPD em até 72 horas após a ciência do incidente (LGPD, art. 48).</Li>
          <Li>Notificar os titulares afetados diretamente por e-mail, com descrição dos dados envolvidos, possíveis riscos e medidas tomadas.</Li>
          <Li>Tomar medidas imediatas para conter e corrigir o incidente.</Li>
          <Li>Documentar o incidente e as ações corretivas adotadas.</Li>
        </ul>
      </Section>

      <Section id="transferencia" title="13. Transferência internacional de dados">
        <p>
          Alguns de nossos parceiros (Resend, Supabase, Google, Meta, Sentry) armazenam dados em servidores
          localizados nos Estados Unidos. Essas transferências são realizadas com base em:
        </p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li>Cláusulas contratuais padrão aprovadas pela ANPD.</Li>
          <Li>Certificações de adequação reconhecidas (ex: EU-US Data Privacy Framework).</Li>
          <Li>Necessidade para execução do contrato com você (LGPD, art. 33, V).</Li>
        </ul>
      </Section>

      <Section id="alteracoes" title="14. Alterações nesta Política">
        <p>
          Podemos actualizar esta Política periodicamente. Quando houver alterações relevantes, notificaremos
          por e-mail (se você tiver cadastro) ou por aviso em destaque no site. A data de &quot;Última actualização&quot;
          no topo do documento indica a versão em vigor.
        </p>
        <p style={{ marginTop: 10 }}>
          O uso continuado do site após a notificação de alterações constitui aceitação da nova versão.
          Se não concordar, por favor encerre sua conta e cesse o uso do site.
        </p>
      </Section>

      {/* Contato */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '24px', marginTop: 16 }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>
          Dúvidas sobre esta Política?
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.8 }}>
          📧 <a href={`mailto:${EMAIL_PRIVACY}`} style={{ color: 'var(--brand-orange)' }}>{EMAIL_PRIVACY}</a><br />
          💬 WhatsApp: {WHATSAPP}<br />
          📮 {EMAIL_CONTACT}
        </p>
      </div>

    </div>
  )
}
