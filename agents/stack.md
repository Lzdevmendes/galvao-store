# Stack — Cada lib e por que existe

## Next.js 15 (App Router / RSC)

**Por que existe**: Framework full-stack que permite renderização no servidor (RSC) para SEO e performance, com server actions para mutações seguras sem expor API pública. O App Router simplifica a estrutura de rotas e layouts aninhados.

**O que quebraria sem ela**: Toda a aplicação. É o núcleo do store e do admin.

**Arquivos chave**: `apps/store/src/app/`, `apps/admin/src/app/`

---

## Drizzle ORM + Turso (libSQL)

**Por que existe**: Drizzle é um ORM TypeScript-first que gera tipos a partir do schema, evitando erros de tipo em queries. Turso é SQLite distribuído na edge global — baixíssima latência para leituras no Brasil (região `gru`).

**O que quebraria sem ela**: Todo acesso ao banco de dados (produtos, pedidos, estoque, usuários). Localmente usa `better-sqlite3` via `file:` URI.

**Arquivos chave**: `packages/db/src/schema/`, `apps/store/src/lib/db.ts`

**Importante**: Schema define `integer('..._in_cents')` para TODOS os valores monetários. Nunca `real`/`float`.

---

## Supabase Auth + Storage

**Auth**: Gerencia sessões de clientes (JWT em cookies HTTP-only via `@supabase/ssr`). OAuth Google/GitHub. O `user.id` do Supabase é o mesmo `id` na tabela `users` do SQLite — sincronização em `createOrder`.

**Storage**: Armazena fotos de produtos. Upload no admin, URLs públicas servidas via CDN do Supabase.

**O que quebraria sem ele**: Login de clientes e admins, upload de fotos de produtos.

**Arquivos chave**: `apps/store/src/lib/supabase/`, `apps/admin/src/lib/supabase/`

---

## Mercado Pago

**Por que existe**: Único gateway de pagamento relevante para BR. Suporta PIX (instantâneo, 5% desconto), cartão crédito (tokenização no browser via SDK MP, sem PCI scope no servidor), boleto.

**O que quebraria sem ela**: Todo o fluxo de pagamento. Sem MP não há como receber dinheiro.

**Arquivos chave**: `apps/store/src/app/checkout/actions.ts`, `apps/store/src/app/api/webhooks/mercadopago/route.ts`

**Segurança**: O status do pagamento é sempre verificado via `GET /v1/payments/{id}` na API do MP — nunca confiamos no payload do webhook. HMAC-SHA256 valida autenticidade com `timingSafeEqual`.

---

## Resend + React Email

**Por que existe**: Resend é um serviço de envio de e-mail moderno com alta deliverability. React Email permite criar templates de e-mail com componentes React renderizados para HTML no servidor.

**O que quebraria sem ela**: Todos os e-mails transacionais (confirmação de pedido, pagamento confirmado, envio, cancelamento, boas-vindas newsletter). Porém o fluxo de pedido **não falha** se o e-mail falhar — é fire-and-forget.

**Arquivos chave**: `apps/store/src/lib/email.ts`, `apps/store/src/emails/`

---

## Upstash Redis + @upstash/ratelimit

**Por que existe**: Rate limiting distribuído (funciona em múltiplas instâncias Vercel). Limita tentativas de login a 5/15min por IP. Sem Upstash, o fallback é in-memory (só funciona em single instance — dev).

**O que quebraria sem ela**: Rate limiting distribuído. A app funciona com fallback in-memory mas fica vulnerável a brute force em produção multi-instância.

**Arquivos chave**: `apps/store/src/middleware.ts`

---

## Sentry

**Por que existe**: Error tracking em produção. Captura exceções não tratadas com stack trace, contexto de request e session replay (com `maskAllText: true` para proteger PII).

**O que quebraria sem ela**: Visibilidade de erros em produção. A app funciona, mas erros silenciosos passam despercebidos.

**Arquivos chave**: `apps/store/sentry.*.config.ts`, `apps/admin/sentry.*.config.ts`

**Importante**: `NEXT_PUBLIC_SENTRY_DSN` é público (client-side) por design do Sentry. `SENTRY_AUTH_TOKEN` é privado (só para upload de source maps no build).

---

## Melhor Envio

**Por que existe**: Integração com transportadoras brasileiras (Correios PAC/SEDEX) para cálculo de frete real baseado em dimensões do produto e CEPs. Fallback para valores fixos quando sem credenciais.

**O que quebraria sem ela**: Cálculo de frete real. A app usa valores fixos de fallback (SEDEX R$29,90, PAC R$14,90).

**Arquivos chave**: `apps/store/src/lib/melhor-envio.ts`, `apps/store/src/app/checkout/actions.ts`

---

## Zod

**Por que existe**: Validação de schema em runtime no boundary do sistema (rotas de API e server actions). Garante que dados externos (payloads do cliente, formulários) tenham a forma esperada antes de qualquer processamento.

**O que quebraria sem ela**: Segurança e robustez nas fronteiras. Dados malformados poderiam causar erros internos ou injeção.

**Uso**: `z.object({...}).safeParse()` em todas as API routes públicas.

---

## Zustand

**Por que existe**: State management leve para o carrinho no cliente (`cart-store.ts`). Persiste em `localStorage` via `persist` middleware. Sincroniza com o BD ao fazer login.

**O que quebraria sem ela**: O carrinho de compras client-side. Seria substituído por `useState` com lógica de persistência manual.

**Arquivos chave**: `apps/store/src/lib/cart-store.ts`, `apps/store/src/components/cart-sync.tsx`

---

## Turborepo

**Por que existe**: Orquestrador de build do monorepo. Cache inteligente de tasks (`turbo build`, `turbo lint`, `turbo test`) — só re-builda o que mudou. Resolve dependências entre packages.

**O que quebraria sem ela**: Builds seriam mais lentos e manuais. Cada app teria que ser buildada separadamente.

**Arquivos chave**: `turbo.json`

---

## WhatsApp Business API (Meta)

**Por que existe**: Notificações de pedido via WhatsApp para clientes brasileiros (canal preferido). Dispara mensagem ao criar pedido e ao confirmar pagamento.

**O que quebraria sem ela**: Notificações WhatsApp. A app funciona normalmente — é complementar ao e-mail.

**Arquivos chave**: `apps/store/src/lib/whatsapp.ts`

**Status atual**: Token expirado — necessário renovar em Meta for Developers.
