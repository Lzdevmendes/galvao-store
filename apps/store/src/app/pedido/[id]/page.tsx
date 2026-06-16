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
  coupon_code: string | null; created_at: string
}

type OrderItemRow = {
  product_name: string; brand_name: string; variant_size: string
  variant_color: string | null; image_url: string | null
  qty: number; unit_in_cents: number; total_in_cents: number
}

// Mapeamento de status para posição no tracker (0-based, 4 etapas = 5 pontos)
const STATUS_TRACKER: Record<string, number> = {
  pending_payment: 1,  // AGUARDANDO PIX — ponto 1 ativo
  paid:            2,  // EM SEPARAÇÃO
  processing:      2,  // EM SEPARAÇÃO
  shipped:         3,  // EM TRÂNSITO
  delivered:       4,  // ENTREGUE
  cancelled:      -1,  // Cancelado
  refunded:       -1,
}

const TRACKER_LABELS = ['PEDIDO CRIADO', 'AGUARDANDO PIX', 'EM SEPARAÇÃO', 'EM TRÂNSITO', 'ENTREGUE']

const deliveryLabel: Record<string, string> = {
  sedex: 'SEDEX', pac: 'PAC', local_delivery: 'Entrega Local Galvão',
}
const methodLabel: Record<string, string> = {
  pix: 'PIX', credit_card: 'Cartão de Crédito', boleto: 'Boleto Bancário',
}

export default async function PedidoPage({ params, searchParams }: PageProps) {
  const { id }   = await params
  const sp       = await searchParams
  const method   = sp.method ?? 'pix'
  const pixQr    = sp.qr
  const pixKey   = sp.key
  const pixExpAt = sp.exp
  const boletoUrl = sp.burl
  const boletoBar = sp.bcode

  const orders = await db.all<OrderRow>(sql`
    SELECT id, order_number, status, customer_name, customer_email,
           ship_street, ship_number, ship_complement, ship_district, ship_city, ship_state,
           delivery_method, shipping_in_cents, estimated_days,
           payment_method, subtotal_in_cents, discount_in_cents, total_in_cents,
           coupon_code, created_at
    FROM orders WHERE id = ${id} LIMIT 1
  `)
  const order = orders[0]
  if (!order) notFound()

  const items = await db.all<OrderItemRow>(sql`
    SELECT product_name, brand_name, variant_size, variant_color, image_url, qty, unit_in_cents, total_in_cents
    FROM order_items WHERE order_id = ${id}
  `)

  const trackerPos   = STATUS_TRACKER[order.status] ?? 0
  const isPaid       = ['paid','processing','shipped','delivered'].includes(order.status)
  const isCancelled  = order.status === 'cancelled' || order.status === 'refunded'
  const firstName    = order.customer_name.split(' ')[0].toUpperCase()

  // Banner: verde se pago, laranja se aguardando, vermelho se cancelado
  const bannerGrad = isPaid
    ? 'linear-gradient(135deg, #1A6B3A, #2CB35A)'
    : isCancelled
    ? 'linear-gradient(135deg, #7A1F1F, #E23B3B)'
    : 'linear-gradient(135deg, var(--brand-orange), var(--brand-orange-600))'

  return (
    <>
      {/* Promo bar minimal — contexto de checkout */}
      <div style={{ background:'#0B0E12', color:'#fff', textAlign:'center', padding:'8px', fontFamily:'var(--font-ui)', fontSize:12 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign:'middle', marginRight:4, color:'var(--brand-green)' }}><path d="M14 9V5a3 3 0 0 0-6 0v4"/><rect width="18" height="12" x="3" y="9" rx="2"/></svg>
        Pedido criado com sucesso · ambiente seguro
      </div>

      <div className="conf-wrap" style={{ maxWidth:920, margin:'0 auto', padding:'40px 24px 96px' }}>

        {/* ── Banner de sucesso ─────────────────────────────────── */}
        <div style={{ background: bannerGrad, color:'#fff', borderRadius:'var(--r-xl)', padding:'48px 32px', marginBottom:24, position:'relative', overflow:'hidden', textAlign:'center' }}>
          {/* Glow decorativo */}
          <div style={{ position:'absolute', right:-50, top:-50, width:200, height:200, background:'rgba(255,255,255,.12)', borderRadius:'50%', pointerEvents:'none' }} />

          {/* Check circle */}
          <div style={{ width:80, height:80, background:'#fff', borderRadius:'50%', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', color: isPaid ? '#2CB35A' : isCancelled ? '#E23B3B' : 'var(--brand-orange)', position:'relative', zIndex:1 }}>
            {isCancelled ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </div>

          <h1 style={{ fontFamily:'var(--font-stencil)', fontSize:'clamp(48px,8vw,72px)', lineHeight:.95, margin:'0 0 8px', position:'relative', zIndex:1 }}>
            {isCancelled ? 'CANCELADO,' : 'OBRIGADO,'}<br />{firstName}!
          </h1>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:13, letterSpacing:'.18em', margin:'0 0 16px', opacity:.9, position:'relative', zIndex:1 }}>
            PEDIDO {order.order_number}
          </div>
          <p style={{ fontSize:15, maxWidth:520, margin:'0 auto', lineHeight:1.6, position:'relative', zIndex:1 }}>
            {isPaid
              ? 'Seu pagamento foi confirmado. Já estamos separando suas chuteiras!'
              : isCancelled
              ? 'Seu pedido foi cancelado. Se tiver dúvidas, entre em contato.'
              : method === 'boleto'
              ? 'Seu boleto foi gerado. Efetue o pagamento em até 3 dias úteis.'
              : 'Seu pedido foi criado. Falta só finalizar o Pix abaixo para a gente começar a separar suas chuteiras. Você tem 30 minutos.'}
          </p>

          {/* Ações rápidas */}
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:24, flexWrap:'wrap', position:'relative', zIndex:1 }}>
            <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:'var(--r-md)', background:'#fff', color:'#0B0E12', fontFamily:'var(--font-ui)', fontWeight:700, fontSize:14 }}>
              Continuar comprando
            </Link>
            <Link href="/conta/pedidos" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:'var(--r-md)', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,.4)', fontFamily:'var(--font-ui)', fontWeight:700, fontSize:14 }}>
              Meus pedidos
            </Link>
          </div>
        </div>

        {/* ── PIX ─────────────────────────────────────────────────── */}
        {method === 'pix' && !isPaid && !isCancelled && (
          <div style={{ background:'var(--bg-elev)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:24, marginBottom:16, display:'grid', gridTemplateColumns:'160px 1fr', gap:24, alignItems:'center' }}>
            {/* QR Code */}
            <div style={{ width:160, height:160, background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:8, flexShrink:0 }}>
              {pixQr ? (
                <Image src={`data:image/png;base64,${pixQr}`} alt="QR Code PIX" width={144} height={144} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
              ) : (
                /* QR placeholder visual */
                <svg viewBox="0 0 80 80" width="144" height="144" style={{ display:'block' }}>
                  <pattern id="qrp" patternUnits="userSpaceOnUse" width="6" height="6">
                    <rect width="3" height="3" fill="black"/>
                    <rect x="3" y="3" width="3" height="3" fill="black"/>
                  </pattern>
                  <rect width="80" height="80" fill="url(#qrp)"/>
                  <rect x="0" y="0" width="22" height="22" fill="white"/><rect x="3" y="3" width="16" height="16" fill="black"/><rect x="7" y="7" width="8" height="8" fill="white"/>
                  <rect x="58" y="0" width="22" height="22" fill="white"/><rect x="61" y="3" width="16" height="16" fill="black"/><rect x="65" y="7" width="8" height="8" fill="white"/>
                  <rect x="0" y="58" width="22" height="22" fill="white"/><rect x="3" y="61" width="16" height="16" fill="black"/><rect x="7" y="65" width="8" height="8" fill="white"/>
                  <rect x="20" y="20" width="40" height="40" fill="black" opacity=".35"/>
                </svg>
              )}
            </div>

            {/* Infos */}
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, margin:'0 0 4px' }}>Pagar com Pix</h3>
              {pixExpAt && (
                <div style={{ marginBottom:12 }}>
                  <PixTimer expiresAt={pixExpAt} />
                </div>
              )}
              <p style={{ fontSize:13, color:'var(--fg-muted)', lineHeight:1.55, margin:'0 0 10px' }}>
                Aponte a câmera do banco para o QR Code <strong style={{ color:'var(--fg)' }}>ou</strong> copie a chave Pix abaixo. Aprovação em até 30 segundos.
              </p>
              {pixKey && (
                <>
                  <div style={{ background:'var(--bg-sunk)', padding:'10px 12px', borderRadius:'var(--r-sm)', fontFamily:'var(--font-mono)', fontSize:10, wordBreak:'break-all', border:'1px solid var(--border)', marginBottom:8, color:'var(--fg)' }}>
                    {pixKey}
                  </div>
                  <CopyButton text={pixKey} />
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Boleto ───────────────────────────────────────────────── */}
        {method === 'boleto' && !isPaid && !isCancelled && (
          <div style={{ background:'var(--bg-elev)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:24, marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, margin:'0 0 16px' }}>Boleto Bancário</h3>
            {boletoUrl && (
              <a href={boletoUrl} target="_blank" rel="noopener noreferrer"
                style={{ display:'block', textAlign:'center', padding:16, borderRadius:12, background:'var(--brand-orange)', color:'#fff', fontFamily:'var(--font-ui)', fontWeight:700, fontSize:15, marginBottom:16 }}>
                Abrir Boleto PDF
              </a>
            )}
            {boletoBar && (
              <div>
                <p style={{ fontFamily:'var(--font-ui)', fontSize:12, color:'var(--fg-muted)', marginBottom:8 }}>Linha digitável:</p>
                <div style={{ display:'flex', gap:8 }}>
                  <code style={{ flex:1, padding:'10px 14px', borderRadius:10, background:'var(--bg-sunk)', border:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--fg)' }}>
                    {boletoBar}
                  </code>
                  <CopyButton text={boletoBar} />
                </div>
              </div>
            )}
            <p style={{ fontFamily:'var(--font-ui)', fontSize:12, color:'var(--fg-muted)', marginTop:12 }}>
              ⚠️ Compensação em 1–3 dias úteis · Vence em 3 dias úteis
            </p>
          </div>
        )}

        {/* ── Order Tracker ────────────────────────────────────────── */}
        {!isCancelled && (
          <div style={{ background:'var(--bg-elev)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:24, marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:16, marginBottom:16, borderBottom:'1px solid var(--border)' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, letterSpacing:'.04em', textTransform:'uppercase', margin:0 }}>
                Acompanhe seu pedido
              </h3>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--fg-muted)' }}>
                {new Date(order.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' })}
              </span>
            </div>

            {/* Tracker: dots + steps */}
            <div style={{ display:'flex', alignItems:'center', marginBottom:8 }}>
              {TRACKER_LABELS.map((_, i) => (
                <div key={i} style={{ display:'contents' }}>
                  {/* Dot */}
                  <div style={{
                    width:14, height:14, borderRadius:'50%', flexShrink:0, position:'relative', zIndex:1,
                    background: i < trackerPos ? 'var(--brand-green)' : i === trackerPos ? 'var(--brand-orange)' : 'var(--border)',
                    boxShadow: i === trackerPos ? '0 0 0 4px rgba(242,107,31,.2)' : 'none',
                    transition: 'all .3s',
                  }} />
                  {/* Step bar (não após o último dot) */}
                  {i < TRACKER_LABELS.length - 1 && (
                    <div style={{
                      flex:1, height:4, margin:'0 -1px',
                      background: i < trackerPos ? 'var(--brand-green)' : i === trackerPos - 1 ? 'linear-gradient(90deg, var(--brand-green), var(--brand-orange))' : 'var(--border)',
                      transition: 'background .3s',
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Labels */}
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'.06em' }}>
              {TRACKER_LABELS.map((label, i) => (
                <span key={i} style={{
                  color: i < trackerPos ? 'var(--brand-green)' : i === trackerPos ? 'var(--brand-orange)' : 'var(--fg-muted)',
                  fontWeight: i === trackerPos ? 700 : 400,
                  textAlign: i === 0 ? 'left' : i === TRACKER_LABELS.length - 1 ? 'right' : 'center',
                  flex: 1,
                }}>
                  {label}
                </span>
              ))}
            </div>

            {/* Hint contextual */}
            <div style={{ background:'var(--bg-sunk)', padding:'12px 16px', borderRadius:'var(--r-sm)', fontSize:13, color:'var(--fg-muted)', marginTop:16 }}>
              {order.status === 'pending_payment' && '⚡ Após o Pix ser identificado, seu pedido sai do CD em até 24h úteis.'}
              {(order.status === 'paid' || order.status === 'processing') && '📦 Estamos separando seus produtos. Em breve você receberá o código de rastreio.'}
              {order.status === 'shipped' && `🚚 Seu pedido está a caminho! Prazo estimado: ${order.estimated_days ? `${order.estimated_days} dia(s) útil(eis)` : 'conforme transportadora'}.`}
              {order.status === 'delivered' && '🎉 Pedido entregue! Adoramos ver você correndo com as melhores chuteiras.'}
              {!['pending_payment','paid','processing','shipped','delivered'].includes(order.status) && 'Acompanhe as atualizações por e-mail.'}
            </div>
          </div>
        )}

        {/* ── Grid: entrega + resumo ───────────────────────────────── */}
        <div className="rg-sidebar">

          {/* Entrega */}
          <div style={{ background:'var(--bg-elev)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:24 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, letterSpacing:'.04em', textTransform:'uppercase', margin:'0 0 16px', paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
              Entrega
            </h3>
            <div className="rg-delivery">
              <div>
                <p style={{ fontFamily:'var(--font-ui)', fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>Endereço</p>
                <p style={{ fontFamily:'var(--font-ui)', fontSize:13, lineHeight:1.6 }}>
                  {order.ship_street}, {order.ship_number}{order.ship_complement ? `, ${order.ship_complement}` : ''}<br />
                  {order.ship_district} — {order.ship_city}/{order.ship_state}
                </p>
              </div>
              <div>
                <p style={{ fontFamily:'var(--font-ui)', fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>Modalidade</p>
                <p style={{ fontFamily:'var(--font-ui)', fontSize:13 }}>
                  {deliveryLabel[order.delivery_method] ?? order.delivery_method}
                </p>
                {order.estimated_days && (
                  <p style={{ fontFamily:'var(--font-ui)', fontSize:12, color:'var(--fg-muted)', marginTop:2 }}>
                    Estimativa: {order.estimated_days} dia(s) útil(eis)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div style={{ background:'var(--bg-elev)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:24 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, letterSpacing:'.04em', textTransform:'uppercase', margin:'0 0 16px', paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
              Resumo · {items.length} {items.length === 1 ? 'item' : 'itens'}
            </h3>

            {/* Items */}
            <div style={{ display:'flex', flexDirection:'column' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display:'flex', gap:16, padding:'12px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', alignItems:'center' }}>
                  <div style={{ width:64, height:64, background:'#fff', borderRadius:'var(--r-sm)', padding:4, flexShrink:0 }}>
                    {item.image_url && (
                      <Image src={item.image_url} alt={item.product_name} width={56} height={56}
                        style={{ width:'100%', height:'100%', objectFit:'contain', mixBlendMode:'multiply' }} />
                    )}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'var(--font-ui)', fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--fg-muted)', marginBottom:2 }}>
                      {item.brand_name}
                    </div>
                    <div style={{ fontWeight:600, fontSize:14, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize:12, color:'var(--fg-muted)' }}>
                      Tam. {item.variant_size}{item.variant_color ? ` · ${item.variant_color}` : ''} · Qty {item.qty}
                    </div>
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', textAlign:'right', fontSize:13, fontWeight:600, flexShrink:0 }}>
                    {fmt(item.total_in_cents)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)', fontSize:14 }}>
              <SRow label="Subtotal" value={fmt(order.subtotal_in_cents)} />
              {(() => {
                const pixDisc   = order.payment_method === 'pix' ? Math.round(order.subtotal_in_cents * 0.05) : 0
                const couponDisc = order.discount_in_cents - pixDisc
                return (
                  <>
                    {couponDisc > 0 && <SRow label={`Cupom${order.coupon_code ? ` (${order.coupon_code})` : ''}`} value={`-${fmt(couponDisc)}`} green />}
                    {pixDisc > 0    && <SRow label="Desconto PIX 5%" value={`-${fmt(pixDisc)}`} green />}
                  </>
                )
              })()}
              {order.shipping_in_cents > 0
                ? <SRow label="Frete" value={fmt(order.shipping_in_cents)} />
                : <SRow label="Frete" value="Grátis" green />
              }
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:10, marginTop:4 }}>
                <SRow label="TOTAL" value={fmt(order.total_in_cents)} large />
              </div>
              <p style={{ fontFamily:'var(--font-ui)', fontSize:11, color:'var(--fg-muted)', marginTop:4 }}>
                Pago via {methodLabel[order.payment_method] ?? order.payment_method}
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

function SRow({ label, value, green, large }: { label: string; value: string; green?: boolean; large?: boolean }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
      <span style={{ fontFamily:'var(--font-ui)', fontSize: large ? 14 : 13, fontWeight: large ? 700 : 400, color: large ? 'var(--fg)' : 'var(--fg-muted)' }}>{label}</span>
      <span style={{ fontFamily: large ? 'var(--font-display)' : 'var(--font-ui)', fontSize: large ? 20 : 13, fontWeight: large ? 900 : 600, color: green ? 'var(--brand-green)' : large ? 'var(--brand-orange)' : 'var(--fg)' }}>{value}</span>
    </div>
  )
}
