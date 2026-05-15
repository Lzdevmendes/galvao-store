import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../shared/store'
import { formatBRL, getPixPrice } from '../../core/domain/product'

export function CartPage() {
  const nav = useNavigate()
  const { cart, removeFromCart, updateQty, clearCart, cartTotal } = useStore()
  const total = cartTotal()
  const pix = getPixPrice(total)
  const freeShip = total >= 399

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 96, opacity: .2, lineHeight: 1 }}>:(</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: '24px 0 12px' }}>Carrinho vazio</h2>
        <p style={{ color: 'var(--fg-muted)', marginBottom: 32 }}>Adiciona produtos para começar.</p>
        <button className="btn btn-primary btn-lg" onClick={() => nav('/produtos')}>Ver produtos</button>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link to="/produtos" style={{ color: 'var(--fg-muted)', fontSize: 13 }}>← Continuar comprando</Link>
        <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 48, margin: 0, lineHeight: 1 }}>CARRINHO</h1>
        <span style={{ color: 'var(--fg-muted)', fontSize: 14 }}>{cart.length} iten{cart.length > 1 ? 's' : ''}</span>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cart.map(item => (
            <div key={`${item.product.id}-${item.size}`} className="cart-item">
              <Link to={`/produto/${item.product.slug}`}>
                <img src={item.product.images[0]?.url} alt={item.product.name} />
              </Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>
                  {item.product.brand}
                </div>
                <div className="name">{item.product.name} "{item.product.colorway}"</div>
                <div className="meta" style={{ marginTop: 4 }}>Tamanho: <strong>{item.size}</strong></div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div className="qty-ctrl">
                    <button onClick={() => updateQty(item.product.id, item.size, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, item.size, item.quantity + 1)}>+</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>
                      {formatBRL(item.product.price * item.quantity)}
                    </strong>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      style={{ background: 'none', border: 'none', color: 'var(--fg-faint)', cursor: 'pointer', fontSize: 18 }}
                    >✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--fg-faint)', fontSize: 13, cursor: 'pointer', padding: '4px 0' }}
          >
            Limpar carrinho
          </button>
        </div>

        {/* Summary */}
        <div className="order-summary">
          <h3>Resumo do pedido</h3>

          {/* Coupon */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input placeholder="Cupom de desconto" style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: 13, background: 'var(--bg-elev)', color: 'var(--fg)', fontFamily: 'inherit', outline: 'none' }} />
            <button className="btn btn-ghost btn-sm">Aplicar</button>
          </div>

          <div className="row" style={{ justifyContent: 'space-between', color: 'var(--fg-muted)', fontSize: 14 }}>
            <span>Subtotal</span><span>{formatBRL(total)}</span>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 14 }}>
            <span style={{ color: 'var(--fg-muted)' }}>Frete</span>
            <span style={{ color: freeShip ? 'var(--brand-green)' : 'var(--fg-muted)', fontWeight: freeShip ? 700 : 400 }}>
              {freeShip ? 'GRÁTIS' : 'Calcular'}
            </span>
          </div>

          {!freeShip && (
            <div style={{ background: 'rgba(242,107,31,.08)', borderRadius: 'var(--r-sm)', padding: '8px 12px', fontSize: 12, color: 'var(--brand-orange)', marginTop: 10 }}>
              Falta {formatBRL(399 - total)} para frete grátis!
            </div>
          )}

          <div className="total">
            <span>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>{formatBRL(total)}</span>
          </div>
          <div className="pix-price row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
            <span>No Pix (5% OFF)</span>
            <strong>{formatBRL(pix)}</strong>
          </div>

          <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20 }} onClick={() => nav('/checkout')}>
            Finalizar compra
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--fg-faint)', marginTop: 10 }}>
            🔒 Pagamento 100% seguro com SSL
          </p>
        </div>
      </div>
    </div>
  )
}
