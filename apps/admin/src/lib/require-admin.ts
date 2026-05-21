import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireAdmin(): Promise<{ userId: string } | NextResponse> {
  const supabase   = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  if (!user || !adminEmails.includes((user.email ?? '').toLowerCase())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  return { userId: user.id }
}
