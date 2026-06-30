import { describe, it, expect, vi, beforeEach } from 'vitest'

const dbRun = vi.fn()
vi.mock('@/lib/db', () => ({ db: { run: (...a: unknown[]) => dbRun(...a) } }))

const checkRateLimit = vi.fn()
vi.mock('@/lib/ratelimit', () => ({
  limiters: { aviseme: {} },
  getRealIp: () => '1.2.3.4',
  checkRateLimit: (...a: unknown[]) => checkRateLimit(...a),
}))

import { POST } from '@/app/api/avise-me/route'

function req(body: unknown) { return { json: async () => body } as unknown as Parameters<typeof POST>[0] }

beforeEach(() => { dbRun.mockReset(); checkRateLimit.mockReset(); checkRateLimit.mockResolvedValue(null) })

describe('POST /api/avise-me', () => {
  it('grava alerta com ON CONFLICT (deduplicação)', async () => {
    const res = await POST(req({ email: 'a@b.com', variantId: 'v1', productName: 'Chuteira' }))
    expect((await res.json()).ok).toBe(true)
    expect(dbRun).toHaveBeenCalledTimes(1)
  })

  it('rejeita payload sem variantId', async () => {
    const res = await POST(req({ email: 'a@b.com' }))
    expect(res.status).toBe(400)
    expect(dbRun).not.toHaveBeenCalled()
  })

  it('respeita o rate limit', async () => {
    checkRateLimit.mockResolvedValueOnce(new Response('blocked', { status: 429 }))
    const res = await POST(req({ email: 'a@b.com', variantId: 'v1' }))
    expect(res.status).toBe(429)
  })
})
