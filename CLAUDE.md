# Galvão's Store — Guia para IA

Loja de chuteiras/tênis esportivos (Caraguatatuba/SP). Monorepo Turborepo + pnpm.

## Stack resumida

| Peça | Função |
|------|--------|
| Next.js 15 App Router | SSR/RSC — `apps/store` (porta 3010) e `apps/admin` (porta 3011) |
| Drizzle ORM + Turso | SQLite edge. Schema em `packages/db/src/schema/` |
| Supabase Auth | Autenticação de clientes e admins |
| Mercado Pago | PIX / cartão / boleto — webhook em `/api/webhooks/mercadopago` |
| Resend + React Email | E-mails transacionais — `apps/store/src/lib/email.ts` |
| Upstash Redis | Rate limiting no middleware |
| Sentry | Error tracking — `sentry.*.config.ts` em cada app |

## Comandos

```bash
pnpm install                          # instalar
pnpm --filter @galvao/store dev       # store em :3010
pnpm --filter @galvao/admin dev       # admin em :3011
pnpm turbo build                      # build completo
pnpm turbo lint                       # lint
pnpm --filter @galvao/store test      # unit tests (vitest)
pnpm --filter @galvao/store test:e2e  # playwright
```

## Camada de Segurança — arquivos chave

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/ratelimit.ts` | Singleton Redis, todos os limiters, `getRealIp()` anti-spoofing, `checkRateLimit()` |
| `src/middleware.ts` | Rate limit global `/api/*` (300/min), login (5/15min), session refresh |
| `src/lib/validate.ts` | CPF (algoritmo real), CEP, telefone, sanitizeText |
| `src/app/api/webhooks/mercadopago/route.ts` | HMAC timingSafeEqual + janela 5min anti-replay + idempotência |
| `src/app/checkout/actions.ts` | Rate limit checkout (5/5min), validação completa, preços do banco |
| `apps/admin/src/middleware.ts` | Bloqueia tudo exceto /login, verifica ADMIN_EMAILS |
| `apps/admin/src/lib/require-admin.ts` | Chamado em TODA server action e API route do admin |
| `apps/admin/src/app/api/images/upload/route.ts` | Magic bytes validation (não confia em file.type) |

## Rate Limiting — limites por rota

| Rota / Ação | Limite | Janela | Chave |
|-------------|--------|--------|-------|
| `/auth/login` | 5 | 15min | IP (anti-spoofing) |
| `/api/*` (global) | 300 | 1min | IP |
| `createOrder` (checkout) | 5 | 5min | IP |
| `/api/newsletter` (IP) | 3 | 10min | IP |
| `/api/newsletter` (email) | 1 | 24h | email |
| `/api/avise-me` | 5 | 10min | IP |
| `/api/cart/sync` | 30 | 1min | userId |
| `/api/webhooks/mercadopago` | **Sem limite** | — | (nunca bloquear) |

## 5 Regras Invioláveis

### 1. NUNCA confiar em valores financeiros vindos do cliente
Preços e totais SEMPRE recalculados no servidor a partir do banco (`packages/db`). O `checkout/actions.ts` re-busca `price_in_cents` / `price_promo_in_cents` de `product_variants` via `variantMap`. Cupons também são re-validados no servidor.

### 2. Webhook Mercado Pago É idempotente
A rota `/api/webhooks/mercadopago` usa `UPDATE ... WHERE status != 'paid'` e checa `rowsAffected === 0` antes de decrementar estoque. O mesmo webhook pode chegar várias vezes sem efeito colateral.

### 3. Dinheiro em centavos, sempre inteiro
Todos os campos monetários no schema Drizzle são `integer` (centavos). R$ 529,99 = `52999`. Nunca usar `real`/`float` para dinheiro. Verificar com `integer('..._in_cents')`.

### 4. Admin exige `requireAdmin()` em TODA server action e API route
O middleware do admin (`apps/admin/src/middleware.ts`) protege a UI, mas server actions precisam chamar `requireAdmin()` de `@/lib/require-admin` individualmente — Next.js não garante que o middleware proteja actions chamadas diretamente.

### 5. Erros internos nunca vazam para o cliente
Mensagens de erro no checkout e APIs públicas são genéricas (`'Erro interno.'`). O `console.error` com detalhes fica só no servidor/Sentry. Nunca expor stack trace, mensagem de DB ou detalhe de lib de pagamento ao browser.

### 7. E-mail não pode derrubar o fluxo de pedido
Toda chamada de e-mail usa `void sendEmail(...).catch(e => console.error(...))` — falha silenciosa. Nunca `await` e-mail no caminho crítico do checkout ou webhook.

### 8. Toda nova rota/action/upload exige checklist de segurança
Ao criar qualquer nova funcionalidade verificar: (1) autenticação? (2) rate limit? (3) validação Zod no boundary? (4) IDOR — filtra por userId? (5) erros genéricos para o cliente? (6) upload valida magic bytes? E atualizar CLAUDE.md + agents/ com o que mudou.

## Estrutura de imports

- `apps/store` → `@galvao/db` (schema + client) e `@galvao/ui` (componentes)
- `apps/admin` → `@galvao/db` e `@galvao/ui`
- **Proibido**: apps importarem uma da outra diretamente
- Lógica compartilhada vai em `packages/`, nunca duplicada entre apps

## Fluxo de pedido (resumo)

```
Cliente → checkout/actions.ts (createOrder)
  ↓ valida estoque + preço do banco
  ↓ cria order + reserva stock_reserved
  ↓ chama Mercado Pago
  ↓ retorna PIX/boleto/aprovação imediata
  ↓
MP → /api/webhooks/mercadopago (confirma na API do MP, não no payload)
  ↓ UPDATE orders WHERE status != 'paid'  ← idempotente
  ↓ decrementa stock + stock_reserved
  ↓ dispara e-mail (void + .catch)
  ↓
Cron /api/cron/clear-reservations (a cada 30min)
  ↓ cancela pending_payment > 30min
  ↓ libera stock_reserved
```
