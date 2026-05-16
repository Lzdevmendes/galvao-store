'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateProfile } from './actions'

const maskPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
const maskCpf   = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

export default function ProfileForm({ email, initial }: {
  email: string
  initial: { name: string; phone: string; cpf: string; birthday: string }
}) {
  const [form, setForm]     = useState(initial)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')
  const [isErr, setIsErr]   = useState(false)

  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-ui)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }

  const handleSave = async () => {
    if (!form.name.trim()) { setMsg('Nome obrigatório.'); setIsErr(true); return }
    setLoading(true); setMsg(''); setIsErr(false)
    const res = await updateProfile(form)
    if (res.error) { setMsg(res.error); setIsErr(true) }
    else { setMsg('Dados actualizados com sucesso!'); setIsErr(false) }
    setLoading(false)
  }

  return (
    <div>
      <Link href="/conta" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-muted)', textDecoration: 'none' }}>← Minha Conta</Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '.04em', marginTop: 8, marginBottom: 32 }}>DADOS PESSOAIS</h1>

      <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div>
            <label style={lbl}>Nome completo *</label>
            <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="João Silva" />
          </div>

          <div>
            <label style={lbl}>E-mail (não editável)</label>
            <input style={{ ...inp, background: 'var(--bg-sunk)', color: 'var(--fg-muted)', cursor: 'not-allowed' }} value={email} readOnly />
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--fg-faint)', marginTop: 4 }}>Para alterar o e-mail, contacta o suporte.</p>
          </div>

          <div>
            <label style={lbl}>Telefone</label>
            <input style={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: maskPhone(e.target.value) }))} placeholder="(11) 99999-0000" />
          </div>

          <div>
            <label style={lbl}>CPF</label>
            <input style={inp} value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: maskCpf(e.target.value) }))} placeholder="000.000.000-00" />
          </div>

          <div>
            <label style={lbl}>Data de nascimento</label>
            <input style={inp} type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
          </div>

          {msg && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, padding: '10px 14px', borderRadius: 8, margin: 0, background: isErr ? 'rgba(239,68,68,.08)' : 'rgba(34,197,94,.08)', color: isErr ? '#EF4444' : 'var(--brand-green)' }}>
              {msg}
            </p>
          )}

          <button onClick={handleSave} disabled={loading} style={{ padding: '15px', borderRadius: 12, border: 'none', background: loading ? 'var(--border)' : 'var(--brand-orange)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15 }}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}
