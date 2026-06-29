import { describe, it, expect } from 'vitest'
import type { NextRequest } from 'next/server'
import { getRealIp, checkMemory } from '@/lib/ratelimit'

function reqWith(headers: Record<string, string>): NextRequest {
  return { headers: { get: (k: string) => headers[k.toLowerCase()] ?? null } } as unknown as NextRequest
}

describe('getRealIp (anti-spoofing)', () => {
  it('prefere x-real-ip quando válido', () => {
    expect(getRealIp(reqWith({ 'x-real-ip': '203.0.113.7' }))).toBe('203.0.113.7')
  })
  it('ignora IPs privados e pega o público mais à direita do x-forwarded-for', () => {
    expect(getRealIp(reqWith({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1, 192.168.0.1' }))).toBe('203.0.113.9')
  })
  it('em dev (só loopback) aceita o primeiro', () => {
    expect(getRealIp(reqWith({ 'x-forwarded-for': '127.0.0.1' }))).toBe('127.0.0.1')
  })
  it('devolve unknown sem headers', () => {
    expect(getRealIp(reqWith({}))).toBe('unknown')
  })
})

describe('checkMemory (fallback in-memory)', () => {
  it('permite até ao máximo e bloqueia depois', () => {
    const key = `test:${Math.random()}`
    expect(checkMemory(key, 2, 60_000)).toBe(true)  // 1
    expect(checkMemory(key, 2, 60_000)).toBe(true)  // 2
    expect(checkMemory(key, 2, 60_000)).toBe(false) // 3 → bloqueado
  })
  it('isola contadores por chave', () => {
    const a = `a:${Math.random()}`
    const b = `b:${Math.random()}`
    expect(checkMemory(a, 1, 60_000)).toBe(true)
    expect(checkMemory(a, 1, 60_000)).toBe(false)
    expect(checkMemory(b, 1, 60_000)).toBe(true)
  })
})
