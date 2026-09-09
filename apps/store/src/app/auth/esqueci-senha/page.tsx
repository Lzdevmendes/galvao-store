'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AuthShell, Field, ErrorMsg, SuccessMsg, SubmitBtn } from '../shared'
import { requestPasswordReset } from './actions'

export default function EsqueciSenhaPage() {
  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await requestPasswordReset(email, `${location.origin}/auth/callback?type=recovery`)
    if (!result.success) { setError(result.error); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  return (
    <AuthShell title="Redefinir senha" sub="Vamos recuperar o seu acesso">
      {success ? (
        <>
          <SuccessMsg>
            Enviamos um link de redefinição para <strong>{email}</strong>. Verifique sua caixa de entrada.
          </SuccessMsg>
          <p style={{ textAlign:'center', fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)', marginTop:24 }}>
            <Link href="/auth/login" style={{ color:'var(--brand-orange)', fontWeight:700 }}>← Voltar ao login</Link>
          </p>
        </>
      ) : (
        <form onSubmit={handleReset} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" />
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <SubmitBtn loading={loading}>Enviar link de redefinição</SubmitBtn>
          <p style={{ textAlign:'center', fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)' }}>
            <Link href="/auth/login" style={{ color:'var(--brand-orange)' }}>← Voltar ao login</Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
