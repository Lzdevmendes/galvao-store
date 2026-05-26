import { describe, it, expect } from 'vitest'
import {
  fmt,
  pixPrice,
  installment,
  maskCep,
  maskPhone,
  maskCpf,
  isCpfValid,
  truncate,
  slugify,
} from '@/lib/utils'

describe('fmt', () => {
  it('formats cents to BRL currency string', () => {
    expect(fmt(39900)).toBe('R$ 399,00')
    expect(fmt(100)).toBe('R$ 1,00')
    expect(fmt(0)).toBe('R$ 0,00')
  })
})

describe('pixPrice', () => {
  it('applies 5% PIX discount', () => {
    expect(pixPrice(10000)).toBe(9500)
    expect(pixPrice(39900)).toBe(37905)
  })

  it('rounds correctly', () => {
    expect(pixPrice(1)).toBe(1)
    expect(pixPrice(10)).toBe(10) // rounds 9.5 → 10
  })
})

describe('installment', () => {
  it('divides total into 12 installments by default', () => {
    expect(installment(12000)).toBe(1000)
    expect(installment(39900)).toBe(3325)
  })

  it('accepts custom number of installments', () => {
    expect(installment(10000, 10)).toBe(1000)
    expect(installment(10000, 3)).toBe(3333)
  })
})

describe('maskCep', () => {
  it('formats 8-digit CEP with hyphen', () => {
    expect(maskCep('11671207')).toBe('11671-207')
  })

  it('removes non-digits', () => {
    expect(maskCep('11671-207')).toBe('11671-207')
  })

  it('truncates to 8 digits', () => {
    expect(maskCep('116712079999')).toBe('11671-207')
  })
})

describe('maskPhone', () => {
  it('formats mobile number', () => {
    expect(maskPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('removes non-digits', () => {
    expect(maskPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
  })
})

describe('maskCpf', () => {
  it('formats CPF with dots and dash', () => {
    expect(maskCpf('12345678909')).toBe('123.456.789-09')
  })

  it('removes non-digits', () => {
    expect(maskCpf('123.456.789-09')).toBe('123.456.789-09')
  })
})

describe('isCpfValid', () => {
  it('validates a real CPF', () => {
    expect(isCpfValid('529.982.247-25')).toBe(true)
    expect(isCpfValid('52998224725')).toBe(true)
  })

  it('rejects invalid CPFs', () => {
    expect(isCpfValid('111.111.111-11')).toBe(false)
    expect(isCpfValid('000.000.000-00')).toBe(false)
    expect(isCpfValid('123.456.789-00')).toBe(false)
  })

  it('rejects CPFs with wrong length', () => {
    expect(isCpfValid('123')).toBe(false)
    expect(isCpfValid('')).toBe(false)
  })
})

describe('truncate', () => {
  it('returns string unchanged if shorter than limit', () => {
    expect(truncate('abc', 5)).toBe('abc')
    expect(truncate('abc', 3)).toBe('abc')
  })

  it('truncates and appends ellipsis', () => {
    expect(truncate('abcdef', 4)).toBe('abcd…')
  })
})

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Nike Phantom')).toBe('nike-phantom')
  })

  it('removes accents', () => {
    expect(slugify('Tênis Adidas')).toBe('tenis-adidas')
    expect(slugify('Chuteira Ação')).toBe('chuteira-acao')
  })

  it('removes special characters', () => {
    expect(slugify('Nike (Air Max) 2025!')).toBe('nike-air-max-2025')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify('  Nike  ')).toBe('nike')
  })
})
