import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, ZoomIn, Truck, RotateCcw, Shield, Star, Check } from 'lucide-react';
import { getProductBySlug, products } from '../data/products';
import { useStore } from '../store';
import { Badge, DiscountBadge, PixBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/product/ProductCard';

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={14}
            className={i <= Math.round(rating) ? 'text-brand-yellow fill-brand-yellow' : 'text-(--border-strong)'}
          />
        ))}
      </div>
      <span className="text-sm text-(--fg-muted)">
        <strong className="text-(--fg)">{rating}</strong> · {count} avaliações ·{' '}
        <a href="#avaliacoes" className="text-brand-orange font-semibold">Ver tudo</a>
      </span>
    </div>
  );
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'trocas'>('desc');
  const [cep, setCep] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="font-display text-6xl text-brand-orange mb-4">404</div>
        <p className="text-(--fg-muted) mb-6">Produto não encontrado.</p>
        <Button onClick={() => navigate('/produtos')}>Ver todos os produtos</Button>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const installment = product.price / 12;

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    addToCart(product, selectedSize);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); return; }
    addToCart(product, selectedSize);
    navigate('/carrinho');
  };

  const related = products
    .filter(p => p.id !== product.id && (p.brand === product.brand || p.category === product.category))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-(--fg-muted) mb-6">
        <Link to="/" className="hover:text-brand-orange transition-colors">Início</Link>
        <span>/</span>
        <Link to={`/marca/${product.brand.toLowerCase()}`} className="hover:text-brand-orange transition-colors">{product.brand}</Link>
        <span>/</span>
        <Link to={`/categoria/${product.category.toLowerCase().split(' ')[0]}`} className="hover:text-brand-orange transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-(--fg)">{product.name} "{product.colorway}"</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 w-16">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  selectedImage === i ? 'border-brand-orange' : 'border-(--border) hover:border-(--border-strong)'
                }`}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="flex-1 relative aspect-square rounded-xl overflow-hidden bg-(--bg-sunk)">
            {product.badge && (
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <Badge type={product.badge} />
                {hasDiscount && <DiscountBadge original={product.originalPrice!} current={product.price} />}
              </div>
            )}
            <img
              src={product.images[selectedImage]?.url}
              alt={product.images[selectedImage]?.alt}
              className="w-full h-full object-cover"
            />
            <button className="absolute bottom-4 right-4 w-10 h-10 rounded-md bg-(--bg-elev)/80 backdrop-blur-sm flex items-center justify-center text-(--fg-muted) hover:text-(--fg) transition-all">
              <ZoomIn size={18} />
            </button>
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(i => (i - 1 + product.images.length) % product.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-(--bg-elev)/80 backdrop-blur-sm flex items-center justify-center hover:bg-(--bg-elev) transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setSelectedImage(i => (i + 1) % product.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-(--bg-elev)/80 backdrop-blur-sm flex items-center justify-center hover:bg-(--bg-elev) transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold font-ui text-(--fg-faint) uppercase tracking-widest mb-1">
                {product.brand}{product.line ? ` · Linha ${product.line}` : ''}
              </div>
              <h1 className="font-heading text-2xl text-(--fg) leading-tight">
                {product.name} <span className="text-(--fg-muted) font-normal">"{product.colorway}"</span>
              </h1>
              <div className="text-[11px] font-mono text-(--fg-faint) mt-1">SKU {product.sku}</div>
            </div>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`shrink-0 w-10 h-10 rounded-md border flex items-center justify-center transition-all ${
                isWished ? 'bg-brand-orange border-brand-orange text-white' : 'border-(--border) text-(--fg-muted) hover:border-brand-orange hover:text-brand-orange'
              }`}
            >
              <Heart size={18} fill={isWished ? 'currentColor' : 'none'} />
            </button>
          </div>

          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Price */}
          <div className="bg-(--bg-sunk) rounded-lg p-4 flex flex-col gap-2">
            {hasDiscount && (
              <div className="text-sm text-(--fg-faint) line-through">
                De {product.originalPrice!.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl text-(--fg)">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              {hasDiscount && (
                <span className="bg-brand-orange/15 text-brand-orange text-xs font-bold font-ui px-2 py-1 rounded">
                  ECONOMIZE {(product.originalPrice! - product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              )}
            </div>
            <PixBadge price={product.price} />
            <div className="text-xs text-(--fg-muted)">
              ou em <strong>12x de {installment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> sem juros no cartão
            </div>
          </div>

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold font-ui text-(--fg)">Tamanho (BR)</span>
              <a href="#" className="text-xs font-semibold font-ui text-brand-orange">Tabela de tamanhos</a>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(({ size, available }) => (
                <button
                  key={size}
                  disabled={!available}
                  onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  className={`w-12 h-11 rounded-md text-sm font-semibold font-ui border-2 transition-all
                    ${!available
                      ? 'opacity-30 cursor-not-allowed border-(--border) text-(--fg-faint) line-through'
                      : selectedSize === size
                        ? 'border-brand-orange bg-brand-orange text-white shadow-md'
                        : 'border-(--border) text-(--fg) hover:border-brand-orange hover:text-brand-orange'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="text-xs text-brand-red mt-2 flex items-center gap-1">
                <span>⚠</span> Seleciona um tamanho antes de continuar.
              </p>
            )}
            {selectedSize && (
              <div className="mt-2 text-xs text-(--fg-muted) flex items-center gap-1.5">
                <Check size={12} className="text-brand-green" />
                Tamanho {selectedSize} selecionado
                {product.sizes.find(s => s.size === selectedSize)?.stock === 1 && (
                  <span className="text-brand-red font-semibold ml-1">⚡ Última unidade!</span>
                )}
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <Button size="lg" fullWidth onClick={handleBuyNow}>
              {addedFeedback ? '✓ Adicionado!' : `Comprar agora · ${product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
            </Button>
            <Button size="lg" variant="secondary" fullWidth onClick={handleAddToCart}>
              Adicionar ao carrinho
            </Button>
          </div>

          {/* Shipping */}
          <div className="border border-(--border) rounded-lg p-4 flex flex-col gap-3">
            <div className="text-sm font-semibold font-ui text-(--fg) flex items-center gap-2">
              <Truck size={16} className="text-brand-orange" />
              Calcular frete e prazo
            </div>
            <div className="flex gap-2">
              <input
                value={cep}
                onChange={e => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="00000-000"
                className="flex-1 h-9 px-3 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange transition-all"
              />
              <Button size="sm" variant="ghost">Calcular</Button>
            </div>
            <div className="space-y-2 text-xs text-(--fg-muted)">
              <div className="flex justify-between"><span>SEDEX · 2 dias úteis</span><strong className="text-brand-green">GRÁTIS</strong></div>
              <div className="flex justify-between"><span>SEDEX 10 · próximo dia útil</span><span>R$ 39,90</span></div>
              <div className="flex justify-between"><span>Retirada na loja (São Paulo)</span><strong className="text-brand-green">GRÁTIS</strong></div>
            </div>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Shield, text: 'Compra protegida' },
              { icon: RotateCcw, text: 'Troca grátis em 30 dias' },
              { icon: Truck, text: 'Entrega para todo o Brasil' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 text-[10px] text-(--fg-faint)">
                <Icon size={18} className="text-(--fg-muted)" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex gap-0 border-b border-(--border)">
          {[
            { key: 'desc', label: 'Descrição' },
            { key: 'specs', label: 'Especificações' },
            { key: 'reviews', label: `Avaliações (${product.reviewCount})` },
            { key: 'trocas', label: 'Trocas & devoluções' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-5 py-3 text-sm font-semibold font-ui border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'text-brand-orange border-brand-orange'
                  : 'text-(--fg-muted) border-transparent hover:text-(--fg)'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'desc' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-(--fg-muted) leading-relaxed">{product.description}</p>
                <h3 className="font-heading text-lg text-(--fg)">Recomendada para</h3>
                <ul className="space-y-3">
                  {product.features.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <Check size={16} className="text-brand-green shrink-0 mt-0.5" />
                      <span className="text-sm text-(--fg-muted)">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {product.images[1] && (
                <div className="rounded-xl overflow-hidden aspect-4/5 bg-(--bg-sunk)">
                  <img src={product.images[1].url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-lg">
              <h3 className="font-heading text-lg text-(--fg) mb-4">Especificações técnicas</h3>
              <div className="divide-y divide-(--border)">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-3 text-sm">
                    <span className="text-(--fg-muted) font-medium">{key}</span>
                    <span className="text-(--fg) font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-8 text-(--fg-muted)">
              <Star size={32} className="mx-auto mb-3 text-brand-yellow" />
              <div className="font-display text-5xl text-(--fg) mb-1">{product.rating}</div>
              <p className="text-sm">Baseado em {product.reviewCount} avaliações verificadas</p>
              <p className="text-xs mt-2 text-(--fg-faint)">Integração com avaliações em breve.</p>
            </div>
          )}

          {activeTab === 'trocas' && (
            <div className="max-w-lg space-y-3 text-sm text-(--fg-muted) leading-relaxed">
              <p><strong className="text-(--fg)">Troca gratuita em até 30 dias</strong> após o recebimento do pedido.</p>
              <p>O produto deve estar na embalagem original, sem sinais de uso, com etiquetas e acessórios inclusos.</p>
              <p>Para solicitar a troca, acesse <Link to="/conta" className="text-brand-orange font-semibold">Minha Conta → Pedidos</Link> ou entre em contacto com o nosso suporte.</p>
              <p>Reembolso integral em até 5 dias úteis após análise do produto devolvido.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-4xl text-(--fg) mb-6">
            PRODUTOS <span className="text-brand-orange">RELACIONADOS.</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
