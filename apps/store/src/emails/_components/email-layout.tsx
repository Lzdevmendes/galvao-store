import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components'

// ── Brand tokens ───────────────────────────────────────────
export const brand = {
  orange:   '#F26B1F',
  teal:     '#1FB5A8',
  green:    '#2CB35A',
  red:      '#E23B3B',
  yellow:   '#FFC83A',
  dark:     '#0B0E12',
  light:    '#F8F9FB',
  white:    '#FFFFFF',
  border:   '#E5E7EB',
  muted:    '#6B7280',
  bodyBg:   '#F1F3F5',
}

export const font = {
  base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "Courier New", monospace',
}

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://galvaosstore.com.br'
export const LOGO_URL = `${APP_URL}/logo.jpg`

// ── fmt helper (edge-safe, no Intl dependency issues) ─────
export const fmt = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ── Shared Header ─────────────────────────────────────────
export function EmailHeader() {
  return (
    <Section style={{ backgroundColor: brand.dark, padding: '24px 0' }}>
      <Row>
        <Column align="center">
          <Img
            src={LOGO_URL}
            alt="Galvão's Store"
            width={80}
            height={80}
            style={{ borderRadius: '50%', display: 'block', margin: '0 auto' }}
          />
          <Text
            style={{
              margin: '8px 0 0',
              textAlign: 'center',
              fontFamily: font.base,
              fontSize: '22px',
              fontWeight: '900',
              letterSpacing: '0.5px',
              color: brand.light,
            }}
          >
            GALVÃO&apos;S STORE
          </Text>
          <Text
            style={{
              margin: '2px 0 0',
              textAlign: 'center',
              fontFamily: font.base,
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '3px',
              color: brand.orange,
              textTransform: 'uppercase',
            }}
          >
            Artigos Esportivos
          </Text>
        </Column>
      </Row>
    </Section>
  )
}

// ── Shared Footer ─────────────────────────────────────────
export function EmailFooter() {
  return (
    <>
      <Hr style={{ borderColor: brand.border, margin: '0' }} />
      <Section style={{ backgroundColor: brand.dark, padding: '32px 24px' }}>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: font.base,
            fontSize: '13px',
            color: brand.muted,
            margin: '0 0 12px',
          }}
        >
          Galvão&apos;s Store — Caraguatatuba / SP
        </Text>
        <Row style={{ textAlign: 'center', margin: '0 0 16px' }}>
          <Column>
            <Link href={`${APP_URL}`} style={{ color: brand.orange, fontFamily: font.base, fontSize: '12px', textDecoration: 'none', margin: '0 8px' }}>Loja</Link>
            <Link href={`${APP_URL}/conta/pedidos`} style={{ color: brand.orange, fontFamily: font.base, fontSize: '12px', textDecoration: 'none', margin: '0 8px' }}>Meus Pedidos</Link>
            <Link href={`${APP_URL}/politica-trocas`} style={{ color: brand.orange, fontFamily: font.base, fontSize: '12px', textDecoration: 'none', margin: '0 8px' }}>Trocas e Devoluções</Link>
            <Link href={`${APP_URL}/contato`} style={{ color: brand.orange, fontFamily: font.base, fontSize: '12px', textDecoration: 'none', margin: '0 8px' }}>Suporte</Link>
          </Column>
        </Row>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: font.base,
            fontSize: '11px',
            color: '#4B5563',
            margin: '0',
          }}
        >
          © {new Date().getFullYear()} Galvão&apos;s Store. Todos os direitos reservados.
        </Text>
      </Section>
    </>
  )
}

// ── Orange divider line ───────────────────────────────────
export function OrangeLine() {
  return (
    <Section style={{ backgroundColor: brand.orange, height: '4px', padding: 0 }}>
      <Text style={{ margin: 0, fontSize: 0, lineHeight: 0 }}>&nbsp;</Text>
    </Section>
  )
}

// ── Status badge ─────────────────────────────────────────
const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  pending_payment: { bg: '#FFF7ED', text: brand.orange, label: 'Aguardando Pagamento' },
  paid:            { bg: '#F0FDF4', text: brand.green,  label: 'Pago' },
  processing:      { bg: '#EFF6FF', text: '#3B82F6',    label: 'Em Processamento' },
  shipped:         { bg: '#F0FDF4', text: brand.teal,   label: 'Enviado' },
  delivered:       { bg: '#F0FDF4', text: brand.green,  label: 'Entregue' },
  cancelled:       { bg: '#FEF2F2', text: brand.red,    label: 'Cancelado' },
  refunded:        { bg: '#FEF2F2', text: brand.red,    label: 'Reembolsado' },
}

export function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? { bg: brand.light, text: brand.dark, label: status }
  return (
    <Text
      style={{
        display: 'inline-block',
        backgroundColor: s.bg,
        color: s.text,
        fontFamily: font.base,
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 12px',
        borderRadius: '999px',
        margin: '0',
        letterSpacing: '0.3px',
      }}
    >
      {s.label}
    </Text>
  )
}

// ── Order items table ─────────────────────────────────────
export interface OrderItemData {
  productName: string
  brandName:   string
  variantSize: string
  variantColor?: string | null
  imageUrl?:   string | null
  qty:         number
  unitInCents: number
  totalInCents:number
}

export function OrderItemsTable({ items }: { items: OrderItemData[] }) {
  return (
    <Section style={{ margin: '0 0 8px' }}>
      {/* Table header */}
      <Row style={{ backgroundColor: brand.dark, borderRadius: '8px 8px 0 0', padding: '10px 16px' }}>
        <Column style={{ width: '50%' }}>
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '11px', fontWeight: '700', color: brand.light, letterSpacing: '1px', textTransform: 'uppercase' }}>Produto</Text>
        </Column>
        <Column style={{ width: '20%' }} align="center">
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '11px', fontWeight: '700', color: brand.light, letterSpacing: '1px', textTransform: 'uppercase' }}>Qtd</Text>
        </Column>
        <Column style={{ width: '30%' }} align="right">
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '11px', fontWeight: '700', color: brand.light, letterSpacing: '1px', textTransform: 'uppercase' }}>Valor</Text>
        </Column>
      </Row>

      {/* Items */}
      {items.map((item, i) => (
        <Row
          key={i}
          style={{
            backgroundColor: i % 2 === 0 ? brand.white : '#FAFAFA',
            padding: '12px 16px',
            borderLeft: `1px solid ${brand.border}`,
            borderRight: `1px solid ${brand.border}`,
            borderBottom: `1px solid ${brand.border}`,
          }}
        >
          <Column style={{ width: '50%', paddingRight: '8px' }}>
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark }}>{item.productName}</Text>
            <Text style={{ margin: '2px 0 0', fontFamily: font.base, fontSize: '11px', color: brand.muted }}>
              {item.brandName} · Tam. {item.variantSize}{item.variantColor ? ` · ${item.variantColor}` : ''}
            </Text>
          </Column>
          <Column style={{ width: '20%' }} align="center">
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.dark }}>×{item.qty}</Text>
          </Column>
          <Column style={{ width: '30%' }} align="right">
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', fontWeight: '700', color: brand.dark }}>{fmt(item.totalInCents)}</Text>
            {item.qty > 1 && (
              <Text style={{ margin: '2px 0 0', fontFamily: font.base, fontSize: '11px', color: brand.muted }}>{fmt(item.unitInCents)} cada</Text>
            )}
          </Column>
        </Row>
      ))}
    </Section>
  )
}

// ── Totals block ──────────────────────────────────────────
export interface TotalsData {
  subtotalInCents:  number
  discountInCents:  number
  shippingInCents:  number
  totalInCents:     number
  couponCode?:      string | null
  paymentMethod:    string
}

export function OrderTotals({ data }: { data: TotalsData }) {
  const methodLabels: Record<string, string> = {
    pix:         'PIX (5% de desconto)',
    credit_card: 'Cartão de Crédito',
    boleto:      'Boleto Bancário',
  }

  return (
    <Section style={{ backgroundColor: '#FAFAFA', borderRadius: '0 0 8px 8px', border: `1px solid ${brand.border}`, borderTop: 'none', padding: '12px 16px', marginBottom: '24px' }}>
      <Row style={{ marginBottom: '4px' }}>
        <Column><Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>Subtotal</Text></Column>
        <Column align="right"><Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.dark }}>{fmt(data.subtotalInCents)}</Text></Column>
      </Row>
      {data.discountInCents > 0 && (
        <Row style={{ marginBottom: '4px' }}>
          <Column>
            <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.green }}>
              Desconto{data.couponCode ? ` (${data.couponCode})` : ''}
            </Text>
          </Column>
          <Column align="right"><Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.green }}>−{fmt(data.discountInCents)}</Text></Column>
        </Row>
      )}
      <Row style={{ marginBottom: '12px' }}>
        <Column><Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: brand.muted }}>Frete</Text></Column>
        <Column align="right">
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '13px', color: data.shippingInCents === 0 ? brand.green : brand.dark }}>
            {data.shippingInCents === 0 ? 'GRÁTIS' : fmt(data.shippingInCents)}
          </Text>
        </Column>
      </Row>
      <Hr style={{ borderColor: brand.border, margin: '8px 0' }} />
      <Row>
        <Column>
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '15px', fontWeight: '900', color: brand.dark }}>TOTAL</Text>
          <Text style={{ margin: '2px 0 0', fontFamily: font.base, fontSize: '11px', color: brand.muted }}>{methodLabels[data.paymentMethod] ?? data.paymentMethod}</Text>
        </Column>
        <Column align="right">
          <Text style={{ margin: 0, fontFamily: font.base, fontSize: '20px', fontWeight: '900', color: brand.orange }}>{fmt(data.totalInCents)}</Text>
        </Column>
      </Row>
    </Section>
  )
}

// ── CTA Button ────────────────────────────────────────────
export function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section style={{ textAlign: 'center', margin: '24px 0' }}>
      <Link
        href={href}
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
          letterSpacing: '0.3px',
        }}
      >
        {children}
      </Link>
    </Section>
  )
}

// ── Address block ─────────────────────────────────────────
export interface AddressData {
  street:     string
  number:     string
  complement?:string | null
  district:   string
  city:       string
  state:      string
  cep:        string
}

export function AddressBlock({ address }: { address: AddressData }) {
  return (
    <Section style={{ backgroundColor: '#FAFAFA', border: `1px solid ${brand.border}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
      <Text style={{ margin: '0 0 4px', fontFamily: font.base, fontSize: '11px', fontWeight: '700', color: brand.orange, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        Endereço de Entrega
      </Text>
      <Text style={{ margin: '0', fontFamily: font.base, fontSize: '14px', color: brand.dark, lineHeight: '1.5' }}>
        {address.street}, {address.number}{address.complement ? ` — ${address.complement}` : ''}<br />
        {address.district} · {address.city} / {address.state}<br />
        CEP {address.cep}
      </Text>
    </Section>
  )
}

// ── Base layout wrapper ───────────────────────────────────
interface EmailLayoutProps {
  preview:  string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.bodyBg, margin: '0', padding: '0', fontFamily: font.base }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <EmailHeader />
          <OrangeLine />
          <Section style={{ backgroundColor: brand.white, padding: '32px 32px 0' }}>
            {children}
          </Section>
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}
