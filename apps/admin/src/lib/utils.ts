// Preço: centavos → BRL display
export const fmt = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// PIX: 5% de desconto
export const pixPrice = (cents: number) => Math.round(cents * 0.95)

// Parcelas
export const installment = (cents: number, n = 12) => Math.round(cents / n)
