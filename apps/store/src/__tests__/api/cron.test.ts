import { describe, it, expect, vi, beforeEach } from 'vitest'

const dbAll = vi.fn()
const dbRun = vi.fn()
vi.mock('@/lib/db', () => ({ db: { all: (...a: unknown[]) => dbAll(...a), run: (...a: unknown[]) => dbRun(...a) } }))

import { GET as clearReservations } from '@/app/api/cron/clear-reservations/route'
import { GET as anonymize } from '@/app/api/cron/anonymize-data/route'

function req(authHeader?: string) {
  return { headers: { get: (k: string) => (k === 'authorization' ? authHeader ?? null : null) } } as unknown as Parameters<typeof anonymize>[0]
}

beforeEach(() => {
  dbAll.mockReset(); dbRun.mockReset()
  process.env.CRON_SECRET = 'segredo'
  dbAll.mockResolvedValue([])
  dbRun.mockResolvedValue({ rowsAffected: 0 })
})

describe('cron — proteção por CRON_SECRET', () => {
  it('clear-reservations rejeita sem Bearer correto', async () => {
    const res = await clearReservations(req('Bearer errado'))
    expect(res.status).toBe(401)
  })
  it('clear-reservations aceita com Bearer correto', async () => {
    const res = await clearReservations(req('Bearer segredo'))
    expect((await res.json()).ok).toBe(true)
  })
  it('anonymize-data rejeita sem autorização', async () => {
    const res = await anonymize(req())
    expect(res.status).toBe(401)
  })
  it('anonymize-data corre com Bearer correto e reporta contadores', async () => {
    dbRun.mockResolvedValue({ rowsAffected: 2 })
    const res = await anonymize(req('Bearer segredo'))
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.ordersAnonymized).toBe(2)
  })
})
