import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso — Galvão\'s Store',
  description: 'Termos e condições de uso da loja virtual Galvão\'s Store.',
}

const UPDATED = 'Junho de 2026'
const EMAIL = 'contato@galvaosstore.com.br'
const WHATSAPP = '(12) 9 9999-9999'
const CIDADE = 'Caraguatatuba/SP'

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

export default function TermosPage() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 780 }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 8, fontWeight: 700 }}>
          Legal · CDC · Código de Defesa do Consumidor
        </div>
        <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(36px,5vw,56px)', margin: '0 0 8px' }}>
          TERMOS DE<br /><span style={{ color: 'var(--brand-orange)' }}>USO.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', marginTop: 8 }}>
          Última actualização: {UPDATED} — versão 2.0
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 12, lineHeight: 1.8 }}>
          Ao acessar ou utilizar o site da <Strong>Galvão&apos;s Store</Strong>, você declara ter lido, compreendido e
          concordado com estes Termos de Uso. Se não concordar com qualquer cláusula, por favor não utilize nossos serviços.
        </p>
      </div>

      {/* Índice */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 24px', marginBottom: 48 }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 12 }}>Índice</p>
        <ol style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', lineHeight: 2.2, margin: 0, paddingLeft: 20 }}>
          {[
            ['#objeto', '1. Objeto e aceitação'],
            ['#cadastro', '2. Cadastro e conta'],
            ['#uso-permitido', '3. Uso permitido e proibições'],
            ['#produtos', '4. Produtos, preços e disponibilidade'],
            ['#pagamento', '5. Formas de pagamento'],
            ['#entrega', '6. Entrega e prazos'],
            ['#troca-devolucao', '7. Trocas, devoluções e direito de arrependimento (CDC)'],
            ['#garantia', '8. Garantias'],
            ['#propriedade', '9. Propriedade intelectual'],
            ['#responsabilidade', '10. Limitação de responsabilidade'],
            ['#fraude', '11. Prevenção de fraudes e chargeback'],
            ['#forca-maior', '12. Força maior e caso fortuito'],
            ['#suspensao', '13. Suspensão e encerramento de conta'],
            ['#alteracoes', '14. Alterações dos Termos'],
            ['#lei', '15. Lei aplicável e foro'],
            ['#contato', '16. Contato e SAC'],
          ].map(([href, label]) => (
            <li key={href}><a href={href} style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>{label}</a></li>
          ))}
        </ol>
      </div>

      <Section id="objeto" title="1. Objeto e aceitação">
        <p>
          Estes Termos regulam o acesso e uso do site <Strong>galvaosstore.com.br</Strong> e de todos os
          serviços prestados pela Galvão&apos;s Store, incluindo a navegação, o cadastro, a compra de produtos e
          o uso de promoções e cupons.
        </p>
        <p style={{ marginTop: 10 }}>
          A aceitação é formalizada ao marcar a caixa &quot;Li e aceito os Termos de Uso&quot; no cadastro ou
          finalização de compra. Menores de 18 anos devem ter o consentimento de um responsável legal,
          que assume responsabilidade solidária.
        </p>
      </Section>

      <Section id="cadastro" title="2. Cadastro e conta">
        <ul style={{ paddingLeft: 20, margin: '0' }}>
          <Li>O cadastro exige informações verdadeiras, completas e actualizadas. O fornecimento de dados falsos pode acarretar cancelamento imediato da conta e das compras realizadas.</Li>
          <Li>Você é responsável pela <Strong>confidencialidade da sua senha</Strong>. Não compartilhe suas credenciais. Em caso de suspeita de acesso não autorizado, altere sua senha imediatamente e nos notifique em {EMAIL}.</Li>
          <Li>Cada pessoa física pode ter apenas <Strong>uma conta</Strong>. A criação de múltiplas contas para abusar de promoções ou cupons é proibida e poderá resultar em cancelamento de todas as contas envolvidas.</Li>
          <Li>Reservamo-nos o direito de <Strong>verificar a identidade</Strong> do titular antes de processar pedidos de alto valor.</Li>
          <Li>A exclusão de conta pode ser solicitada a qualquer momento em {EMAIL}. A exclusão não afeta pedidos em andamento nem obrigações fiscais já constituídas.</Li>
        </ul>
      </Section>

      <Section id="uso-permitido" title="3. Uso permitido e proibições">
        <p>O site deve ser usado exclusivamente para navegação pessoal e compras legítimas. É expressamente <Strong>proibido</Strong>:</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li>Usar bots, scrapers, crawlers ou qualquer automação não autorizada para acessar ou extrair dados do site.</Li>
          <Li>Tentar contornar mecanismos de segurança, autenticação ou rate limiting.</Li>
          <Li>Realizar ataques de negação de serviço (DoS/DDoS), tentativas de injeção (SQL, XSS) ou qualquer outra exploração de vulnerabilidades.</Li>
          <Li>Realizar compras com cartões de crédito ou contas de pagamento que não lhe pertencem (fraude).</Li>
          <Li>Criar pedidos falsos ou cancelar sistematicamente para prejudicar o estoque ou operação da loja.</Li>
          <Li>Usar o site para fins ilegais, incluindo lavagem de dinheiro ou financiamento de atividades ilícitas.</Li>
          <Li>Reproduzir, copiar ou distribuir conteúdo do site sem autorização prévia por escrito.</Li>
          <Li>Criar múltiplas contas para abusar de promoções, cupons ou benefícios de fidelidade.</Li>
          <Li>Enviar spam, phishing ou comunicações enganosas em nome da Galvão&apos;s Store.</Li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Violações podem resultar em <Strong>suspensão imediata da conta</Strong>, cancelamento de pedidos,
          estorno de valores indevidos e notificação às autoridades competentes.
        </p>
      </Section>

      <Section id="produtos" title="4. Produtos, preços e disponibilidade">
        <ul style={{ paddingLeft: 20, margin: '0' }}>
          <Li>Os preços exibidos são em <Strong>Reais (BRL)</Strong> e incluem os impostos aplicáveis, salvo indicação em contrário.</Li>
          <Li>Reservamo-nos o direito de <Strong>alterar preços e disponibilidade a qualquer momento</Strong> sem aviso prévio. O preço válido é o exibido no momento da confirmação do pedido.</Li>
          <Li>Em caso de <Strong>erro de preço</Strong> manifesto (ex: produto de R$500 anunciado por R$5,00 por falha de sistema), entraremos em contacto para confirmar a compra pelo preço correto ou proceder ao cancelamento com reembolso integral. Não somos obrigados a honrar preços evidentemente errados.</Li>
          <Li>A disponibilidade do estoque é verificada em tempo real, mas pode haver variações em situações de alta demanda. Se um produto estiver indisponível após a confirmação do pedido, ofereceremos substituição ou reembolso integral.</Li>
          <Li>Imagens dos produtos são ilustrativas. Pequenas variações de cor podem ocorrer por calibragem de telas.</Li>
        </ul>
      </Section>

      <Section id="pagamento" title="5. Formas de pagamento">
        <ul style={{ paddingLeft: 20, margin: '0' }}>
          <Li><Strong>PIX:</Strong> desconto automático de 5% no subtotal. O pagamento deve ser realizado em até 30 minutos após a geração do QR Code, caso contrário o pedido é cancelado automaticamente e o estoque liberado.</Li>
          <Li><Strong>Cartão de crédito:</Strong> aceitamos os principais cartões nacionais e internacionais, em até 12x sem juros (sujeito ao valor mínimo de parcela de R$10,00). O processamento é realizado pelo Mercado Pago.</Li>
          <Li><Strong>Boleto bancário:</Strong> o pagamento deve ser realizado em até 3 dias úteis. Após esse prazo, o boleto vence e o pedido é cancelado.</Li>
          <Li>Todos os pagamentos são processados em ambiente seguro pela <Strong>Mercado Pago</Strong>. Não armazenamos dados de cartão em nossos servidores.</Li>
          <Li>O pedido só é confirmado após a <Strong>aprovação do pagamento</Strong> pelo processador. Para PIX e boleto, o processamento pode levar alguns minutos.</Li>
          <Li>Reservamo-nos o direito de recusar pedidos que apresentem indícios de fraude, independentemente da forma de pagamento.</Li>
        </ul>
      </Section>

      <Section id="entrega" title="6. Entrega e prazos">
        <ul style={{ paddingLeft: 20, margin: '0' }}>
          <Li>Os prazos de entrega são <Strong>estimados em dias úteis</Strong> e iniciam a contagem após a confirmação do pagamento e a separação do pedido.</Li>
          <Li>Prazos podem ser impactados por greves, feriados, condições climáticas extremas, endereços de difícil acesso ou restrições dos Correios/transportadoras. Nesses casos, não nos responsabilizamos pelos atrasos, mas nos comprometemos a acompanhar e informar o cliente.</Li>
          <Li>A <Strong>entrega local</Strong> (Caraguatatuba e região) é realizada por carro próprio e pode ter prazo diferenciado, conforme disponibilidade.</Li>
          <Li>O risco de extravio ou dano durante o transporte é de responsabilidade da transportadora. Ajudaremos a acionar o seguro ou buscar solução junto ao Correios em caso de problemas.</Li>
          <Li>Em caso de <Strong>não entrega por ausência do destinatário</Strong>, o produto pode ser devolvido ao remetente. Nesse caso, o reenvio estará sujeito a novo frete.</Li>
          <Li>Caso o pedido não seja entregue no prazo estimado + 7 dias úteis, entre em contacto para investigação e solução.</Li>
        </ul>
      </Section>

      <Section id="troca-devolucao" title="7. Trocas, devoluções e direito de arrependimento">
        <p style={{ marginBottom: 12 }}><Strong>7.1 Direito de arrependimento (CDC, art. 49)</Strong></p>
        <p>
          Para compras realizadas pela internet, você tem o direito de desistir da compra em até <Strong>7 (sete) dias corridos</Strong> a
          partir do recebimento do produto, sem necessidade de justificativa, com reembolso integral incluindo o frete de
          retorno (quando aplicável). Para exercer este direito, entre em contacto em {EMAIL} ou {WHATSAPP}.
        </p>

        <p style={{ marginTop: 16, marginBottom: 12 }}><Strong>7.2 Troca por defeito ou produto incorreto</Strong></p>
        <p>
          Em caso de produto com vício ou diferente do anunciado, você tem direito à troca, reparo ou reembolso conforme
          o <Strong>Código de Defesa do Consumidor (art. 18 e 26)</Strong>:
        </p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li>Produto com <Strong>vício aparente:</Strong> prazo de 90 dias para reclamar (produtos duráveis).</Li>
          <Li>Produto com <Strong>vício oculto:</Strong> prazo de 90 dias contados da descoberta do defeito.</Li>
          <Li>Se não conseguirmos solucionar o problema em 30 dias, você poderá optar por substituição do produto, abatimento proporcional do preço ou devolução com reembolso integral.</Li>
        </ul>

        <p style={{ marginTop: 16, marginBottom: 12 }}><Strong>7.3 Condições para troca/devolução</Strong></p>
        <ul style={{ paddingLeft: 20, margin: '0' }}>
          <Li>Produto deve estar na <Strong>embalagem original, sem uso e sem sinais de uso</Strong> (salvo casos de vício ou defeito).</Li>
          <Li>Acompanhar nota fiscal ou comprovante de compra.</Li>
          <Li>Itens em promoção ou liquidação seguem as mesmas regras legais de troca por vício.</Li>
          <Li>Frete de retorno em caso de arrependimento: por conta do cliente. Por defeito ou erro nosso: por nossa conta.</Li>
        </ul>

        <p style={{ marginTop: 16 }}>
          O reembolso será processado em até <Strong>10 dias úteis</Strong> após o recebimento e validação do produto devolvido,
          pelo mesmo meio de pagamento original (para cartão, sujeito ao prazo da operadora).
        </p>
      </Section>

      <Section id="garantia" title="8. Garantias">
        <p>
          Todos os produtos vendidos têm a <Strong>garantia legal mínima de 90 dias</Strong> contra vícios de fabricação,
          conforme o CDC. Alguns produtos podem ter garantia adicional do fabricante — verifique a embalagem.
        </p>
        <p style={{ marginTop: 10 }}>
          A garantia não cobre danos causados por uso inadequado, desgaste natural, acidentes, modificações não
          autorizadas ou descumprimento das instruções do fabricante.
        </p>
      </Section>

      <Section id="propriedade" title="9. Propriedade intelectual">
        <p>
          Todo o conteúdo do site — textos, imagens, logotipos, layouts, código-fonte, nomes de produtos — é de
          propriedade da Galvão&apos;s Store ou de seus licenciadores. É <Strong>proibido reproduzir, distribuir,
          modificar ou usar comercialmente</Strong> qualquer conteúdo sem autorização prévia por escrito.
        </p>
        <p style={{ marginTop: 10 }}>
          As marcas Nike, Adidas, Puma, Umbro e demais são de propriedade de seus respectivos titulares.
          A exibição dessas marcas neste site serve apenas para identificação dos produtos comercializados.
        </p>
        <p style={{ marginTop: 10 }}>
          Qualquer uso não autorizado estará sujeito às penalidades da Lei de Propriedade Industrial
          (Lei nº 9.279/1996) e da Lei de Direitos Autorais (Lei nº 9.610/1998).
        </p>
      </Section>

      <Section id="responsabilidade" title="10. Limitação de responsabilidade">
        <p>
          Na máxima extensão permitida pela legislação brasileira (sem excluir direitos do consumidor previstos no CDC):
        </p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li>Nossa responsabilidade está <Strong>limitada ao valor do produto adquirido</Strong>, salvo dolo ou culpa grave.</Li>
          <Li>Não nos responsabilizamos por <Strong>danos indiretos, lucros cessantes ou danos morais</Strong> decorrentes de atrasos de entrega por terceiros (Correios, transportadoras).</Li>
          <Li>Não nos responsabilizamos por indisponibilidade temporária do site por manutenção, falhas de terceiros ou eventos fora do nosso controle.</Li>
          <Li>O site pode conter links para sites de terceiros. Não nos responsabilizamos pelo conteúdo ou práticas de privacidade desses sites.</Li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Estas limitações não afetam seus direitos como consumidor previstos no CDC. Em caso de conflito,
          prevalecem as disposições do CDC.
        </p>
      </Section>

      <Section id="fraude" title="11. Prevenção de fraudes e chargeback">
        <p>
          A Galvão&apos;s Store utiliza sistemas automatizados de prevenção de fraudes. Pedidos com
          características suspeitas podem ser:
        </p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 16px' }}>
          <Li>Colocados em análise (com notificação ao cliente)</Li>
          <Li>Cancelados preventivamente, com reembolso integral</Li>
          <Li>Sujeitos a verificação de identidade adicional</Li>
        </ul>
        <p>
          <Strong>Chargeback indevido:</Strong> caso você solicite o cancelamento do pagamento diretamente à
          operadora do cartão (chargeback) sem antes contatar nosso SAC para resolução, reservamo-nos o direito de:
        </p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li>Suspendr a conta e bloquear futuras compras enquanto o caso estiver em aberto.</Li>
          <Li>Apresentar evidências de entrega e comunicação à operadora do cartão e ao Mercado Pago.</Li>
          <Li>Tomar as medidas legais cabíveis em caso de chargeback fraudulento (estelionato, art. 171 do Código Penal).</Li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Sempre tente resolver o problema conosco primeiro — respondemos em até 24 horas em dias úteis.
        </p>
      </Section>

      <Section id="forca-maior" title="12. Força maior e caso fortuito">
        <p>
          Não seremos responsabilizados por atrasos ou descumprimento de obrigações causados por eventos de
          força maior ou caso fortuito, incluindo:
        </p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
          <Li>Greves de transportadoras ou dos Correios</Li>
          <Li>Desastres naturais, enchentes, pandemias</Li>
          <Li>Falhas generalizadas de infraestrutura de internet ou energia elétrica</Li>
          <Li>Atos de autoridade governamental (embargos, quarentenas, etc.)</Li>
          <Li>Ataques cibernéticos em larga escala contra provedores de serviço</Li>
        </ul>
        <p style={{ marginTop: 10 }}>
          Em tais situações, comunicaremos os clientes afetados e buscaremos a solução mais adequada possível,
          incluindo reprogramação de entrega ou reembolso.
        </p>
      </Section>

      <Section id="suspensao" title="13. Suspensão e encerramento de conta">
        <p>Podemos suspender ou encerrar sua conta, com aviso prévio quando possível, em caso de:</p>
        <ul style={{ paddingLeft: 20, margin: '8px 0 16px' }}>
          <Li>Violação destes Termos de Uso</Li>
          <Li>Fornecimento de informações falsas</Li>
          <Li>Suspeita de fraude ou atividade ilícita</Li>
          <Li>Inatividade superior a 2 anos</Li>
          <Li>Determinação judicial ou de autoridade competente</Li>
        </ul>
        <p>
          Em caso de encerramento por nossa iniciativa sem justa causa, reembolsaremos integralmente quaisquer
          valores pagos por pedidos não entregues.
        </p>
        <p style={{ marginTop: 10 }}>
          Você pode encerrar sua conta a qualquer momento em {EMAIL}. O encerramento não cancela obrigações
          já constituídas (pedidos em andamento, débitos pendentes).
        </p>
      </Section>

      <Section id="alteracoes" title="14. Alterações dos Termos">
        <p>
          Podemos actualizar estes Termos a qualquer momento. Alterações relevantes serão comunicadas com
          pelo menos <Strong>10 dias de antecedência</Strong> por e-mail (cadastrados) ou aviso no site.
        </p>
        <p style={{ marginTop: 10 }}>
          O uso continuado do site após a vigência das alterações constitui aceitação dos novos Termos. Caso
          não concorde, você pode encerrar sua conta antes da data de vigência.
        </p>
      </Section>

      <Section id="lei" title="15. Lei aplicável e foro">
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil, em especial pelo
          <Strong> Código de Defesa do Consumidor (Lei nº 8.078/1990)</Strong>, pelo <Strong>Marco Civil da Internet
          (Lei nº 12.965/2014)</Strong> e pela <Strong>LGPD (Lei nº 13.709/2018)</Strong>.
        </p>
        <p style={{ marginTop: 10 }}>
          Fica eleito o <Strong>Foro da Comarca de {CIDADE}</Strong> para dirimir quaisquer controvérsias
          decorrentes destes Termos, sem prejuízo do direito do consumidor de acionar o juizado de seu domicílio
          (CDC, art. 101, I) ou o Procon de seu município.
        </p>
        <p style={{ marginTop: 10 }}>
          Antes de acionar o judiciário, encorajamos a tentativa de resolução extrajudicial através do nosso SAC
          ou da plataforma pública <a href="https://consumidor.gov.br" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-orange)' }}>consumidor.gov.br</a>.
        </p>
      </Section>

      <Section id="contato" title="16. Contato e SAC">
        <p>Para dúvidas, reclamações ou exercício de direitos:</p>
        <div style={{ marginTop: 10 }}>
          <p>📧 <Strong>E-mail:</Strong> <a href={`mailto:${EMAIL}`} style={{ color: 'var(--brand-orange)' }}>{EMAIL}</a></p>
          <p>💬 <Strong>WhatsApp:</Strong> {WHATSAPP} (dias úteis, 9h–18h)</p>
          <p>🌐 <Strong>Consumidor.gov.br:</Strong> <a href="https://consumidor.gov.br" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-orange)' }}>consumidor.gov.br</a></p>
          <p>🏛️ <Strong>Procon:</Strong> Procon {CIDADE}</p>
        </div>
        <p style={{ marginTop: 14, fontSize: 13 }}>
          Horário de atendimento: segunda a sexta, das 9h às 18h. Respondemos em até 24 horas em dias úteis.
        </p>
      </Section>

    </div>
  )
}
