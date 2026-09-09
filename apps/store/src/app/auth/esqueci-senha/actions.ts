'use server'

import { checkMemory, getRealIpFromHeaders, limiters } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'
import { normalizeEmail } from '@/lib/validate'

export type PasswordResetResult = { success: true } | { success: false; error: string }

export async function requestPasswordReset(email: string, redirectTo: string): Promise<PasswordResetResult> {
  const ip = await getRealIpFromHeaders()
  const limitKey = `password_reset:${ip}`
  if (limiters.passwordReset) {
    const { success } = await limiters.passwordReset.limit(limitKey)
    if (!success) return { success: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.' }
  } else if (!checkMemory(limitKey, 5, 15 * 60 * 1000)) {
    return { success: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.' }
  }

  const cleanEmail = normalizeEmail(email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { success: false, error: 'E-mail inválido.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo })

  if (error) return { success: false, error: 'Erro ao enviar e-mail. Verifique o endereço.' }

  return { success: true }
}
