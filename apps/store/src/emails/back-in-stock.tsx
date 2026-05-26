import { Section, Text, Img } from '@react-email/components'
import {
  EmailLayout,
  CtaButton,
  brand,
  font,
  APP_URL,
} from './_components/email-layout'

export interface BackInStockEmailProps {
  customerEmail: string
  productName:   string
  brandName:     string
  variantSize:   string
  productSlug:   string
  imageUrl?:     string | null
  priceInCents:  number
  pricePromoInCents?: number | null
}

export function BackInStockEmail({
  productName,
  brandName,
  variantSize,
  productSlug,
  imageUrl,
  priceInCents,
  pricePromoInCents,
}: BackInStockEmailProps) {
  const productUrl = `${APP_URL}/produto/${productSlug}`
  const price = pricePromoInCents != null && pricePromoInCents < priceInCents
    ? pricePromoInCents
    : priceInCents
  const hasPromo = pricePromoInCents != null && pricePromoInCents < priceInCents
  const fmt = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <EmailLayout preview={`${productName} (Tam. ${variantSize}) voltou ao estoque — corra antes que acabe!`}>

      {/* Alert bar */}
      <Section style={{ backgroundColor: '#F0FDF4', border: `2px solid ${brand.green}`, borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', textAlign: 'center' }}>
        <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '28px' }}>🎉</Text>
        <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '20px', fontWeight: '900', color: brand.green }}>
          Voltou ao estoque!
        </Text>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '14px', color: '#166534' }}>
          O produto que você estava aguardando está disponível novamente.
        </Text>
      </Section>

      {/* Product card */}
      <Section style={{ backgroundColor: '#FAFAFA', border: `1px solid ${brand.border}`, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        {imageUrl && (
          <Section style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Img
              src={imageUrl}
              alt={productName}
              width={160}
              height={160}
              style={{ borderRadius: '8px', objectFit: 'cover', display: 'block', margin: '0 auto', border: `1px solid ${brand.border}` }}
            />
          </Section>
        )}

        <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '11px', fontWeight: '700', color: brand.orange, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          {brandName}
        </Text>
        <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '18px', fontWeight: '900', color: brand.dark }}>
          {productName}
        </Text>
        <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '14px', color: brand.muted }}>
          Tamanho: <strong style={{ color: brand.dark }}>{variantSize}</strong>
        </Text>

        <Section>
          {hasPromo && (
            <Text style={{ margin: '0', fontFamily: font.base, fontSize: '13px', color: brand.muted, textDecoration: 'line-through' }}>
              De {fmt(priceInCents)}
            </Text>
          )}
          <Text style={{ margin: '0', fontFamily: font.base, fontSize: '24px', fontWeight: '900', color: brand.green }}>
            {hasPromo ? `Por ${fmt(price)}` : fmt(price)}
          </Text>
        </Section>
      </Section>

      {/* Urgency */}
      <Section style={{ backgroundColor: '#FFF7ED', border: `1px solid #FED7AA`, borderRadius: '8px', padding: '14px 16px', marginBottom: '24px' }}>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: '#92400E' }}>
          ⚡ <strong>Aja rápido!</strong> Produtos que voltam ao estoque costumam vender rápido. Não perca de novo!
        </Text>
      </Section>

      <CtaButton href={productUrl}>
        Comprar Agora →
      </CtaButton>

      <Section style={{ textAlign: 'center', padding: '0 0 32px' }}>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '12px', color: brand.muted }}>
          Você recebeu este e-mail porque se cadastrou para ser avisado.<br />
          Se não quer mais receber alertas de estoque,{' '}
          <span style={{ color: brand.orange }}>acesse sua conta</span>.
        </Text>
      </Section>

    </EmailLayout>
  )
}

export default BackInStockEmail
