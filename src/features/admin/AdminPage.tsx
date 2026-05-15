import { useState } from 'react'
import { catalog } from '../../infrastructure/catalog/products'
import { formatBRL } from '../../core/domain/product'

type Screen = 'dashboard' | 'orders' | 'products' | 'inventory' | 'customers' | 'coupons' | 'reports' | 'settings'

const kpis = [
  { label: 'Vendas hoje', value: 'R$ 14.892', delta: '▲ 23% vs ontem', up: true },
  { label: 'Pedidos hoje', value: '42', delta: '▲ 18% vs ontem', up: true },
  { label: 'Ticket médio', value: 'R$ 354', delta: '▲ 4% no mês', up: true },
  { label: 'Conversão', value: '3,8%', delta: '▼ 0,4 pp', up: false },
]

const orders = [
  { id: '#GS-1042', customer: 'Lucas Ferreira', email: 'lucas@email.com', product: 'Phantom GX III Elite', size: 41, price: 529.99, status: 'pago', date: '06/05 · 09:42', pay: 'Pix' },
  { id: '#GS-1041', customer: 'Marcos Oliveira', email: 'marcos@email.com', product: 'F50 Elite FG', size: 42, price: 799.99, status: 'enviado', date: '06/05 · 08:15', pay: 'Cartão 12×' },
  { id: '#GS-1040', customer: 'Rafael Santos', email: 'rafael@email.com', product: 'Future 8 Ultimate', size: 40, price: 749.99, status: 'entregue', date: '05/05 · 14:30', pay: 'Pix' },
  { id: '#GS-1039', customer: 'Diego Costa', email: 'diego@email.com', product: 'Predator Accuracy', size: 43, price: 689.99, status: 'cancelado', date: '05/05 · 10:00', pay: 'Boleto' },
  { id: '#GS-1038', customer: 'Bruno Mendes', email: 'bruno@email.com', product: 'Mercurial Vapor XV', size: 44, price: 869.99, status: 'pago', date: '04/05 · 18:22', pay: 'Cartão 6×' },
]

const statusPill: Record<string, { cls: string; label: string }> = {
  pago:      { cls: 'green',  label: 'Pago' },
  enviado:   { cls: 'teal',   label: 'Enviado' },
  entregue:  { cls: 'gray',   label: 'Entregue' },
  cancelado: { cls: 'red',    label: 'Cancelado' },
  separacao: { cls: 'yellow', label: 'Em separação' },
}

const nav_items: { key: Screen; label: string; badge?: number; group: string }[] = [
  { group: 'Operação', key: 'dashboard', label: '📊 Dashboard' },
  { group: 'Operação', key: 'orders', label: '📦 Pedidos', badge: 14 },
  { group: 'Operação', key: 'inventory', label: '📋 Estoque', badge: 8 },
  { group: 'Catálogo', key: 'products', label: '👟 Produtos', badge: catalog.length },
  { group: 'Marketing', key: 'customers', label: '👥 Clientes' },
  { group: 'Marketing', key: 'coupons', label: '🎟️ Cupons' },
  { group: 'Marketing', key: 'reports', label: '📈 Relatórios' },
  { group: 'Sistema', key: 'settings', label: '⚙️ Configurações' },
]

function MiniChart() {
  const pts = [140,130,138,110,120,95,105,78,90,65,75,50,60,80,50,60,35,45,25,40,20]
  const w = 560; const h = 160
  const path = pts.map((y, i) => `${(i/(pts.length-1))*w},${y}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 160 }}>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F26B1F" stopOpacity=".25"/>
          <stop offset="100%" stopColor="#F26B1F" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[40,80,120].map(y => <line key={y} x1="0" y1={y} x2={w} y2={y} stroke="var(--border)" strokeDasharray="3 6"/>)}
      <polyline points={`${path} ${w},${h} 0,${h}`} fill="url(#g)"/>
      <polyline points={path} fill="none" stroke="#F26B1F" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx={w} cy={pts[pts.length-1]} r="5" fill="#F26B1F"/>
    </svg>
  )
}

export function AdminPage() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [sideOpen, setSideOpen] = useState(true)
  const groups = [...new Set(nav_items.map(n => n.group))]

  return (
    <div className="admin-app" data-theme="dark">
      {/* Sidebar */}
      {sideOpen && (
        <aside className="admin-nav">
          <div className="logo">
            <div className="logo-text">
              <div className="t">GALVÃO'S STORE</div>
              <div className="s">ADMIN PANEL</div>
            </div>
          </div>

          {groups.map(g => (
            <div key={g}>
              <h5>{g}</h5>
              {nav_items.filter(n => n.group === g).map(n => (
                <a key={n.key} className={screen === n.key ? 'active' : ''} onClick={() => setScreen(n.key)}>
                  {n.label}
                  {n.badge && <span className="badge">{n.badge}</span>}
                </a>
              ))}
            </div>
          ))}

          <div className="me">
            <div className="av">A</div>
            <div>
              <div className="name">Anderson Galvão</div>
              <div className="role">Admin</div>
            </div>
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <button onClick={() => setSideOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 18, padding: '4px 8px' }}>☰</button>
          <span className="crumb">{nav_items.find(n => n.key === screen)?.label?.replace(/^[^\s]+\s/, '') ?? 'DASHBOARD'}</span>
          <div className="search">
            <svg className="ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input placeholder="Buscar pedidos, produtos, clientes..." />
          </div>
          <div className="actions">
            <button className="btn btn-primary btn-sm" onClick={() => setScreen('products')}>+ Novo produto</button>
          </div>
        </div>

        {/* Content */}
        <div className="admin-page">

          {/* Dashboard */}
          {screen === 'dashboard' && (
            <>
              <div className="admin-page-head">
                <div>
                  <h1>Bom dia, Anderson 👊</h1>
                  <div className="sub">Quarta, 14 de maio · R$ 4.290 vendidos enquanto dormias.</div>
                </div>
              </div>

              <div className="kpi-row">
                {kpis.map((k, i) => (
                  <div key={k.label} className={`kpi${i === 0 ? ' accent' : ''}`}>
                    <div className="label">{k.label}</div>
                    <div className="v">{k.value}</div>
                    <div className={`delta ${k.up ? 'up' : 'down'}`}>{k.delta}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="adm-card">
                  <div className="adm-card-head"><h3>Vendas — últimos 30 dias</h3></div>
                  <div style={{ padding: '16px 20px 20px' }}><MiniChart /></div>
                </div>
                <div className="adm-card">
                  <div className="adm-card-head"><h3>Top produtos</h3></div>
                  <div style={{ padding: '0 20px 16px' }}>
                    {catalog.slice(0, 5).map((p, i) => (
                      <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-faint)', width: 16, textAlign: 'right' }}>{i + 1}</span>
                        <img src={p.images[0]?.url} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'contain', background: 'var(--bg-sunk)', mixBlendMode: 'normal' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--fg-faint)' }}>{p.brand}</div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--brand-green)' }}>{formatBRL(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'rgba(226,59,59,.08)', border: '1px solid rgba(226,59,59,.2)', borderRadius: 'var(--r-md)', padding: 16, fontSize: 13 }}>
                  <strong style={{ color: 'var(--brand-red)' }}>⚠ 8 produtos com estoque crítico</strong>
                  <p style={{ color: 'var(--fg-muted)', margin: '4px 0 0', fontSize: 12 }}>Repor antes de esgotar</p>
                </div>
                <div style={{ background: 'rgba(255,200,58,.08)', border: '1px solid rgba(255,200,58,.2)', borderRadius: 'var(--r-md)', padding: 16, fontSize: 13 }}>
                  <strong style={{ color: 'var(--brand-yellow)' }}>⏳ 3 pedidos aguardam aprovação</strong>
                  <p style={{ color: 'var(--fg-muted)', margin: '4px 0 0', fontSize: 12 }}>Análise manual necessária</p>
                </div>
                <div style={{ background: 'rgba(44,179,90,.08)', border: '1px solid rgba(44,179,90,.2)', borderRadius: 'var(--r-md)', padding: 16, fontSize: 13 }}>
                  <strong style={{ color: 'var(--brand-green)' }}>✓ Meta do mês atingida (112%)</strong>
                  <p style={{ color: 'var(--fg-muted)', margin: '4px 0 0', fontSize: 12 }}>Parabéns à equipa!</p>
                </div>
              </div>

              {/* Recent orders */}
              <div className="adm-card">
                <div className="adm-card-head">
                  <h3>Pedidos recentes</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setScreen('orders')}>Ver todos →</button>
                </div>
                <OrdersTable orders={orders.slice(0, 5)} />
              </div>
            </>
          )}

          {/* Orders */}
          {screen === 'orders' && (
            <>
              <div className="admin-page-head">
                <div><h1>Pedidos</h1><div className="sub">{orders.length} pedidos</div></div>
              </div>
              <div className="adm-card">
                <OrdersTable orders={orders} />
              </div>
            </>
          )}

          {/* Products */}
          {screen === 'products' && (
            <>
              <div className="admin-page-head">
                <div><h1>Produtos</h1><div className="sub">{catalog.length} produtos</div></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm">+ Novo produto</button>
                </div>
              </div>
              <div className="adm-card">
                <table className="adm-table">
                  <thead><tr>
                    <th>Produto</th><th>Marca</th><th>Categoria</th><th>Preço</th><th>Rating</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {catalog.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <img src={p.images[0]?.url} alt="" style={{ width: 36, height: 36, objectFit: 'contain', background: 'var(--bg-sunk)', borderRadius: 4, mixBlendMode: 'normal' }} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 12 }}>{p.name}</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-faint)' }}>"{p.colorway}"</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{p.brand}</td>
                        <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{p.category}</td>
                        <td><strong style={{ fontFamily: 'var(--font-display)', fontSize: 14 }}>{formatBRL(p.price)}</strong></td>
                        <td style={{ fontSize: 12, color: 'var(--brand-yellow)' }}>★ {p.rating}</td>
                        <td><span className={`pill ${p.inStock ? 'green' : 'red'}`}>{p.inStock ? 'Em estoque' : 'Esgotado'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Reports */}
          {screen === 'reports' && (
            <>
              <div className="admin-page-head"><div><h1>Relatórios</h1></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                {[
                  { label: 'Receita (mês)', value: 'R$ 87.450', delta: '+31%' },
                  { label: 'Pedidos (mês)', value: '247', delta: '+18%' },
                  { label: 'Novos clientes', value: '89', delta: '+12%' },
                  { label: 'Abandono carrinho', value: '68%', delta: '-3pp' },
                  { label: 'NPS score', value: '72', delta: '+5' },
                  { label: 'Custo/conversão', value: 'R$ 48', delta: '-8%' },
                ].map(r => (
                  <div key={r.label} className="kpi">
                    <div className="label">{r.label}</div>
                    <div className="v">{r.value}</div>
                    <div className="delta up">{r.delta} vs mês anterior</div>
                  </div>
                ))}
              </div>
              <div className="adm-card">
                <div className="adm-card-head"><h3>Receita — últimos 30 dias</h3></div>
                <div style={{ padding: '16px 20px 20px' }}><MiniChart /></div>
              </div>
            </>
          )}

          {/* Others */}
          {!['dashboard','orders','products','reports'].includes(screen) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 72, opacity: .15 }}>EM BREVE</div>
                <p style={{ color: 'var(--fg-muted)', marginTop: 12 }}>Esta secção está em desenvolvimento.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OrdersTable({ orders: list }: { orders: typeof orders }) {
  return (
    <table className="adm-table">
      <thead><tr>
        <th>Pedido</th><th>Data</th><th>Cliente</th><th>Produto</th><th>Tam.</th><th>Valor</th><th>Pag.</th><th>Status</th>
      </tr></thead>
      <tbody>
        {list.map(o => (
          <tr key={o.id}>
            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-orange)', fontSize: 12 }}>{o.id}</td>
            <td style={{ fontSize: 11, color: 'var(--fg-faint)' }}>{o.date}</td>
            <td>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{o.customer}</div>
              <div style={{ fontSize: 10, color: 'var(--fg-faint)' }}>{o.email}</div>
            </td>
            <td style={{ fontSize: 12, color: 'var(--fg-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product}</td>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{o.size}</td>
            <td><strong style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>{formatBRL(o.price)}</strong></td>
            <td style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{o.pay}</td>
            <td><span className={`pill ${statusPill[o.status]?.cls ?? 'gray'}`}>{statusPill[o.status]?.label ?? o.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
