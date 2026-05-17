import { Section, Row, Column, Text, Hr } from '@react-email/components'
import {
  EmailLayout,
  OrderItemsTable,
  OrderTotals,
  CtaButton,
  brand,
  font,
  APP_URL,
  type OrderItemData,
  type TotalsData,
} from './_components/email-layout'

export interface PaymentConfirmedEmailProps {
  orderNumber:   string
  customerName:  string
  paidAt:        string
  items:         OrderItemData[]
  totals:        TotalsData
  deliveryMethod: string
  estimatedDays?: number | null
}

const deliveryLabels: Record<string, string> = {
  sedex:          'SEDEX',
  pac:            'PAC',
  local_delivery: 'Entrega Local',
  pickup:         'Retirada na Loja',
}

export function PaymentConfirmedEmail({
  orderNumber,
  customerName,
  paidAt,
  items,
  totals,
  deliveryMethod,
  estimatedDays,
}: PaymentConfirmedEmailProps) {
  const firstName = customerName.split(' ')[0]
  const date = new Date(paidAt).toLocaleString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <EmailLayout preview={`Pagamento confirmado! Pedido ${orderNumber} em preparação.`}>

      {/* ── Banner de sucesso ── */}
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ margin: '0 0 8px', fontSize: '56px', lineHeight: '1' }}>✅</Text>
        <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '28px', fontWeight: '900', color: brand.dark }}>
          Pagamento Confirmado!
        </Text>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '15px', color: brand.muted }}>
          Ótima escolha, <strong style={{ color: brand.dark }}>{firstName}</strong>! Seu pedido está sendo preparado.
        </Text>
      </Section>

      {/* ── Destaque: número do pedido + data pagamento ── */}
      <Section style={{ backgroundColor: '#F0FDF4', border: `2px solid ${brand.green}`, borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
        <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '12px', color: '#166534', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>
          Número do Pedido
        </Text>
        <Text style={{ margin: '0 0 8px', fontFamily: font.mono, fontSize: '28px', fontWeight: '900', color: brand.green }}>
          {orderNumber}
        </Text>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: '#166534' }}>
          Pago em {date}
        </Text>
      </Section>

      {/* ── Timeline de status ── */}
      <Section style={{ marginBottom: '32px' }}>
        {[
          { icon: '✅', label: 'Pagamento Confirmado',     active: true,  done: true  },
          { icon: '📦', label: 'Em Preparação',            active: true,  done: false },
          { icon: '🚚', label: 'Enviado (código a seguir)', active: false, done: false },
          { icon: '🏠', label: 'Entregue',                 active: false, done: false },
        ].map((step, i) => (
          <Row key={i} style={{ marginBottom: '8px', opacity: step.active ? 1 : 0.4 }}>
            <Column style={{ width: '40px' }}>
              <Text style={{ margin: 0, fontSize: '20px', textAlign: 'center' }}>{step.icon}</Text>
            </Column>
            <Column style={{ width: '12px', textAlign: 'center', position: 'relative' }}>
              <Text style={{
                margin: 0,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: step.done ? brand.green : (step.active ? brand.orange : brand.border),
                display: 'inline-block',
              }}>
                &nbsp;
              </Text>
            </Column>
            <Column style={{ paddingLeft: '12px' }}>
              <Text style={{
                margin: 0,
                fontFamily: font.base,
                fontSize: '14px',
                fontWeight: step.active ? '700' : '400',
                color: step.active ? brand.dark : brand.muted,
              }}>
                {step.label}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />

      {/* ── Items resumo ── */}
      <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Resumo do Pedido
      </Text>
      <OrderItemsTable items={items} />
      <OrderTotals data={totals} />

      {/* ── Entrega info ── */}
      <Section style={{ backgroundColor: '#F0F9FF', border: `1px solid #BAE6FD`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <Row>
          <Column style={{ width: '40px' }}>
            <Text style={{ margin: 0, fontSize: '24px' }}>🚚</Text>
          </Column>
          <Column>
            <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: '#0C4A6E' }}>
              {deliveryLabels[deliveryMethod] ?? deliveryMethod}
            </Text>
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: '#075985' }}>
              {estimatedDays
                ? `Prazo: ${estimatedDays} dia${estimatedDays > 1 ? 's' : ''} útei${estimatedDays > 1 ? 's' : 's'} a partir de hoje`
                : 'Prazo a confirmar após despacho'
              }
            </Text>
            <Text style={{ margin: '4px 0 0', fontFamily: font.base, fontSize: '12px', color: '#0284C7' }}>
              Você receberá o código de rastreio por e-mail assim que o pedido for despachado.
            </Text>
          </Column>
        </Row>
      </Section>

      <CtaButton href={`${APP_URL}/conta/pedidos`}>
        Ver Meu Pedido →
      </CtaButton>

      <Section style={{ textAlign: 'center', padding: '0 0 32px' }}>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
          Obrigado pela confiança!{' '}
          <strong style={{ color: brand.dark }}>Equipe Galvão&apos;s Store</strong>
        </Text>
      </Section>

    </EmailLayout>
  )
}

export default PaymentConfirmedEmail
