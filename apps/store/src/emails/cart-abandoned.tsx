import { Section, Text, Row, Column, Img, Hr } from '@react-email/components'
import {
  EmailLayout,
  CtaButton,
  brand,
  font,
  fmt,
} from './_components/email-layout'

export interface CartAbandonedItem {
  productName:  string
  brandName:    string
  variantSize:  string
  imageUrl?:    string | null
  priceInCents: number
  pricePromoInCents?: number | null
}

export interface CartAbandonedEmailProps {
  customerName: string
  cartUrl:      string
  items:        CartAbandonedItem[]
  // 1h, 24h ou 72h — controla o texto e o cupom
  variant:      '1h' | '24h' | '72h'
  couponCode?:  string | null
  couponValue?: number | null  // em centavos (5% → 500 para pedido de 10000)
}

const variantCopy = {
  '1h': {
    preview: 'Esqueceu alguma coisa? Seu carrinho ainda está esperando por você!',
    headline: 'Seu carrinho está esperando!',
    body: 'Você deixou alguns produtos incríveis para trás. Ainda estão disponíveis — mas o estoque pode acabar a qualquer momento.',
    urgency: null,
  },
  '24h': {
    preview: 'Seus produtos ainda estão no carrinho — não deixe escapar!',
    headline: 'Seus produtos estão reservados',
    body: 'Você visitou nossa loja e adicionou produtos ao carrinho, mas não finalizou. Estamos guardando para você — mas não por muito tempo.',
    urgency: 'Os produtos mais vendidos costumam esgotar rápido. Finalize antes que alguém compre no seu lugar.',
  },
  '72h': {
    preview: 'Última chance! Seu carrinho está quase expirando.',
    headline: 'Última chamada ⏰',
    body: 'Esta é nossa última mensagem sobre seu carrinho. Os produtos abaixo ainda estão disponíveis, mas não por muito tempo.',
    urgency: 'Se não comprar em breve, liberaremos o estoque para outros clientes.',
  },
}

export function CartAbandonedEmail({
  customerName,
  cartUrl,
  items,
  variant,
  couponCode,
  couponValue,
}: CartAbandonedEmailProps) {
  const firstName = customerName.split(' ')[0]
  const copy = variantCopy[variant]

  return (
    <EmailLayout preview={copy.preview}>

      {/* Headline */}
      <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '26px', fontWeight: '900', color: brand.dark }}>
        {copy.headline}
      </Text>
      <Text style={{ margin: '0 0 24px', fontFamily: font.base, fontSize: '15px', color: brand.muted, lineHeight: '1.6' }}>
        Oi, <strong style={{ color: brand.dark }}>{firstName}</strong>! {copy.body}
      </Text>

      {/* Cart items */}
      <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '11px', fontWeight: '700', color: brand.muted, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        Itens no seu Carrinho
      </Text>

      {items.map((item, i) => {
        const price = item.pricePromoInCents != null && item.pricePromoInCents < item.priceInCents
          ? item.pricePromoInCents
          : item.priceInCents
        const hasDiscount = item.pricePromoInCents != null && item.pricePromoInCents < item.priceInCents

        return (
          <Row key={i} style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#FAFAFA', borderRadius: '8px', border: `1px solid ${brand.border}` }}>
            <Column style={{ width: '56px', verticalAlign: 'top', paddingRight: '12px' }}>
              {item.imageUrl
                ? <Img src={item.imageUrl} alt={item.productName} width={44} height={44} style={{ borderRadius: '6px', objectFit: 'cover' }} />
                : <Section style={{ width: '44px', height: '44px', backgroundColor: brand.border, borderRadius: '6px' }} />
              }
            </Column>
            <Column>
              <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark }}>{item.productName}</Text>
              <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '12px', color: brand.muted }}>{item.brandName} · Tam. {item.variantSize}</Text>
              <Row>
                <Column>
                  <Text style={{ margin: 0, fontFamily: font.base, fontSize: '14px', fontWeight: '700', color: brand.green }}>{fmt(price)}</Text>
                </Column>
                {hasDiscount && (
                  <Column>
                    <Text style={{ margin: 0, fontFamily: font.base, fontSize: '12px', color: brand.muted, textDecoration: 'line-through' }}>{fmt(item.priceInCents)}</Text>
                  </Column>
                )}
              </Row>
            </Column>
          </Row>
        )
      })}

      {/* Urgency message */}
      {copy.urgency && (
        <Section style={{ backgroundColor: '#FFF7ED', border: `1px solid #FED7AA`, borderRadius: '8px', padding: '14px 16px', margin: '8px 0 24px' }}>
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: '#92400E' }}>
            ⚠️ {copy.urgency}
          </Text>
        </Section>
      )}

      {/* Coupon */}
      {couponCode && (
        <Section style={{ backgroundColor: '#F0FDF4', border: `2px solid ${brand.green}`, borderRadius: '12px', padding: '20px 24px', margin: '0 0 24px', textAlign: 'center' }}>
          <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: '#166534', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Cupom Especial para Você
          </Text>
          <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '14px', color: '#166534' }}>
            {couponValue ? `Ganhe ${fmt(couponValue)} de desconto finalizando agora:` : 'Use e economize na sua compra:'}
          </Text>
          <Section style={{ backgroundColor: brand.white, borderRadius: '8px', padding: '10px 20px', display: 'inline-block' }}>
            <Text style={{ margin: 0, fontFamily: 'monospace', fontSize: '22px', fontWeight: '900', color: brand.orange, letterSpacing: '3px' }}>
              {couponCode}
            </Text>
          </Section>
        </Section>
      )}

      <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />

      <CtaButton href={cartUrl}>
        Finalizar Compra Agora →
      </CtaButton>

      <Section style={{ textAlign: 'center', padding: '0 0 32px' }}>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
          Pagamento seguro · Frete Correios · Troca em 30 dias
        </Text>
      </Section>

    </EmailLayout>
  )
}

export default CartAbandonedEmail
