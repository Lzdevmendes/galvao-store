'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard, type ProductCardData } from '@/components/catalog/product-card'
import { SearchInput } from './search-input'

interface Props {
  q:               string
  products:        ProductCardData[]
  brands:          { slug: string; name: string }[]
  categories:      { slug: string; name: string }[]
  sizes:           string[]
  total:           number
  currentMarca?:   string
  currentCategoria?: string
  currentTamanho?: string
  currentSort?:    string
}

const SORT_OPTIONS = [
  { value: 'relevancia',   label: 'Relevância'    },
  { value: 'lancamentos',  label: 'Lançamentos'   },
  { value: 'menor-preco',  label: 'Menor Preço'   },
  { value: 'maior-preco',  label: 'Maior Preço'   },
]

const pill = (active: boolean): React.CSSProperties => ({
  padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: active ? 700 : 500,
  fontFamily: 'var(--font-ui)', cursor: 'pointer', border: 'none', transition: 'all .15s',
  background: active ? 'var(--brand-orange)' : 'var(--bg-elev)',
  color: active ? '#fff' : 'var(--fg-muted)',
  boxShadow: active ? '0 2px 8px rgba(242,107,31,.3)' : 'none',
})

export function BuscaClient({
  q, products, brands, categories, sizes, total,
  currentMarca, currentCategoria, currentTamanho, currentSort,
}: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const navigate = useCallback((params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams({ q })
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v) })
    start(() => router.push(`/busca?${sp}`))
  }, [q, router])

  const setSort   = (v: string) => navigate({ marca: currentMarca, categoria: currentCategoria, tamanho: currentTamanho, sort: v })
  const setMarca  = (v?: string) => navigate({ marca: v, categoria: currentCategoria, tamanho: currentTamanho, sort: currentSort })
  const setCat    = (v?: string) => navigate({ marca: currentMarca, categoria: v, tamanho: currentTamanho, sort: currentSort })
  const setTam    = (v?: string) => navigate({ marca: currentMarca, categoria: currentCategoria, tamanho: v, sort: currentSort })

  return (
    <>
      {/* Header Mobile compacto */}
      <div className="lhead-m">
        <div className="crumb">Busca</div>
        <h1>{q ? `"${q}"` : 'BUSCA'}<span className="o">.</span></h1>
        {q && (
          <div className="sub">{pending ? 'Buscando...' : total > 0 ? `${total} ${total > 1 ? 'resultados' : 'resultado'}` : 'Nenhum resultado'}</div>
        )}
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        {q ? (
          <>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.32em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8, fontWeight: 700 }}>
              Resultados para
            </div>
            <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(40px,6vw,80px)', lineHeight: .9, margin: '0 0 8px' }}>
              &ldquo;{q}&rdquo;
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)' }}>
              {pending ? 'Buscando...' : total > 0 ? `${total} produto${total > 1 ? 's' : ''} encontrado${total > 1 ? 's' : ''}` : 'Nenhum produto encontrado'}
            </p>
          </>
        ) : (
          <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 56 }}>BUSCA</h1>
        )}
        <div style={{ marginTop: 24, maxWidth: 640 }}>
          <SearchInput defaultValue={q} />
        </div>
      </motion.div>

      {/* ── Filtros ── */}
      {q && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .1 }}
          style={{ background: 'var(--bg-elev)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, border: '1px solid var(--border)' }}
        >
          {/* Marcas */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginRight: 4 }}>Marca</span>
            <button style={pill(!currentMarca)} onClick={() => setMarca(undefined)}>Todas</button>
            {brands.map(b => (
              <button key={b.slug} style={pill(currentMarca === b.slug)} onClick={() => setMarca(currentMarca === b.slug ? undefined : b.slug)}>{b.name}</button>
            ))}
          </div>

          {/* Categorias */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginRight: 4 }}>Cat.</span>
            <button style={pill(!currentCategoria)} onClick={() => setCat(undefined)}>Todas</button>
            {categories.map(c => (
              <button key={c.slug} style={pill(currentCategoria === c.slug)} onClick={() => setCat(currentCategoria === c.slug ? undefined : c.slug)}>{c.name}</button>
            ))}
          </div>

          {/* Tamanhos */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginRight: 4 }}>Tam.</span>
            {sizes.map(s => (
              <button key={s} style={{
                width: 40, height: 40, borderRadius: 8, fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-ui)', cursor: 'pointer', border: '1.5px solid',
                transition: 'all .15s',
                borderColor: currentTamanho === s ? 'var(--brand-orange)' : 'var(--border)',
                background: currentTamanho === s ? 'var(--brand-orange)' : 'transparent',
                color: currentTamanho === s ? '#fff' : 'var(--fg-muted)',
              }} onClick={() => setTam(currentTamanho === s ? undefined : s)}>{s}</button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Sort + Total ── */}
      {q && total > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)' }}>
            {total} resultado{total > 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} style={pill((currentSort ?? 'relevancia') === opt.value)} onClick={() => setSort(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      <AnimatePresence mode="wait">
        {q && total === 0 && !pending ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: .95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: '0 0 8px' }}>Sem resultados</h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--fg-muted)' }}>
              Tenta com outra palavra ou navega pelo catálogo completo.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: pending ? .5 : 1 }}
            transition={{ duration: .2 }}
            className="grid-products"
            data-density="4"
          >
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <ProductCard p={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state sem query ── */}
      {!q && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '80px 0' }}
        >
          <div style={{ fontSize: 72, marginBottom: 20 }}>⚽</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 12px' }}>O que você procura?</h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--fg-muted)', maxWidth: 400, margin: '0 auto' }}>
            Busca por modelo, marca ou categoria — ex: &ldquo;Phantom GX&rdquo;, &ldquo;Nike campo&rdquo;, &ldquo;tamanho 42&rdquo;.
          </p>
        </motion.div>
      )}
      </div>
    </>
  )
}
