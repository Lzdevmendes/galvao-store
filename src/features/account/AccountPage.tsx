import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../shared/store'
import { catalog } from '../../infrastructure/catalog/products'
import { formatBRL } from '../../core/domain/product'
import { ProductCard } from '../../shared/product/ProductCard'

type Tab = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings'

const orders = [
  { id: '#GS-1042', date: '06/05/2026', product: 'Phantom GX III Elite · Tam 41', total: 529.99, status: 'em_transito', statusLabel: 'Em trânsito', statusColor: 'orange' },
  { id: '#GS-0987', date: '14/04/2026', product: 'F50 Elite FG "Solar Yellow" · Tam 42', total: 799.99, status: 'entregue', statusLabel: 'Entregue', statusColor: 'green' },
  { id: '#GS-0754', date: '02/03/2026', product: 'Future 8 Ultimate · Tam 41', total: 749.99, status: 'entregue', statusLabel: 'Entregue', statusColor: 'green' },
]

export function AccountPage() {
  const nav = useNavigate()
  const { wishlist } = useStore()
  const [tab, setTab] = useState<Tab>('overview')
  const wishedProds = catalog.filter(p => wishlist.includes(p.id))

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Visão geral' },
    { key: 'orders', label: `Pedidos (${orders.length})` },
    { key: 'wishlist', label: `Favoritos (${wishedProds.length})` },
    { key: 'addresses', label: 'Endereços' },
    { key: 'settings', label: 'Configurações' },
  ]

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      {/* User header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 28, color: '#fff', flexShrink: 0 }}>L</div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: 0 }}>Léo Mendes</h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: 14, margin: 0 }}>leo@exemplo.com · Cliente desde Jan/2024</p>
          <span className="badge badge-orange" style={{ marginTop: 8, display: 'inline-block' }}>★ CLUBE GALVÃO'S · VIP</span>
        </div>
        <button onClick={() => nav('/login')} style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 16px', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 13 }}>Sair</button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: 0, marginBottom: 32, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '12px 20px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14,
            background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            borderBottom: tab === t.key ? '2px solid var(--brand-orange)' : '2px solid transparent',
            color: tab === t.key ? 'var(--brand-orange)' : 'var(--fg-muted)',
            marginBottom: -1, transition: 'all .15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total gasto', value: 'R$ 8.247', color: 'var(--brand-green)' },
              { label: 'Pedidos', value: orders.length.toString(), color: 'var(--fg)' },
              { label: 'Ticket médio', value: 'R$ 687', color: 'var(--fg)' },
              { label: 'Favoritos', value: wishedProds.length.toString(), color: 'var(--brand-orange)' },
            ].map(s => (
              <div key={s.label} className="kpi">
                <div className="label">{s.label}</div>
                <div className="v" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>Último pedido</h3>
          <OrderCard order={orders[0]} onDetails={() => setTab('orders')} />
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}

      {/* Wishlist */}
      {tab === 'wishlist' && (
        wishedProds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--fg-muted)' }}>
            <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 72, opacity: .2 }}>♡</div>
            <p style={{ marginTop: 16 }}>Sem favoritos ainda.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/produtos')}>Ver produtos</button>
          </div>
        ) : (
          <div className="grid" data-density="4">
            {wishedProds.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )
      )}

      {/* Addresses */}
      {tab === 'addresses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Casa', street: 'Av. Paulista, 1000 — Ap. 42', city: 'São Paulo/SP · CEP 01310-100', def: true },
            { label: 'Trabalho', street: 'Rua Oscar Freire, 500 — Sala 12', city: 'São Paulo/SP · CEP 01426-001', def: false },
          ].map(a => (
            <div key={a.label} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <strong style={{ fontFamily: 'var(--font-display)' }}>{a.label}</strong>
                  {a.def && <span className="badge badge-teal">PADRÃO</span>}
                </div>
                <p style={{ color: 'var(--fg-muted)', fontSize: 14, margin: 0 }}>{a.street}</p>
                <p style={{ color: 'var(--fg-faint)', fontSize: 13, margin: 0 }}>{a.city}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm">Editar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div style={{ maxWidth: 480 }}>
          {[
            { label: 'Nome', value: 'Léo Mendes' },
            { label: 'E-mail', value: 'leo@exemplo.com' },
            { label: 'Telefone', value: '(11) 9 8765-4321' },
          ].map(f => (
            <div key={f.label} className="form-group">
              <label style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>{f.label}</label>
              <input defaultValue={f.value} style={{ padding: '12px 16px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: 14, background: 'var(--bg-elev)', color: 'var(--fg)', fontFamily: 'inherit', outline: 'none', width: '100%' }} />
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop: 8 }}>Salvar alterações</button>
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onDetails }: { order: typeof orders[0]; onDetails?: () => void }) {
  return (
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-sunk)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-orange)' }}>{order.id}</span>
        <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{order.date}</span>
        <span className={`pill ${order.statusColor === 'green' ? 'green' : order.statusColor === 'orange' ? 'teal' : 'gray'}`}>{order.statusLabel}</span>
        <strong style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: 18 }}>{formatBRL(order.total)}</strong>
      </div>
      <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: 0 }}>{order.product}</p>
        {onDetails && <button className="btn btn-ghost btn-sm" onClick={onDetails}>Ver detalhes →</button>}
      </div>
    </div>
  )
}
