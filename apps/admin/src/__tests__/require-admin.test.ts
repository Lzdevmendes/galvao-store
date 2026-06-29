import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// Mock do cliente Supabase do servidor — controlamos o user devolvido.
let mockUser: { id: string; email: string } | null = null
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: mockUser } }) },
  }),
}))

import { requireAdmin } from '@/lib/require-admin'

describe('requireAdmin', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'dono@galvao.com, gerente@galvao.com'
    mockUser = null
  })

  it('rejeita visitante não autenticado com 401', async () => {
    mockUser = null
    const res = await requireAdmin()
    expect(res).toBeInstanceOf(NextResponse)
    expect((res as NextResponse).status).toBe(401)
  })

  it('rejeita utilizador fora de ADMIN_EMAILS com 401', async () => {
    mockUser = { id: 'u1', email: 'intruso@evil.com' }
    const res = await requireAdmin()
    expect(res).toBeInstanceOf(NextResponse)
    expect((res as NextResponse).status).toBe(401)
  })

  it('aceita admin autorizado (case-insensitive) e devolve userId', async () => {
    mockUser = { id: 'u2', email: 'Dono@Galvao.com' }
    const res = await requireAdmin()
    expect(res).toEqual({ userId: 'u2' })
  })
})
