import {
  Section,
  Row,
  Column,
  Text,
  Img,
  Link,
  Hr,
} from '@react-email/components'
import {
  EmailLayout,
  OrderItemsTable,
  OrderTotals,
  AddressBlock,
  CtaButton,
  StatusBadge,
  brand,
  font,
  APP_URL,
  type OrderItemData,
  type AddressData,
  type TotalsData,
} from './_components/email-layout'

export interface OrderCreatedEmailProps {
  orderNumber:      string
  customerName:     string
  createdAt:        string           // ISO string
  items:            OrderItemData[]
  totals:           TotalsData
  address:          AddressData
  deliveryMethod:   string
  estimatedDays?:   number | null
  paymentMethod:    'pix' | 'credit_card' | 'boleto'
  pixQrCode?:       string | null    // base64 PNG
  pixKey?:          string | null    // copia-e-cola
  pixExpiresAt?:    string | null
  boletoUrl?:       string | null
  boletoBarCode?:   string | null
  boletoExpiresAt?: string | null
}

const deliveryLabels: Record<string, string> = {
  sedex:          'SEDEX',
  pac:            'PAC',
  local_delivery: 'Entrega Local',
  pickup:         'Retirada na Loja',
}

export function OrderCreatedEmail({
  orderNumber,
  customerName,
  createdAt,
  items,
  totals,
  address,
  deliveryMethod,
  estimatedDays,
  paymentMethod,
  pixQrCode,
  pixKey,
  pixExpiresAt,
  boletoUrl,
  boletoBarCode,
  boletoExpiresAt,
}: OrderCreatedEmailProps) {
  const date = new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const firstName = customerName.split(' ')[0]

  return (
    <EmailLayout preview={`Pedido ${orderNumber} recebido — obrigado pela compra, ${firstName}!`}>

      {/* ── Greeting ── */}
      <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '26px', fontWeight: '900', color: brand.dark }}>
        Pedido recebido! 🎉
      </Text>
      <Text style={{ margin: '0 0 24px', fontFamily: font.base, fontSize: '15px', color: brand.muted, lineHeight: '1.5' }}>
        Oi, <strong style={{ color: brand.dark }}>{firstName}</strong>! Seu pedido foi registrado com sucesso e já está na nossa fila.
      </Text>

      {/* ── Order info bar ── */}
      <Section style={{ backgroundColor: '#FAFAFA', border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '11px', color: brand.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Pedido</Text>
            <Text style={{ margin: 0, fontFamily: font.mono, fontSize: '18px', fontWeight: '700', color: brand.orange }}>{orderNumber}</Text>
          </Column>
          <Column style={{ width: '30%' }}>
            <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '11px', color: brand.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>Data</Text>
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.dark }}>{date}</Text>
          </Column>
          <Column style={{ width: '20%' }} align="right">
            <StatusBadge status="pending_payment" />
          </Column>
        </Row>
      </Section>

      {/* ── Items ── */}
      <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Itens do Pedido
      </Text>
      <OrderItemsTable items={items} />
      <OrderTotals data={totals} />

      {/* ── Payment section ── */}
      {paymentMethod === 'pix' && (
        <Section style={{ backgroundColor: '#F0FDF4', border: `2px solid ${brand.green}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '18px', fontWeight: '900', color: brand.green }}>
            Pague via PIX e economize 5%
          </Text>
          <Text style={{ margin: '0 0 16px', fontFamily: font.base, fontSize: '13px', color: '#166534', lineHeight: '1.5' }}>
            O desconto já está aplicado no total acima. Seu pedido será processado em menos de 1 minuto após a confirmação do PIX.
          </Text>

          {pixQrCode && (
            <Row style={{ marginBottom: '16px' }}>
              <Column align="center">
                <Img
                  src={`data:image/png;base64,${pixQrCode}`}
                  alt="QR Code PIX"
                  width={180}
                  height={180}
                  style={{ display: 'block', margin: '0 auto', border: `4px solid ${brand.white}`, borderRadius: '8px' }}
                />
              </Column>
            </Row>
          )}

          {pixKey && (
            <Section style={{ backgroundColor: brand.white, border: `1px solid #BBF7D0`, borderRadius: '8px', padding: '12px 16px', marginBottom: '12px' }}>
              <Text style={{ margin: '0 0 6px', fontFamily: font.base, fontSize: '11px', color: '#166534', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>
                PIX Copia e Cola
              </Text>
              <Text
                style={{
                  margin: 0,
                  fontFamily: font.mono,
                  fontSize: '11px',
                  color: brand.dark,
                  wordBreak: 'break-all',
                  lineHeight: '1.6',
                  backgroundColor: '#F0FDF4',
                  padding: '8px',
                  borderRadius: '4px',
                }}
              >
                {pixKey}
              </Text>
            </Section>
          )}

          {pixExpiresAt && (
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '12px', color: '#166534' }}>
              ⏰ Expira em: <strong>{new Date(pixExpiresAt).toLocaleString('pt-BR')}</strong>
            </Text>
          )}
        </Section>
      )}

      {paymentMethod === 'boleto' && (
        <Section style={{ backgroundColor: '#FFF7ED', border: `2px solid ${brand.yellow}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '18px', fontWeight: '900', color: '#92400E' }}>
            Boleto Bancário
          </Text>
          <Text style={{ margin: '0 0 16px', fontFamily: font.base, fontSize: '13px', color: '#78350F', lineHeight: '1.5' }}>
            O boleto pode levar até 3 dias úteis para compensar. Após o pagamento, seu pedido será confirmado automaticamente.
          </Text>

          {boletoBarCode && (
            <Section style={{ backgroundColor: brand.white, border: `1px solid #FDE68A`, borderRadius: '8px', padding: '12px 16px', marginBottom: '12px' }}>
              <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '11px', color: '#92400E', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>
                Código de Barras
              </Text>
              <Text style={{ margin: 0, fontFamily: font.mono, fontSize: '12px', color: brand.dark, wordBreak: 'break-all' }}>
                {boletoBarCode}
              </Text>
            </Section>
          )}

          {boletoUrl && (
            <Link href={boletoUrl} style={{ display: 'inline-block', backgroundColor: '#92400E', color: brand.white, fontFamily: font.base, fontSize: '14px', fontWeight: '700', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' }}>
              Abrir Boleto
            </Link>
          )}

          {boletoExpiresAt && (
            <Text style={{ margin: '12px 0 0', fontFamily: font.base, fontSize: '12px', color: '#78350F' }}>
              ⏰ Vencimento: <strong>{new Date(boletoExpiresAt).toLocaleDateString('pt-BR')}</strong>
            </Text>
          )}
        </Section>
      )}

      {paymentMethod === 'credit_card' && (
        <Section style={{ backgroundColor: '#EFF6FF', border: `2px solid #93C5FD`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '18px', fontWeight: '900', color: '#1E40AF' }}>
            Cartão de Crédito
          </Text>
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: '#1E3A8A', lineHeight: '1.5' }}>
            Seu pagamento está sendo processado. Você receberá um e-mail de confirmação assim que for aprovado.
          </Text>
        </Section>
      )}

      {/* ── Delivery ── */}
      <AddressBlock address={address} />

      <Section style={{ backgroundColor: '#FAFAFA', border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <Row>
          <Column style={{ width: '10%' }}>
            <Text style={{ margin: 0, fontSize: '24px' }}>🚚</Text>
          </Column>
          <Column style={{ width: '90%' }}>
            <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark }}>
              {deliveryLabels[deliveryMethod] ?? deliveryMethod}
            </Text>
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
              {estimatedDays
                ? `Prazo estimado: ${estimatedDays} dia${estimatedDays > 1 ? 's' : ''} útei${estimatedDays > 1 ? 's' : 's'} após confirmação`
                : 'Prazo informado após confirmação do pagamento'
              }
            </Text>
          </Column>
        </Row>
      </Section>

      {/* ── Next steps ── */}
      <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />
      <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Próximos Passos
      </Text>
      <Section style={{ marginBottom: '32px' }}>
        {[
          { icon: '💳', title: 'Confirmação do Pagamento', desc: 'Após o pagamento ser identificado, seu pedido entra em preparação.' },
          { icon: '📦', title: 'Preparação', desc: 'Separamos e embalamos seus produtos com cuidado.' },
          { icon: '🚚', title: 'Envio', desc: 'Você receberá o código de rastreio por e-mail.' },
          { icon: '🎉', title: 'Entrega', desc: 'Produto chegando na sua porta!' },
        ].map((step, i) => (
          <Row key={i} style={{ marginBottom: '12px' }}>
            <Column style={{ width: '40px', verticalAlign: 'top' }}>
              <Text style={{ margin: 0, fontSize: '20px' }}>{step.icon}</Text>
            </Column>
            <Column>
              <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark }}>{step.title}</Text>
              <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>{step.desc}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      <CtaButton href={`${APP_URL}/conta/pedidos`}>
        Acompanhar Meu Pedido →
      </CtaButton>

      {/* ── Support ── */}
      <Section style={{ textAlign: 'center', padding: '0 0 32px' }}>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
          Dúvidas? Fale com a gente no{' '}
          <Link href="https://wa.me/55" style={{ color: brand.orange, textDecoration: 'none', fontWeight: '700' }}>WhatsApp</Link>
          {' '}ou responda este e-mail.
        </Text>
      </Section>

    </EmailLayout>
  )
}

export default OrderCreatedEmail
