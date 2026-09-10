import { describe, it, expect, vi, beforeEach } from 'vitest'

const runAllActiveSources = vi.fn()
vi.mock('@/lib/import/run-import', () => ({
  runAllActiveSources: () => runAllActiveSources(),
}))

import { GET } from '@/app/api/cron/import-produtos/route'

function req(authHeader?: string) {
  return { headers: { get: (k: string) => (k === 'authorization' ? authHeader ?? null : null) } } as unknown as Parameters<typeof GET>[0]
}

beforeEach(() => {
  runAllActiveSources.mockReset()
  process.env.CRON_SECRET = 'segredo'
})

describe('cron import-produtos — proteção por CRON_SECRET', () => {
  it('rejeita sem Bearer correto', async () => {
    const res = await GET(req('Bearer errado'))
    expect(res.status).toBe(401)
    expect(runAllActiveSources).not.toHaveBeenCalled()
  })

  it('rejeita sem header nenhum', async () => {
    const res = await GET(req())
    expect(res.status).toBe(401)
  })

  it('roda o import com Bearer correto e devolve o resumo por fonte', async () => {
    runAllActiveSources.mockResolvedValue([
      { sourceId: 's1', sourceName: 'Importador X', status: 'success', itemsFound: 3, itemsPublished: 2, itemsUpdated: 0, itemsPendingPrice: 1, errorMessage: null },
    ])
    const res = await GET(req('Bearer segredo'))
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.sources).toHaveLength(1)
    expect(json.sources[0].itemsPublished).toBe(2)
  })
})
