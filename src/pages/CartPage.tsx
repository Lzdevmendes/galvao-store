import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';

export function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useStore();
  const total = cartTotal();
  const pixTotal = total * 0.95;
  const freeShipping = total >= 399;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-(--border-strong) mb-6" />
        <h2 className="font-display text-5xl text-(--fg) mb-3">CARRINHO VAZIO</h2>
        <p className="text-(--fg-muted) mb-8">Adiciona produtos para começar.</p>
        <Button size="lg" onClick={() => navigate('/produtos')}>Ver produtos</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/produtos" className="flex items-center gap-2 text-sm text-(--fg-muted) hover:text-brand-orange transition-colors">
          <ArrowLeft size={16} />Continuar comprando
        </Link>
        <h1 className="font-display text-4xl text-(--fg)">CARRINHO</h1>
        <span className="text-(--fg-muted) text-sm">{cart.length} iten{cart.length > 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {cart.map(item => (
            <div
              key={`${item.product.id}-${item.size}`}
              className="bg-(--bg-elev) border border-(--border) rounded-lg p-4 flex gap-4"
            >
              <Link to={`/produto/${item.product.slug}`} className="w-24 h-24 rounded-md overflow-hidden bg-(--bg-sunk) shrink-0">
                <img
                  src={item.product.images[0]?.url}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold font-ui text-(--fg-faint) uppercase tracking-widest">{item.product.brand}</div>
                <Link to={`/produto/${item.product.slug}`} className="text-sm font-semibold text-(--fg) hover:text-brand-orange transition-colors line-clamp-2">
                  {item.product.name} "{item.product.colorway}"
                </Link>
                <div className="text-xs text-(--fg-muted) mt-0.5">Tamanho: <strong>{item.size}</strong></div>

                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      className="w-7 h-7 rounded-sm border border-(--border) flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold font-ui">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      className="w-7 h-7 rounded-sm border border-(--border) flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold font-ui text-(--fg)">
                      {(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="w-7 h-7 rounded-sm text-(--fg-faint) hover:text-brand-red hover:bg-brand-red/10 transition-all flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-xs font-semibold font-ui text-(--fg-faint) hover:text-brand-red transition-colors self-start mt-1"
          >
            Limpar carrinho
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-(--bg-elev) border border-(--border) rounded-xl p-6 sticky top-32">
            <h3 className="font-heading text-lg text-(--fg) mb-4">Resumo do pedido</h3>

            {/* Coupon */}
            <div className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--fg-faint)" />
                <input
                  placeholder="Código do cupom"
                  className="w-full h-9 pl-9 pr-3 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange transition-all"
                />
              </div>
              <Button size="sm" variant="ghost">Aplicar</Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-(--fg-muted)">
                <span>Subtotal</span>
                <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-(--fg-muted)">
                <span>Frete</span>
                <span className={freeShipping ? 'text-brand-green font-semibold' : ''}>
                  {freeShipping ? 'GRÁTIS' : 'Calcular'}
                </span>
              </div>
              {!freeShipping && (
                <div className="text-[11px] text-brand-orange bg-brand-orange/10 rounded px-2 py-1.5">
                  Falta {(399 - total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para frete grátis!
                </div>
              )}

              <div className="border-t border-(--border) pt-3 flex justify-between font-bold text-(--fg)">
                <span>Total</span>
                <span className="font-display text-xl">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-[11px] text-brand-green">
                <span>No Pix (5% OFF)</span>
                <span className="font-semibold">{pixTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>

            <Button size="lg" fullWidth className="mt-5" onClick={() => navigate('/checkout')}>
              Finalizar compra
            </Button>
            <p className="text-center text-[10px] text-(--fg-faint) mt-3">
              🔒 Pagamento 100% seguro com SSL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
