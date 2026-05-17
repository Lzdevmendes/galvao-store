// Preço: centavos → BRL display
export const fmt = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// PIX: 5% de desconto
export const pixPrice = (cents: number) => Math.round(cents * 0.95)

// Parcelas
export const installment = (cents: number, n = 12) => Math.round(cents / n)

// ── Máscaras de input ──────────────────────────────────────
export const maskCep   = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
export const maskPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
export const maskCpf   = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

// ── Validação CPF (módulo 11) ──────────────────────────────
export function isCpfValid(v: string): boolean {
  const d = v.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  const calc = (x: number) => {
    let s = 0
    for (let i = 0; i < x - 1; i++) s += Number(d[i]) * (x - i)
    const r = (s * 10) % 11
    return r === 10 || r === 11 ? 0 : r
  }
  return calc(10) === Number(d[9]) && calc(11) === Number(d[10])
}

// ── Truncar texto ──────────────────────────────────────────
export const truncate = (s: string, n: number) => s.length > n ? `${s.slice(0, n)}…` : s

// ── Slug ───────────────────────────────────────────────────
export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
