# Domínio e Regras de Negócio — Galvão's Store

## O que é

Loja de chuteiras e tênis esportivos (Nike, Adidas, Puma, Umbro, etc.) com sede em Caraguatatuba/SP. Vende online via loja pública (`galvaosstore.com.br`) gerenciada pelo backoffice admin.

## Entidades principais

| Entidade | Regra de negócio |
|----------|-----------------|
| **Produto** | Tem variantes (tamanho × cor). Unidade real de venda é a `product_variant`. |
| **Variante** | `price_in_cents` e `price_promo_in_cents` são inteiros em centavos. O preço efetivo é `MIN(price, promo)` quando `promo IS NOT NULL`. |
| **Estoque** | `stock` = total físico. `stock_reserved` = reservado em pedidos `pending_payment`. Disponível = `stock - stock_reserved`. |
| **Pedido** | Status: `pending_payment → paid → processing → shipped → delivered` ou `cancelled`/`refunded`. |
| **Pagamento** | PIX (5% desconto automático), cartão crédito (até 12x), boleto. Integração via Mercado Pago. |
| **Cupom** | Tipo `percent` (ex: 10%) ou `fixed` (ex: R$50 = 5000 centavos). Tem `max_uses`, `max_uses_per_customer`, validade. |
| **Frete** | Entrega local por carro próprio (zonas de CEP em `delivery_zones`) ou Correios via Melhor Envio (PAC/SEDEX). |

## Regras críticas de negócio

### Estoque
- Ao criar um pedido: `stock_reserved += qty` para cada variante.
- Ao confirmar pagamento (webhook `approved`): `stock -= qty`, `stock_reserved -= qty`.
- Ao cancelar/expirar: apenas `stock_reserved -= qty` (stock físico não muda).
- Cron a cada 30min: cancela pedidos `pending_payment` com `created_at < now - 30min` e libera `stock_reserved`.

### Preços
- **Nunca** usar preço vindo do cliente. Sempre re-buscar de `product_variants` no servidor.
- Subtotal calculado em `checkout/actions.ts` a partir do `variantMap` (banco).
- Cupons re-validados no servidor dentro de `createOrder` com o subtotal real.

### Webhook (Mercado Pago)
- MP pode enviar o mesmo evento várias vezes.
- O status do pagamento é **sempre confirmado via API do MP** (`GET /v1/payments/{id}`), nunca do payload recebido.
- Idempotência: `UPDATE orders ... WHERE status != 'paid'` + verificação de `rowsAffected`.

### E-mail
- E-mails são fire-and-forget: `void sendEmail(...).catch(...)`.
- Falha de e-mail **nunca** causa falha do pedido.

### Autenticação
- Clientes: Supabase Auth (email/password + OAuth).
- Admins: Supabase Auth + verificação de email em `ADMIN_EMAILS` env var.
- Sem RLS no Turso — toda authz é no código. Toda query de cliente filtra por `user_id` da sessão.

## Fluxo de pedido ponta a ponta

```
1. Cliente seleciona produto/tamanho → adiciona ao carrinho (Zustand/localStorage)
2. Ao fazer login → CartSync sincroniza localStorage → DB (cart_items)
3. Cliente vai ao checkout:
   a. Step 1: dados pessoais (nome, CPF, telefone, e-mail)
   b. Step 2: CEP → calculateShipping() → opções de frete
   c. Step 3: método de pagamento → submit

4. createOrder() [server action]:
   - Valida idempotency key (checkout_idempotency)
   - Busca preços do banco (variantMap)
   - Valida estoque
   - Re-valida cupom
   - Cria order em pending_payment
   - Reserva stock_reserved
   - Chama Mercado Pago API
   - Retorna dados de pagamento (QR PIX, URL boleto, etc.)

5. Cliente paga (fora do sistema)

6. Mercado Pago envia webhook POST /api/webhooks/mercadopago:
   - Valida HMAC (x-signature) com timingSafeEqual
   - Confirma status na API do MP
   - UPDATE orders WHERE status != 'paid' (idempotente)
   - Decrementa stock + stock_reserved
   - Dispara e-mail de confirmação (void)
   - Dispara WhatsApp (void)

7. Admin gerencia fulfillment:
   - Muda status para processing → shipped (com código de rastreio) → delivered
   - Cada mudança de status dispara e-mail automático

8. Cron /api/cron/clear-reservations (a cada 30min via Vercel Cron):
   - Cancela pedidos pending_payment > 30min
   - Libera stock_reserved
```
