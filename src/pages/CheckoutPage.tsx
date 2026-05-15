import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Check, Lock, CreditCard, Smartphone, QrCode, Copy, ArrowLeft } from 'lucide-react';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';

type Step = 'address' | 'payment' | 'review';
type PayMethod = 'pix' | 'credit' | 'boleto';

const PIX_CODE = '00020126580014br.gov.bcb.pix0136a629c8b9-4f12-4d23-9e8a-7b3c5d2e1f455204000053039865802BR5915GALVAOS COMERCIO6009SAO PAULO62070503***6304E2A1';

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'address', label: 'Endereço' },
    { key: 'payment', label: 'Pagamento' },
    { key: 'review', label: 'Revisão' },
  ];
  const idx = steps.findIndex(s => s.key === current);
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className={`flex items-center gap-2 ${i < idx ? 'text-brand-green' : i === idx ? 'text-brand-orange' : 'text-(--fg-faint)'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-ui border-2 transition-all
              ${i < idx ? 'bg-brand-green border-brand-green text-white'
                : i === idx ? 'border-brand-orange text-brand-orange bg-brand-orange/10'
                : 'border-(--border) text-(--fg-faint)'}`}>
              {i < idx ? <Check size={13} /> : i + 1}
            </div>
            <span className="text-xs font-semibold font-ui hidden sm:block">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-0.5 mx-2 ${i < idx ? 'bg-brand-green' : 'bg-(--border)'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function PixQR({ amount }: { amount: number }) {
  const [copied, setCopied] = useState(false);
  const timeLeft = '29:42';

  const copy = () => {
    navigator.clipboard.writeText(PIX_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <div className="bg-white p-4 rounded-lg shrink-0">
        <svg viewBox="0 0 80 80" width="140" height="140">
          <pattern id="qr1" patternUnits="userSpaceOnUse" width="6" height="6">
            <rect width="3" height="3" fill="black" />
            <rect x="3" y="3" width="3" height="3" fill="black" />
          </pattern>
          <rect width="80" height="80" fill="url(#qr1)" />
          <rect x="0" y="0" width="22" height="22" fill="white" />
          <rect x="3" y="3" width="16" height="16" fill="black" />
          <rect x="7" y="7" width="8" height="8" fill="white" />
          <rect x="58" y="0" width="22" height="22" fill="white" />
          <rect x="61" y="3" width="16" height="16" fill="black" />
          <rect x="65" y="7" width="8" height="8" fill="white" />
          <rect x="0" y="58" width="22" height="22" fill="white" />
          <rect x="3" y="61" width="16" height="16" fill="black" />
          <rect x="7" y="65" width="8" height="8" fill="white" />
          <rect x="28" y="28" width="24" height="24" fill="white" />
          <rect x="31" y="31" width="18" height="18" fill="black" />
          <rect x="34" y="34" width="12" height="12" fill="white" />
          <text x="40" y="44" textAnchor="middle" fontSize="7" fill="#F26B1F" fontWeight="bold">G</text>
        </svg>
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <div className="text-lg font-bold font-ui text-(--fg)">
            {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-xs text-brand-green font-semibold">5% desconto Pix já aplicado</div>
        </div>
        <div className="bg-brand-orange/10 text-brand-orange text-xs font-semibold font-ui px-3 py-1.5 rounded-md w-fit flex items-center gap-1.5">
          ⏱ Expira em {timeLeft}
        </div>
        <p className="text-xs text-(--fg-muted) leading-relaxed">
          Aponte a câmera do banco para o QR Code <strong className="text-(--fg)">ou</strong> copie o código abaixo. Aprovação em até 30 segundos.
        </p>
        <div className="bg-(--bg-sunk) rounded-md px-3 py-2 text-[10px] font-mono text-(--fg-faint) break-all leading-relaxed">
          {PIX_CODE.slice(0, 60)}...
        </div>
        <Button variant="secondary" size="sm" icon={<Copy size={14} />} onClick={copy}>
          {copied ? '✓ Copiado!' : 'Copiar código Pix'}
        </Button>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useStore();
  const total = cartTotal();
  const pixTotal = total * 0.95;
  const freeShipping = total >= 399;

  const [step, setStep] = useState<Step>('address');
  const [payMethod, setPayMethod] = useState<PayMethod>('pix');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber] = useState(() => `GS-${Date.now().toString().slice(-6)}`);

  const [address, setAddress] = useState({ name: '', email: '', phone: '', cep: '', street: '', number: '', complement: '', district: '', city: '', state: 'SP' });
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '', installments: '12' });

  const handleAddr = (k: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress(a => ({ ...a, [k]: e.target.value }));

  const handleCard = (k: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setCard(c => ({ ...c, [k]: e.target.value }));

  const placeOrder = () => {
    clearCart();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-green/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-brand-green" />
          </div>
          <h1 className="font-display text-6xl text-(--fg) mb-2">OBRIGADO!</h1>
          <div className="font-mono text-brand-orange text-sm font-semibold tracking-widest">PEDIDO #{orderNumber}</div>
          <p className="text-(--fg-muted) text-sm mt-2">Receberás um e-mail de confirmação em {address.email || 'contacto@galvaostore.com.br'}</p>
        </div>

        {payMethod === 'pix' && (
          <div className="bg-(--bg-elev) border border-(--border) rounded-xl p-6 mb-6">
            <h3 className="font-heading text-base text-(--fg) mb-4 flex items-center gap-2">
              <QrCode size={18} className="text-brand-orange" /> Finalizar pagamento via Pix
            </h3>
            <PixQR amount={pixTotal} />
          </div>
        )}

        {/* Order tracker */}
        <div className="bg-(--bg-elev) border border-(--border) rounded-xl p-6 mb-6">
          <h3 className="font-heading text-base text-(--fg) mb-5">Acompanha o teu pedido</h3>
          <div className="flex items-center gap-0 mb-3">
            {['Pedido Criado', payMethod === 'pix' ? 'Aguardando Pix' : 'Pagamento', 'Em Separação', 'Em Trânsito', 'Entregue'].map((label, i) => (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${i === 0 ? 'bg-brand-green border-brand-green' : i === 1 ? 'bg-brand-orange border-brand-orange animate-pulse' : 'border-(--border)'}`} />
                  <span className={`text-[9px] font-ui font-bold mt-1.5 text-center leading-tight ${i === 0 ? 'text-brand-green' : i === 1 ? 'text-brand-orange' : 'text-(--fg-faint)'}`}>{label}</span>
                </div>
                {i < 4 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${i === 0 ? 'bg-brand-green' : 'bg-(--border)'}`} />}
              </div>
            ))}
          </div>
          <div className="bg-(--bg-sunk) rounded-md px-3 py-2 text-xs text-(--fg-muted)">
            ⚡ Após o pagamento, o pedido sai em até 24h úteis. Previsão: <strong className="text-(--fg)">em 2 dias úteis</strong>
          </div>
        </div>

        {/* Items summary */}
        <div className="bg-(--bg-elev) border border-(--border) rounded-xl p-6 mb-6">
          <h3 className="font-heading text-base text-(--fg) mb-4">Itens do pedido</h3>
          {cart.length > 0 ? cart.map(item => (
            <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3 py-2.5 border-b border-(--border) last:border-0">
              <img src={item.product.images[0]?.url} alt="" className="w-12 h-12 rounded-md object-cover bg-(--bg-sunk)" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-(--fg) truncate">{item.product.name} "{item.product.colorway}"</div>
                <div className="text-[11px] text-(--fg-muted)">Tam {item.size} · {item.quantity}×</div>
              </div>
              <div className="text-sm font-bold font-ui text-(--fg)">{(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            </div>
          )) : (
            <p className="text-sm text-(--fg-muted)">Pedido #{orderNumber} registado.</p>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button variant="secondary" onClick={() => navigate('/')}>Continuar comprando</Button>
          <Button variant="ghost" onClick={() => navigate('/conta')}>Ver meus pedidos</Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/carrinho');
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/carrinho" className="flex items-center gap-1.5 text-sm text-(--fg-muted) hover:text-brand-orange transition-colors">
          <ArrowLeft size={16} />Carrinho
        </Link>
        <ChevronRight size={14} className="text-(--fg-faint)" />
        <span className="text-sm font-semibold font-ui text-(--fg)">Checkout</span>
      </div>

      <div className="flex items-center gap-2 mb-6 text-xs text-(--fg-muted)">
        <Lock size={12} className="text-brand-green" />
        <span>Ambiente 100% seguro — SSL ativado</span>
      </div>

      <StepIndicator current={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 'address' && (
            <div className="space-y-5">
              <h2 className="font-heading text-lg text-(--fg)">Dados de entrega</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome completo" value={address.name} onChange={handleAddr('name')} placeholder="João da Silva" />
                <Field label="E-mail" type="email" value={address.email} onChange={handleAddr('email')} placeholder="joao@email.com" />
                <Field label="Telefone / WhatsApp" value={address.phone} onChange={handleAddr('phone')} placeholder="(11) 99999-0000" />
                <Field label="CEP" value={address.cep} onChange={handleAddr('cep')} placeholder="00000-000" maxLength={9} />
              </div>

              <Field label="Rua / Avenida" value={address.street} onChange={handleAddr('street')} placeholder="Av. Paulista" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Número" value={address.number} onChange={handleAddr('number')} placeholder="1000" />
                <Field label="Complemento" value={address.complement} onChange={handleAddr('complement')} placeholder="Ap. 42" />
                <Field label="Bairro" value={address.district} onChange={handleAddr('district')} placeholder="Bela Vista" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Cidade" value={address.city} onChange={handleAddr('city')} placeholder="São Paulo" />
                <div>
                  <label className="block text-xs font-semibold font-ui text-(--fg-muted) uppercase tracking-wider mb-1.5">Estado</label>
                  <select value={address.state} onChange={handleAddr('state')}
                    className="w-full h-10 px-3 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) focus:outline-none focus:border-brand-orange transition-all">
                    {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button size="lg" fullWidth onClick={() => setStep('payment')} icon={<ChevronRight size={18} />}>
                Continuar para pagamento
              </Button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-5">
              <h2 className="font-heading text-lg text-(--fg)">Forma de pagamento</h2>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'pix' as PayMethod, icon: <QrCode size={20} />, label: 'Pix', sub: '5% OFF' },
                  { key: 'credit' as PayMethod, icon: <CreditCard size={20} />, label: 'Cartão', sub: '12× sem juros' },
                  { key: 'boleto' as PayMethod, icon: <Smartphone size={20} />, label: 'Boleto', sub: '1-3 dias úteis' },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setPayMethod(m.key)}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-lg border-2 transition-all ${
                      payMethod === m.key
                        ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                        : 'border-(--border) text-(--fg-muted) hover:border-(--border-strong)'
                    }`}
                  >
                    {m.icon}
                    <span className="text-xs font-bold font-ui">{m.label}</span>
                    <span className="text-[10px] font-ui">{m.sub}</span>
                  </button>
                ))}
              </div>

              {payMethod === 'pix' && (
                <div className="bg-brand-green/10 border border-brand-green/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-brand-green font-semibold text-sm mb-1">
                    <Check size={16} /> Melhor opção — você economiza {(total * 0.05).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <p className="text-xs text-(--fg-muted)">O QR Code Pix será gerado após confirmar o pedido. Aprovação imediata.</p>
                </div>
              )}

              {payMethod === 'credit' && (
                <div className="space-y-4">
                  <Field label="Número do cartão" value={card.number} onChange={handleCard('number')} placeholder="0000 0000 0000 0000" maxLength={19} />
                  <Field label="Nome no cartão" value={card.name} onChange={handleCard('name')} placeholder="JOÃO DA SILVA" />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Validade" value={card.expiry} onChange={handleCard('expiry')} placeholder="MM/AA" maxLength={5} />
                    <Field label="CVV" value={card.cvv} onChange={handleCard('cvv')} placeholder="123" maxLength={4} type="password" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold font-ui text-(--fg-muted) uppercase tracking-wider mb-1.5">Parcelas</label>
                    <select value={card.installments} onChange={handleCard('installments')}
                      className="w-full h-10 px-3 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) focus:outline-none focus:border-brand-orange transition-all">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}× de {(total / n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} {n === 1 ? '(à vista)' : 'sem juros'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {payMethod === 'boleto' && (
                <div className="bg-(--bg-sunk) rounded-lg p-4 text-sm text-(--fg-muted)">
                  <p>O boleto será gerado após confirmar. O prazo de compensação é de 1-3 dias úteis. Não há desconto Pix nessa modalidade.</p>
                  <p className="mt-2 text-xs">Valor: <strong className="text-(--fg)">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('address')}>Voltar</Button>
                <Button fullWidth onClick={() => setStep('review')} icon={<ChevronRight size={18} />}>Revisar pedido</Button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-5">
              <h2 className="font-heading text-lg text-(--fg)">Revisão do pedido</h2>

              <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-ui text-(--fg)">Endereço de entrega</h3>
                  <button onClick={() => setStep('address')} className="text-xs text-brand-orange font-semibold">Editar</button>
                </div>
                <div className="text-sm text-(--fg-muted) space-y-0.5">
                  <p>{address.name}</p>
                  <p>{address.street}, {address.number} {address.complement && `- ${address.complement}`}</p>
                  <p>{address.district} — {address.city}/{address.state} · CEP {address.cep}</p>
                  <p>{address.phone}</p>
                </div>
              </div>

              <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold font-ui text-(--fg)">Pagamento</h3>
                  <button onClick={() => setStep('payment')} className="text-xs text-brand-orange font-semibold">Editar</button>
                </div>
                <div className="text-sm text-(--fg-muted)">
                  {payMethod === 'pix' && `Pix — ${pixTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (5% OFF)`}
                  {payMethod === 'credit' && `Cartão •••• ${card.number.slice(-4) || '0000'} — ${card.installments}× de ${(total / parseInt(card.installments)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                  {payMethod === 'boleto' && `Boleto bancário — ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                </div>
              </div>

              <div className="bg-(--bg-elev) border border-(--border) rounded-lg divide-y divide-(--border) overflow-hidden">
                {cart.map(item => (
                  <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3 p-4">
                    <img src={item.product.images[0]?.url} alt="" className="w-14 h-14 rounded-md object-cover bg-(--bg-sunk)" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-(--fg) truncate">{item.product.name} "{item.product.colorway}"</div>
                      <div className="text-[11px] text-(--fg-muted)">Tam {item.size} · {item.product.brand} · ×{item.quantity}</div>
                    </div>
                    <div className="text-sm font-bold font-ui text-(--fg) whitespace-nowrap">
                      {(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('payment')}>Voltar</Button>
                <Button fullWidth size="lg" onClick={placeOrder} icon={<Lock size={16} />}>
                  Confirmar pedido — {payMethod === 'pix'
                    ? pixTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Button>
              </div>
              <p className="text-center text-[10px] text-(--fg-faint)">Ao confirmar, aceitas os nossos Termos de Uso e Política de Privacidade</p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-(--bg-elev) border border-(--border) rounded-xl p-5 sticky top-32">
            <h3 className="font-heading text-sm text-(--fg) mb-4">Resumo ({cart.length} iten{cart.length > 1 ? 's' : ''})</h3>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-2">
                  <div className="relative">
                    <img src={item.product.images[0]?.url} alt="" className="w-10 h-10 rounded object-cover bg-(--bg-sunk)" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-(--fg) text-(--bg) text-[9px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 text-xs text-(--fg) truncate">{item.product.name}</div>
                  <div className="text-xs font-semibold text-(--fg)">{(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-(--border) pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-(--fg-muted)">
                <span>Subtotal</span><span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-(--fg-muted)">
                <span>Frete</span>
                <span className={freeShipping ? 'text-brand-green font-semibold' : ''}>{freeShipping ? 'GRÁTIS' : 'A calcular'}</span>
              </div>
              {payMethod === 'pix' && (
                <div className="flex justify-between text-brand-green text-xs font-semibold">
                  <span>Desconto Pix (5%)</span>
                  <span>-{(total * 0.05).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              )}
              <div className="border-t border-(--border) pt-2 flex justify-between font-bold text-(--fg)">
                <span>Total</span>
                <span className="font-display text-xl">
                  {payMethod === 'pix'
                    ? pixTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', maxLength }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold font-ui text-(--fg-muted) uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full h-10 px-3 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
      />
    </div>
  );
}
