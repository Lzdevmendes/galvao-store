import { describe, it, expect } from 'vitest'
import { meServiceToMethod } from '@/lib/melhor-envio'

describe('meServiceToMethod', () => {
  it('mapeia ids 2 e 4 para sedex', () => {
    expect(meServiceToMethod(2)).toBe('sedex')
    expect(meServiceToMethod(4)).toBe('sedex')
  })
  it('mapeia os restantes para pac', () => {
    expect(meServiceToMethod(1)).toBe('pac')
    expect(meServiceToMethod(3)).toBe('pac')
    expect(meServiceToMethod(99)).toBe('pac')
  })
})
