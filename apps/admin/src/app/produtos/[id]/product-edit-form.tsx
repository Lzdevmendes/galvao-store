'use client'

import { useState, useTransition } from 'react'
import { updateProduct } from './actions'

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #1E2530', background: '#141922',
  color: '#F8F9FB', fontSize: 14, outline: 'none',
  fontFamily: 'Space Grotesk, sans-serif', boxSizing: 'border-box',
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, color: '#6B7280',
  textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, fontWeight: 700,
}

const BADGES = [
  { value: '', label: 'Nenhum' },
  { value: 'new', label: 'Lançamento' },
  { value: 'sale', label: 'Oferta' },
  { value: 'bestseller', label: '★ Top' },
  { value: 'exclusive', label: 'Exclusivo' },
]

interface Props {
  productId: string
  initial: {
    name: string
    description: string
    line: string | null
    badge: string | null
    status: string
    meta_title: string | null
    meta_description: string | null
  }
}

export function ProductEditForm({ productId, initial }: Props) {
  const [form, setForm] = useState({
    name:             initial.name,
    description:      initial.description,
    line:             initial.line ?? '',
    badge:            initial.badge ?? '',
    status:           initial.status,
    meta_title:       initial.meta_title ?? '',
    meta_description: initial.meta_description ?? '',
  })
  const [msg, setMsg]   = useState('')
  const [isErr, setIsErr] = useState(false)
  const [pending, start] = useTransition()

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    setMsg(''); setIsErr(false)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.set(k, v))
    start(async () => {
      const res = await updateProduct(productId, fd)
      if (res.error) { setMsg(res.error); setIsErr(true) }
      else { setMsg('Produto actualizado com sucesso!'); setIsErr(false) }
    })
  }

  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 15, margin: '0 0 20px', color: '#F8F9FB' }}>
        Editar produto
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <label style={lbl}>Nome *</label>
          <input style={inp} value={form.name} onChange={set('name')} placeholder="Nome do produto" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Status</label>
            <select style={inp} value={form.status} onChange={set('status')}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Badge</label>
            <select style={inp} value={form.badge} onChange={set('badge')}>
              {BADGES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Linha / Modelo</label>
            <input style={inp} value={form.line} onChange={set('line')} placeholder="Phantom, Predator..." />
          </div>
        </div>

        <div>
          <label style={lbl}>Descrição *</label>
          <textarea
            rows={4}
            style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
            value={form.description}
            onChange={set('description')}
            placeholder="Descreva o produto..."
          />
        </div>

        <div style={{ borderTop: '1px solid #1E2530', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: '#4A5462', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 14px', fontWeight: 700 }}>SEO</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={lbl}>Meta title</label>
              <input style={inp} value={form.meta_title} onChange={set('meta_title')}
                placeholder={`${form.name} | Galvão's Store`} maxLength={70} />
              <p style={{ fontSize: 11, color: '#4A5462', marginTop: 4 }}>
                {form.meta_title.length}/70 caracteres
              </p>
            </div>
            <div>
              <label style={lbl}>Meta description</label>
              <textarea
                rows={2}
                style={{ ...inp, resize: 'none' }}
                value={form.meta_description}
                onChange={set('meta_description')}
                placeholder="Descrição curta para Google (até 160 chars)"
                maxLength={160}
              />
              <p style={{ fontSize: 11, color: '#4A5462', marginTop: 4 }}>
                {form.meta_description.length}/160 caracteres
              </p>
            </div>
          </div>
        </div>

      </div>

      {msg && (
        <p style={{ marginTop: 14, fontSize: 13, color: isErr ? '#E23B3B' : '#2CB35A' }}>
          {isErr ? '⚠️' : '✅'} {msg}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={pending}
        style={{
          marginTop: 20, width: '100%', padding: '11px', borderRadius: 8, border: 'none',
          background: pending ? '#1E2530' : '#F26B1F', color: '#fff',
          fontSize: 14, fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer',
          fontFamily: 'Space Grotesk, sans-serif', transition: 'background .15s',
        }}
      >
        {pending ? 'A guardar...' : 'Guardar alterações'}
      </button>
    </div>
  )
}
