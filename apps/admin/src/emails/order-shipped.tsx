import { Section, Row, Column, Text, Link, Hr } from '@react-email/components'
import {
  EmailLayout,
  CtaButton,
  AddressBlock,
  brand,
  font,
  APP_URL,
  type OrderItemData,
  type AddressData,
} from './_components/email-layout'

export interface OrderShippedEmailProps {
  orderNumber:    string
  customerName:   string
  shippedAt:      string
  trackingCode:   string
  trackingUrl?:   string
  deliveryMethod: string
  estimatedDays?: number | null
  items:          OrderItemData[]
  address:        AddressData
}

const deliveryLabels: Record<string, string> = {
  sedex:          'SEDEX — Correios',
  pac:            'PAC — Correios',
  local_delivery: 'Entrega Local',
  pickup:         'Retirada na Loja',
}

const trackingBaseUrls: Record<string, string> = {
  sedex: 'https://rastreamento.correios.com.br/app/index.php',
  pac:   'https://rastreamento.correios.com.br/app/index.php',
}

export function OrderShippedEmail({
  orderNumber,
  customerName,
  shippedAt,
  trackingCode,
  trackingUrl,
  deliveryMethod,
  estimatedDays,
  items,
  address,
}: OrderShippedEmailProps) {
  const firstName = customerName.split(' ')[0]

  const resolvedTrackingUrl =
    trackingUrl ??
    (trackingBaseUrls[deliveryMethod]
      ? `${trackingBaseUrls[deliveryMethod]}?objeto=${trackingCode}`
      : undefined)

  const shippedDate = new Date(shippedAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const estimatedArrival = estimatedDays
    ? (() => {
        const d = new Date(shippedAt)
        d.setDate(d.getDate() + estimatedDays)
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
      })()
    : null

  return (
    <EmailLayout preview={`Pedido ${orderNumber} enviado! Rastreio: ${trackingCode}`}>

      {/* ── Hero ── */}
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ margin: '0 0 8px', fontSize: '56px', lineHeight: '1' }}>🚚</Text>
        <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '28px', fontWeight: '900', color: brand.dark }}>
          Seu pedido está a caminho!
        </Text>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '15px', color: brand.muted }}>
          Boa notícia, <strong style={{ color: brand.dark }}>{firstName}</strong>! Seu pedido saiu para entrega.
        </Text>
      </Section>

      {/* ── Tracking destaque ── */}
      <Section style={{ backgroundColor: brand.dark, borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
        <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '11px', color: brand.orange, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700' }}>
          Código de Rastreio
        </Text>
        <Text style={{ margin: '0 0 4px', fontFamily: font.mono, fontSize: '28px', fontWeight: '900', color: brand.light, letterSpacing: '2px' }}>
          {trackingCode}
        </Text>
        <Text style={{ margin: '0 0 16px', fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
          {deliveryLabels[deliveryMethod] ?? deliveryMethod}
        </Text>
        {resolvedTrackingUrl && (
          <Link
            href={resolvedTrackingUrl}
            style={{
              display: 'inline-block',
              backgroundColor: brand.orange,
              color: brand.white,
              fontFamily: font.base,
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
            }}
          >
            Rastrear Pedido →
          </Link>
        )}
      </Section>

      {/* ── Datas ── */}
      <Section style={{ marginBottom: '24px' }}>
        <Row>
          <Column style={{ width: '50%', paddingRight: '8px' }}>
            <Section style={{ backgroundColor: '#FAFAFA', border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '11px', color: brand.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Despachado em</Text>
              <Text style={{ margin: 0, fontFamily: font.base, fontSize: '14px', fontWeight: '700', color: brand.dark }}>{shippedDate}</Text>
            </Section>
          </Column>
          <Column style={{ width: '50%', paddingLeft: '8px' }}>
            <Section style={{ backgroundColor: '#F0FDF4', border: `1px solid #BBF7D0`, borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '11px', color: '#166534', letterSpacing: '1px', textTransform: 'uppercase' }}>Previsão de Entrega</Text>
              <Text style={{ margin: 0, fontFamily: font.base, fontSize: '14px', fontWeight: '700', color: brand.green }}>
                {estimatedArrival ?? (estimatedDays ? `${estimatedDays} dias úteis` : 'A confirmar')}
              </Text>
            </Section>
          </Column>
        </Row>
      </Section>

      {/* ── Timeline de status ── */}
      <Section style={{ marginBottom: '24px' }}>
        {[
          { icon: '✅', label: 'Pagamento Confirmado', done: true  },
          { icon: '📦', label: 'Pedido Preparado',     done: true  },
          { icon: '🚚', label: 'Enviado',              done: true,  active: true },
          { icon: '🏠', label: 'Entregue',             done: false },
        ].map((step, i) => (
          <Row key={i} style={{ marginBottom: '8px', opacity: step.done ? 1 : 0.4 }}>
            <Column style={{ width: '40px' }}>
              <Text style={{ margin: 0, fontSize: '20px', textAlign: 'center' }}>{step.icon}</Text>
            </Column>
            <Column style={{ paddingLeft: '12px' }}>
              <Text style={{
                margin: 0,
                fontFamily: font.base,
                fontSize: '14px',
                fontWeight: (step as { active?: boolean }).active ? '700' : '400',
                color: step.done ? brand.dark : brand.muted,
              }}>
                {step.label}
                {(step as { active?: boolean }).active && (
                  <span style={{ color: brand.teal, fontWeight: '900', marginLeft: '8px' }}>← Agora</span>
                )}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />

      {/* ── Itens ── */}
      <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Itens Enviados
      </Text>
      <Section style={{ marginBottom: '24px' }}>
        {items.map((item, i) => (
          <Row key={i} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: i < items.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
            <Column style={{ width: '70%' }}>
              <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark }}>{item.productName}</Text>
              <Text style={{ margin: 0, fontFamily: font.base, fontSize: '12px', color: brand.muted }}>
                {item.brandName} · Tam. {item.variantSize}{item.variantColor ? ` · ${item.variantColor}` : ''} · Qtd: {item.qty}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* ── Endereço ── */}
      <AddressBlock address={address} />

      {/* ── Dicas de rastreio ── */}
      <Section style={{ backgroundColor: '#FFFBEB', border: `1px solid #FDE68A`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '12px', fontWeight: '700', color: '#92400E', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Dicas para Rastrear
        </Text>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: '#78350F', lineHeight: '1.6' }}>
          • O rastreio é atualizado pelos Correios a cada 24–48 horas.<br />
          • Se não encontrar atualizações, tente novamente amanhã.<br />
          • Em caso de problemas, entre em contato conosco.
        </Text>
      </Section>

      <CtaButton href={`${APP_URL}/conta/pedidos/${orderNumber.toLowerCase()}`}>
        Acompanhar no Site →
      </CtaButton>

      <Section style={{ textAlign: 'center', padding: '0 0 32px' }}>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
          Pedido <strong style={{ fontFamily: font.mono, color: brand.dark }}>{orderNumber}</strong> · Dúvidas? Responda este e-mail.
        </Text>
      </Section>

    </EmailLayout>
  )
}

export default OrderShippedEmail
