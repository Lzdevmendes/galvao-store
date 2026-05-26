import { Section, Text, Hr } from '@react-email/components'
import {
  EmailLayout,
  OrderItemsTable,
  CtaButton,
  brand,
  font,
  APP_URL,
  type OrderItemData,
} from './_components/email-layout'

export interface OrderCancelledEmailProps {
  orderNumber:    string
  customerName:   string
  cancelledAt:    string
  reason?:        string | null
  items:          OrderItemData[]
  totalInCents?:  number
  paymentMethod:  'pix' | 'credit_card' | 'boleto'
  refundExpected?: boolean
}

export function OrderCancelledEmail({
  orderNumber,
  customerName,
  cancelledAt,
  reason,
  items,
  paymentMethod,
  refundExpected = false,
}: OrderCancelledEmailProps) {
  const firstName = customerName.split(' ')[0]
  const date = new Date(cancelledAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const refundInfo: Record<string, string> = {
    pix:         'O reembolso via PIX será processado em até 3 dias úteis na conta de origem.',
    credit_card: 'O estorno no cartão será processado pela operadora em até 2 faturas.',
    boleto:      'Para boleto, entre em contato pelo WhatsApp para informar seus dados bancários.',
  }

  return (
    <EmailLayout preview={`Pedido ${orderNumber} cancelado — ${firstName}, veja os detalhes`}>

      <Section style={{ backgroundColor: '#FEF2F2', border: `2px solid ${brand.red}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '24px', fontWeight: '900', color: brand.red }}>
          Pedido Cancelado
        </Text>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '14px', color: '#7F1D1D', lineHeight: '1.5' }}>
          Oi, <strong>{firstName}</strong>. Infelizmente seu pedido <strong style={{ fontFamily: 'monospace' }}>{orderNumber}</strong> foi cancelado em {date}.
        </Text>
      </Section>

      {reason && (
        <Section style={{ backgroundColor: '#FAFAFA', border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '11px', fontWeight: '700', color: brand.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Motivo
          </Text>
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '14px', color: brand.dark }}>
            {reason}
          </Text>
        </Section>
      )}

      <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Itens do Pedido
      </Text>
      <OrderItemsTable items={items} />

      {refundExpected && (
        <Section style={{ backgroundColor: '#FFFBEB', border: `1px solid #FCD34D`, borderRadius: '8px', padding: '16px', margin: '0 0 24px' }}>
          <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: '#92400E' }}>
            Reembolso
          </Text>
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: '#78350F', lineHeight: '1.5' }}>
            {refundInfo[paymentMethod]}
          </Text>
        </Section>
      )}

      <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />

      <Text style={{ margin: '0 0 24px', fontFamily: font.base, fontSize: '14px', color: brand.muted, lineHeight: '1.6', textAlign: 'center' }}>
        Ficou com dúvidas? Nossa equipe está pronta para ajudar.
      </Text>

      <CtaButton href={`${APP_URL}/contato`}>
        Falar com o Suporte →
      </CtaButton>

      <Section style={{ textAlign: 'center', padding: '0 0 32px' }}>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
          Ou continue explorando nosso catálogo — temos muito mais para você.
        </Text>
      </Section>

      <CtaButton href={`${APP_URL}/produtos`}>
        Ver Produtos →
      </CtaButton>

    </EmailLayout>
  )
}

export default OrderCancelledEmail
