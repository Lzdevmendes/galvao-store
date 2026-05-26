import { describe, it, expect } from 'vitest'
import { frenetCodeToMethod } from '@/lib/frenet'

describe('frenetCodeToMethod', () => {
  it('maps SEDEX codes correctly', () => {
    expect(frenetCodeToMethod('04014')).toBe('sedex')
    expect(frenetCodeToMethod('04162')).toBe('sedex')
    expect(frenetCodeToMethod('04065')).toBe('sedex')
    expect(frenetCodeToMethod('04014-000')).toBe('sedex')
  })

  it('maps PAC codes correctly', () => {
    expect(frenetCodeToMethod('04510')).toBe('pac')
    expect(frenetCodeToMethod('04669')).toBe('pac')
    expect(frenetCodeToMethod('04693')).toBe('pac')
  })

  it('falls back to PAC for unknown codes', () => {
    expect(frenetCodeToMethod('99999')).toBe('pac')
    expect(frenetCodeToMethod('')).toBe('pac')
  })
})
