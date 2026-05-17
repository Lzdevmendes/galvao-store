import { Section, Row, Column, Text, Link, Hr } from '@react-email/components'
import {
  EmailLayout,
  brand,
  font,
  APP_URL,
} from './_components/email-layout'

export interface PasswordResetEmailProps {
  userName?:   string
  resetUrl:    string
  expiresInHours?: number
}

export function PasswordResetEmail({
  userName,
  resetUrl,
  expiresInHours = 2,
}: PasswordResetEmailProps) {
  const firstName = userName?.split(' ')[0] ?? 'cliente'

  return (
    <EmailLayout preview="Redefinição de senha — Galvão's Store. Link válido por 2 horas.">

      {/* ── Header visual ── */}
      <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ margin: '0 0 8px', fontSize: '56px', lineHeight: '1' }}>🔐</Text>
        <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '26px', fontWeight: '900', color: brand.dark }}>
          Redefinir Senha
        </Text>
        <Text style={{ margin: 0, fontFamily: font.base, fontSize: '15px', color: brand.muted, lineHeight: '1.5' }}>
          Oi, <strong style={{ color: brand.dark }}>{firstName}</strong>! Recebemos uma solicitação de redefinição de senha para a sua conta na Galvão&apos;s Store.
        </Text>
      </Section>

      {/* ── CTA principal ── */}
      <Section style={{ backgroundColor: '#FAFAFA', border: `1px solid ${brand.border}`, borderRadius: '12px', padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
        <Text style={{ margin: '0 0 16px', fontFamily: font.base, fontSize: '14px', color: brand.muted, lineHeight: '1.5' }}>
          Clique no botão abaixo para criar uma nova senha.
          Este link é válido por <strong style={{ color: brand.dark }}>{expiresInHours} hora{expiresInHours > 1 ? 's' : ''}</strong>.
        </Text>

        <Link
          href={resetUrl}
          style={{
            display: 'inline-block',
            backgroundColor: brand.orange,
            color: brand.white,
            fontFamily: font.base,
            fontSize: '16px',
            fontWeight: '700',
            textDecoration: 'none',
            padding: '16px 40px',
            borderRadius: '8px',
            letterSpacing: '0.3px',
          }}
        >
          Redefinir Minha Senha
        </Link>

        <Text style={{ margin: '20px 0 0', fontFamily: font.base, fontSize: '12px', color: brand.muted }}>
          Se o botão não funcionar, copie e cole este link no seu navegador:
        </Text>
        <Text style={{
          margin: '8px 0 0',
          fontFamily: font.mono,
          fontSize: '11px',
          color: brand.muted,
          wordBreak: 'break-all',
          backgroundColor: '#F1F3F5',
          padding: '10px 12px',
          borderRadius: '6px',
        }}>
          {resetUrl}
        </Text>
      </Section>

      {/* ── Expiração ── */}
      <Section style={{ backgroundColor: '#FFF7ED', border: `1px solid #FED7AA`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <Row>
          <Column style={{ width: '40px' }}>
            <Text style={{ margin: 0, fontSize: '22px' }}>⏰</Text>
          </Column>
          <Column>
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: '#92400E', lineHeight: '1.5' }}>
              Este link expira em <strong>{expiresInHours} hora{expiresInHours > 1 ? 's' : ''}</strong>. Se precisar de um novo link, solicite outra redefinição na página de login.
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr style={{ borderColor: brand.border, margin: '0 0 24px' }} />

      {/* ── Aviso de segurança ── */}
      <Section style={{ backgroundColor: '#FEF2F2', border: `1px solid #FECACA`, borderRadius: '8px', padding: '16px', marginBottom: '32px' }}>
        <Row>
          <Column style={{ width: '40px' }}>
            <Text style={{ margin: 0, fontSize: '22px' }}>🛡️</Text>
          </Column>
          <Column>
            <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: '#991B1B' }}>
              Não foi você?
            </Text>
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: '#7F1D1D', lineHeight: '1.5' }}>
              Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanece a mesma e nenhuma alteração foi feita na sua conta. Se suspeitar de acesso não autorizado, entre em contato imediatamente.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* ── Dicas de segurança ── */}
      <Section style={{ marginBottom: '32px' }}>
        <Text style={{ margin: '0 0 12px', fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Dicas para uma senha segura
        </Text>
        {[
          { icon: '✓', tip: 'Use pelo menos 8 caracteres' },
          { icon: '✓', tip: 'Misture letras maiúsculas, minúsculas, números e símbolos' },
          { icon: '✓', tip: 'Evite informações pessoais como datas e nomes' },
          { icon: '✓', tip: 'Não reutilize senhas de outros serviços' },
        ].map((item, i) => (
          <Row key={i} style={{ marginBottom: '6px' }}>
            <Column style={{ width: '24px' }}>
              <Text style={{ margin: 0, fontFamily: font.base, fontSize: '14px', color: brand.green, fontWeight: '700' }}>{item.icon}</Text>
            </Column>
            <Column>
              <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>{item.tip}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Section style={{ textAlign: 'center', padding: '0 0 32px' }}>
        <Text style={{ margin: '0 0 8px', fontFamily: font.base, fontSize: '13px', color: brand.muted }}>
          Precisa de ajuda? Fale com a gente.
        </Text>
        <Link href={`${APP_URL}/contato`} style={{ color: brand.orange, fontFamily: font.base, fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
          Central de Atendimento →
        </Link>
      </Section>

    </EmailLayout>
  )
}

export default PasswordResetEmail
