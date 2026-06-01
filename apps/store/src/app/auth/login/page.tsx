'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthShell, Field, ErrorMsg, SubmitBtn, Divider, GoogleBtn } from '../shared'

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') ?? '/conta'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push(redirect)
    router.refresh()
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?redirect=${redirect}` },
    })
  }

  return (
    <AuthShell title="Bem-vindo de volta" sub="Entre na sua conta Galvão's Store">
      <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" />
        <div>
          <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          <div style={{ textAlign:'right', marginTop:6 }}>
            <Link href="/auth/esqueci-senha" style={{ fontFamily:'var(--font-ui)', fontSize:12, color:'var(--brand-orange)' }}>
              Esqueci minha senha
            </Link>
          </div>
        </div>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <SubmitBtn loading={loading}>Entrar</SubmitBtn>
      </form>

      <Divider />

      <GoogleBtn onClick={handleGoogle} />

      <p style={{ textAlign:'center', fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)', marginTop:24 }}>
        Não tem conta?{' '}
        <Link href={`/auth/cadastro${redirect !== '/conta' ? `?redirect=${redirect}` : ''}`} style={{ color:'var(--brand-orange)', fontWeight:700 }}>
          Criar agora
        </Link>
      </p>
    </AuthShell>
  )
}
