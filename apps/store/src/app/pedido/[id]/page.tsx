import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { fmt } from '@/lib/utils'
import { CopyButton, PixTimer } from './client-components'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ method?: string; qr?: string; key?: string; exp?: string; burl?: string; bcode?: string }>
}

type OrderRow = {
  id: string; order_number: string; status: string
  customer_name: string; customer_email: string
  ship_street: string; ship_number: string; ship_complement: string | null
  ship_district: string; ship_city: string; ship_state: string
  delivery_method: string; shipping_in_cents: number; estimated_days: number | null
  payment_method: string; subtotal_in_cents: number; discount_in_cents: number; total_in_cents: number
  coupon_code: string | null
  created_at: string
}

type OrderItemRow = {
  product_name: string; brand_name: string; variant_size: string
  variant_color: string | null; image_url: string | null
  qty: number; unit_in_cents: number; total_in_cents: number
}

export default async function PedidoPage({ params, searchParams }: PageProps) {
  const { id }    = await params
  const sp        = await searchParams
  const method    = sp.method ?? 'pix'
  const pixQr     = sp.qr
  const pixKey    = sp.key
  const pixExpAt  = sp.exp
  const boletoUrl = sp.burl
  const boletoBar = sp.bcode

  const orders = db.all<OrderRow>(sql`
    SELECT id, order_number, status, customer_name, customer_email,
           ship_street, ship_number, ship_complement, ship_district, ship_city, ship_state,
           delivery_method, shipping_in_cents, estimated_days,
           payment_method, subtotal_in_cents, discount_in_cents, total_in_cents,
           coupon_code, created_at
    FROM orders WHERE id = ${id} LIMIT 1
  `)

  const order = orders[0]
  if (!order) notFound()

  const items = db.all<OrderItemRow>(sql`
    SELECT product_name, brand_name, variant_size, variant_color, image_url, qty, unit_in_cents, total_in_cents
    FROM order_items WHERE order_id = ${id}
  `)

  const methodLabel: Record<string, string> = {
    pix: 'PIX', credit_card: 'Cartão de Crédito', boleto: 'Boleto Bancário',
  }
  const deliveryLabel: Record<string, string> = {
    sedex: 'SEDEX', pac: 'PAC', local_delivery: 'Entrega Local Galvão',
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>

      {/* Banner sucesso */}
      <div style={{ background: 'linear-gradient(135deg,#0B0E12,#1a2620)', borderRadius: 16, padding: '40px 40px 36px', marginBottom: 40, color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%,rgba(34,197,94,.2) 0%,transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, letterSpacing: '.06em', marginBottom: 8 }}>
            PEDIDO CONFIRMADO!
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'rgba(255,255,255,.7)', marginBottom: 12 }}>
            {order.customer_email}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', borderRadius: 99, padding: '8px 20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, letterSpacing: '.1em' }}>
              {order.order_number}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

        {/* ── Pagamento ──────────────────────────────────────────────── */}
        <div>

          {/* PIX */}
          {method === 'pix' && (
            <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, marginBottom: 20 }}>
                PAGUE COM PIX
              </h2>

              {pixQr ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  <Image
                    src={`data:image/png;base64,${pixQr}`}
                    alt="QR Code PIX"
                    width={220} height={220}
                    style={{ borderRadius: 12, border: '4px solid var(--border)' }}
                  />

                  {pixExpAt && <PixTimer expiresAt={pixExpAt} />}

                  {pixKey && (
                    <div style={{ width: '100%' }}>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>
                        Ou copie o código PIX:
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <code style={{
                          flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-sunk)',
                          border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 10,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg)',
                        }}>
                          {pixKey}
                        </code>
                        <CopyButton text={pixKey} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Dev mode sem chaves MP
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-sunk)', borderRadius: 12 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>
                    Configure as chaves do Mercado Pago em <code>.env.local</code> para gerar o QR Code.
                  </p>
                </div>
              )}

              <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(34,197,94,.08)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)' }}>
                  ✓ Pague e receba a confirmação em até 5 segundos<br />
                  ✓ Use qualquer app bancário ou carteira digital<br />
                  ✓ O pagamento expira em 30 minutos
                </p>
              </div>
            </div>
          )}

          {/* Boleto */}
          {method === 'boleto' && (
            <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, marginBottom: 20 }}>
                BOLETO BANCÁRIO
              </h2>

              {boletoUrl ? (
                <div>
                  <a
                    href={boletoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block', textAlign: 'center', padding: '16px', borderRadius: 12,
                      background: 'var(--brand-orange)', color: '#fff', textDecoration: 'none',
                      fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, marginBottom: 20,
                    }}
                  >
                    Abrir Boleto PDF
                  </a>

                  {boletoBar && (
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>
                        Linha digitável:
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <code style={{
                          flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-sunk)',
                          border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 11,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg)',
                        }}>
                          {boletoBar}
                        </code>
                        <CopyButton text={boletoBar} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-sunk)', borderRadius: 12 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>
                    Configure as chaves do Mercado Pago em <code>.env.local</code> para gerar o boleto.
                  </p>
                </div>
              )}

              <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(250,204,21,.08)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)' }}>
                  ⚠️ Compensação em 1–3 dias úteis após o pagamento<br />
                  ⚠️ O pedido só será processado após a confirmação<br />
                  ⚠️ Vence em 3 dias úteis
                </p>
              </div>
            </div>
          )}

          {/* Cartão */}
          {method === 'credit_card' && (
            <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, marginBottom: 16 }}>
                CARTÃO DE CRÉDITO
              </h2>
              <div style={{ padding: '14px 18px', background: 'rgba(34,197,94,.08)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--brand-green)', fontWeight: 600 }}>
                  ✓ Pagamento aprovado!
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
                  Você receberá a confirmação por e-mail em instantes.
                </p>
              </div>
            </div>
          )}

          {/* Endereço + Entrega */}
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, marginBottom: 16 }}>
              ENTREGA
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Endereço</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6 }}>
                  {order.ship_street}, {order.ship_number}{order.ship_complement ? `, ${order.ship_complement}` : ''}<br />
                  {order.ship_district} — {order.ship_city}/{order.ship_state}
                </p>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Modalidade</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13 }}>
                  {deliveryLabel[order.delivery_method] ?? order.delivery_method}
                </p>
                {order.estimated_days && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                    Prazo estimado: {order.estimated_days} dia(s) útil(eis)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Resumo do pedido ────────────────────────────────────────── */}
        <div>
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, marginBottom: 20 }}>
              ITENS DO PEDIDO
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 52, height: 52, background: 'var(--bg-sunk)', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {item.image_url && (
                      <Image src={item.image_url} alt={item.product_name} width={48} height={48} style={{ objectFit: 'contain', mixBlendMode: 'multiply', width: '85%', height: '85%' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{item.product_name}</p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)' }}>Tam. {item.variant_size} · Qty {item.qty}</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }}>{fmt(item.total_in_cents)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SRow label="Subtotal" value={fmt(order.subtotal_in_cents)} />
              {(() => {
                const pixDisc = order.payment_method === 'pix' ? Math.round(order.subtotal_in_cents * 0.05) : 0
                const couponDisc = order.discount_in_cents - pixDisc
                return (
                  <>
                    {couponDisc > 0 && <SRow label={`Cupom${order.coupon_code ? ` (${order.coupon_code})` : ''}`} value={`-${fmt(couponDisc)}`} green />}
                    {pixDisc > 0 && <SRow label="Desconto PIX 5%" value={`-${fmt(pixDisc)}`} green />}
                  </>
                )
              })()}
              {order.shipping_in_cents > 0
                ? <SRow label="Frete" value={fmt(order.shipping_in_cents)} />
                : <SRow label="Frete" value="Grátis" green />
              }
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                <SRow label="TOTAL" value={fmt(order.total_in_cents)} large />
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>
                Pago via {methodLabel[order.payment_method] ?? order.payment_method}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Link
              href="/"
              style={{
                display: 'block', textAlign: 'center', padding: '14px', borderRadius: 12,
                border: '1.5px solid var(--border)', color: 'var(--fg-muted)',
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, textDecoration: 'none',
              }}
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SRow({ label, value, green, large }: { label: string; value: string; green?: boolean; large?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: large ? 14 : 13, fontWeight: large ? 700 : 400, color: large ? 'var(--fg)' : 'var(--fg-muted)' }}>{label}</span>
      <span style={{ fontFamily: large ? 'var(--font-display)' : 'var(--font-ui)', fontSize: large ? 20 : 13, fontWeight: large ? 900 : 600, color: green ? 'var(--brand-green)' : large ? 'var(--brand-orange)' : 'var(--fg)' }}>{value}</span>
    </div>
  )
}

