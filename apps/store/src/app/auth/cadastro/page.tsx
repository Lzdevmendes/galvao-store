'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthShell, Field, ErrorMsg, SuccessMsg, SubmitBtn, Divider, GoogleBtn } from '../shared'

export default function CadastroPage() {
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') ?? '/conta'

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 8)  { setError('A senha deve ter no mínimo 8 caracteres.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (error) {
      setError(error.message === 'User already registered'
        ? 'Este e-mail já está cadastrado. Faça login.'
        : 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?redirect=${redirect}` },
    })
  }

  if (success) {
    return (
      <AuthShell title="Confirme seu e-mail" sub="Quase lá!">
        <SuccessMsg>
          Enviamos um link de confirmação para <strong>{email}</strong>. Verifique sua caixa de entrada.
        </SuccessMsg>
        <p style={{ textAlign:'center', fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)', marginTop:24 }}>
          <Link href="/auth/login" style={{ color:'var(--brand-orange)', fontWeight:700 }}>Ir para o login</Link>
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Criar conta" sub="Junte-se ao time Galvão's">
      <form onSubmit={handleCadastro} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Field label="Nome completo" type="text"     value={name}     onChange={setName}     placeholder="João Silva" />
        <Field label="E-mail"        type="email"    value={email}    onChange={setEmail}    placeholder="seu@email.com" />
        <Field label="Senha"         type="password" value={password} onChange={setPassword} placeholder="Mínimo 8 caracteres" />
        <Field label="Confirmar senha" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" />

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <SubmitBtn loading={loading}>Criar conta</SubmitBtn>
      </form>

      <Divider />
      <GoogleBtn onClick={handleGoogle} />

      <p style={{ textAlign:'center', fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)', marginTop:24 }}>
        Já tem conta?{' '}
        <Link href="/auth/login" style={{ color:'var(--brand-orange)', fontWeight:700 }}>Entrar</Link>
      </p>
    </AuthShell>
  )
}
