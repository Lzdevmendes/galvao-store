import { Section, Text, Row, Column, Hr } from '@react-email/components'
import {
  EmailLayout,
  CtaButton,
  brand,
  font,
  APP_URL,
} from './_components/email-layout'

export interface WelcomeClubEmailProps {
  customerName: string
  couponCode?:  string | null
  couponValue?: number | null  // em centavos
}

export function WelcomeClubEmail({
  customerName,
  couponCode,
  couponValue,
}: WelcomeClubEmailProps) {
  const firstName = customerName.split(' ')[0]

  const perks = [
    { icon: '⚡', title: 'Acesso Antecipado', desc: 'Lançamentos exclusivos antes de todo mundo' },
    { icon: '🏷️', title: 'Descontos VIP',    desc: 'Ofertas especiais só para membros do clube' },
    { icon: '🚚', title: 'Frete Prioritário', desc: 'Seus pedidos são preparados primeiro' },
    { icon: '🎂', title: 'Presente de Aniversário', desc: 'Cupom especial no seu aniversário' },
    { icon: '🌟', title: 'Suporte Dedicado',  desc: 'Atendimento prioritário via WhatsApp' },
  ]

  return (
    <EmailLayout preview={`Bem-vindo ao Clube Galvão's, ${firstName}! Seus benefícios exclusivos te esperam.`}>

      {/* Hero */}
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '40px', lineHeight: '1' }}>
          ⭐
        </Text>
        <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '28px', fontWeight: '900', color: brand.dark, letterSpacing: '0.5px' }}>
          Bem-vindo ao Clube!
        </Text>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '16px', color: brand.muted, lineHeight: '1.5' }}>
          Oi, <strong style={{ color: brand.dark }}>{firstName}</strong>! Você agora é membro<br />
          do <strong style={{ color: brand.orange }}>Clube Galvão's Store</strong> — alta performance no próximo nível.
        </Text>
      </Section>

      {/* Coupon highlight */}
      {couponCode && (
        <Section style={{ backgroundColor: '#F0FDF4', border: `2px solid ${brand.green}`, borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
          <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: '#166534', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Presente de Boas-Vindas
          </Text>
          <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '14px', color: '#166534' }}>
            Use o cupom abaixo na sua próxima compra{couponValue ? ` e ganhe ${(couponValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de desconto` : ''}:
          </Text>
          <Section style={{ backgroundColor: brand.white, borderRadius: '8px', padding: '12px 24px', display: 'inline-block' }}>
            <Text style={{ margin: 0, fontFamily: 'monospace', fontSize: '24px', fontWeight: '900', color: brand.orange, letterSpacing: '4px' }}>
              {couponCode}
            </Text>
          </Section>
        </Section>
      )}

      {/* Perks */}
      <Text style={{ margin: '0 0 16px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Seus Benefícios Exclusivos
      </Text>

      {perks.map((p, i) => (
        <Row key={i} style={{ marginBottom: '16px' }}>
          <Column style={{ width: '48px', verticalAlign: 'top' }}>
            <Section style={{ backgroundColor: '#FFF7ED', borderRadius: '8px', width: '36px', height: '36px', textAlign: 'center' }}>
              <Text style={{ margin: 0, fontSize: '18px', lineHeight: '36px' }}>{p.icon}</Text>
            </Section>
          </Column>
          <Column>
            <Text style={{ margin: '0 0 2px', fontFamily: font.base, fontSize: '14px', fontWeight: '700', color: brand.dark }}>{p.title}</Text>
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>{p.desc}</Text>
          </Column>
        </Row>
      ))}

      <Hr style={{ borderColor: brand.border, margin: '24px 0' }} />

      <CtaButton href={`${APP_URL}/produtos`}>
        Explorar o Catálogo →
      </CtaButton>

      <Section style={{ textAlign: 'center', padding: '0 0 32px' }}>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
          Obrigado por fazer parte do time. Joguem bonito! ⚽
        </Text>
      </Section>

    </EmailLayout>
  )
}

export default WelcomeClubEmail
