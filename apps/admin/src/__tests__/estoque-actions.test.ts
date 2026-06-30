import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

const dbGet = vi.fn()
const dbRun = vi.fn()
const dbAll = vi.fn()
vi.mock('@/lib/db', () => ({ db: {
  get: (...a: unknown[]) => dbGet(...a),
  run: (...a: unknown[]) => dbRun(...a),
  all: (...a: unknown[]) => dbAll(...a),
} }))

const requireAdmin = vi.fn()
vi.mock('@/lib/require-admin', () => ({ requireAdmin: () => requireAdmin() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
const sendBackInStock = vi.fn()
vi.mock('@/lib/email', () => ({ sendBackInStockEmail: (...a: unknown[]) => { sendBackInStock(...a); return Promise.resolve() } }))

import { adjustStock } from '@/app/estoque/actions'

beforeEach(() => {
  dbGet.mockReset(); dbRun.mockReset(); dbAll.mockReset(); sendBackInStock.mockReset()
  requireAdmin.mockResolvedValue({ userId: 'admin1' })
  dbAll.mockResolvedValue([])
})

describe('adjustStock', () => {
  it('rejeita quando não autorizado', async () => {
    requireAdmin.mockResolvedValue(NextResponse.json({ error: 'x' }, { status: 401 }))
    const r = await adjustStock('v1', 5, 'purchase', '')
    expect(r).toEqual({ success: false, error: 'Não autorizado.' })
  })

  it('rejeita parâmetros inválidos (delta 0)', async () => {
    const r = await adjustStock('v1', 0, 'adjustment', '')
    expect(r.success).toBe(false)
  })

  it('rejeita quando variante não existe', async () => {
    dbGet.mockResolvedValue(undefined)
    const r = await adjustStock('v1', 5, 'purchase', '')
    expect(r.error).toContain('não encontrada')
  })

  it('impede stock negativo', async () => {
    dbGet.mockResolvedValue({ stock: 2 })
    const r = await adjustStock('v1', -5, 'adjustment', '')
    expect(r.success).toBe(false)
    expect(r.error).toContain('insuficiente')
  })

  it('ajusta stock e regista movimento', async () => {
    dbGet.mockResolvedValue({ stock: 3 })
    const r = await adjustStock('v1', 4, 'purchase', 'nota')
    expect(r.success).toBe(true)
    expect(dbRun).toHaveBeenCalledTimes(2) // update stock + insert movement (sem alertas)
  })

  it('dispara avise-me quando volta a ter stock', async () => {
    dbGet.mockResolvedValue({ stock: 0 })
    dbAll
      .mockResolvedValueOnce([{ id: 'a1', email: 'x@y.com', product_name: 'Chuteira' }]) // alerts
      .mockResolvedValueOnce([{ slug: 'chuteira-x' }])                                    // slug
    const r = await adjustStock('v1', 2, 'purchase', '')
    expect(r.success).toBe(true)
    expect(sendBackInStock).toHaveBeenCalledWith('x@y.com', 'Chuteira', 'chuteira-x')
  })
})
