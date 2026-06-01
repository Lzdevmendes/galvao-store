# Galvão's Store

Loja de chuteiras e tênis esportivos — Nike, Adidas, Puma, Umbro e mais.  
Caraguatatuba / SP · [galvaosstore.com.br](https://galvaosstore.com.br)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Banco de dados | Turso (libsql / SQLite distribuído) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Pagamentos | Mercado Pago (PIX, cartão, boleto) |
| E-mail | Resend + React Email |
| Frete | Melhor Envio (Correios) |
| WhatsApp | WhatsApp Business API |
| Rate limiting | Upstash Redis |
| Error tracking | Sentry |
| Monorepo | pnpm workspaces + Turborepo |

---

## Estrutura

```
.
├── apps/
│   ├── store/          # loja pública (porta 3010)
│   └── admin/          # backoffice (porta 3011)
└── packages/
    ├── db/             # schema Drizzle + cliente Turso
    └── ui/             # componentes partilhados
```

---

## Setup local

### Pré-requisitos
- Node.js 20+
- pnpm 9+

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example apps/store/.env.local
cp .env.example apps/admin/.env.local
```

Preencha os valores — veja comentários no `.env.example`.  
Para desenvolvimento local, `DATABASE_URL` pode ser omitido (usa o ficheiro `galvao.db` local).

### 3. Iniciar

```bash
# Store (http://localhost:3010)
pnpm --filter @galvao/store dev

# Admin (http://localhost:3011)
pnpm --filter @galvao/admin dev

# Ambos em paralelo
pnpm dev
```

---

## Base de dados

O projecto usa **Turso** em produção e um ficheiro SQLite local em desenvolvimento.

```bash
# Criar/actualizar tabelas em produção (requer CLI Turso)
turso db shell galvao-store < packages/db/schema.sql

# Seed de dados de exemplo
cd packages/db && pnpm seed
```

Tabelas importantes:

| Tabela | Descrição |
|--------|-----------|
| `products` / `product_variants` | Catálogo |
| `orders` / `order_items` | Pedidos |
| `users` / `addresses` | Clientes |
| `cart_items` | Carrinho server-side |
| `wishlists` | Favoritos |
| `coupons` / `coupon_uses` | Cupons |
| `newsletter_subscriptions` | Newsletter |
| `stock_alerts` | Avisos de reposição |
| `checkout_idempotency` | Prevenção de double-submit |
| `stock_movements` | Histórico de estoque |

---

## Deploy (Vercel)

### Store

1. Criar projecto no Vercel apontando para `apps/store`
2. Definir variáveis de ambiente (ver `.env.example`)
3. O `vercel.json` já configura o cron de limpeza de reservas (a cada 30 min)

### Admin

1. Criar projecto separado apontando para `apps/admin`
2. Definir variáveis de ambiente
3. Configurar domínio privado (ex: `admin.galvaosstore.com.br`)
4. O `vercel.json` já adiciona `X-Robots-Tag: noindex`

### Variáveis obrigatórias em produção

| Variável | Onde obter |
|----------|-----------|
| `DATABASE_URL` | [turso.tech](https://turso.tech) |
| `DATABASE_AUTH_TOKEN` | turso.tech |
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase.com (apenas admin) |
| `MERCADOPAGO_ACCESS_TOKEN` | [mercadopago.com.br](https://www.mercadopago.com.br) |
| `MERCADOPAGO_WEBHOOK_SECRET` | mercadopago.com.br |
| `RESEND_API_KEY` | [resend.com](https://resend.com) |
| `CRON_SECRET` | Gerar aleatório |

Opcionais mas recomendados:
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` → rate limiting distribuído
- `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_AUTH_TOKEN` → error tracking
- `WHATSAPP_PHONE_ID` + `WHATSAPP_TOKEN` → notificações WhatsApp
- `MELHOR_ENVIO_CLIENT_ID` + `MELHOR_ENVIO_CLIENT_SECRET` → frete real dos Correios

---

## Funcionalidades

- **Catálogo** com filtros por marca, categoria, tamanho e ordenação + paginação
- **PDP** (página de produto) com galeria, seletor de tamanho, favoritos, JSON-LD
- **Carrinho** persistido em localStorage + sincronização com DB ao fazer login
- **Checkout** em 3 passos: dados → frete → pagamento
- **Pagamento** via PIX (5% OFF), cartão de crédito (até 12x) e boleto
- **Frete** via Melhor Envio (Correios) + entrega local por CEP
- **Conta do cliente**: pedidos, endereços, favoritos, avaliações, cupons
- **Newsletter** com e-mail de boas-vindas persistida na DB
- **"Avise-me"** quando produto volta ao estoque
- **Admin**: gestão de produtos, variantes, estoque, pedidos, cupons, relatórios

---

## Testes

```bash
# Unit tests (vitest)
pnpm --filter @galvao/store test

# E2E (Playwright) — requer store rodando em :3010
pnpm --filter @galvao/store test:e2e

# TypeScript check
cd apps/store && npx tsc --noEmit
cd apps/admin && npx tsc --noEmit
```

---

## Documentação adicional

| Documento | Conteúdo |
|-----------|---------|
| [`CLAUDE.md`](./CLAUDE.md) | Guia rápido para IA — regras invioláveis e fluxo |
| [`agents/overview.md`](./agents/overview.md) | Domínio e regras de negócio |
| [`agents/architecture.md`](./agents/architecture.md) | Arquitetura e estrutura de arquivos |
| [`agents/stack.md`](./agents/stack.md) | Cada lib e por que existe |
| [`agents/conventions.md`](./agents/conventions.md) | Como criar features, convenção de commits |
| [`agents/glossary.md`](./agents/glossary.md) | Entidades do schema Drizzle |
| [`docs/EXPLICACAO.md`](./docs/EXPLICACAO.md) | Explicação didática ponta a ponta |

---

## Commits

Títulos apenas, separados por responsabilidade:

```
feat: nova funcionalidade
fix: correcção de bug
security: correcção de segurança
perf: melhoria de performance
refactor: sem mudança de comportamento
style: formatação/CSS
test: testes
docs: documentação
chore: deps/config/build
```
