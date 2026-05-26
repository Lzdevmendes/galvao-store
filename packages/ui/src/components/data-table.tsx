'use client'

import { useState, useMemo, useCallback } from 'react'
import { cn } from '../lib/cn'

// ── Types ────────────────────────────────────────────────

export type SortDir = 'asc' | 'desc'

export interface Column<T> {
  key:        string
  header:     string
  cell:       (row: T) => React.ReactNode
  sortable?:  boolean
  className?: string
  align?:     'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data:           T[]
  columns:        Column<T>[]
  keyExtractor:   (row: T) => string
  pageSize?:      number
  emptyMessage?:  string
  loading?:       boolean
  className?:     string
  onRowClick?:    (row: T) => void
  defaultSort?:   { key: string; dir: SortDir }
  getSortValue?:  (row: T, key: string) => string | number
}

// ── Component ────────────────────────────────────────────

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 20,
  emptyMessage = 'Nenhum resultado encontrado.',
  loading = false,
  className,
  onRowClick,
  defaultSort,
  getSortValue,
}: DataTableProps<T>) {
  const [sort, setSort]   = useState<{ key: string; dir: SortDir } | null>(defaultSort ?? null)
  const [page, setPage]   = useState(1)

  const sorted = useMemo(() => {
    if (!sort || !getSortValue) return data
    return [...data].sort((a, b) => {
      const av = getSortValue(a, sort.key)
      const bv = getSortValue(b, sort.key)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [data, sort, getSortValue])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const slice = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = useCallback((key: string) => {
    setSort(prev => {
      if (prev?.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      return { key, dir: 'asc' }
    })
    setPage(1)
  }, [])

  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortable) return null
    const active = sort?.key === col.key
    return (
      <svg
        width="10" height="10" viewBox="0 0 10 10" fill="none"
        className={cn('ml-1 inline-block shrink-0 transition-colors', active ? 'text-[var(--brand-orange)]' : 'text-[var(--fg-faint)]')}
      >
        <path d="M5 1v8M2 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          opacity={sort?.key === col.key && sort.dir === 'desc' ? 0.3 : 1} />
        <path d="M5 9V1M2 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          opacity={sort?.key === col.key && sort.dir === 'asc' ? 0.3 : 1} />
      </svg>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-sunk)]">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 font-ui text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]',
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                    col.sortable && 'cursor-pointer select-none hover:text-[var(--fg)] transition-colors',
                    col.className,
                  )}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  {col.header}
                  <SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-[var(--bg-sunk)]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : slice.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center font-ui text-sm text-[var(--fg-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              slice.map(row => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'border-b border-[var(--border)] last:border-0 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-[var(--bg-sunk)]',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-[var(--fg)]',
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                        col.className,
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 font-ui text-sm text-[var(--fg-muted)]">
          <span>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} de {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <PagBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</PagBtn>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              let p = i + 1
              if (totalPages > 7) {
                const left  = Math.max(1, page - 3)
                const right = Math.min(totalPages, left + 6)
                p = left + i
                if (p > right) return null
              }
              return (
                <PagBtn key={p} active={p === page} onClick={() => setPage(p)}>
                  {p}
                </PagBtn>
              )
            })}
            <PagBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</PagBtn>
          </div>
        </div>
      )}
    </div>
  )
}

function PagBtn({ children, disabled, active, onClick }: {
  children: React.ReactNode; disabled?: boolean; active?: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-7 min-w-7 px-2 rounded-md text-xs font-semibold transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-[var(--brand-orange)] text-white'
          : 'hover:bg-[var(--bg-sunk)] text-[var(--fg-muted)]',
      )}
    >
      {children}
    </button>
  )
}
