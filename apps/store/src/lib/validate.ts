// Validações de dados brasileiros com algoritmos reais

// CPF — algoritmo dos dois dígitos verificadores
export function isValidCpf(raw: string): boolean {
  const cpf = raw.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  // Rejeitar sequências triviais: 00000000000, 11111111111, etc.
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const sum = (digits: number[], weights: number[]) =>
    digits.reduce((acc, d, i) => acc + d * weights[i], 0)

  const digits = cpf.split('').map(Number)

  // Primeiro dígito verificador
  const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2]
  const r1 = (sum(digits.slice(0, 9), w1) * 10) % 11
  if ((r1 === 10 || r1 === 11 ? 0 : r1) !== digits[9]) return false

  // Segundo dígito verificador
  const w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
  const r2 = (sum(digits.slice(0, 10), w2) * 10) % 11
  if ((r2 === 10 || r2 === 11 ? 0 : r2) !== digits[10]) return false

  return true
}

// CEP — formato básico 8 dígitos
export function isValidCep(raw: string): boolean {
  return /^\d{8}$/.test(raw.replace(/\D/g, ''))
}

// Telefone — 10 ou 11 dígitos (com DDD)
export function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  return digits.length === 10 || digits.length === 11
}

// E-mail — validação básica adicional à do Zod
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Sanitize texto — remove tags HTML para prevenir XSS em campos de texto
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&(?!lt;|gt;|amp;)/g, '&amp;')
    .trim()
}
