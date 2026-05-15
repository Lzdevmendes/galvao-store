import { useState, useMemo } from 'react'
import { catalog } from '../../infrastructure/catalog/products'
import { formatBRL } from '../../core/domain/product'

type Screen =
  | 'dashboard' | 'products' | 'product-edit' | 'product-new'
  | 'orders' | 'order-detail' | 'inventory'
  | 'customers' | 'coupons' | 'reports' | 'settings'

/* ─── Static mock data ─────────────────────────────────── */
const kpis = [
  { label: 'Vendas hoje',      value: 'R$ 14.892', delta: '▲ 23%', up: true,  sub: 'vs ontem' },
  { label: 'Pedidos hoje',     value: '42',        delta: '▲ 18%', up: true,  sub: 'vs ontem' },
  { label: 'Ticket médio',     value: 'R$ 354',    delta: '▲ 4%',  up: true,  sub: 'no mês' },
  { label: 'Conversão',        value: '3,8%',      delta: '▼ 0,4pp', up: false, sub: 'vs semana' },
]

const allOrders = [
  { id: '#GS-1042', date: '06/05 · 09:42', customer: 'Lucas Ferreira',  email: 'lucas@email.com', product: 'Phantom GX III Elite', size: 41, price: 529.99,  status: 'paid',      pay: 'Pix' },
  { id: '#GS-1041', date: '06/05 · 08:15', customer: 'Marcos Oliveira', email: 'marcos@email.com', product: 'F50 Elite FG',        size: 42, price: 799.99,  status: 'shipped',   pay: 'Cartão 12×' },
  { id: '#GS-1040', date: '05/05 · 14:30', customer: 'Rafael Santos',   email: 'rafael@email.com', product: 'Future 8 Ultimate',  size: 40, price: 749.99,  status: 'delivered', pay: 'Pix' },
  { id: '#GS-1039', date: '05/05 · 10:00', customer: 'Diego Costa',     email: 'diego@email.com',  product: 'Predator Accuracy',  size: 43, price: 689.99,  status: 'cancelled', pay: 'Boleto' },
  { id: '#GS-1038', date: '04/05 · 18:22', customer: 'Bruno Mendes',    email: 'bruno@email.com',  product: 'Mercurial Vapor XV', size: 44, price: 869.99,  status: 'paid',      pay: 'Cartão 6×' },
  { id: '#GS-1037', date: '04/05 · 15:10', customer: 'Ana Costa',       email: 'ana@email.com',    product: 'Copa Pure II IC',   size: 38, price: 399.99,  status: 'processing', pay: 'Pix' },
  { id: '#GS-1036', date: '03/05 · 09:00', customer: 'Thiago Lima',     email: 'thiago@email.com', product: 'King Platinum 21',  size: 42, price: 549.99,  status: 'shipped',   pay: 'Cartão 3×' },
  { id: '#GS-1035', date: '01/05 · 11:45', customer: 'Camila Rocha',    email: 'camila@email.com', product: 'Ultraboost 24',     size: 39, price: 899.99,  status: 'delivered', pay: 'Pix' },
]

const customers = [
  { id: 'C001', name: 'Lucas Ferreira',  email: 'lucas@email.com',  orders: 8,  ltv: 4290, last: '06/05', status: 'vip',     score: 92 },
  { id: 'C002', name: 'Marcos Oliveira', email: 'marcos@email.com', orders: 12, ltv: 8247, last: '06/05', status: 'vip',     score: 94 },
  { id: 'C003', name: 'Rafael Santos',   email: 'rafael@email.com', orders: 3,  ltv: 1890, last: '05/05', status: 'regular', score: 65 },
  { id: 'C004', name: 'Diego Costa',     email: 'diego@email.com',  orders: 1,  ltv: 689,  last: '05/05', status: 'new',     score: 42 },
  { id: 'C005', name: 'Bruno Mendes',    email: 'bruno@email.com',  orders: 6,  ltv: 3210, last: '04/05', status: 'regular', score: 78 },
  { id: 'C006', name: 'Ana Costa',       email: 'ana@email.com',    orders: 4,  ltv: 2100, last: '04/05', status: 'regular', score: 70 },
]

const coupons = [
  { code: 'GALVAO10',   type: 'percent', val: 10,   uses: 48,  limit: 100, expires: '30/06/2026', active: true  },
  { code: 'FRETEGRATIS',type: 'shipping',val: 0,    uses: 23,  limit: 50,  expires: '15/05/2026', active: true  },
  { code: 'PIX15',      type: 'percent', val: 15,   uses: 100, limit: 100, expires: '01/05/2026', active: false },
  { code: 'NIKE20',     type: 'fixed',   val: 20,   uses: 12,  limit: 30,  expires: '31/12/2026', active: true  },
  { code: 'PRIMEIRA',   type: 'percent', val: 8,    uses: 67,  limit: 200, expires: '31/08/2026', active: true  },
]

const pillCls: Record<string, string> = {
  paid: 'paid', processing: 'processing', shipped: 'shipped',
  delivered: 'delivered', cancelled: 'cancelled',
}
const pillLabel: Record<string, string> = {
  paid: 'Pago', processing: 'Em separação', shipped: 'Enviado',
  delivered: 'Entregue', cancelled: 'Cancelado',
}

const navItems = [
  { group: 'Operação',  key: 'dashboard' as Screen, icon: '📊', label: 'Dashboard' },
  { group: 'Operação',  key: 'orders' as Screen,    icon: '🛒', label: 'Pedidos',   badge: 14 },
  { group: 'Operação',  key: 'inventory' as Screen, icon: '📋', label: 'Estoque',   badge: 8  },
  { group: 'Catálogo',  key: 'products' as Screen,  icon: '👟', label: 'Produtos',  badge: catalog.length },
  { group: 'Marketing', key: 'customers' as Screen, icon: '👥', label: 'Clientes' },
  { group: 'Marketing', key: 'coupons' as Screen,   icon: '🎟️', label: 'Cupons' },
  { group: 'Marketing', key: 'reports' as Screen,   icon: '📈', label: 'Relatórios' },
  { group: 'Sistema',   key: 'settings' as Screen,  icon: '⚙️', label: 'Configurações' },
]

/* ─── Chart ──────────────────────────────────────────────── */
function Chart() {
  const pts = [140,130,138,110,120,95,105,78,90,65,75,50,60,80,50,60,35,45,25,40,20]
  const prev= [160,155,145,150,130,135,120,125,110,115,100,105,90,95,80,85,75,80,65,70,60]
  const w = 560; const h = 160
  const p  = pts.map((y,i)=>`${(i/(pts.length-1))*w},${y}`).join(' ')
  const p2 = prev.map((y,i)=>`${(i/(prev.length-1))*w},${y}`).join(' ')
  return (
    <div className="chart" style={{ height: 180, padding: 0 }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F26B1F" stopOpacity=".25"/>
            <stop offset="100%" stopColor="#F26B1F" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[40,80,120].map(y=><line key={y} x1="0" y1={y} x2={w} y2={y} stroke="var(--border)" strokeDasharray="3 6"/>)}
        <polyline points={`${p} ${w},${h} 0,${h}`} fill="url(#cg)"/>
        <polyline points={p} fill="none" stroke="#F26B1F" strokeWidth="2.5" strokeLinejoin="round"/>
        <polyline points={p2} fill="none" stroke="#1FB5A8" strokeWidth="1.5" strokeDasharray="4 4" strokeLinejoin="round"/>
        <circle cx={w} cy={pts[pts.length-1]} r="5" fill="#F26B1F"/>
        <circle cx={w} cy={pts[pts.length-1]} r="9" fill="#F26B1F" opacity=".2"/>
      </svg>
    </div>
  )
}

/* ─── Orders table ────────────────────────────────────────── */
function OrdersTable({ rows, onDetail }: { rows: typeof allOrders; onDetail?: (o: typeof allOrders[0]) => void }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table className="adm-table">
        <thead><tr>
          {['Pedido','Data','Cliente','Produto','Tam.','Valor','Pag.','Status',''].map(h=>(
            <th key={h}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map(o=>(
            <tr key={o.id} style={{ cursor: onDetail ? 'pointer' : 'default' }}>
              <td style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--brand-orange)', fontSize:12 }}>{o.id}</td>
              <td style={{ fontSize:11, color:'var(--fg-faint)', whiteSpace:'nowrap' }}>{o.date}</td>
              <td>
                <div style={{ fontWeight:600, fontSize:12 }}>{o.customer}</div>
                <div style={{ fontSize:10, color:'var(--fg-faint)' }}>{o.email}</div>
              </td>
              <td style={{ fontSize:12, color:'var(--fg-muted)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.product}</td>
              <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{o.size}</td>
              <td><strong style={{ fontFamily:'var(--font-display)', fontSize:15 }}>{formatBRL(o.price)}</strong></td>
              <td style={{ fontSize:11, color:'var(--fg-muted)' }}>{o.pay}</td>
              <td><span className={`pill ${pillCls[o.status]??'archived'}`}>{pillLabel[o.status]??o.status}</span></td>
              <td>
                {onDetail && (
                  <button onClick={()=>onDetail(o)} style={{ background:'none', border:'none', color:'var(--brand-orange)', fontSize:12, cursor:'pointer', fontFamily:'var(--font-ui)', fontWeight:600 }}>Ver →</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Product form ────────────────────────────────────────── */
function ProductForm({ product, onCancel }: { product?: typeof catalog[0]; onCancel: ()=>void }) {
  const [form, setForm] = useState({
    name: product?.name ?? '', brand: product?.brand ?? 'Nike',
    category: product?.category ?? 'Campo (FG)', price: product?.price.toString() ?? '',
    originalPrice: product?.originalPrice?.toString() ?? '', sku: product?.sku ?? '',
    description: product?.description ?? '', colorway: product?.colorway ?? '',
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(f=>({...f,[k]:e.target.value}))

  const sizes = [37,38,39,40,41,42,43,44,45,46]

  return (
    <div>
      {/* Image upload grid */}
      <label style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--fg-muted)', display:'block', marginBottom:8 }}>Imagens do produto</label>
      <div className="img-grid" style={{ marginBottom:20 }}>
        {product?.images.slice(0,3).map((img,i)=>(
          <div key={i} className="filled">
            <img src={img.url} alt={img.alt}/>
            {i===0 && <div className="main">PRINCIPAL</div>}
            <div className="x">×</div>
          </div>
        ))}
        <div className="slot">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
          <span>Adicionar</span>
        </div>
        {!product && Array.from({length: 3}).map((_,i)=>(
          <div key={i} className="slot">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
            <span>Adicionar</span>
          </div>
        ))}
      </div>

      <div className="field-row">
        <AdminField label="Nome do produto" value={form.name} onChange={set('name')} placeholder="Phantom GX III Elite FG" />
        <AdminField label="Colorway" value={form.colorway} onChange={set('colorway')} placeholder="Mad Ready" />
      </div>
      <div className="field-row three">
        <div className="field">
          <label>Marca</label>
          <select value={form.brand} onChange={set('brand')}>
            {['Nike','Adidas','Puma','Umbro','New Balance','Joma'].map(b=><option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Categoria</label>
          <select value={form.category} onChange={set('category')}>
            {['Campo (FG)','Society (SG)','Futsal','Tênis Casual','Corrida','Camisas','Meias'].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <AdminField label="SKU" value={form.sku} onChange={set('sku')} placeholder="NK-PHT-GX3-EL-001" />
      </div>
      <div className="field-row">
        <AdminField label="Preço (R$)" type="number" value={form.price} onChange={set('price')} placeholder="529.99" />
        <AdminField label="Preço original (R$)" type="number" value={form.originalPrice} onChange={set('originalPrice')} placeholder="619.99" />
      </div>
      <div className="field">
        <label>Descrição</label>
        <textarea value={form.description} onChange={set('description')} rows={3}
          style={{ width:'100%', padding:'8px 10px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:13, background:'var(--bg-elev)', color:'var(--fg)', fontFamily:'inherit', resize:'vertical' }}
          placeholder="Descreve o produto..." />
      </div>

      {/* Sizes / stock */}
      <label style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--fg-muted)', display:'block', marginBottom:8 }}>Tamanhos e estoque</label>
      <table className="var-table" style={{ marginBottom:16 }}>
        <thead><tr>
          {['Tamanho','Preço','Estoque','Activo'].map(h=><th key={h}>{h}</th>)}
        </tr></thead>
        <tbody>
          {sizes.map(s=>{
            const sv = product?.sizes.find(x=>x.size===s)
            return (
              <tr key={s}>
                <td><span style={{ fontFamily:'var(--font-mono)', fontWeight:700 }}>{s}</span></td>
                <td><input defaultValue={product?.price??''} placeholder={form.price||'0.00'} style={{ width:80 }}/></td>
                <td>
                  <input type="number" defaultValue={sv?.stock??0} min={0}
                    className={sv && sv.stock < 3 ? 'stock-low' : ''} style={{ width:60 }}/>
                </td>
                <td><input type="checkbox" defaultChecked={sv?.available??true} style={{ accentColor:'var(--brand-orange)' }}/></td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={onCancel} className="btn btn-ghost">Cancelar</button>
        <button className="btn btn-primary">Salvar produto</button>
      </div>
    </div>
  )
}

function AdminField({ label, value, onChange, placeholder, type='text' }: {
  label:string; value:string; onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void; placeholder?:string; type?:string
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}/>
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────── */
export function AdminPage() {
  const [screen, setScreen]   = useState<Screen>('dashboard')
  const [sideOpen, setSide]   = useState(true)
  const [search, setSearch]   = useState('')
  const [orderStatus, setOS]  = useState('all')
  const [selectedOrder, setSO]= useState<typeof allOrders[0]|null>(null)
  const [editProduct, setEP]  = useState<typeof catalog[0]|null>(null)
  const [settingsTab, setST]  = useState('geral')
  const [toggles, setToggles] = useState({ reviews: true, stock: true, newsletter: false, analytics: true })

  const groups = [...new Set(navItems.map(n=>n.group))]

  const filteredOrders = useMemo(()=>
    allOrders.filter(o=>
      (orderStatus==='all' || o.status===orderStatus) &&
      (o.id+o.customer+o.product).toLowerCase().includes(search.toLowerCase())
    ), [search, orderStatus])

  const filteredProducts = useMemo(()=>
    catalog.filter(p=>(p.name+p.brand).toLowerCase().includes(search.toLowerCase()))
  , [search])

  const nav = (s: Screen) => { setScreen(s); setSearch('') }

  const isActive = (key: Screen) =>
    key === screen ||
    (key==='orders'   && screen==='order-detail') ||
    (key==='products' && (screen==='product-edit'||screen==='product-new'))

  return (
    <div className="admin-app" data-theme="dark" style={{ height:'100vh' }}>
      {/* ── Sidebar ── */}
      <aside className={`admin-nav${sideOpen?'':' collapsed'}`} style={{ display: sideOpen ? 'flex' : 'none', flexDirection:'column' }}>
        <div className="logo">
          <div className="logo-text">
            <div className="t">GALVÃO'S STORE</div>
            <div className="s">ADMIN PANEL</div>
          </div>
        </div>

        {groups.map(g=>(
          <div key={g}>
            <h5>{g}</h5>
            {navItems.filter(n=>n.group===g).map(n=>(
              <a key={n.key} className={isActive(n.key)?'active':''} onClick={()=>nav(n.key)} style={{ cursor:'pointer' }}>
                <span>{n.icon}</span>
                {n.label}
                {n.badge && <span className="badge">{n.badge}</span>}
              </a>
            ))}
          </div>
        ))}

        <div className="me" style={{ marginTop:'auto' }}>
          <div className="av">A</div>
          <div>
            <div className="name">Anderson Galvão</div>
            <div className="role">Administrador</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main" style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Topbar */}
        <div className="admin-topbar">
          <button onClick={()=>setSide(o=>!o)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-muted)', fontSize:18, padding:'0 4px', lineHeight:1 }}>
            {sideOpen ? '←' : '☰'}
          </button>
          <span className="crumb" style={{ fontSize:11 }}>
            {navItems.find(n=>isActive(n.key))?.label?.toUpperCase() ?? 'DASHBOARD'}
            {screen==='order-detail' && selectedOrder && ` · ${selectedOrder.id}`}
            {screen==='product-edit' && editProduct && ` · EDITAR`}
            {screen==='product-new' && ' · NOVO'}
          </span>

          <div className="search">
            <svg className="ico" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar pedidos, produtos..." />
          </div>

          <div className="actions">
            <div style={{ position:'relative', width:32, height:32, borderRadius:'var(--r-sm)', border:'1px solid var(--border)', background:'var(--bg-elev)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <div style={{ position:'absolute', top:4, right:4, width:7, height:7, background:'var(--brand-orange)', borderRadius:'50%' }}/>
            </div>
            <button className="btn btn-primary" style={{ fontSize:12, padding:'7px 12px' }} onClick={()=>nav('product-new')}>
              + Novo produto
            </button>
          </div>
        </div>

        {/* ── Content area ── */}
        <div className="admin-page" style={{ flex:1, overflowY:'auto' }}>

          {/* ═══ DASHBOARD ═══════════════════════════════════════ */}
          {screen==='dashboard' && (
            <>
              <div className="admin-page-head">
                <div>
                  <h1>Bom dia, Anderson 👊</h1>
                  <div className="sub">Quinta, 15 de maio · R$ 4.290 vendidos enquanto dormias.</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <select style={{ padding:'7px 10px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:12, background:'var(--bg-elev)', color:'var(--fg)', fontFamily:'inherit' }}>
                    <option>Últimos 7 dias</option>
                    <option>Últimos 30 dias</option>
                    <option>Mês atual</option>
                  </select>
                  <button className="btn btn-ghost" style={{ fontSize:12 }}>Exportar PDF</button>
                </div>
              </div>

              {/* KPIs */}
              <div className="kpi-row">
                {kpis.map((k,i)=>(
                  <div key={k.label} className={`kpi${i===0?' accent':''}`}>
                    <div className="label">{k.label}</div>
                    <div className="v">{k.value}</div>
                    <div className={`delta ${k.up?'up':'down'}`}>{k.delta} {k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Chart + Top produtos */}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
                <div className="adm-card">
                  <div className="adm-card-head">
                    <h3>Vendas — últimos 30 dias</h3>
                    <div style={{ display:'flex', gap:6 }}>
                      {['R$','Pedidos','Itens'].map((f,i)=>(
                        <button key={f} style={{ padding:'3px 8px', fontSize:11, borderRadius:'var(--r-pill)', border:'1px solid var(--border)', background: i===0?'var(--ink-950)':'transparent', color: i===0?'var(--white)':'var(--fg-muted)', cursor:'pointer' }}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding:'0 16px 16px' }}>
                    <Chart/>
                    <div style={{ display:'flex', gap:16, marginTop:8 }}>
                      <span style={{ fontSize:11, display:'flex', alignItems:'center', gap:4 }}><span style={{ display:'inline-block', width:12, height:2, background:'var(--brand-orange)' }}/> Atual</span>
                      <span style={{ fontSize:11, display:'flex', alignItems:'center', gap:4 }}><span style={{ display:'inline-block', width:12, height:2, background:'var(--brand-teal)', borderTop:'1px dashed' }}/> Anterior</span>
                    </div>
                  </div>
                </div>
                <div className="adm-card">
                  <div className="adm-card-head"><h3>Top produtos</h3></div>
                  <div style={{ padding:'0 16px 16px' }}>
                    {catalog.slice(0,5).map((p,i)=>(
                      <div key={p.id} style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-faint)', width:16, textAlign:'right' }}>{i+1}</span>
                        <img src={p.images[0]?.url} alt="" style={{ width:32, height:32, borderRadius:4, objectFit:'contain', background:'var(--bg-sunk)' }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:11, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                          <div style={{ fontSize:10, color:'var(--fg-faint)' }}>{p.brand} · {p.reviewCount} vendas</div>
                        </div>
                        <span style={{ fontFamily:'var(--font-display)', fontSize:13, color:'var(--brand-green)' }}>{formatBRL(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alertas */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                {[
                  { icon:'⚠️', text:'8 produtos com estoque crítico', sub:'Repor antes de esgotar', color:'brand-red' },
                  { icon:'⏳', text:'3 pedidos aguardam revisão', sub:'Análise manual necessária', color:'brand-yellow' },
                  { icon:'✅', text:'Meta do mês atingida (112%)', sub:'Parabéns à equipa!', color:'brand-green' },
                ].map(a=>(
                  <div key={a.text} style={{ background:`rgba(var(--${a.color}-rgb,0,0,0),.05)`, border:`1px solid rgba(var(--${a.color}-rgb,0,0,0),.15)`, borderRadius:'var(--r-md)', padding:'14px 16px' }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{a.icon} {a.text}</div>
                    <div style={{ fontSize:12, color:'var(--fg-muted)' }}>{a.sub}</div>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="adm-card">
                <div className="adm-card-head">
                  <h3>Pedidos recentes</h3>
                  <button className="btn btn-ghost" style={{ fontSize:12 }} onClick={()=>nav('orders')}>Ver todos →</button>
                </div>
                <OrdersTable rows={allOrders.slice(0,5)} onDetail={o=>{setSO(o);nav('order-detail')}}/>
              </div>
            </>
          )}

          {/* ═══ ORDERS ══════════════════════════════════════════ */}
          {screen==='orders' && (
            <>
              <div className="admin-page-head">
                <div><h1>Pedidos</h1><div className="sub">{filteredOrders.length} pedidos encontrados</div></div>
                <button className="btn btn-ghost" style={{ fontSize:12 }}>Exportar CSV</button>
              </div>
              {/* Filters bar */}
              <div className="filters">
                <div className="search-mini">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar pedido, cliente..."/>
                </div>
                <select value={orderStatus} onChange={e=>setOS(e.target.value)} >
                  <option value="all">Todos os status</option>
                  {Object.entries(pillLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
                <select>
                  <option>Todos os períodos</option>
                  <option>Hoje</option><option>Esta semana</option><option>Este mês</option>
                </select>
              </div>
              <div className="adm-card">
                <OrdersTable rows={filteredOrders} onDetail={o=>{setSO(o);nav('order-detail')}}/>
              </div>
            </>
          )}

          {/* ═══ ORDER DETAIL ════════════════════════════════════ */}
          {screen==='order-detail' && selectedOrder && (
            <>
              <div className="admin-page-head">
                <div>
                  <button onClick={()=>nav('orders')} style={{ background:'none', border:'none', color:'var(--fg-muted)', cursor:'pointer', fontSize:13, marginBottom:8, display:'block' }}>← Voltar aos pedidos</button>
                  <h1 style={{ display:'flex', alignItems:'center', gap:12 }}>
                    {selectedOrder.id}
                    <span className={`pill ${pillCls[selectedOrder.status]??'archived'}`}>{pillLabel[selectedOrder.status]}</span>
                  </h1>
                  <div className="sub">{selectedOrder.date} · {selectedOrder.customer}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost" style={{ fontSize:12 }}>Imprimir</button>
                  <select style={{ padding:'7px 10px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:12, background:'var(--bg-elev)', color:'var(--fg)', fontFamily:'inherit' }}>
                    {Object.entries(pillLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                  <button className="btn btn-primary" style={{ fontSize:12 }}>Actualizar status</button>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16 }}>
                <div>
                  {/* Items */}
                  <div className="adm-card" style={{ marginBottom:16 }}>
                    <div className="adm-card-head"><h3>Itens do pedido</h3></div>
                    <div style={{ padding:'16px 20px', display:'flex', gap:16, alignItems:'center' }}>
                      <div style={{ width:64, height:64, background:'var(--bg-sunk)', borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg-faint)' }}>👟</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600 }}>{selectedOrder.product}</div>
                        <div style={{ fontSize:12, color:'var(--fg-muted)', marginTop:2 }}>Tamanho {selectedOrder.size} · Quantidade: 1</div>
                      </div>
                      <strong style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--brand-green)' }}>{formatBRL(selectedOrder.price)}</strong>
                    </div>
                    <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', fontSize:14 }}>
                      <span style={{ color:'var(--fg-muted)' }}>Total do pedido</span>
                      <strong>{formatBRL(selectedOrder.price)}</strong>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="adm-card">
                    <div className="adm-card-head"><h3>Timeline do pedido</h3></div>
                    <div style={{ padding:'16px 20px' }}>
                      <div className="timeline">
                        {[
                          { label:'Pedido criado',          time:selectedOrder.date, done:true,    current:false },
                          { label:'Pagamento confirmado',    time:selectedOrder.pay,  done:selectedOrder.status!=='cancelled', current:false },
                          { label:'Em separação',            time:'',                  done:['processing','shipped','delivered'].includes(selectedOrder.status), current:selectedOrder.status==='processing' },
                          { label:'Enviado à transportadora',time:'',                  done:['shipped','delivered'].includes(selectedOrder.status), current:selectedOrder.status==='shipped' },
                          { label:'Entregue ao cliente',     time:'',                  done:selectedOrder.status==='delivered', current:false },
                        ].map((s,i)=>(
                          <div key={i} className={`step${s.done?' done':''}${s.current?' current':''}`}>
                            <div className="t">{s.label}</div>
                            {s.time && <div className="d">{s.time}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right sidebar */}
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div className="adm-card">
                    <div className="adm-card-head"><h3>Cliente</h3></div>
                    <div style={{ padding:'0 20px 16px', fontSize:13 }}>
                      <div style={{ fontWeight:700 }}>{selectedOrder.customer}</div>
                      <div style={{ color:'var(--fg-muted)', marginTop:2 }}>{selectedOrder.email}</div>
                      <button className="btn btn-ghost" style={{ fontSize:12, marginTop:12, width:'100%' }}>Ver perfil do cliente</button>
                    </div>
                  </div>
                  <div className="adm-card">
                    <div className="adm-card-head"><h3>Pagamento</h3></div>
                    <div style={{ padding:'0 20px 16px', fontSize:13 }}>
                      <div>{selectedOrder.pay}</div>
                      <div style={{ color:'var(--brand-green)', fontWeight:700, fontSize:18, fontFamily:'var(--font-display)', marginTop:6 }}>{formatBRL(selectedOrder.price)}</div>
                    </div>
                  </div>
                  <div className="adm-card">
                    <div className="adm-card-head"><h3>Acções</h3></div>
                    <div style={{ padding:'0 20px 16px', display:'flex', flexDirection:'column', gap:6 }}>
                      <button className="btn btn-ghost" style={{ fontSize:12 }}>📧 Enviar e-mail</button>
                      <button className="btn btn-ghost" style={{ fontSize:12 }}>🖨️ Imprimir etiqueta</button>
                      <button className="btn" style={{ fontSize:12, background:'transparent', border:'1px solid var(--brand-red)', color:'var(--brand-red)' }}>Cancelar pedido</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ PRODUCTS ════════════════════════════════════════ */}
          {screen==='products' && (
            <>
              <div className="admin-page-head">
                <div><h1>Produtos</h1><div className="sub">{filteredProducts.length} produtos</div></div>
                <div style={{ display:'flex', gap:8 }}>
                  <div className="filters" style={{ marginBottom:0, padding:'6px 10px' }}>
                    <div className="search-mini" style={{ minWidth:0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar produto..."/>
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ fontSize:12 }} onClick={()=>nav('product-new')}>+ Novo produto</button>
                </div>
              </div>
              <div className="adm-card">
                <div style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                    <thead><tr>
                      <th>Produto</th><th>Marca</th><th>Categoria</th><th>Preço</th><th>Original</th><th>Rating</th><th>Status</th><th></th>
                    </tr></thead>
                    <tbody>
                      {filteredProducts.map(p=>(
                        <tr key={p.id}>
                          <td>
                            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                              <div style={{ width:36, height:36, background:'var(--bg-sunk)', borderRadius:4, padding:2, flexShrink:0 }}>
                                <img src={p.images[0]?.url} alt="" style={{ width:'100%', height:'100%', objectFit:'contain', mixBlendMode:'multiply' }}/>
                              </div>
                              <div>
                                <div style={{ fontWeight:600, fontSize:12 }}>{p.name}</div>
                                <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-faint)' }}>"{p.colorway}"</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize:12, color:'var(--fg-muted)' }}>{p.brand}</td>
                          <td style={{ fontSize:12, color:'var(--fg-muted)', whiteSpace:'nowrap' }}>{p.category}</td>
                          <td><strong style={{ fontFamily:'var(--font-display)', fontSize:15 }}>{formatBRL(p.price)}</strong></td>
                          <td style={{ fontSize:12, color:'var(--fg-faint)', textDecoration:'line-through' }}>{p.originalPrice?formatBRL(p.originalPrice):'—'}</td>
                          <td style={{ color:'var(--brand-yellow)', fontSize:12 }}>★ {p.rating}</td>
                          <td><span className={`pill ${p.inStock?'active':'out'}`}>{p.inStock?'Activo':'Esgotado'}</span></td>
                          <td>
                            <div style={{ display:'flex', gap:4 }}>
                              <button onClick={()=>{setEP(p);nav('product-edit')}} style={{ background:'none', border:'none', color:'var(--brand-orange)', cursor:'pointer', fontSize:12, fontFamily:'var(--font-ui)', fontWeight:600 }}>Editar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═══ PRODUCT NEW / EDIT ══════════════════════════════ */}
          {(screen==='product-new'||screen==='product-edit') && (
            <>
              <div className="admin-page-head">
                <div>
                  <button onClick={()=>nav('products')} style={{ background:'none', border:'none', color:'var(--fg-muted)', cursor:'pointer', fontSize:13, marginBottom:8, display:'block' }}>← Voltar aos produtos</button>
                  <h1>{screen==='product-new'?'Novo produto':`Editar · ${editProduct?.name??''}`}</h1>
                </div>
              </div>
              <div style={{ maxWidth:760 }}>
                <ProductForm product={editProduct??undefined} onCancel={()=>nav('products')}/>
              </div>
            </>
          )}

          {/* ═══ INVENTORY ═══════════════════════════════════════ */}
          {screen==='inventory' && (
            <>
              <div className="admin-page-head">
                <div><h1>Estoque</h1><div className="sub">Monitoramento em tempo real</div></div>
                <button className="btn btn-ghost" style={{ fontSize:12 }}>🔄 Actualizar</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                {[
                  { label:'Produtos activos', value: catalog.filter(p=>p.inStock).length, color:'var(--brand-green)' },
                  { label:'Estoque crítico',  value: 8, color:'var(--brand-red)' },
                  { label:'Sem estoque',      value: catalog.filter(p=>!p.inStock).length, color:'var(--fg-muted)' },
                ].map(s=>(
                  <div key={s.label} className="kpi">
                    <div className="label">{s.label}</div>
                    <div className="v" style={{ color:s.color, fontSize:40 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="adm-card">
                <div style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                    <thead><tr>
                      <th>Produto</th><th>SKU</th>
                      {[39,40,41,42,43,44].map(s=><th key={s}>{s}</th>)}
                      <th>Total</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                      {catalog.map(p=>{
                        const total = p.sizes.reduce((a,s)=>a+s.stock,0)
                        const critical = total < 5
                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ fontWeight:600, fontSize:12 }}>{p.name}</div>
                              <div style={{ fontSize:10, color:'var(--fg-faint)' }}>{p.brand}</div>
                            </td>
                            <td style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-faint)' }}>{p.sku.slice(0,14)}</td>
                            {[39,40,41,42,43,44].map(sz=>{
                              const sv = p.sizes.find(s=>s.size===sz)
                              return (
                                <td key={sz}>
                                  <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color: !sv?'var(--fg-faint)': sv.stock===0?'var(--brand-red)': sv.stock<3?'var(--brand-yellow)':'var(--fg)' }}>
                                    {sv?sv.stock:'—'}
                                  </span>
                                </td>
                              )
                            })}
                            <td><strong style={{ fontFamily:'var(--font-mono)' }}>{total}</strong></td>
                            <td><span className={`pill ${critical?'out':'active'}`}>{critical?'Crítico':'OK'}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═══ CUSTOMERS ═══════════════════════════════════════ */}
          {screen==='customers' && (
            <>
              <div className="admin-page-head">
                <div><h1>Clientes</h1><div className="sub">{customers.length} clientes registados</div></div>
                <button className="btn btn-ghost" style={{ fontSize:12 }}>Exportar CSV</button>
              </div>
              <div className="adm-card">
                <div style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                    <thead><tr>
                      <th>Cliente</th><th>E-mail</th><th>Pedidos</th><th>LTV</th><th>Último pedido</th><th>Score</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                      {customers.map(c=>(
                        <tr key={c.id} style={{ cursor:'pointer' }}>
                          <td>
                            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--brand-orange)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'var(--font-display)', fontSize:13, flexShrink:0 }}>
                                {c.name[0]}
                              </div>
                              <span style={{ fontWeight:600, fontSize:12 }}>{c.name}</span>
                            </div>
                          </td>
                          <td style={{ fontSize:12, color:'var(--fg-muted)' }}>{c.email}</td>
                          <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{c.orders}</td>
                          <td><strong style={{ fontFamily:'var(--font-display)', fontSize:15, color:'var(--brand-green)' }}>{formatBRL(c.ltv)}</strong></td>
                          <td style={{ fontSize:12, color:'var(--fg-muted)' }}>{c.last}</td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:99, maxWidth:64 }}>
                                <div style={{ width:`${c.score}%`, height:'100%', background:'var(--brand-orange)', borderRadius:99 }}/>
                              </div>
                              <span style={{ fontFamily:'var(--font-mono)', fontSize:11 }}>{c.score}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`pill ${c.status==='vip'?'paid':c.status==='new'?'pending':'processing'}`}>
                              {c.status==='vip'?'VIP':c.status==='new'?'Novo':'Regular'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ═══ COUPONS ════════════════════════════════════════ */}
          {screen==='coupons' && (
            <>
              <div className="admin-page-head">
                <div><h1>Cupons</h1><div className="sub">{coupons.filter(c=>c.active).length} activos</div></div>
                <button className="btn btn-primary" style={{ fontSize:12 }}>+ Novo cupom</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
                {coupons.map(c=>(
                  <div key={c.code} className={`coupon-card${!c.active?' expired':''}`}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div className="code">{c.code}</div>
                      <span className={`pill ${c.active?'active':'archived'}`}>{c.active?'Activo':'Expirado'}</span>
                    </div>
                    <div className="desc">
                      {c.type==='percent'&&`${c.val}% de desconto`}
                      {c.type==='fixed'&&`R$ ${c.val} de desconto`}
                      {c.type==='shipping'&&'Frete grátis'}
                    </div>
                    <div className="stats">
                      <div><span className="l">Utilizações</span><strong>{c.uses}/{c.limit}</strong></div>
                      <div><span className="l">Expira em</span>{c.expires}</div>
                    </div>
                    <div style={{ height:4, background:'var(--border)', borderRadius:99, marginTop:12 }}>
                      <div style={{ width:`${(c.uses/c.limit)*100}%`, height:'100%', background: c.active?'var(--brand-orange)':'var(--ink-400)', borderRadius:99, transition:'width .4s' }}/>
                    </div>
                    <div style={{ display:'flex', gap:6, marginTop:12 }}>
                      <button className="btn btn-ghost" style={{ fontSize:11 }}>Editar</button>
                      <button className="btn" style={{ fontSize:11, background:'transparent', border:'1px solid var(--brand-red)', color:'var(--brand-red)' }}>Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ REPORTS ════════════════════════════════════════ */}
          {screen==='reports' && (
            <>
              <div className="admin-page-head">
                <div><h1>Relatórios</h1><div className="sub">Maio 2026</div></div>
                <button className="btn btn-ghost" style={{ fontSize:12 }}>Exportar PDF</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                {[
                  { label:'Receita (mês)',  value:'R$ 87.450', delta:'▲ 31%' },
                  { label:'Pedidos',        value:'247',       delta:'▲ 18%' },
                  { label:'Novos clientes', value:'89',        delta:'▲ 12%' },
                  { label:'Abandono cart.', value:'68%',       delta:'▼ 3pp' },
                  { label:'NPS score',      value:'72',        delta:'▲ 5' },
                  { label:'Custo/conv.',    value:'R$ 48',     delta:'▼ 8%' },
                ].map(r=>(
                  <div key={r.label} className="kpi">
                    <div className="label">{r.label}</div>
                    <div className="v" style={{ fontSize:28 }}>{r.value}</div>
                    <div className={`delta ${r.delta.startsWith('▲')?'up':'down'}`}>{r.delta} vs mês anterior</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
                <div className="adm-card">
                  <div className="adm-card-head"><h3>Receita — últimos 30 dias</h3></div>
                  <div style={{ padding:'0 16px 16px' }}><Chart/></div>
                </div>
                <div className="adm-card">
                  <div className="adm-card-head"><h3>Por forma de pagamento</h3></div>
                  <div style={{ padding:'0 16px 16px' }}>
                    {[['Pix',54,'var(--brand-teal)'],['Cartão',38,'var(--brand-orange)'],['Boleto',8,'var(--fg-muted)']].map(([m,p,c])=>(
                      <div key={m as string} style={{ marginBottom:12 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                          <span style={{ color:'var(--fg-muted)' }}>{m}</span><span>{p}%</span>
                        </div>
                        <div style={{ height:6, background:'var(--border)', borderRadius:99 }}>
                          <div style={{ width:`${p}%`, height:'100%', background: c as string, borderRadius:99 }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ SETTINGS ════════════════════════════════════════ */}
          {screen==='settings' && (
            <>
              <div className="admin-page-head"><div><h1>Configurações</h1></div></div>
              <div className="settings">
                {/* Side nav */}
                <div className="side">
                  {['geral','pagamentos','frete','notificacoes','integrações'].map(s=>(
                    <a key={s} className={settingsTab===s?'active':''} style={{ cursor:'pointer', textTransform:'capitalize' }} onClick={()=>setST(s)}>{s}</a>
                  ))}
                </div>
                {/* Content */}
                <div>
                  {settingsTab==='geral' && (
                    <div className="adm-card">
                      <div className="adm-card-head"><h3>Informações da loja</h3></div>
                      <div style={{ padding:'0 20px 20px' }}>
                        {[
                          { label:'Nome da loja',      val:"Galvão's Store" },
                          { label:'CNPJ',              val:'00.000.000/0001-00' },
                          { label:'E-mail de contacto',val:'contato@galvaostore.com.br' },
                          { label:'Telefone',          val:'(11) 99999-0000' },
                        ].map(f=>(
                          <div key={f.label} className="field">
                            <label>{f.label}</label>
                            <input defaultValue={f.val}/>
                          </div>
                        ))}
                        <button className="btn btn-primary" style={{ fontSize:12 }}>Salvar</button>
                      </div>
                    </div>
                  )}
                  {settingsTab==='pagamentos' && (
                    <div className="adm-card">
                      <div className="adm-card-head"><h3>Configurações de pagamento</h3></div>
                      <div style={{ padding:'0 20px 20px' }}>
                        {[
                          { label:'Desconto Pix (%)', val:'5' },
                          { label:'Máx. parcelas sem juros', val:'12' },
                        ].map(f=>(
                          <div key={f.label} className="field">
                            <label>{f.label}</label>
                            <input defaultValue={f.val} type="number"/>
                          </div>
                        ))}
                        <div className="adm-card-head" style={{ marginTop:20 }}><h3>Formas de pagamento</h3></div>
                        {[
                          { label:'Pix', desc:'Desconto automático de 5%' },
                          { label:'Cartão de crédito', desc:'Até 12× sem juros' },
                          { label:'Boleto bancário', desc:'Prazo de 1-3 dias úteis' },
                        ].map(p=>(
                          <div key={p.label} className="row-toggle">
                            <div><div className="t">{p.label}</div><div className="s">{p.desc}</div></div>
                            <div className="switch on"/>
                          </div>
                        ))}
                        <button className="btn btn-primary" style={{ fontSize:12, marginTop:16 }}>Salvar</button>
                      </div>
                    </div>
                  )}
                  {settingsTab==='frete' && (
                    <div className="adm-card">
                      <div className="adm-card-head"><h3>Configurações de frete</h3></div>
                      <div style={{ padding:'0 20px 20px' }}>
                        {[
                          { label:'Frete grátis acima de (R$)', val:'399' },
                          { label:'Prazo SEDEX (dias úteis)', val:'2' },
                        ].map(f=>(
                          <div key={f.label} className="field">
                            <label>{f.label}</label>
                            <input defaultValue={f.val} type="number"/>
                          </div>
                        ))}
                        <button className="btn btn-primary" style={{ fontSize:12 }}>Salvar</button>
                      </div>
                    </div>
                  )}
                  {settingsTab==='notificacoes' && (
                    <div className="adm-card">
                      <div className="adm-card-head"><h3>Notificações</h3></div>
                      <div style={{ padding:'0 20px 20px' }}>
                        {(Object.entries(toggles) as [keyof typeof toggles, boolean][]).map(([k,v])=>(
                          <div key={k} className="row-toggle">
                            <div>
                              <div className="t" style={{ textTransform:'capitalize' }}>{k}</div>
                              <div className="s">Activar notificações de {k}</div>
                            </div>
                            <div className={`switch ${v?'on':''}`} onClick={()=>setToggles(t=>({...t,[k]:!v}))}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {settingsTab==='integrações' && (
                    <div className="adm-card">
                      <div className="adm-card-head"><h3>Integrações</h3></div>
                      <div style={{ padding:'0 20px 20px' }}>
                        {['Google Analytics','Meta Pixel','Hotjar','Mailchimp'].map(i=>(
                          <div key={i} className="row-toggle">
                            <div><div className="t">{i}</div><div className="s">Integração com {i}</div></div>
                            <div className="switch"/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
