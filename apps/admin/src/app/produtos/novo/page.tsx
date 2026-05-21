'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProduct } from './actions'

const BRANDS = [
  { id: 'nike',    name: 'Nike' },
  { id: 'adidas',  name: 'Adidas' },
  { id: 'puma',    name: 'Puma' },
  { id: 'umbro',   name: 'Umbro' },
  { id: 'nb',      name: 'New Balance' },
]

const CATEGORIES = [
  { id: 'campo',   name: 'Campo (FG)' },
  { id: 'society', name: 'Society (SG)' },
  { id: 'futsal',  name: 'Futsal (IC)' },
  { id: 'casual',  name: 'Tênis Casual' },
  { id: 'corrida', name: 'Corrida' },
  { id: 'camisas', name: 'Camisas' },
  { id: 'meias',   name: 'Meias' },
]

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 8,
  border: '1px solid #1E2530', background: '#141922',
  color: '#F8F9FB', fontSize: 14, outline: 'none',
  fontFamily: 'Space Grotesk, sans-serif', boxSizing: 'border-box',
}

function Field({ label, name, type = 'text', placeholder, hint, required, children }: {
  label: string; name?: string; type?: string; placeholder?: string
  hint?: string; required?: boolean; children?: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, fontWeight: 700 }}>
        {label}{required && <span style={{ color: '#E23B3B' }}> *</span>}
      </label>
      {children ?? (
        <input name={name} type={type} placeholder={placeholder} required={required} style={inp} />
      )}
      {hint && <p style={{ fontSize: 11, color: '#4A5462', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 15, margin: '0 0 20px', color: '#F8F9FB' }}>{title}</h3>
      {children}
    </div>
  )
}

export default function NovoProdutoPage() {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = new FormData(e.currentTarget)
    start(async () => {
      const res = await createProduct(form)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/produtos" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Produtos</Link>
        <span style={{ color: '#2A3340' }}>/</span>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 22, margin: 0 }}>Novo produto</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          {/* Left */}
          <div>
            <Section title="Informações básicas">
              <Field label="Nome do produto" name="name" placeholder="Nike Phantom GX III Elite FG" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Marca" required>
                  <select name="brand_id" required style={inp}>
                    <option value="">Selecione...</option>
                    {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Categoria" required>
                  <select name="category_id" required style={inp}>
                    <option value="">Selecione...</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Linha / Modelo" name="line" placeholder="Phantom, Predator, Future..." hint="Opcional — identifica a linha dentro da marca" />
              <Field label="Descrição" required>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Descreva o produto, tecnologias e diferenciais..."
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
                />
              </Field>
            </Section>

            <Section title="Preços">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Preço (R$)" name="price" type="number" placeholder="899.99" required hint="Preço normal de venda" />
                <Field label="Preço promocional (R$)" name="price_promo" type="number" placeholder="749.99" hint="Deixe vazio para sem promoção" />
              </div>
            </Section>

            <Section title="Variantes">
              <Field label="Tamanhos" name="sizes" placeholder="37, 38, 39, 40, 41, 42, 43, 44"
                hint="Separados por vírgula ou espaço. Stock inicial = 0 para todos." />
              <div style={{ padding: '12px 16px', background: '#141922', borderRadius: 8, fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                💡 Após criar o produto, aceda à página de edição para fazer upload de imagens e ajustar o stock de cada variante.
              </div>
            </Section>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 14, margin: '0 0 16px' }}>Publicação</h3>
              <Field label="Status">
                <select name="status" style={inp} defaultValue="draft">
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </select>
              </Field>
              <div style={{ padding: '10px 14px', background: '#141922', borderRadius: 8, fontSize: 12, color: '#4A5462', lineHeight: 1.5 }}>
                <strong style={{ color: '#6B7280' }}>Rascunho:</strong> Só visível no admin<br />
                <strong style={{ color: '#6B7280' }}>Publicado:</strong> Visível na loja
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: '#E23B3B11', border: '1px solid #E23B3B33', borderRadius: 8, fontSize: 13, color: '#E23B3B' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: pending ? '#1E2530' : '#F26B1F', color: '#fff', fontSize: 14, fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'background .15s' }}
            >
              {pending ? 'A criar produto...' : 'Criar produto'}
            </button>

            <button type="button" onClick={() => router.back()} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid #1E2530', background: 'none', color: '#6B7280', fontSize: 14, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
