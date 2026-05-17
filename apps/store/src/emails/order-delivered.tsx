import { Section, Row, Column, Text, Link, Hr } from '@react-email/components'
import {
  EmailLayout,
  CtaButton,
  brand,
  font,
  fmt,
  APP_URL,
  type OrderItemData,
} from './_components/email-layout'

export interface OrderDeliveredEmailProps {
  orderNumber:  string
  customerName: string
  deliveredAt:  string
  items:        OrderItemData[]
}

export function OrderDeliveredEmail({
  orderNumber,
  customerName,
  deliveredAt,
  items,
}: OrderDeliveredEmailProps) {
  const firstName = customerName.split(' ')[0]
  const date = new Date(deliveredAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <EmailLayout preview={`Pedido ${orderNumber} entregue! Conta-nos o que achou 🌟`}>

      {/* ── Hero ── */}
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ margin: '0 0 8px', fontSize: '64px', lineHeight: '1' }}>🎉</Text>
        <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '28px', fontWeight: '900', color: brand.dark }}>
          Pedido Entregue!
        </Text>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '15px', color: brand.muted, lineHeight: '1.5' }}>
          <strong style={{ color: brand.dark }}>{firstName}</strong>, seu pedido foi entregue em <strong style={{ color: brand.dark }}>{date}</strong>.
          <br />Esperamos que você esteja amando os produtos! ⚽
        </Text>
      </Section>

      {/* ── Timeline completa ── */}
      <Section style={{ backgroundColor: '#F0FDF4', border: `1px solid #BBF7D0`, borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
        {[
          { icon: '✅', label: 'Pagamento Confirmado' },
          { icon: '📦', label: 'Pedido Preparado'    },
          { icon: '🚚', label: 'Enviado'              },
          { icon: '🏠', label: 'Entregue',             active: true },
        ].map((step, i) => (
          <Row key={i} style={{ marginBottom: i < 3 ? '8px' : '0' }}>
            <Column style={{ width: '40px' }}>
              <Text style={{ margin: 0, fontSize: '20px', textAlign: 'center' }}>{step.icon}</Text>
            </Column>
            <Column style={{ paddingLeft: '12px' }}>
              <Text style={{
                margin: 0,
                fontFamily: font.base,
                fontSize: '14px',
                fontWeight: (step as { active?: boolean }).active ? '900' : '600',
                color: (step as { active?: boolean }).active ? brand.green : '#166534',
              }}>
                {step.label}
                {(step as { active?: boolean }).active && (
                  <span style={{ marginLeft: '8px', color: brand.green }}>✓ Concluído</span>
                )}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* ── Itens recebidos ── */}
      <Text style={{ margin: '0 0 16px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Produtos Recebidos
      </Text>
      <Section style={{ marginBottom: '32px' }}>
        {items.map((item, i) => (
          <Row key={i} style={{
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: i < items.length - 1 ? `1px solid ${brand.border}` : 'none',
          }}>
            <Column style={{ width: '65%' }}>
              <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '14px', fontWeight: '700', color: brand.dark }}>{item.productName}</Text>
              <Text style={{ margin: 0, fontFamily: font.base, fontSize: '12px', color: brand.muted }}>
                {item.brandName} · Tam. {item.variantSize}{item.variantColor ? ` · ${item.variantColor}` : ''} · Qtd: {item.qty}
              </Text>
            </Column>
            <Column style={{ width: '35%' }} align="right">
              <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark }}>
                {fmt(item.totalInCents)}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Hr style={{ borderColor: brand.border, margin: '0 0 32px' }} />

      {/* ── CTA Avaliação ── */}
      <Section style={{
        background: `linear-gradient(135deg, ${brand.dark} 0%, #1a2233 100%)`,
        borderRadius: '16px',
        padding: '32px 24px',
        marginBottom: '32px',
        textAlign: 'center',
      }}>
        <Text style={{ margin: '0 0 4px', fontSize: '40px', lineHeight: '1' }}>⭐</Text>
        <Text style={{ margin: '8px 0', fontFamily: font.base, fontSize: '20px', fontWeight: '900', color: brand.light }}>
          O que você achou?
        </Text>
        <Text style={{ margin: '0 0 20px', fontFamily: font.base, fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5' }}>
          Sua opinião nos ajuda a melhorar e ajuda outros clientes a escolherem os melhores produtos.
          Leva menos de 1 minuto! 🙏
        </Text>
        <Link
          href={`${APP_URL}/conta/pedidos`}
          style={{
            display: 'inline-block',
            backgroundColor: brand.orange,
            color: brand.white,
            fontFamily: font.base,
            fontSize: '15px',
            fontWeight: '700',
            textDecoration: 'none',
            padding: '14px 32px',
            borderRadius: '8px',
          }}
        >
          Avaliar Meus Produtos →
        </Link>
      </Section>

      {/* ── Trocas e Devoluções ── */}
      <Section style={{ backgroundColor: '#FAFAFA', border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <Row>
          <Column style={{ width: '40px' }}>
            <Text style={{ margin: 0, fontSize: '24px' }}>🔄</Text>
          </Column>
          <Column>
            <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark }}>Precisa trocar ou devolver?</Text>
            <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '13px', color: brand.muted, lineHeight: '1.5' }}>
              Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução, conforme o Código de Defesa do Consumidor.
            </Text>
            <Link href={`${APP_URL}/politica-trocas`} style={{ color: brand.orange, fontFamily: font.base, fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
              Ver política de trocas →
            </Link>
          </Column>
        </Row>
      </Section>

      {/* ── Social proof / recompra ── */}
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '14px', color: brand.muted }}>
          Gostou? Veja mais produtos da Galvão&apos;s Store ⚽👟
        </Text>
        <CtaButton href={APP_URL}>
          Explorar Produtos →
        </CtaButton>
      </Section>

      <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />

      <Section style={{ textAlign: 'center', padding: '0 0 32px' }}>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '14px', color: brand.dark, fontWeight: '700' }}>
          Obrigado por comprar na Galvão&apos;s Store! 🧡
        </Text>
        <Text style={{ margin: '4px 0 0', fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
          Pedido <strong style={{ fontFamily: font.mono }}>{orderNumber}</strong>
        </Text>
      </Section>

    </EmailLayout>
  )
}

export default OrderDeliveredEmail
