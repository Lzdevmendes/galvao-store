# Arquitectura — Galvão's Store Monorepo

## Estrutura

```
galvao-store/
├── apps/
│   ├── store/              Next.js 15 — loja pública (:3010)
│   └── admin/              Next.js 15 — backoffice (:3011)
├── packages/
│   ├── db/                 Schema Drizzle + cliente Turso
│   │   └── src/
│   │       ├── client.ts   createClient() para libSQL
│   │       ├── schema/
│   │       │   ├── products.ts   brands, categories, products, variants, images, reviews, stockMovements
│   │       │   ├── orders.ts     orders, orderItems, orderEvents
│   │       │   ├── users.ts      users, addresses, adminUsers
│   │       │   └── commerce.ts   coupons, couponUses, cartItems, wishlists, deliveryZones, auditLog, appSettings
│   │       └── seed.ts
│   ├── ui/                 Componentes partilhados (Radix + CVA) — em desenvolvimento
│   └── tsconfig/           tsconfig base compartilhado
├── turbo.json              Pipeline: build → lint → test
├── pnpm-workspace.yaml     apps/* + packages/*
└── CLAUDE.md               Guia para IA
```

## Apps

### `apps/store` — Loja pública

**Rotas de página** (App Router/RSC):
- `/` — Home com hero, marcas, promoções
- `/produtos` — Catálogo com filtros + paginação
- `/[brand-slug]` — Catálogo por marca
- `/produto/[slug]` — PDP (product detail page)
- `/busca` — Full-text search
- `/carrinho` — Carrinho (localStorage + sync DB)
- `/checkout` — 3 passos: dados → frete → pagamento
- `/obrigado/[id]` — Confirmação de pedido
- `/conta/*` — Área do cliente (pedidos, endereços, favoritos)
- `/auth/*` — Login, cadastro, recuperação, callback OAuth

**API Routes**:

| Rota | Método | Autenticação | Rate limit |
|------|--------|-------------|-----------|
| `/api/newsletter` | POST | - | ❌ (adicionar) |
| `/api/avise-me` | POST | - | ❌ (adicionar) |
| `/api/cart/sync` | POST/DELETE | Supabase session | - |
| `/api/conta/enderecos` | GET | Supabase session | - |
| `/api/favoritos` | GET/POST/DELETE | Supabase session | - |
| `/api/webhooks/mercadopago` | POST | HMAC x-signature | NÃO aplicar |
| `/api/cron/clear-reservations` | GET | Bearer CRON_SECRET | - |
| `/api/frete` | POST | - | - |

**Middleware** (`src/middleware.ts`):
- Rate limiting no `POST /auth/login` (5/15min, Upstash Redis com fallback in-memory)
- Redireciona `/conta/*` para `/auth/login` se não autenticado
- Supabase session refresh

**Server Actions**:
- `src/app/checkout/actions.ts` — `calculateShipping`, `validateCoupon`, `createOrder`

### `apps/admin` — Backoffice

**Rotas de página**: `/`, `/produtos/*`, `/pedidos/*`, `/estoque`, `/cupons`, `/relatorios`, `/clientes`, `/configuracoes`

**Middleware** (`src/middleware.ts`):
- Bloqueia tudo (matcher: `/((?!login|_next|...).*)`)
- Verifica `ADMIN_EMAILS` env var contra email do Supabase Auth

**Server Actions** (todas chamam `requireAdmin()`):
- `app/pedidos/[id]/actions.ts` — `updateOrderStatus`
- `app/estoque/actions.ts` — `adjustStock`
- `app/cupons/actions.ts` — `toggleCoupon`, `createCoupon`
- `app/produtos/novo/actions.ts` — `createProduct`
- `app/produtos/[id]/actions.ts` — `updateProduct`

**API Routes** (todas chamam `requireAdmin()`):
- `/api/images/[id]` DELETE — apaga imagem do Supabase Storage
- `/api/images/upload` POST — faz upload de imagem
- `/api/images/reorder` POST — reordena fotos
- `/api/images/primary` POST — define foto principal

## Fronteiras de import

```
apps/store   → @galvao/db, @galvao/ui
apps/admin   → @galvao/db, @galvao/ui
packages/db  → @libsql/client, drizzle-orm
packages/ui  → radix-ui/*, class-variance-authority

PROIBIDO: apps/store → apps/admin (ou vice-versa)
PROIBIDO: packages/* → apps/*
```

## Base de dados (Turso/SQLite)

- **Dev local**: `file:../../packages/db/galvao.db` (SQLite local)
- **Produção**: `libsql://<db>.turso.io` (SQLite distribuído na edge)
- Não há RLS — authz é 100% no código da aplicação
- Todas as queries usam `drizzle-orm` + parâmetros (sem SQL injection)

## Autenticação dupla

1. **Clientes** (`apps/store`): Supabase Auth. JWT via cookies. `createClient()` de `@/lib/supabase/server` para RSC/actions.
2. **Admins** (`apps/admin`): Supabase Auth + lista de emails autorizados em `ADMIN_EMAILS`. O `requireAdmin()` em `@/lib/require-admin` é chamado em toda server action e API route do admin.

## Deploy

- Cada app tem seu próprio projeto Vercel
- `apps/store`: domínio `galvaosstore.com.br`
- `apps/admin`: domínio `admin.galvaosstore.com.br` (privado, `X-Robots-Tag: noindex`)
- Cron Vercel: `GET /api/cron/clear-reservations` a cada 30min
