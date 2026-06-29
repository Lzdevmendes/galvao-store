import { describe, it, expect } from 'vitest'
import { isValidCpf, isValidCep, isValidPhone, normalizeEmail, sanitizeText } from '@/lib/validate'

describe('isValidCpf', () => {
  it('aceita CPFs válidos (com e sem máscara)', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true)
    expect(isValidCpf('11144477735')).toBe(true)
  })
  it('rejeita sequências triviais', () => {
    expect(isValidCpf('00000000000')).toBe(false)
    expect(isValidCpf('11111111111')).toBe(false)
  })
  it('rejeita comprimento errado e dígito verificador inválido', () => {
    expect(isValidCpf('1234567890')).toBe(false)
    expect(isValidCpf('11144477736')).toBe(false)
  })
})

describe('isValidCep', () => {
  it('aceita 8 dígitos (com ou sem máscara)', () => {
    expect(isValidCep('01310100')).toBe(true)
    expect(isValidCep('01310-100')).toBe(true)
  })
  it('rejeita comprimentos diferentes de 8', () => {
    expect(isValidCep('0131010')).toBe(false)
    expect(isValidCep('013101000')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('aceita 10 ou 11 dígitos', () => {
    expect(isValidPhone('(12) 3456-7890')).toBe(true)
    expect(isValidPhone('12934567890')).toBe(true)
  })
  it('rejeita menos de 10 dígitos', () => {
    expect(isValidPhone('123456789')).toBe(false)
  })
})

describe('normalizeEmail', () => {
  it('normaliza caixa e espaços', () => {
    expect(normalizeEmail('  Lzdev@Gmail.com ')).toBe('lzdev@gmail.com')
  })
})

describe('sanitizeText (anti-XSS)', () => {
  it('escapa < > e &', () => {
    expect(sanitizeText('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(sanitizeText('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })
  it('não duplica entidades já escapadas', () => {
    expect(sanitizeText('a&amp;b')).toBe('a&amp;b')
  })
})
