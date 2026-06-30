import { describe, it, expect, vi, beforeEach } from 'vitest'

const dbAll = vi.fn()
const dbRun = vi.fn()
vi.mock('@/lib/db', () => ({ db: { all: (...a: unknown[]) => dbAll(...a), run: (...a: unknown[]) => dbRun(...a) } }))

const checkRateLimit = vi.fn()
vi.mock('@/lib/ratelimit', () => ({
  limiters: { newsletter: {}, newsletterEmail: {} },
  getRealIp: () => '1.2.3.4',
  checkRateLimit: (...a: unknown[]) => checkRateLimit(...a),
}))

const sendEmail = vi.fn()
vi.mock('resend', () => ({
  Resend: class { emails = { send: (...a: unknown[]) => { sendEmail(...a); return Promise.resolve({}) } } },
}))
vi.mock('@/emails/_components/email-layout', () => ({ APP_URL: 'http://x', brand: {}, font: {} }))

import { POST } from '@/app/api/newsletter/route'

function req(body: unknown) { return { json: async () => body } as unknown as Parameters<typeof POST>[0] }

beforeEach(() => {
  dbAll.mockReset(); dbRun.mockReset(); sendEmail.mockReset(); checkRateLimit.mockReset()
  checkRateLimit.mockResolvedValue(null)
})

describe('POST /api/newsletter (double opt-in)', () => {
  it('inscreve e-mail novo como pending e envia confirmação', async () => {
    dbAll.mockResolvedValue([])
    const res = await POST(req({ email: 'novo@b.com' }))
    expect((await res.json()).ok).toBe(true)
    expect(dbRun).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('não reenvia se já confirmado', async () => {
    dbAll.mockResolvedValue([{ status: 'confirmed' }])
    const res = await POST(req({ email: 'ja@b.com' }))
    expect((await res.json()).already).toBe(true)
    expect(dbRun).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('rejeita e-mail inválido com 400', async () => {
    const res = await POST(req({ email: 'invalido' }))
    expect(res.status).toBe(400)
  })

  it('respeita o rate limit por IP', async () => {
    checkRateLimit.mockResolvedValueOnce(new Response('blocked', { status: 429 }))
    const res = await POST(req({ email: 'x@b.com' }))
    expect(res.status).toBe(429)
  })
})
