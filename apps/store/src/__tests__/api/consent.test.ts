import { describe, it, expect, vi, beforeEach } from 'vitest'

const dbRun = vi.fn()
vi.mock('@/lib/db', () => ({ db: { run: (...a: unknown[]) => dbRun(...a) } }))

const checkRateLimit = vi.fn()
vi.mock('@/lib/ratelimit', () => ({
  limiters: { consent: {} },
  getRealIp: () => '1.2.3.4',
  checkRateLimit: (...a: unknown[]) => checkRateLimit(...a),
}))

let mockUser: { id: string } | null = null
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: mockUser } }) } }),
}))

import { POST } from '@/app/api/consent/route'

function req(body: unknown) {
  return {
    json: async () => body,
    headers: { get: () => 'jest-ua' },
  } as unknown as Parameters<typeof POST>[0]
}

beforeEach(() => { dbRun.mockReset(); checkRateLimit.mockReset(); checkRateLimit.mockResolvedValue(null); mockUser = null })

describe('POST /api/consent (LGPD auditoria)', () => {
  it('regista as 3 decisões (necessary/analytics/marketing) para visitante anónimo', async () => {
    const res = await POST(req({ analytics: true, marketing: false }))
    expect((await res.json()).ok).toBe(true)
    expect(dbRun).toHaveBeenCalledTimes(3) // necessary + analytics + marketing
  })

  it('sincroniza marketing_opt_in quando logado', async () => {
    mockUser = { id: 'u1' }
    await POST(req({ analytics: false, marketing: true }))
    // 3 inserts de consentimento + 1 update de marketing_opt_in
    expect(dbRun).toHaveBeenCalledTimes(4)
  })

  it('rejeita payload inválido', async () => {
    const res = await POST(req({ analytics: 'sim' }))
    expect(res.status).toBe(400)
  })
})
