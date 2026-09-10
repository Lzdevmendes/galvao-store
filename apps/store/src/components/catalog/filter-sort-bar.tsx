'use client'
import { useRouter, usePathname } from 'next/navigation'
import type { SortOption } from '@/lib/catalog-query'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevancia',  label: 'Relevância'   },
  { value: 'lancamentos', label: 'Lançamentos'  },
  { value: 'menor-preco', label: 'Menor preço'  },
  { value: 'maior-preco', label: 'Maior preço'  },
]

interface FilterSortBarProps {
  total:          number
  availableSizes: string[]
  lines?:         string[]
  // valores actuais dos filtros (lidos pelo servidor, passados como props)
  currentLine?:   string
  currentSize?:   string
  currentSort?:   string
}

export function FilterSortBar({
  total, availableSizes, lines = [],
  currentLine = '', currentSize = '', currentSort = 'relevancia',
}: FilterSortBarProps) {
  const router   = useRouter()
  const pathname = usePathname()

  const update = (key: string, value: string | null) => {
    // Lê os parâmetros actuais directamente da URL
    const params = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : ''
    )
    if (value && value !== 'relevancia') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const toggleSize = (s: string) => update('tamanho', currentSize === s ? null : s)
  const toggleLine = (l: string) => update('linha',   currentLine === l ? null : l)
  const setSort    = (v: string) => update('sort', v)

  const hasFilters = !!(currentSize || currentLine)

  const clearAll = () => {
    const params = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : ''
    )
    params.delete('tamanho')
    params.delete('linha')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div style={{ background: 'var(--bg-elev)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">

        {/* Sub-linhas (só aparece em brand pages com >1 linha) */}
        {lines.length > 0 && (
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            <NavPill active={!currentLine} onClick={() => toggleLine('')}>Todos</NavPill>
            {lines.map(l => (
              <NavPill key={l} active={currentLine === l} onClick={() => toggleLine(l)}>{l}</NavPill>
            ))}
          </div>
        )}

        {/* Resultado */}
        <div style={{ padding: '10px 0 0' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>
            {total} {total === 1 ? 'produto' : 'produtos'}
          </span>
        </div>

        {/* Sort — scroll horizontal no mobile em vez de quebrar linha */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600, flexShrink: 0 }}>
            Ordenar:
          </span>
          {SORT_OPTIONS.map(opt => (
            <SortChip
              key={opt.value}
              active={currentSort === opt.value}
              onClick={() => setSort(opt.value)}
            >
              {opt.label}
            </SortChip>
          ))}
        </div>

        {/* Filtro de tamanho — scroll horizontal no mobile em vez de quebrar linha */}
        {availableSizes.length > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingBottom: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600, marginRight: 2, flexShrink: 0 }}>
              Tamanho:
            </span>
            {availableSizes.map(s => (
              <SizeChip
                key={s}
                active={currentSize === s}
                onClick={() => toggleSize(s)}
              >
                {s}
              </SizeChip>
            ))}
            {hasFilters && (
              <button
                onClick={clearAll}
                style={{ marginLeft: 4, flexShrink: 0, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--fg-muted)' }}
              >
                ✕ Limpar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function NavPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '13px 20px', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active ? 700 : 600,
        cursor: 'pointer', border: 'none', background: 'transparent', flexShrink: 0,
        color:       active ? 'var(--brand-orange)' : 'var(--fg-muted)',
        borderBottom: active ? '2px solid var(--brand-orange)' : '2px solid transparent',
        transition: 'all .15s',
      }}
    >
      {children}
    </button>
  )
}

function SortChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 11px', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-ui)', fontWeight: 600,
        cursor: 'pointer', transition: 'all .15s',
        border:      active ? '1.5px solid var(--brand-orange)' : '1.5px solid var(--border)',
        background:  active ? 'var(--brand-orange)' : 'transparent',
        color:       active ? '#fff' : 'var(--fg-muted)',
      }}
    >
      {children}
    </button>
  )
}

function SizeChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 42, height: 34, borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
        cursor: 'pointer', transition: 'all .15s',
        border:     active ? '2px solid var(--brand-orange)' : '2px solid var(--border-strong)',
        background: active ? '#0B0E12' : 'transparent',
        color:      active ? '#fff' : 'var(--fg)',
        boxShadow:  active ? '0 0 0 2px rgba(242,107,31,.18)' : 'none',
      }}
    >
      {children}
    </button>
  )
}
