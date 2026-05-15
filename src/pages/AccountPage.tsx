import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin, CreditCard, Star, LogOut, ChevronRight, Truck, Check } from 'lucide-react';
import { useStore } from '../store';
import { products } from '../data/products';

type Tab = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings';

const mockOrders = [
  { id: '#GS-1042', date: '06/05/2026', items: 'Phantom GX III Elite · Tam 41', total: 529.99, status: 'em_transito', tracking: 'BR123456789' },
  { id: '#GS-0987', date: '14/04/2026', items: 'F50 Elite FG "Solar Yellow" · Tam 42', total: 799.99, status: 'entregue', tracking: 'BR987654321' },
  { id: '#GS-0754', date: '02/03/2026', items: 'Future 8 Ultimate · Tam 41', total: 749.99, status: 'entregue', tracking: 'BR111222333' },
  { id: '#GS-0612', date: '15/01/2026', items: 'Meias Nike Elite × 3', total: 149.97, status: 'entregue', tracking: 'BR444555666' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pago: { label: 'Pago', color: 'text-brand-teal bg-brand-teal/10' },
  em_separacao: { label: 'Em separação', color: 'text-brand-yellow bg-brand-yellow/10' },
  em_transito: { label: 'Em trânsito', color: 'text-brand-orange bg-brand-orange/10' },
  entregue: { label: 'Entregue', color: 'text-brand-green bg-brand-green/10' },
  cancelado: { label: 'Cancelado', color: 'text-brand-red bg-brand-red/10' },
};

export function AccountPage() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useStore();
  const [tab, setTab] = useState<Tab>('overview');

  const wishedProducts = products.filter(p => wishlist.includes(p.id));
  const totalSpent = mockOrders.reduce((a, o) => a + o.total, 0);

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'overview', icon: <Star size={16} />, label: 'Visão geral' },
    { key: 'orders', icon: <Package size={16} />, label: `Pedidos (${mockOrders.length})` },
    { key: 'wishlist', icon: <Heart size={16} />, label: `Favoritos (${wishedProducts.length})` },
    { key: 'addresses', icon: <MapPin size={16} />, label: 'Endereços' },
    { key: 'settings', icon: <CreditCard size={16} />, label: 'Configurações' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-brand-orange flex items-center justify-center text-white font-display text-2xl shrink-0">L</div>
        <div>
          <h1 className="font-heading text-xl text-(--fg)">Léo Mendes</h1>
          <p className="text-sm text-(--fg-muted)">leo@exemplo.com · Cliente desde Jan/2024</p>
          <span className="inline-block mt-1 text-[10px] font-bold font-ui text-brand-yellow bg-brand-yellow/10 px-2 py-0.5 rounded-full tracking-widest">★ CLUBE GALVÃO'S · VIP</span>
        </div>
        <button onClick={() => navigate('/login')} className="ml-auto flex items-center gap-1.5 text-xs text-(--fg-faint) hover:text-brand-red transition-colors">
          <LogOut size={14} />Sair
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-0 border-b border-(--border) mb-8 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold font-ui border-b-2 whitespace-nowrap transition-all ${
              tab === t.key ? 'text-brand-orange border-brand-orange' : 'text-(--fg-muted) border-transparent hover:text-(--fg)'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total gasto (LTV)', value: totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: 'text-brand-green' },
              { label: 'Pedidos realizados', value: mockOrders.length.toString(), color: 'text-(--fg)' },
              { label: 'Ticket médio', value: (totalSpent / mockOrders.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: 'text-(--fg)' },
              { label: 'Favoritos', value: wishedProducts.length.toString(), color: 'text-brand-orange' },
            ].map(s => (
              <div key={s.label} className="bg-(--bg-elev) border border-(--border) rounded-lg p-4">
                <div className="text-xs text-(--fg-muted) font-ui mb-1">{s.label}</div>
                <div className={`font-display text-2xl ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Last order */}
          {mockOrders[0] && (
            <div>
              <h3 className="font-heading text-base text-(--fg) mb-3">Último pedido</h3>
              <OrderCard order={mockOrders[0]} onViewAll={() => setTab('orders')} />
            </div>
          )}

          {/* Wishlist preview */}
          {wishedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-base text-(--fg)">Favoritos</h3>
                <button onClick={() => setTab('wishlist')} className="text-xs text-brand-orange font-semibold">Ver todos →</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {wishedProducts.slice(0, 4).map(p => (
                  <div key={p.id} className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
                    <img src={p.images[0]?.url} alt={p.name} className="w-full aspect-square object-cover bg-(--bg-sunk)" />
                    <div className="p-2.5">
                      <div className="text-[10px] text-(--fg-faint) font-bold font-ui">{p.brand}</div>
                      <div className="text-xs font-semibold text-(--fg) truncate">{p.name}</div>
                      <div className="text-xs font-bold font-ui text-(--fg) mt-1">{p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {mockOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Wishlist */}
      {tab === 'wishlist' && (
        <div>
          {wishedProducts.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={40} className="mx-auto text-(--border-strong) mb-3" />
              <p className="text-(--fg-muted)">Sem favoritos ainda.</p>
              <button onClick={() => navigate('/produtos')} className="mt-4 text-sm font-semibold text-brand-orange">Ver produtos →</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishedProducts.map(p => (
                <div key={p.id} className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden group relative">
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-brand-red/90 text-white rounded-full flex items-center justify-center text-xs hover:bg-brand-red transition-all"
                  >×</button>
                  <img src={p.images[0]?.url} alt={p.name} className="w-full aspect-square object-cover bg-(--bg-sunk)" />
                  <div className="p-3">
                    <div className="text-[10px] font-bold font-ui text-(--fg-faint)">{p.brand}</div>
                    <div className="text-sm font-semibold text-(--fg) leading-tight">{p.name}</div>
                    <div className="text-sm font-bold font-ui text-(--fg) mt-1.5">{p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    <button
                      onClick={() => navigate(`/produto/${p.slug}`)}
                      className="mt-2 w-full h-8 bg-brand-orange text-white text-xs font-semibold font-ui rounded-sm hover:bg-brand-orange-600 transition-all"
                    >Ver produto</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Addresses */}
      {tab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base text-(--fg)">Meus endereços</h3>
            <button className="text-xs text-brand-orange font-semibold">+ Adicionar</button>
          </div>
          {[
            { label: 'Casa', street: 'Av. Paulista, 1000 — Ap. 42', city: 'São Paulo/SP · 01310-100', default: true },
            { label: 'Trabalho', street: 'Rua Oscar Freire, 500 — Sala 12', city: 'São Paulo/SP · 01426-001', default: false },
          ].map(addr => (
            <div key={addr.label} className="bg-(--bg-elev) border border-(--border) rounded-lg p-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-brand-orange" />
                  <span className="text-sm font-bold font-ui text-(--fg)">{addr.label}</span>
                  {addr.default && <span className="text-[10px] font-bold text-brand-teal bg-brand-teal/10 px-1.5 py-0.5 rounded-full">PADRÃO</span>}
                </div>
                <p className="text-sm text-(--fg-muted)">{addr.street}</p>
                <p className="text-xs text-(--fg-faint)">{addr.city}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-xs text-brand-orange font-semibold">Editar</button>
                <button className="text-xs text-brand-red font-semibold">Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="space-y-6 max-w-md">
          <div>
            <h3 className="font-heading text-base text-(--fg) mb-4">Dados pessoais</h3>
            <div className="space-y-3">
              {[
                { label: 'Nome', value: 'Léo Mendes' },
                { label: 'E-mail', value: 'leo@exemplo.com' },
                { label: 'Telefone', value: '(11) 9 8765-4321' },
                { label: 'CPF', value: '123.456.789-00' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-semibold font-ui text-(--fg-muted) uppercase tracking-wider">{f.label}</label>
                  <div className="mt-1 h-10 px-3 bg-(--bg-sunk) border border-(--border) rounded-md flex items-center text-sm text-(--fg)">{f.value}</div>
                </div>
              ))}
              <button className="h-10 px-4 bg-brand-orange text-white text-sm font-semibold font-ui rounded-md hover:bg-brand-orange-600 transition-all mt-2">Salvar alterações</button>
            </div>
          </div>

          <div className="border-t border-(--border) pt-6">
            <h3 className="font-heading text-base text-(--fg) mb-4">Notificações</h3>
            {[
              { label: 'Promoções e ofertas', checked: true },
              { label: 'Status de pedidos', checked: true },
              { label: 'Novos lançamentos', checked: false },
            ].map(n => (
              <label key={n.label} className="flex items-center justify-between py-3 border-b border-(--border) cursor-pointer">
                <span className="text-sm text-(--fg)">{n.label}</span>
                <input type="checkbox" defaultChecked={n.checked} className="accent-brand-orange w-4 h-4 cursor-pointer" />
              </label>
            ))}
          </div>

          <div className="border-t border-(--border) pt-6">
            <button className="text-sm font-semibold text-brand-red hover:text-red-700 transition-colors flex items-center gap-2">
              <LogOut size={16} />Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onViewAll }: { order: typeof mockOrders[0]; onViewAll?: () => void }) {
  const cfg = statusConfig[order.status];
  return (
    <div className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-brand-orange">{order.id}</span>
          <span className="text-xs text-(--fg-faint)">{order.date}</span>
          <span className={`text-[10px] font-bold font-ui px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
        </div>
        <div className="text-sm font-bold font-ui text-(--fg)">
          {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-(--fg)">{order.items}</p>
          {order.status === 'em_transito' && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-brand-teal">
              <Truck size={12} />
              <span>Rastreio: <strong>{order.tracking}</strong></span>
            </div>
          )}
          {order.status === 'entregue' && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-brand-green">
              <Check size={12} />
              <span>Entregue com sucesso</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {order.status === 'entregue' && (
            <button className="text-xs font-semibold font-ui text-brand-teal border border-brand-teal/30 px-3 py-1.5 rounded-sm hover:bg-brand-teal/10 transition-all">
              Comprar novamente
            </button>
          )}
          <button className="flex items-center gap-1 text-xs font-semibold font-ui text-(--fg-muted) hover:text-brand-orange transition-colors">
            Detalhes <ChevronRight size={12} />
          </button>
        </div>
      </div>
      {onViewAll && (
        <div className="px-4 py-2 border-t border-(--border) bg-(--bg-sunk)">
          <button onClick={onViewAll} className="text-xs text-brand-orange font-semibold">Ver todos os pedidos →</button>
        </div>
      )}
    </div>
  );
}
