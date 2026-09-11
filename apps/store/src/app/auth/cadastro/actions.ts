'use server'

import { checkMemory, getRealIpFromHeaders, limiters } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'
import { normalizeEmail, sanitizeText } from '@/lib/validate'
import { TERMS_VERSION } from '@/lib/legal'

export type SignUpResult = { success: true } | { success: false; error: string }

export async function signUp(name: string, email: string, password: string, acceptedTerms: boolean): Promise<SignUpResult> {
  if (!acceptedTerms) {
    return { success: false, error: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.' }
  }
  const ip = await getRealIpFromHeaders()
  const limitKey = `signup:${ip}`
  if (limiters.signup) {
    const { success } = await limiters.signup.limit(limitKey)
    if (!success) return { success: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.' }
  } else if (!checkMemory(limitKey, 5, 15 * 60 * 1000)) {
    return { success: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.' }
  }

  const cleanName = sanitizeText(name)
  const cleanEmail = normalizeEmail(email)
  if (!cleanName || cleanName.length < 2) return { success: false, error: 'Nome inválido.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { success: false, error: 'E-mail inválido.' }
  if (password.length < 8) return { success: false, error: 'A senha deve ter no mínimo 8 caracteres.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: cleanName,
        terms_accepted_at: new Date().toISOString(),
        terms_version: TERMS_VERSION,
      },
    },
  })

  if (error) {
    return {
      success: false,
      error: error.message === 'User already registered'
        ? 'Este e-mail já está cadastrado. Faça login.'
        : 'Erro ao criar conta. Tente novamente.',
    }
  }

  return { success: true }
}
