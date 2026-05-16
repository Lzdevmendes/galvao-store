'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { addAddress, deleteAddress, setDefaultAddress } from './actions'

type Address = {
  id: string; label: string; street: string; number: string
  complement: string | null; district: string; city: string; state: string
  cep: string; is_default: number
}

const maskCep = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')

const EMPTY = { label: 'Casa', cep: '', street: '', number: '', complement: '', district: '', city: '', state: '', isDefault: false }

export default function EnderecosPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [loading, setLoading]     = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    fetch('/api/conta/enderecos').then(r => r.json()).then(setAddresses).catch(() => {})
  }, [])

  const lookupCep = async (cep: string) => {
    if (cep.replace(/\D/g, '').length !== 8) return
    setCepLoading(true)
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(f => ({ ...f, street: data.logradouro ?? f.street, district: data.bairro ?? f.district, city: data.localidade ?? f.city, state: data.uf ?? f.state }))
      }
    } catch { /* silent */ } finally { setCepLoading(false) }
  }

  const handleAdd = async () => {
    if (!form.cep || !form.street || !form.number || !form.city) { setError('Preencha todos os campos obrigatórios.'); return }
    setLoading(true); setError('')
    const res = await addAddress(form)
    if (res.error) { setError(res.error); setLoading(false); return }
    setShowForm(false); setForm(EMPTY)
    const data = await fetch('/api/conta/enderecos').then(r => r.json())
    setAddresses(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await deleteAddress(id)
    setAddresses(a => a.filter(x => x.id !== id))
  }

  const handleDefault = async (id: string) => {
    await setDefaultAddress(id)
    setAddresses(a => a.map(x => ({ ...x, is_default: x.id === id ? 1 : 0 })))
  }

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 5 }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <Link href="/conta" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', textDecoration: 'none' }}>← Minha Conta</Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '.04em', marginTop: 8, marginBottom: 0 }}>ENDEREÇOS</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: 'var(--brand-orange)', color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          + Novo endereço
        </button>
      </div>

      {/* Lista */}
      {addresses.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--fg-muted)' }}>Nenhum endereço salvo ainda.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {addresses.map(addr => (
          <div key={addr.id} style={{ background: 'var(--bg-elev)', border: `1.5px solid ${addr.is_default ? 'var(--brand-orange)' : 'var(--border)'}`, borderRadius: 14, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14 }}>{addr.label}</span>
                {addr.is_default === 1 && <span style={{ background: 'var(--brand-orange)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--font-ui)' }}>PADRÃO</span>}
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg)', margin: '0 0 2px', lineHeight: 1.6 }}>
                {addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''}
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', margin: 0 }}>
                {addr.district} — {addr.city}/{addr.state} · CEP {addr.cep}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {addr.is_default !== 1 && (
                <button onClick={() => handleDefault(addr.id)} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)' }}>
                  Tornar padrão
                </button>
              )}
              <button onClick={() => handleDelete(addr.id)} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #FEE2E2', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, color: '#EF4444' }}>
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulário novo endereço */}
      {showForm && (
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginTop: 24 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, marginBottom: 20 }}>NOVO ENDEREÇO</p>
          {error && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#EF4444', padding: '10px 14px', background: 'rgba(239,68,68,.08)', borderRadius: 8, marginBottom: 16 }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Rótulo</label>
              <select style={inp} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}>
                <option>Casa</option><option>Trabalho</option><option>Outro</option>
              </select>
            </div>
            <div>
              <label style={lbl}>CEP *</label>
              <input style={inp} value={form.cep} onChange={e => { const v = maskCep(e.target.value); setForm(f => ({ ...f, cep: v })); if (v.length === 9) lookupCep(v) }} placeholder="00000-000" />
              {cepLoading && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-muted)' }}>Buscando...</span>}
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Rua *</label>
              <input style={inp} value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="Rua das Flores" />
            </div>
            <div>
              <label style={lbl}>Número *</label>
              <input style={inp} value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="123" />
            </div>
            <div>
              <label style={lbl}>Complemento</label>
              <input style={inp} value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} placeholder="Apto 42 (opcional)" />
            </div>
            <div>
              <label style={lbl}>Bairro *</label>
              <input style={inp} value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="Centro" />
            </div>
            <div>
              <label style={lbl}>Cidade *</label>
              <input style={inp} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="São Paulo" />
            </div>
            <div>
              <label style={lbl}>UF *</label>
              <input style={{ ...inp, width: 80 }} maxLength={2} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} placeholder="SP" />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="default" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} style={{ accentColor: 'var(--brand-orange)', width: 16, height: 16 }} />
              <label htmlFor="default" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>Definir como endereço padrão</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); setError('') }} style={{ padding: '13px 20px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, color: 'var(--fg-muted)' }}>
              Cancelar
            </button>
            <button onClick={handleAdd} disabled={loading} style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: loading ? 'var(--border)' : 'var(--brand-orange)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15 }}>
              {loading ? 'Salvando...' : 'Salvar endereço'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
