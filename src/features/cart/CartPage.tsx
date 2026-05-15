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
        <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 96, opacity: .15, lineHeight: 1, color: 'var(--fg)' }}>:(</div>
        <h2 style={{ fontFamily: 'var(--font-stencil)', fontSize: 48, margin: '24px 0 12px', letterSpacing: '.02em' }}>CARRINHO VAZIO</h2>
        <p style={{ color: 'var(--fg-muted)', marginBottom: 32 }}>Adiciona produtos para começar.</p>
        <button className="btn btn-primary btn-lg" onClick={() => nav('/produtos')}>Ver produtos</button>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      {/* Page head */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32 }}>
        <Link to="/produtos" style={{ color: 'var(--fg-muted)', fontSize: 13, fontFamily: 'var(--font-ui)' }}>← Continuar comprando</Link>
        <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 56, lineHeight: .95, margin: 0, letterSpacing: '.005em' }}>
          CARRINHO
        </h1>
        <span style={{ color: 'var(--fg-muted)', fontSize: 14 }}>{cart.length} iten{cart.length > 1 ? 's' : ''}</span>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div>
          <div className="cart-items">
            {cart.map(item => (
              <div key={`${item.product.id}-${item.size}`} className="cart-row">
                {/* Thumbnail */}
                <div className="cart-thumb">
                  <img src={item.product.images[0]?.url} alt={item.product.name} />
                </div>

                {/* Info */}
                <div>
                  <div className="brand-label">{item.product.brand}</div>
                  <div className="item-name">
                    <Link to={`/produto/${item.product.slug}`} style={{ color: 'inherit' }}>
                      {item.product.name}{' '}
                      <span style={{ fontWeight: 400, color: 'var(--fg-muted)' }}>"{item.product.colorway}"</span>
                    </Link>
                  </div>
                  <div className="item-opts">Tamanho: <strong>{item.size}</strong></div>
                  <div className="cart-qty">
                    <button onClick={() => updateQty(item.product.id, item.size, item.quantity - 1)}>−</button>
                    <span className="qty-num">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, item.size, item.quantity + 1)}>+</button>
                  </div>
                </div>

                {/* Price */}
                <div className="cart-price-col">
                  {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                    <div className="item-from">{formatBRL(item.product.originalPrice * item.quantity)}</div>
                  )}
                  <div className="item-price">{formatBRL(item.product.price * item.quantity)}</div>
                  <button className="item-remove" onClick={() => removeFromCart(item.product.id, item.size)}>
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={clearCart}
            style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--fg-faint)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
          >
            Limpar carrinho
          </button>
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3>Resumo do pedido</h3>

          <div className="line">
            <span style={{ color: 'var(--fg-muted)' }}>Subtotal</span>
            <span>{formatBRL(total)}</span>
          </div>
          <div className="line">
            <span style={{ color: 'var(--fg-muted)' }}>Frete</span>
            <span style={{ color: freeShip ? 'var(--brand-green)' : 'var(--fg-muted)', fontWeight: freeShip ? 700 : 400 }}>
              {freeShip ? 'GRÁTIS' : 'A calcular'}
            </span>
          </div>

          {!freeShip && (
            <div style={{ background: 'var(--brand-orange-100)', color: 'var(--brand-orange-600)', borderRadius: 'var(--r-sm)', padding: '8px 12px', fontSize: 12, marginTop: 8 }}>
              Falta {formatBRL(399 - total)} para frete grátis!
            </div>
          )}

          <div className="line total">
            <span>Total</span>
            <span className="val">{formatBRL(total)}</span>
          </div>

          <div className="cart-pix-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            No Pix: <strong>{formatBRL(pix)}</strong> (5% OFF)
          </div>

          {/* Coupon */}
          <div className="cart-coupon">
            <input placeholder="Código de cupom" />
            <button>Aplicar</button>
          </div>

          <button
            className="btn btn-primary btn-lg btn-block"
            style={{ marginTop: 20 }}
            onClick={() => nav('/checkout')}
          >
            Finalizar compra →
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--fg-faint)', marginTop: 12 }}>
            🔒 Pagamento 100% seguro com SSL
          </p>
        </div>
      </div>
    </div>
  )
}
