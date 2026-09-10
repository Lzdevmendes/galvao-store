import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import {
  RunAllButton, TestSourceButton, ToggleSourceButton,
  CreateSourceForm, CreatePriceRuleForm, DeletePriceRuleButton,
  RetryPendingButton, DiscardPendingButton,
} from './importacoes-client'

type SourceRow = {
  id: string; name: string; base_url: string; parser_key: string
  active: number; request_delay_ms: number; last_run_at: string | null
}
type RunRow = {
  id: string; source_name: string; started_at: string; finished_at: string | null
  status: string | null; items_found: number; items_published: number
  items_updated: number; items_pending_price: number; error_message: string | null
}
type PriceRuleRow = {
  id: string; match_type: string; match_value: string; brand_name: string | null
  price_in_cents: number; price_promo_in_cents: number | null
}
type PendingRow = {
  id: string; source_name: string; raw_name: string; raw_brand: string | null
  raw_category: string | null; cost_in_cents: number | null; created_at: string
}
type BrandRow = { id: string; name: string }

function fmtMoney(cents: number | null) {
  if (cents == null) return '—'
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const card: React.CSSProperties = { background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 24, marginBottom: 20 }
const h2: React.CSSProperties = { fontFamily: 'Archivo Black, sans-serif', fontSize: 15, margin: '0 0 16px', color: '#F8F9FB' }
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', padding: '8px 10px', borderBottom: '1px solid #1E2530' }
const td: React.CSSProperties = { fontSize: 13, color: '#F8F9FB', padding: '10px', borderBottom: '1px solid #1E2530' }
const muted: React.CSSProperties = { color: '#6B7280', fontSize: 12 }

export default async function ImportacoesPage() {
  const [sources, runs, priceRules, pending, brands] = await Promise.all([
    db.all<SourceRow>(sql`SELECT id, name, base_url, parser_key, active, request_delay_ms, last_run_at FROM import_sources ORDER BY created_at DESC`),
    db.all<RunRow>(sql`
      SELECT ir.id, s.name as source_name, ir.started_at, ir.finished_at, ir.status,
             ir.items_found, ir.items_published, ir.items_updated, ir.items_pending_price, ir.error_message
      FROM import_runs ir JOIN import_sources s ON s.id = ir.source_id
      ORDER BY ir.started_at DESC LIMIT 20
    `),
    db.all<PriceRuleRow>(sql`
      SELECT r.id, r.match_type, r.match_value, b.name as brand_name, r.price_in_cents, r.price_promo_in_cents
      FROM import_price_rules r LEFT JOIN brands b ON b.id = r.brand_id
      ORDER BY r.created_at DESC
    `),
    db.all<PendingRow>(sql`
      SELECT p.id, s.name as source_name, p.raw_name, p.raw_brand, p.raw_category, p.cost_in_cents, p.created_at
      FROM import_pending_items p JOIN import_sources s ON s.id = p.source_id
      ORDER BY p.created_at DESC
    `),
    db.all<BrandRow>(sql`SELECT id, name FROM brands ORDER BY name`),
  ])

  return (
    <div style={{ padding: '24px 20px 96px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 22, color: '#F8F9FB', margin: '0 0 4px' }}>Importações</h1>
          <p style={{ ...muted, margin: 0 }}>Catálogo alimentado automaticamente dos sites de importadores. Publica direto — sem fila de revisão — só quando há regra de preço correspondente.</p>
        </div>
        <RunAllButton />
      </div>

      <section style={card}>
        <h2 style={h2}>Fontes (sites de importadores)</h2>
        <CreateSourceForm />
        {sources.length === 0 ? (
          <p style={muted}>Nenhuma fonte cadastrada ainda.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead><tr>
                <th style={th}>Nome</th><th style={th}>Parser</th><th style={th}>Última execução</th>
                <th style={th}>Status</th><th style={th}></th>
              </tr></thead>
              <tbody>
                {sources.map(s => (
                  <tr key={s.id}>
                    <td style={td}>{s.name}<div style={muted}>{s.base_url}</div></td>
                    <td style={td}>{s.parser_key}</td>
                    <td style={td}>{fmtDate(s.last_run_at)}</td>
                    <td style={td}>
                      <span style={{ color: s.active ? '#2CB35A' : '#6B7280' }}>{s.active ? 'ativo' : 'inativo'}</span>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <TestSourceButton sourceId={s.id} />
                      <ToggleSourceButton sourceId={s.id} active={!!s.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={card}>
        <h2 style={h2}>Regras de preço</h2>
        <p style={{ ...muted, margin: '0 0 16px' }}>O robô nunca calcula preço sozinho — sem regra correspondente, o item fica em &quot;Pendências&quot; abaixo.</p>
        <CreatePriceRuleForm brands={brands} />
        {priceRules.length === 0 ? (
          <p style={muted}>Nenhuma regra cadastrada ainda.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead><tr>
                <th style={th}>Tipo</th><th style={th}>Valor</th><th style={th}>Marca</th>
                <th style={th}>Preço</th><th style={th}>Promo</th><th style={th}></th>
              </tr></thead>
              <tbody>
                {priceRules.map(r => (
                  <tr key={r.id}>
                    <td style={td}>{r.match_type === 'sku' ? 'SKU exato' : 'Nome contém'}</td>
                    <td style={td}>{r.match_value}</td>
                    <td style={td}>{r.brand_name ?? <span style={muted}>qualquer</span>}</td>
                    <td style={td}>{fmtMoney(r.price_in_cents)}</td>
                    <td style={td}>{fmtMoney(r.price_promo_in_cents)}</td>
                    <td style={td}><DeletePriceRuleButton ruleId={r.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={card}>
        <h2 style={h2}>Pendências ({pending.length})</h2>
        <p style={{ ...muted, margin: '0 0 16px' }}>Achado pelo robô mas sem marca/categoria/preço reconhecidos — cadastre a regra que falta e tente de novo.</p>
        {pending.length === 0 ? (
          <p style={muted}>Nada pendente.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={th}>Produto</th><th style={th}>Marca/Categoria (site)</th>
                <th style={th}>Custo</th><th style={th}>Fonte</th><th style={th}></th>
              </tr></thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.id}>
                    <td style={td}>{p.raw_name}</td>
                    <td style={td}>{p.raw_brand ?? '—'} / {p.raw_category ?? '—'}</td>
                    <td style={td}>{fmtMoney(p.cost_in_cents)}</td>
                    <td style={td}>{p.source_name}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <RetryPendingButton pendingId={p.id} />
                      <DiscardPendingButton pendingId={p.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={card}>
        <h2 style={h2}>Últimas execuções</h2>
        {runs.length === 0 ? (
          <p style={muted}>Nenhuma execução ainda.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={th}>Fonte</th><th style={th}>Quando</th><th style={th}>Status</th>
                <th style={th}>Publicados</th><th style={th}>Atualizados</th><th style={th}>Pendentes</th><th style={th}>Erro</th>
              </tr></thead>
              <tbody>
                {runs.map(r => (
                  <tr key={r.id}>
                    <td style={td}>{r.source_name}</td>
                    <td style={td}>{fmtDate(r.started_at)}</td>
                    <td style={td}>
                      <span style={{ color: r.status === 'success' ? '#2CB35A' : r.status === 'error' ? '#E23B3B' : r.status === 'partial' ? '#F26B1F' : '#6B7280' }}>
                        {r.status ?? 'rodando…'}
                      </span>
                    </td>
                    <td style={td}>{r.items_published}</td>
                    <td style={td}>{r.items_updated}</td>
                    <td style={td}>{r.items_pending_price}</td>
                    <td style={{ ...td, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.error_message ?? ''}>
                      {r.error_message ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
