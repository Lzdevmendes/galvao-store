import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart3,
  Settings, Bell, Plus, TrendingUp, TrendingDown, Search, Menu, X,
  Edit2, Trash2, Eye, ChevronRight, AlertCircle, Check, Filter,
  Download, RefreshCw, Phone, Mail
} from 'lucide-react';
import { products } from '../data/products';

type AdminScreen = 'dashboard' | 'products' | 'product-edit' | 'product-new' | 'orders' | 'order-detail' | 'inventory' | 'customers' | 'customer-detail' | 'coupons' | 'reports' | 'settings';

const kpis = [
  { label: 'Vendas hoje', value: 'R$ 14.892', delta: '+23%', up: true, sub: 'vs ontem' },
  { label: 'Pedidos hoje', value: '42', delta: '+18%', up: true, sub: 'vs ontem' },
  { label: 'Ticket médio', value: 'R$ 354', delta: '+4%', up: true, sub: 'no mês' },
  { label: 'Taxa de conversão', value: '3,8%', delta: '-0,4pp', up: false, sub: 'vs semana passada' },
];

const mockOrders = [
  { id: '#GS-1042', customer: 'Lucas Ferreira', email: 'lucas@email.com', product: 'Phantom GX III Elite', size: 41, price: 529.99, status: 'pago', date: '06/05/2026 09:42', payment: 'Pix' },
  { id: '#GS-1041', customer: 'Marcos Oliveira', email: 'marcos@email.com', product: 'F50 Elite FG', size: 42, price: 799.99, status: 'enviado', date: '06/05/2026 08:15', payment: 'Cartão 12×' },
  { id: '#GS-1040', customer: 'Rafael Santos', email: 'rafael@email.com', product: 'Future 8 Ultimate', size: 40, price: 749.99, status: 'entregue', date: '05/05/2026 14:30', payment: 'Pix' },
  { id: '#GS-1039', customer: 'Diego Costa', email: 'diego@email.com', product: 'Predator Accuracy', size: 43, price: 689.99, status: 'cancelado', date: '05/05/2026 10:00', payment: 'Boleto' },
  { id: '#GS-1038', customer: 'Bruno Mendes', email: 'bruno@email.com', product: 'Mercurial Vapor XV', size: 44, price: 869.99, status: 'pago', date: '04/05/2026 18:22', payment: 'Cartão 6×' },
  { id: '#GS-1037', customer: 'Ana Costa', email: 'ana@email.com', product: 'Copa Pure II Elite IC', size: 38, price: 399.99, status: 'separacao', date: '04/05/2026 15:10', payment: 'Pix' },
  { id: '#GS-1036', customer: 'Thiago Lima', email: 'thiago@email.com', product: 'King Platinum 21 FG', size: 42, price: 549.99, status: 'enviado', date: '03/05/2026 09:00', payment: 'Cartão 3×' },
  { id: '#GS-1035', customer: 'Camila Rocha', email: 'camila@email.com', product: 'Ultraboost 24', size: 39, price: 899.99, status: 'entregue', date: '01/05/2026 11:45', payment: 'Pix' },
];

const mockCustomers = [
  { id: 'C001', name: 'Lucas Ferreira', email: 'lucas@email.com', phone: '(11) 99999-1111', orders: 8, ltv: 4290, lastOrder: '06/05/2026', status: 'vip', score: 92 },
  { id: 'C002', name: 'Marcos Oliveira', email: 'marcos@email.com', phone: '(11) 99999-2222', orders: 12, ltv: 8247, lastOrder: '06/05/2026', status: 'vip', score: 94 },
  { id: 'C003', name: 'Rafael Santos', email: 'rafael@email.com', phone: '(11) 99999-3333', orders: 3, ltv: 1890, lastOrder: '05/05/2026', status: 'regular', score: 65 },
  { id: 'C004', name: 'Diego Costa', email: 'diego@email.com', phone: '(11) 99999-4444', orders: 1, ltv: 689, lastOrder: '05/05/2026', status: 'novo', score: 42 },
  { id: 'C005', name: 'Bruno Mendes', email: 'bruno@email.com', phone: '(11) 99999-5555', orders: 6, ltv: 3210, lastOrder: '04/05/2026', status: 'regular', score: 78 },
];

const mockCoupons = [
  { code: 'GALVAO10', type: 'percent', value: 10, uses: 48, limit: 100, expires: '30/06/2026', active: true },
  { code: 'FRETEGRATIS', type: 'shipping', value: 0, uses: 23, limit: 50, expires: '15/05/2026', active: true },
  { code: 'PIX15', type: 'percent', value: 15, uses: 100, limit: 100, expires: '01/05/2026', active: false },
  { code: 'NIKE20', type: 'fixed', value: 20, uses: 12, limit: 30, expires: '31/12/2026', active: true },
];

const statusCfg: Record<string, { label: string; color: string }> = {
  pago: { label: 'Pago', color: 'text-brand-teal bg-brand-teal/10' },
  separacao: { label: 'Em separação', color: 'text-brand-yellow bg-brand-yellow/10' },
  enviado: { label: 'Enviado', color: 'text-brand-orange bg-brand-orange/10' },
  entregue: { label: 'Entregue', color: 'text-brand-green bg-brand-green/10' },
  cancelado: { label: 'Cancelado', color: 'text-brand-red bg-brand-red/10' },
};

const customerStatusCfg: Record<string, { label: string; color: string }> = {
  vip: { label: 'VIP', color: 'text-brand-yellow bg-brand-yellow/10' },
  regular: { label: 'Regular', color: 'text-brand-teal bg-brand-teal/10' },
  novo: { label: 'Novo', color: 'text-brand-orange bg-brand-orange/10' },
};

const navItems: { screen: AdminScreen; icon: React.ReactNode; label: string; badge?: number; group: string }[] = [
  { group: 'Operação', screen: 'dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
  { group: 'Operação', screen: 'orders', icon: <ShoppingCart size={15} />, label: 'Pedidos', badge: 14 },
  { group: 'Operação', screen: 'inventory', icon: <Package size={15} />, label: 'Estoque', badge: 8 },
  { group: 'Catálogo', screen: 'products', icon: <Package size={15} />, label: 'Produtos', badge: products.length },
  { group: 'Marketing', screen: 'customers', icon: <Users size={15} />, label: 'Clientes' },
  { group: 'Marketing', screen: 'coupons', icon: <Tag size={15} />, label: 'Cupons' },
  { group: 'Marketing', screen: 'reports', icon: <BarChart3 size={15} />, label: 'Relatórios' },
  { group: 'Sistema', screen: 'settings', icon: <Settings size={15} />, label: 'Configurações' },
];

function MiniChart() {
  const points = [140, 130, 138, 110, 120, 95, 105, 78, 90, 65, 75, 50, 60, 80, 50, 60, 35, 45, 25, 40, 20];
  const w = 560; const h = 160;
  const pts = points.map((y, i) => `${(i / (points.length - 1)) * w},${y}`).join(' ');
  const ptsPrev = [160, 155, 145, 150, 130, 135, 120, 125, 110, 115, 100, 105, 90, 95, 80, 85, 75, 80, 65, 70, 60].map((y, i) => `${(i / (points.length - 1)) * w},${y}`).join(' ');
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-40">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F26B1F" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F26B1F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 80, 120].map(y => <line key={y} x1="0" y1={y} x2={w} y2={y} stroke="var(--border)" strokeDasharray="3 6" />)}
        <polyline points={`${pts} ${w},${h} 0,${h}`} fill="url(#grad)" />
        <polyline points={pts} fill="none" stroke="#F26B1F" strokeWidth="2.5" strokeLinejoin="round" />
        <polyline points={ptsPrev} fill="none" stroke="#1FB5A8" strokeWidth="1.5" strokeDasharray="4 4" strokeLinejoin="round" />
        <circle cx={w} cy={points[points.length - 1]} r="5" fill="#F26B1F" />
        <circle cx={w} cy={points[points.length - 1]} r="9" fill="#F26B1F" opacity="0.2" />
      </svg>
      <div className="absolute top-0 right-0 flex gap-3 text-[10px] font-ui text-(--fg-muted)">
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-brand-orange" />Atual</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-brand-teal border-t border-dashed border-brand-teal" />Anterior</div>
      </div>
    </div>
  );
}

function ProductForm({ onCancel }: { onCancel: () => void }) {
  const [form, setForm] = useState({ name: '', brand: 'Nike', category: 'Campo (FG)', price: '', originalPrice: '', description: '', sku: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminField label="Nome do produto" value={form.name} onChange={set('name')} placeholder="Ex: Phantom GX III Elite FG" />
        <AdminField label="SKU" value={form.sku} onChange={set('sku')} placeholder="NK-PHT-GX3-EL-001" />
        <div>
          <label className="admin-label">Marca</label>
          <select value={form.brand} onChange={set('brand')} className="admin-select">
            {['Nike', 'Adidas', 'Puma', 'Umbro', 'New Balance', 'Mizuno', 'Joma'].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="admin-label">Categoria</label>
          <select value={form.category} onChange={set('category')} className="admin-select">
            {['Campo (FG)', 'Society (SG)', 'Futsal', 'Tênis Casual', 'Corrida', 'Camisas', 'Meias', 'Acessórios'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <AdminField label="Preço atual (R$)" type="number" value={form.price} onChange={set('price')} placeholder="529.99" />
        <AdminField label="Preço original (R$)" type="number" value={form.originalPrice} onChange={set('originalPrice')} placeholder="619.99 (opcional)" />
      </div>
      <div>
        <label className="admin-label">Descrição</label>
        <textarea value={form.description} onChange={set('description')} rows={4}
          className="w-full px-3 py-2 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange resize-none transition-all"
          placeholder="Descreve o produto..." />
      </div>
      <div className="bg-(--bg-sunk) border border-dashed border-(--border) rounded-lg p-8 text-center">
        <Package size={32} className="mx-auto text-(--fg-faint) mb-2" />
        <p className="text-sm text-(--fg-muted)">Clica ou arrasta imagens aqui</p>
        <p className="text-xs text-(--fg-faint) mt-1">PNG, JPG, WEBP até 5MB cada</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="h-9 px-4 border border-(--border) rounded-md text-sm font-semibold font-ui text-(--fg-muted) hover:bg-(--bg-sunk) transition-all">Cancelar</button>
        <button className="h-9 px-5 bg-brand-orange text-white text-sm font-semibold font-ui rounded-md hover:bg-brand-orange-600 transition-all">Salvar produto</button>
      </div>
    </div>
  );
}

function AdminField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold font-ui text-(--fg-muted) uppercase tracking-widest mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full h-9 px-3 bg-(--bg-sunk) border border-(--border) rounded-md text-sm text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange transition-all" />
    </div>
  );
}

export function AdminPage() {
  const [screen, setScreen] = useState<AdminScreen>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const groups = [...new Set(navItems.map(n => n.group))];

  const filteredOrders = mockOrders.filter(o =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.product.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-(--bg) overflow-hidden" data-theme="dark">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-52' : 'w-0 overflow-hidden'} transition-all duration-200 bg-ink-950 flex flex-col border-r border-ink-800 shrink-0`}>
        <div className="p-4 border-b border-ink-800 shrink-0">
          <div className="font-display text-xl text-brand-orange tracking-wider">GALVÃO'S</div>
          <div className="text-[9px] font-bold font-ui text-ink-700 tracking-widest uppercase mt-0.5">ADMIN PANEL</div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {groups.map(group => (
            <div key={group}>
              <div className="text-[9px] font-bold font-ui text-ink-700 tracking-widest uppercase px-2 py-1.5 mt-3">{group}</div>
              {navItems.filter(n => n.group === group).map(item => (
                <button
                  key={item.screen}
                  onClick={() => setScreen(item.screen)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-ui font-medium mb-0.5 transition-all ${
                    screen === item.screen || (screen === 'product-edit' && item.screen === 'products') || (screen === 'product-new' && item.screen === 'products') || (screen === 'order-detail' && item.screen === 'orders') || (screen === 'customer-detail' && item.screen === 'customers')
                      ? 'bg-brand-orange/15 text-brand-orange'
                      : 'text-ink-400 hover:bg-ink-800 hover:text-ink-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-[9px] font-bold bg-ink-800 text-ink-400 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-ink-800 shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-bold font-ui shrink-0">A</div>
            <div className="min-w-0">
              <div className="text-xs font-semibold font-ui text-ink-100 truncate">Anderson Galvão</div>
              <div className="text-[10px] text-ink-600">Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="h-12 border-b border-(--border) bg-ink-900 flex items-center gap-3 px-4 shrink-0">
          <button onClick={() => setSidebarOpen(o => !o)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-ink-800 transition-all text-ink-400">
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
          <div className="text-[10px] font-bold font-ui text-ink-500 tracking-widest uppercase">
            {navItems.find(i => i.screen === screen || (screen === 'product-edit' && i.screen === 'products') || (screen === 'product-new' && i.screen === 'products') || (screen === 'order-detail' && i.screen === 'orders') || (screen === 'customer-detail' && i.screen === 'customers'))?.label ?? 'Admin'}
            {screen === 'product-edit' && ' · EDITAR PRODUTO'}
            {screen === 'product-new' && ' · NOVO PRODUTO'}
            {screen === 'order-detail' && selectedOrder && ` · ${selectedOrder.id}`}
            {screen === 'customer-detail' && selectedCustomer && ` · ${selectedCustomer.name.toUpperCase()}`}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-600" />
              <input placeholder="Buscar..." className="h-7 pl-8 pr-3 text-xs bg-ink-800 border border-ink-700 rounded text-ink-100 placeholder:text-ink-600 focus:outline-none focus:border-brand-orange w-40 transition-all" />
            </div>
            <button className="relative w-7 h-7 rounded flex items-center justify-center text-ink-400 hover:bg-ink-800 transition-all">
              <Bell size={14} />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-brand-orange rounded-full" />
            </button>
            <button onClick={() => setScreen('product-new')} className="flex items-center gap-1.5 h-7 px-3 bg-brand-orange text-white text-[11px] font-semibold font-ui rounded hover:bg-brand-orange-600 transition-all">
              <Plus size={13} />Novo produto
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-(--bg)">

          {/* === DASHBOARD === */}
          {screen === 'dashboard' && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="font-heading text-xl text-(--fg)">Bom dia, Anderson 👊</h1>
                  <p className="text-sm text-(--fg-muted)">Quarta, 14 de maio · R$ 4.290 vendidos enquanto dormias.</p>
                </div>
                <div className="flex gap-2">
                  <select className="h-8 px-3 text-xs bg-(--bg-elev) border border-(--border) rounded text-(--fg) font-ui focus:outline-none focus:border-brand-orange">
                    <option>Últimos 7 dias</option><option>Últimos 30 dias</option><option>Mês atual</option>
                  </select>
                  <button className="h-8 px-3 border border-(--border) rounded text-xs font-ui text-(--fg-muted) hover:bg-(--bg-sunk) flex items-center gap-1.5 transition-all">
                    <Download size={12} />Exportar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((kpi, i) => (
                  <div key={kpi.label} className={`rounded-lg p-4 border ${i === 0 ? 'bg-brand-orange border-brand-orange-600 text-white' : 'bg-(--bg-elev) border-(--border)'}`}>
                    <div className={`text-[10px] font-ui font-semibold ${i === 0 ? 'text-white/70' : 'text-(--fg-muted)'}`}>{kpi.label}</div>
                    <div className={`font-display text-3xl mt-1 ${i === 0 ? 'text-white' : 'text-(--fg)'}`}>{kpi.value}</div>
                    <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${kpi.up ? 'text-brand-green' : 'text-brand-red'} ${i === 0 ? 'text-white/60!' : ''}`}>
                      {kpi.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{kpi.delta} {kpi.sub}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-(--bg-elev) border border-(--border) rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold font-ui text-(--fg)">Vendas — últimos 30 dias</h3>
                    <div className="flex gap-1.5">
                      {['R$', 'Pedidos', 'Itens'].map((f, i) => (
                        <button key={f} className={`text-[11px] font-ui px-2 py-0.5 rounded ${i === 0 ? 'bg-brand-orange/15 text-brand-orange' : 'text-(--fg-muted)'}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <MiniChart />
                </div>

                <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-5">
                  <h3 className="text-sm font-bold font-ui text-(--fg) mb-4">Top produtos</h3>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono text-(--fg-faint) w-4 text-right shrink-0">{i + 1}</span>
                        <img src={p.images[0]?.url} alt="" className="w-8 h-8 rounded object-cover bg-(--bg-sunk) shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-(--fg) truncate">{p.name}</div>
                          <div className="text-[10px] text-(--fg-faint)">{p.brand} · {p.reviewCount} vendas</div>
                        </div>
                        <div className="text-[11px] font-bold font-ui text-brand-green shrink-0">
                          {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border)">
                  <h3 className="text-sm font-bold font-ui text-(--fg)">Pedidos recentes</h3>
                  <button onClick={() => setScreen('orders')} className="text-[11px] font-semibold font-ui text-brand-orange hover:text-brand-orange-600">Ver todos →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-(--border)">
                      {['Pedido', 'Cliente', 'Produto', 'Tam.', 'Valor', 'Status', 'Pagamento'].map(h => (
                        <th key={h} className="text-left py-2.5 px-4 text-[9px] font-bold font-ui text-(--fg-faint) tracking-widest uppercase">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {mockOrders.slice(0, 5).map(o => (
                        <tr key={o.id} onClick={() => { setSelectedOrder(o); setScreen('order-detail'); }} className="border-b border-(--border) hover:bg-(--bg-sunk) transition-colors cursor-pointer">
                          <td className="py-2.5 px-4 font-mono text-xs text-brand-orange">{o.id}</td>
                          <td className="py-2.5 px-4 text-xs text-(--fg)">{o.customer}</td>
                          <td className="py-2.5 px-4 text-xs text-(--fg-muted) max-w-32 truncate">{o.product}</td>
                          <td className="py-2.5 px-4 text-xs text-(--fg-muted)">{o.size}</td>
                          <td className="py-2.5 px-4 text-xs font-semibold text-(--fg)">{o.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="py-2.5 px-4"><span className={`text-[9px] font-bold font-ui px-1.5 py-0.5 rounded-full ${statusCfg[o.status]?.color}`}>{statusCfg[o.status]?.label}</span></td>
                          <td className="py-2.5 px-4 text-[11px] text-(--fg-muted)">{o.payment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alerts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-brand-red shrink-0 mt-0.5" />
                  <div><div className="text-xs font-bold text-brand-red">8 produtos com estoque crítico</div><div className="text-[11px] text-(--fg-muted) mt-0.5">Repor antes de esgotar</div></div>
                </div>
                <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-brand-yellow shrink-0 mt-0.5" />
                  <div><div className="text-xs font-bold text-brand-yellow">3 pedidos aguardam aprovação</div><div className="text-[11px] text-(--fg-muted) mt-0.5">Análise manual necessária</div></div>
                </div>
                <div className="bg-brand-green/10 border border-brand-green/30 rounded-lg p-4 flex items-start gap-3">
                  <Check size={16} className="text-brand-green shrink-0 mt-0.5" />
                  <div><div className="text-xs font-bold text-brand-green">Meta do mês atingida (112%)</div><div className="text-[11px] text-(--fg-muted) mt-0.5">Parabéns à equipa!</div></div>
                </div>
              </div>
            </div>
          )}

          {/* === ORDERS === */}
          {screen === 'orders' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="font-heading text-lg text-(--fg)">Pedidos ({mockOrders.length})</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--fg-faint)" />
                    <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Buscar pedido..." className="h-8 pl-8 pr-3 text-xs bg-(--bg-elev) border border-(--border) rounded text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange w-40 transition-all" />
                  </div>
                  <button className="h-8 px-3 border border-(--border) rounded text-xs font-ui text-(--fg-muted) flex items-center gap-1.5 hover:bg-(--bg-sunk) transition-all">
                    <Filter size={12} />Filtros
                  </button>
                  <button className="h-8 px-3 border border-(--border) rounded text-xs font-ui text-(--fg-muted) flex items-center gap-1.5 hover:bg-(--bg-sunk) transition-all">
                    <Download size={12} />Exportar
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['Todos', 'Pago', 'Em separação', 'Enviado', 'Entregue', 'Cancelado'].map((f, i) => (
                  <button key={f} className={`h-7 px-3 text-[11px] font-ui font-semibold rounded-full border transition-all ${i === 0 ? 'bg-brand-orange text-white border-brand-orange' : 'border-(--border) text-(--fg-muted) hover:border-brand-orange hover:text-brand-orange'}`}>{f}</button>
                ))}
              </div>
              <div className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-(--border)">
                      {['Pedido', 'Data', 'Cliente', 'Produto', 'Tam.', 'Valor', 'Pagamento', 'Status', 'Ações'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-[9px] font-bold font-ui text-(--fg-faint) tracking-widest uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredOrders.map(o => (
                        <tr key={o.id} className="border-b border-(--border) hover:bg-(--bg-sunk) transition-colors group">
                          <td className="py-3 px-4 font-mono text-xs text-brand-orange font-bold">{o.id}</td>
                          <td className="py-3 px-4 text-[11px] text-(--fg-faint) whitespace-nowrap">{o.date}</td>
                          <td className="py-3 px-4">
                            <div className="text-xs font-semibold text-(--fg)">{o.customer}</div>
                            <div className="text-[10px] text-(--fg-faint)">{o.email}</div>
                          </td>
                          <td className="py-3 px-4 text-xs text-(--fg-muted) max-w-36 truncate">{o.product}</td>
                          <td className="py-3 px-4 text-xs font-semibold text-(--fg)">{o.size}</td>
                          <td className="py-3 px-4 text-xs font-bold font-ui text-(--fg)">{o.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="py-3 px-4 text-[11px] text-(--fg-muted)">{o.payment}</td>
                          <td className="py-3 px-4"><span className={`text-[9px] font-bold font-ui px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusCfg[o.status]?.color}`}>{statusCfg[o.status]?.label}</span></td>
                          <td className="py-3 px-4">
                            <button onClick={() => { setSelectedOrder(o); setScreen('order-detail'); }} className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-semibold font-ui text-brand-orange transition-all">
                              <Eye size={12} />Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === ORDER DETAIL === */}
          {screen === 'order-detail' && selectedOrder && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setScreen('orders')} className="text-xs text-(--fg-muted) hover:text-brand-orange flex items-center gap-1 transition-colors">← Pedidos</button>
                <ChevronRight size={12} className="text-(--fg-faint)" />
                <span className="font-mono text-sm font-bold text-brand-orange">{selectedOrder.id}</span>
                <span className={`text-[10px] font-bold font-ui px-2 py-0.5 rounded-full ${statusCfg[selectedOrder.status]?.color}`}>{statusCfg[selectedOrder.status]?.label}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
                    <div className="px-5 py-3 border-b border-(--border) text-xs font-bold font-ui text-(--fg)">Itens do pedido</div>
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-(--bg-sunk) rounded-md flex items-center justify-center text-(--fg-faint)">
                        <Package size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-(--fg)">{selectedOrder.product}</div>
                        <div className="text-xs text-(--fg-muted) mt-0.5">Tamanho: {selectedOrder.size} · Quantidade: 1</div>
                      </div>
                      <div className="text-sm font-bold font-ui text-(--fg)">{selectedOrder.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    </div>
                    <div className="px-5 py-3 border-t border-(--border) bg-(--bg-sunk) flex justify-between text-sm">
                      <span className="text-(--fg-muted)">Total do pedido</span>
                      <span className="font-bold text-(--fg)">{selectedOrder.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>

                  <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-5">
                    <div className="text-xs font-bold font-ui text-(--fg) mb-4">Timeline do pedido</div>
                    <div className="space-y-3">
                      {[
                        { label: 'Pedido criado', time: selectedOrder.date, done: true },
                        { label: 'Pagamento confirmado', time: selectedOrder.payment, done: selectedOrder.status !== 'cancelado' },
                        { label: 'Em separação', time: '', done: ['separacao', 'enviado', 'entregue'].includes(selectedOrder.status) },
                        { label: 'Enviado para transportadora', time: '', done: ['enviado', 'entregue'].includes(selectedOrder.status) },
                        { label: 'Entregue', time: '', done: selectedOrder.status === 'entregue' },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? 'bg-brand-green' : 'bg-(--border)'}`}>
                            {step.done && <Check size={11} className="text-white" />}
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${step.done ? 'text-(--fg)' : 'text-(--fg-faint)'}`}>{step.label}</div>
                            {step.time && <div className="text-[10px] text-(--fg-faint) font-mono">{step.time}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-4">
                    <div className="text-xs font-bold font-ui text-(--fg) mb-3">Cliente</div>
                    <div className="text-sm font-semibold text-(--fg)">{selectedOrder.customer}</div>
                    <div className="text-xs text-(--fg-muted) mt-1 flex items-center gap-1.5"><Mail size={11} />{selectedOrder.email}</div>
                    <button className="mt-3 w-full h-8 border border-(--border) rounded text-xs font-semibold font-ui text-(--fg-muted) hover:border-brand-orange hover:text-brand-orange transition-all">
                      Ver perfil do cliente
                    </button>
                  </div>

                  <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-4">
                    <div className="text-xs font-bold font-ui text-(--fg) mb-3">Pagamento</div>
                    <div className="text-sm text-(--fg)">{selectedOrder.payment}</div>
                    <div className="text-xs text-(--fg-muted) mt-1">Total: <strong className="text-brand-green">{selectedOrder.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
                  </div>

                  <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-4 space-y-2">
                    <div className="text-xs font-bold font-ui text-(--fg) mb-3">Ações</div>
                    <select className="w-full h-8 px-2 text-xs bg-(--bg-sunk) border border-(--border) rounded text-(--fg) focus:outline-none focus:border-brand-orange">
                      {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button className="w-full h-8 bg-brand-orange text-white text-xs font-semibold font-ui rounded hover:bg-brand-orange-600 transition-all">Atualizar status</button>
                    <button className="w-full h-8 border border-brand-red/30 text-brand-red text-xs font-semibold font-ui rounded hover:bg-brand-red/10 transition-all">Cancelar pedido</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === PRODUCTS === */}
          {screen === 'products' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="font-heading text-lg text-(--fg)">Produtos ({products.length})</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--fg-faint)" />
                    <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Buscar produto..." className="h-8 pl-8 pr-3 text-xs bg-(--bg-elev) border border-(--border) rounded text-(--fg) placeholder:text-(--fg-faint) focus:outline-none focus:border-brand-orange w-44 transition-all" />
                  </div>
                  <button onClick={() => setScreen('product-new')} className="h-8 px-3 bg-brand-orange text-white text-xs font-semibold font-ui rounded flex items-center gap-1.5 hover:bg-brand-orange-600 transition-all">
                    <Plus size={13} />Novo produto
                  </button>
                </div>
              </div>
              <div className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-(--border)">
                      {['Produto', 'Marca', 'Categoria', 'Preço', 'Preço orig.', 'Rating', 'Status', 'Ações'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-[9px] font-bold font-ui text-(--fg-faint) tracking-widest uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="border-b border-(--border) hover:bg-(--bg-sunk) transition-colors group">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]?.url} alt="" className="w-9 h-9 rounded object-cover bg-(--bg-sunk) shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-(--fg) truncate max-w-40">{p.name}</div>
                                <div className="text-[10px] text-(--fg-faint) font-mono">"{p.colorway}"</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-(--fg-muted)">{p.brand}</td>
                          <td className="py-3 px-4 text-xs text-(--fg-muted) whitespace-nowrap">{p.category}</td>
                          <td className="py-3 px-4 text-xs font-bold font-ui text-(--fg)">{p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="py-3 px-4 text-xs text-(--fg-faint) line-through">{p.originalPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '—'}</td>
                          <td className="py-3 px-4 text-xs text-brand-yellow">★ {p.rating}</td>
                          <td className="py-3 px-4"><span className={`text-[9px] font-bold font-ui px-1.5 py-0.5 rounded-full ${p.inStock ? 'text-brand-green bg-brand-green/10' : 'text-brand-red bg-brand-red/10'}`}>{p.inStock ? 'Em estoque' : 'Esgotado'}</span></td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => setScreen('product-edit')} className="w-6 h-6 rounded text-(--fg-muted) hover:text-brand-orange hover:bg-brand-orange/10 flex items-center justify-center transition-all">
                                <Edit2 size={12} />
                              </button>
                              <button className="w-6 h-6 rounded text-(--fg-muted) hover:text-brand-red hover:bg-brand-red/10 flex items-center justify-center transition-all">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === PRODUCT EDIT / NEW === */}
          {(screen === 'product-edit' || screen === 'product-new') && (
            <div className="p-6 space-y-5 max-w-3xl">
              <div className="flex items-center gap-3">
                <button onClick={() => setScreen('products')} className="text-xs text-(--fg-muted) hover:text-brand-orange flex items-center gap-1 transition-colors">← Produtos</button>
                <ChevronRight size={12} className="text-(--fg-faint)" />
                <span className="text-xs font-bold font-ui text-(--fg)">{screen === 'product-new' ? 'Novo produto' : 'Editar produto'}</span>
              </div>
              <h2 className="font-heading text-lg text-(--fg)">{screen === 'product-new' ? 'Adicionar novo produto' : 'Editar produto'}</h2>
              <ProductForm onCancel={() => setScreen('products')} />
            </div>
          )}

          {/* === INVENTORY === */}
          {screen === 'inventory' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg text-(--fg)">Estoque</h2>
                <button className="h-8 px-3 border border-(--border) rounded text-xs font-ui text-(--fg-muted) flex items-center gap-1.5 hover:bg-(--bg-sunk) transition-all">
                  <RefreshCw size={12} />Atualizar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Produtos ativos', value: products.filter(p => p.inStock).length, color: 'text-brand-green' },
                  { label: 'Estoque crítico', value: 8, color: 'text-brand-red' },
                  { label: 'Sem estoque', value: 3, color: 'text-(--fg-faint)' },
                ].map(s => (
                  <div key={s.label} className="bg-(--bg-elev) border border-(--border) rounded-lg p-4">
                    <div className="text-[10px] text-(--fg-muted) font-ui mb-1">{s.label}</div>
                    <div className={`font-display text-3xl ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-(--border)">
                      {['Produto', 'SKU', 'Tam. 40', 'Tam. 41', 'Tam. 42', 'Tam. 43', 'Total', 'Status'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-[9px] font-bold font-ui text-(--fg-faint) tracking-widest uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {products.slice(0, 8).map(p => {
                        const totalStock = p.sizes.reduce((a, s) => a + s.stock, 0);
                        const isCritical = totalStock < 5;
                        return (
                          <tr key={p.id} className="border-b border-(--border) hover:bg-(--bg-sunk) transition-colors">
                            <td className="py-3 px-4">
                              <div className="text-xs font-semibold text-(--fg) truncate max-w-40">{p.name}</div>
                              <div className="text-[10px] text-(--fg-faint)">{p.brand}</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[10px] text-(--fg-faint)">{p.sku.slice(0, 12)}</td>
                            {[40, 41, 42, 43].map(sz => {
                              const s = p.sizes.find(s => s.size === sz);
                              return (
                                <td key={sz} className="py-3 px-4">
                                  <span className={`text-xs font-mono ${!s ? 'text-(--fg-faint)' : s.stock === 0 ? 'text-brand-red' : s.stock < 3 ? 'text-brand-yellow' : 'text-(--fg)'}`}>
                                    {s ? s.stock : '—'}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="py-3 px-4 text-xs font-bold font-ui text-(--fg)">{totalStock}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-bold font-ui px-1.5 py-0.5 rounded-full ${isCritical ? 'text-brand-red bg-brand-red/10' : 'text-brand-green bg-brand-green/10'}`}>
                                {isCritical ? 'Crítico' : 'OK'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === CUSTOMERS === */}
          {screen === 'customers' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg text-(--fg)">Clientes ({mockCustomers.length})</h2>
                <button className="h-8 px-3 border border-(--border) rounded text-xs font-ui text-(--fg-muted) flex items-center gap-1.5 hover:bg-(--bg-sunk) transition-all">
                  <Download size={12} />Exportar CSV
                </button>
              </div>
              <div className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-(--border)">
                      {['Cliente', 'Contato', 'Pedidos', 'LTV', 'Último pedido', 'Score', 'Status', 'Ações'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-[9px] font-bold font-ui text-(--fg-faint) tracking-widest uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {mockCustomers.map(c => (
                        <tr key={c.id} className="border-b border-(--border) hover:bg-(--bg-sunk) transition-colors group cursor-pointer" onClick={() => { setSelectedCustomer(c); setScreen('customer-detail'); }}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange font-bold text-xs font-ui shrink-0">{c.name[0]}</div>
                              <div className="text-xs font-semibold text-(--fg)">{c.name}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-[10px] text-(--fg-muted) flex items-center gap-1"><Mail size={9} />{c.email}</div>
                            <div className="text-[10px] text-(--fg-faint) flex items-center gap-1 mt-0.5"><Phone size={9} />{c.phone}</div>
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-(--fg)">{c.orders}</td>
                          <td className="py-3 px-4 text-xs font-bold font-ui text-brand-green">{c.ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="py-3 px-4 text-[11px] text-(--fg-muted)">{c.lastOrder}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 bg-(--border) rounded-full max-w-16">
                                <div className="h-full bg-brand-orange rounded-full transition-all" style={{ width: `${c.score}%` }} />
                              </div>
                              <span className="text-[10px] font-mono text-(--fg-muted)">{c.score}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4"><span className={`text-[9px] font-bold font-ui px-1.5 py-0.5 rounded-full ${customerStatusCfg[c.status]?.color}`}>{customerStatusCfg[c.status]?.label}</span></td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-[10px] font-semibold font-ui text-brand-orange opacity-0 group-hover:opacity-100 transition-all">
                              <Eye size={11} />Ver
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === CUSTOMER DETAIL === */}
          {screen === 'customer-detail' && selectedCustomer && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setScreen('customers')} className="text-xs text-(--fg-muted) hover:text-brand-orange flex items-center gap-1 transition-colors">← Clientes</button>
                <ChevronRight size={12} className="text-(--fg-faint)" />
                <span className="text-xs font-bold font-ui text-(--fg)">{selectedCustomer.name}</span>
              </div>

              <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-6">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="w-14 h-14 rounded-full bg-brand-orange flex items-center justify-center text-white font-display text-2xl shrink-0">{selectedCustomer.name[0]}</div>
                  <div className="flex-1">
                    <h2 className="font-heading text-xl text-(--fg)">{selectedCustomer.name}</h2>
                    <div className="flex gap-3 mt-1 flex-wrap text-xs text-(--fg-muted)">
                      <span className="flex items-center gap-1"><Mail size={11} />{selectedCustomer.email}</span>
                      <span className="flex items-center gap-1"><Phone size={11} />{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-[10px] font-bold font-ui px-2 py-0.5 rounded-full ${customerStatusCfg[selectedCustomer.status]?.color}`}>{customerStatusCfg[selectedCustomer.status]?.label}</span>
                      <span className="text-[10px] font-bold font-ui text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">Score: {selectedCustomer.score}/100</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="h-8 px-3 border border-(--border) rounded text-xs font-semibold font-ui text-(--fg-muted) hover:bg-(--bg-sunk) flex items-center gap-1.5 transition-all"><Mail size={12} />E-mail</button>
                    <button className="h-8 px-3 border border-(--border) rounded text-xs font-semibold font-ui text-(--fg-muted) hover:bg-(--bg-sunk) flex items-center gap-1.5 transition-all"><Phone size={12} />WhatsApp</button>
                    <button className="h-8 px-3 bg-brand-orange text-white text-xs font-semibold font-ui rounded hover:bg-brand-orange-600 transition-all flex items-center gap-1.5"><Plus size={12} />Criar pedido</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: 'LTV total', value: selectedCustomer.ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: 'text-brand-green' },
                  { label: 'Pedidos', value: selectedCustomer.orders.toString(), color: 'text-(--fg)' },
                  { label: 'Ticket médio', value: (selectedCustomer.ltv / selectedCustomer.orders).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: 'text-(--fg)' },
                  { label: 'Último pedido', value: selectedCustomer.lastOrder, color: 'text-brand-orange' },
                  { label: 'Score', value: `${selectedCustomer.score}/100`, color: 'text-brand-teal' },
                ].map(s => (
                  <div key={s.label} className="bg-(--bg-elev) border border-(--border) rounded-lg p-3">
                    <div className="text-[10px] text-(--fg-muted) font-ui">{s.label}</div>
                    <div className={`font-display text-xl mt-0.5 ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-(--border) text-xs font-bold font-ui text-(--fg)">Pedidos do cliente</div>
                {mockOrders.filter(o => o.customer.toLowerCase().startsWith(selectedCustomer.name.split(' ')[0].toLowerCase())).slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-3 border-b border-(--border) last:border-0">
                    <span className="font-mono text-xs text-brand-orange font-bold">{o.id}</span>
                    <span className="text-xs text-(--fg)">{o.product}</span>
                    <span className="text-[11px] text-(--fg-faint)">{o.date}</span>
                    <span className={`ml-auto text-[9px] font-bold font-ui px-1.5 py-0.5 rounded-full ${statusCfg[o.status]?.color}`}>{statusCfg[o.status]?.label}</span>
                    <span className="text-xs font-bold font-ui text-(--fg)">{o.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                ))}
                <div className="px-5 py-3 bg-(--bg-sunk) text-[11px] text-brand-orange font-semibold cursor-pointer hover:text-brand-orange-600">Ver todos os {selectedCustomer.orders} pedidos →</div>
              </div>
            </div>
          )}

          {/* === COUPONS === */}
          {screen === 'coupons' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg text-(--fg)">Cupons de desconto</h2>
                <button className="h-8 px-3 bg-brand-orange text-white text-xs font-semibold font-ui rounded flex items-center gap-1.5 hover:bg-brand-orange-600 transition-all">
                  <Plus size={13} />Novo cupom
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {mockCoupons.map(c => (
                  <div key={c.code} className={`bg-(--bg-elev) border rounded-lg p-5 ${c.active ? 'border-(--border)' : 'border-(--border) opacity-60'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-mono text-lg font-bold text-brand-orange tracking-widest">{c.code}</div>
                        <div className="text-xs text-(--fg-muted) mt-0.5">
                          {c.type === 'percent' && `${c.value}% de desconto`}
                          {c.type === 'fixed' && `R$ ${c.value} de desconto`}
                          {c.type === 'shipping' && 'Frete grátis'}
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold font-ui px-2 py-0.5 rounded-full ${c.active ? 'text-brand-green bg-brand-green/10' : 'text-(--fg-faint) bg-(--border)'}`}>
                        {c.active ? 'Ativo' : 'Expirado'}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-(--fg-muted)">
                      <div className="flex justify-between">
                        <span>Utilizações</span>
                        <span className="font-semibold text-(--fg)">{c.uses}/{c.limit}</span>
                      </div>
                      <div className="h-1.5 bg-(--border) rounded-full">
                        <div className="h-full bg-brand-orange rounded-full" style={{ width: `${(c.uses / c.limit) * 100}%` }} />
                      </div>
                      <div className="flex justify-between">
                        <span>Expira em</span>
                        <span>{c.expires}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 h-7 border border-(--border) rounded text-[11px] font-semibold font-ui text-(--fg-muted) hover:border-brand-orange hover:text-brand-orange transition-all">Editar</button>
                      <button className="h-7 px-3 border border-brand-red/30 rounded text-[11px] font-semibold font-ui text-brand-red hover:bg-brand-red/10 transition-all">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === REPORTS === */}
          {screen === 'reports' && (
            <div className="p-6 space-y-5">
              <h2 className="font-heading text-lg text-(--fg)">Relatórios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Receita total (mês)', value: 'R$ 87.450', delta: '+31%', icon: '📈' },
                  { label: 'Pedidos (mês)', value: '247', delta: '+18%', icon: '📦' },
                  { label: 'Clientes novos', value: '89', delta: '+12%', icon: '👥' },
                  { label: 'Taxa abandono carrinho', value: '68%', delta: '-3pp', icon: '🛒' },
                  { label: 'NPS score', value: '72', delta: '+5', icon: '⭐' },
                  { label: 'Custo por conversão', value: 'R$ 48', delta: '-8%', icon: '💰' },
                ].map(r => (
                  <div key={r.label} className="bg-(--bg-elev) border border-(--border) rounded-lg p-5">
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <div className="text-[10px] text-(--fg-muted) font-ui uppercase tracking-widest">{r.label}</div>
                    <div className="font-display text-3xl text-(--fg) mt-1">{r.value}</div>
                    <div className="text-xs text-brand-green mt-1 flex items-center gap-1"><TrendingUp size={11} />{r.delta} vs mês anterior</div>
                  </div>
                ))}
              </div>
              <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-5">
                <h3 className="text-sm font-bold font-ui text-(--fg) mb-4">Receita dos últimos 30 dias</h3>
                <MiniChart />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-5">
                  <h3 className="text-sm font-bold font-ui text-(--fg) mb-4">Receita por marca</h3>
                  {[['Nike', 42], ['Adidas', 28], ['Puma', 18], ['Umbro', 12]].map(([brand, pct]) => (
                    <div key={brand as string} className="flex items-center gap-3 mb-2.5">
                      <span className="text-[11px] font-bold font-ui text-(--fg-muted) w-12">{brand}</span>
                      <div className="flex-1 h-2 bg-(--border) rounded-full">
                        <div className="h-full bg-brand-orange rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-(--fg-muted) w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="bg-(--bg-elev) border border-(--border) rounded-lg p-5">
                  <h3 className="text-sm font-bold font-ui text-(--fg) mb-4">Formas de pagamento</h3>
                  {[['Pix', 54], ['Cartão', 38], ['Boleto', 8]].map(([method, pct]) => (
                    <div key={method as string} className="flex items-center gap-3 mb-2.5">
                      <span className="text-[11px] font-bold font-ui text-(--fg-muted) w-14">{method}</span>
                      <div className="flex-1 h-2 bg-(--border) rounded-full">
                        <div className="h-full bg-brand-teal rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-(--fg-muted) w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === SETTINGS === */}
          {screen === 'settings' && (
            <div className="p-6 space-y-6 max-w-2xl">
              <h2 className="font-heading text-lg text-(--fg)">Configurações da loja</h2>

              {[
                {
                  title: 'Informações gerais',
                  fields: [
                    { label: 'Nome da loja', value: "Galvão's Store" },
                    { label: 'CNPJ', value: '00.000.000/0001-00' },
                    { label: 'E-mail de contato', value: 'contato@galvaostore.com.br' },
                    { label: 'Telefone', value: '(11) 99999-0000' },
                  ]
                },
                {
                  title: 'Frete e entrega',
                  fields: [
                    { label: 'Frete grátis acima de (R$)', value: '399' },
                    { label: 'Prazo base SEDEX (dias)', value: '2' },
                  ]
                },
                {
                  title: 'Pagamentos',
                  fields: [
                    { label: 'Desconto Pix (%)', value: '5' },
                    { label: 'Máx. parcelas sem juros', value: '12' },
                  ]
                },
              ].map(section => (
                <div key={section.title} className="bg-(--bg-elev) border border-(--border) rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-(--border) text-xs font-bold font-ui text-(--fg) uppercase tracking-widest">{section.title}</div>
                  <div className="p-5 space-y-4">
                    {section.fields.map(f => (
                      <div key={f.label}>
                        <label className="block text-[10px] font-bold font-ui text-(--fg-muted) uppercase tracking-widest mb-1.5">{f.label}</label>
                        <input defaultValue={f.value} className="w-full h-9 px-3 bg-(--bg-sunk) border border-(--border) rounded text-sm text-(--fg) focus:outline-none focus:border-brand-orange transition-all" />
                      </div>
                    ))}
                    <button className="h-8 px-4 bg-brand-orange text-white text-xs font-semibold font-ui rounded hover:bg-brand-orange-600 transition-all">Salvar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
