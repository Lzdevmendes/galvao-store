# Galvão's Store — Descrição Completa do Projecto

Loja de chuteiras e tênis esportivos — Nike, Adidas, Puma, Umbro e mais.  
Caraguatatuba / SP · galvaosstore.com.br

---

## Stack

| Camada         | Tecnologia                                        |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 15 (App Router, RSC)                      |
| Banco de dados | Turso — libsql / SQLite distribuído na edge       |
| Auth           | Supabase Auth (email/password + OAuth)            |
| Storage        | Supabase Storage (fotos de produtos)              |
| Pagamentos     | Mercado Pago (PIX, cartão crédito, boleto)        |
| E-mail         | Resend + React Email                              |
| Frete          | Melhor Envio (Correios PAC/SEDEX) + entrega local |
| WhatsApp       | WhatsApp Business API (Meta)                      |
| Rate limiting  | Upstash Redis + @upstash/ratelimit                |
| Error tracking | Sentry                                            |
| Monorepo       | pnpm workspaces + Turborepo                       |
| Deploy         | Vercel (store + admin separados)                  |

---

## Estrutura do Monorepo

```
.Lipecrg22!
├── apps/
│   ├── store/          # loja pública — porta 3010
│   └── admin/          # backoffice — porta 3011
└── packages/
    ├── db/             # schema Drizzle + cliente Turso
    └── ui/             # componentes partilhados (futuro)
```

---

## App Store — Rotas e Páginas

| Rota                       | Descrição                                                                |
| -------------------------- | ------------------------------------------------------------------------ |
| `/`                        | Home — hero, marcas em destaque, produtos em promoção, newsletter        |
| `/produtos`                | Catálogo com filtros (marca, categoria, tamanho, ordenação) + paginação  |
| `/[brand-slug]`            | Catálogo filtrado por marca (ex: `/nike`, `/adidas`) + paginação         |
| `/produto/[slug]`          | PDP — galeria, seletor de tamanho, favoritos, JSON-LD                    |
| `/busca`                   | Busca full-text com `LIKE` no SQLite                                     |
| `/carrinho`                | Carrinho (localStorage + sync DB ao login)                               |
| `/checkout`                | 3 passos: dados pessoais → frete → pagamento                             |
| `/obrigado/[id]`           | Confirmação de pedido com status                                         |
| `/conta`                   | Dashboard do cliente (pedidos, endereços, favoritos, avaliações, cupons) |
| `/conta/pedidos/[id]`      | Detalhe do pedido                                                        |
| `/auth/login`              | Login com e-mail/password                                                |
| `/auth/cadastro`           | Registro                                                                 |
| `/auth/recuperar`          | Recuperação de senha                                                     |
| `/auth/callback`           | OAuth callback do Supabase                                               |
| `/politica-de-privacidade` | Página LGPD                                                              |
| `/termos-de-uso`           | Termos de serviço                                                        |
| `/sitemap.xml`             | Sitemap dinâmico gerado via route handler                                |
| `/robots.txt`              | Robots dinâmico                                                          |

### API Routes (Store)

| Rota                           | Método        | Função                                          |
| ------------------------------ | ------------- | ----------------------------------------------- |
| `/api/newsletter`              | POST          | Inscrição na newsletter (persiste na DB)        |
| `/api/avise-me`                | POST          | Alerta de reposição de stock (persiste na DB)   |
| `/api/cart/sync`               | POST / DELETE | Sincronização carrinho guest→DB ao login/logout |
| `/api/pagamento/webhook`       | POST          | Webhook Mercado Pago (valida HMAC)              |
| `/api/cron/clear-reservations` | GET           | Limpa reservas de stock expiradas (cron 30min)  |
| `/api/frete`                   | POST          | Cálculo de frete via Melhor Envio               |

---

## App Admin — Rotas e Páginas

| Rota             | Descrição                                                     |
| ---------------- | ------------------------------------------------------------- |
| `/`              | Dashboard — KPIs do dia, pedidos recentes, stock crítico      |
| `/produtos`      | Lista de produtos com busca e filtros                         |
| `/produtos/novo` | Criar produto + variantes + upload de fotos                   |
| `/produtos/[id]` | Editar produto — descrição, fotos, variantes, preços, custo   |
| `/pedidos`       | Lista de pedidos com filtros de status                        |
| `/pedidos/[id]`  | Detalhe do pedido — itens, cliente, endereço, timeline        |
| `/estoque`       | Gestão de estoque — ajuste manual por variante                |
| `/cupons`        | Criar, listar e desactivar cupons de desconto                 |
| `/relatorios`    | Receita, ticket médio, top produtos, gráfico diário (30 dias) |
| `/clientes`      | Lista de clientes com total de pedidos e LTV                  |
| `/configuracoes` | Configurações da loja (em construção)                         |

### API Routes (Admin)

| Rota                  | Método | Função                                      |
| --------------------- | ------ | ------------------------------------------- |
| `/api/images/[id]`    | DELETE | Apaga imagem do Supabase Storage + reordena |
| `/api/images/reorder` | POST   | Reordena fotos de produto via drag-and-drop |

---

## Base de Dados — Tabelas

| Tabela                     | Descrição                                               |
| -------------------------- | ------------------------------------------------------- |
| `products`                 | Catálogo — nome, slug, brand, descrição, categoria, SEO |
| `product_images`           | Fotos associadas a produtos (ordem, URL Supabase)       |
| `product_variants`         | Tamanhos/cores com price, promo, cost, stock, SKU       |
| `orders`                   | Pedidos — status, total, frete, cupom, MP payment_id    |
| `order_items`              | Itens de cada pedido (snapshot de preço)                |
| `users`                    | Perfil do cliente (nome, CPF, telefone)                 |
| `addresses`                | Endereços de entrega dos clientes                       |
| `cart_items`               | Carrinho server-side (user_id + variant_id + qty)       |
| `wishlists`                | Favoritos (user_id + product_id)                        |
| `reviews`                  | Avaliações de produtos (1-5 estrelas + texto)           |
| `coupons`                  | Cupons — tipo (%), valor, validade, uso máximo          |
| `coupon_uses`              | Histórico de uso de cupons por pedido                   |
| `newsletter_subscriptions` | E-mails inscritos na newsletter                         |
| `stock_alerts`             | Alertas de "avise-me" com flag `notified_at`            |
| `checkout_idempotency`     | Prevenção de double-submit (key → order_id)             |
| `stock_movements`          | Histórico de ajustes de estoque (admin)                 |

---

## Componentes e Libs Importantes (Store)

| Ficheiro                                 | Função                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| `src/lib/db.ts`                          | Cliente Turso (async, file:// dev / libsql:// prod)                          |
| `src/lib/catalog-query.ts`               | `queryProducts`, `queryProductsCount`, `searchProducts`, filtros + paginação |
| `src/lib/cart-store.ts`                  | Zustand store do carrinho (localStorage)                                     |
| `src/lib/cart-server.ts`                 | Queries de carrinho na DB                                                    |
| `src/middleware.ts`                      | Rate limiting (Upstash Redis + fallback in-memory)                           |
| `src/components/cart-sync.tsx`           | Sincroniza localStorage→DB ao detectar login (Supabase onAuthStateChange)    |
| `src/components/layout/site-header.tsx`  | Header com busca, carrinho, conta, favoritos                                 |
| `src/components/layout/site-footer.tsx`  | Footer com links, newsletter inline                                          |
| `src/app/checkout/actions.ts`            | Server action de criação de pedido + idempotency                             |
| `src/app/api/pagamento/webhook/route.ts` | Webhook MP com validação HMAC + update de status                             |

---

## Funcionalidades Implementadas

### Loja

- Catálogo com filtros combinados (marca + categoria + tamanho + ordenação) e paginação SEO-friendly (24/página)
- PDP com galeria de fotos, seletor de tamanho com stock em tempo real, JSON-LD (Product schema)
- Busca full-text
- Carrinho persistido em localStorage, sincronizado com a DB ao fazer login
- Favoritos (wishlist) persistidos na DB
- Avaliações de produto com estrelas
- Checkout em 3 passos: dados pessoais → frete (Melhor Envio) → pagamento
- Pagamento via PIX (5% desconto automático), cartão crédito (até 12x sem juros), boleto
- Cupons de desconto (percentual ou valor fixo)
- Proteção contra double-submit com idempotency key
- Página de confirmação com status do pedido
- Conta do cliente: histórico de pedidos, endereços, favoritos, avaliações, cupons usados
- Newsletter com e-mail de boas-vindas via Resend
- "Avise-me" quando produto volta ao stock — e-mail automático disparado no admin
- Entrega local por CEP (Caraguatatuba + região)
- LGPD: cookie consent, política de privacidade, termos de uso
- SEO: sitemap dinâmico, robots, Open Graph, canonical, JSON-LD
- WhatsApp flutuante para suporte
- Loading skeletons em todas as rotas + barra de progresso no admin
- Error boundary e páginas 404 customizadas

### Admin

- CRUD completo de produtos com upload de fotos (drag-and-drop + reorder)
- Gestão de variantes (tamanho, preço, preço promo, custo, stock, SKU)
- Ajuste manual de stock com histórico de movimentações
- Pedidos com timeline de status e detalhe completo
- Cupons: criar, ver usos, desactivar
- Relatórios: receita total, ticket médio, top 10 produtos, gráfico de vendas diárias (Chart.js)
- Lista de clientes com LTV
- E-mail automático de "avise-me" ao repor stock

### Segurança

- Rate limiting no login (5 tentativas / 15 min) via Upstash Redis + fallback in-memory
- IDOR corrigido — todas as queries filtram por `user_id` da sessão
- Content-Security-Policy em store e admin
- HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Webhook MP validado com HMAC-SHA256
- Senha mínima 8 caracteres (validada no frontend e backend)
- Admin bloqueado com noindex + Supabase Auth (sem acesso público)
- Sentry para error tracking em produção

---

## Variáveis de Ambiente

### Obrigatórias

| Variável                        | Onde obter                               |
| ------------------------------- | ---------------------------------------- |
| `DATABASE_URL`                  | turso.tech → `libsql://<db>.turso.io`    |
| `DATABASE_AUTH_TOKEN`           | turso.tech                               |
| `NEXT_PUBLIC_SUPABASE_URL`      | supabase.com                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | supabase.com (só admin)                  |
| `MERCADOPAGO_ACCESS_TOKEN`      | mercadopago.com.br                       |
| `MERCADOPAGO_WEBHOOK_SECRET`    | mercadopago.com.br                       |
| `RESEND_API_KEY`                | resend.com                               |
| `CRON_SECRET`                   | gerar aleatório (`openssl rand -hex 32`) |

### Opcionais (recomendados)

| Variável                     | Para quê                  |
| ---------------------------- | ------------------------- |
| `UPSTASH_REDIS_REST_URL`     | Rate limiting distribuído |
| `UPSTASH_REDIS_REST_TOKEN`   | Rate limiting distribuído |
| `NEXT_PUBLIC_SENTRY_DSN`     | Error tracking            |
| `SENTRY_AUTH_TOKEN`          | Upload de source maps     |
| `WHATSAPP_PHONE_ID`          | Notificações WhatsApp     |
| `WHATSAPP_TOKEN`             | Notificações WhatsApp     |
| `MELHOR_ENVIO_CLIENT_ID`     | Frete real dos Correios   |
| `MELHOR_ENVIO_CLIENT_SECRET` | Frete real dos Correios   |
| `NEXT_PUBLIC_GA_ID`          | Google Analytics 4        |
| `NEXT_PUBLIC_PIXEL_ID`       | Meta Pixel                |
| `NEXT_PUBLIC_SITE_URL`       | URL pública da loja       |

---

## Deploy

### Store (Vercel)

1. Criar projecto apontando para `apps/store`
2. Definir todas as variáveis de ambiente
3. `vercel.json` já configura o cron de limpeza de reservas (a cada 30 min)

### Admin (Vercel)

1. Criar projecto separado apontando para `apps/admin`
2. Definir variáveis de ambiente
3. Configurar domínio privado (ex: `admin.galvaosstore.com.br`)
4. `vercel.json` já adiciona `X-Robots-Tag: noindex, nofollow`

### Schema na DB Turso

```bash
turso db shell galvao-store < packages/db/schema.sql
```

---

## Checklist de Go-Live — Passo a Passo

> Ordem importa. Siga de cima para baixo.

### PASSO 1 — Criar o banco de dados Turso

1. Acesse [turso.tech](https://turso.tech) → criar conta (grátis)
2. Criar banco: `turso db create galvao-store --location gru` (São Paulo)
3. Obter URL: `turso db show galvao-store --url` → salvar como `DATABASE_URL`
4. Criar token: `turso db tokens create galvao-store` → salvar como `DATABASE_AUTH_TOKEN`
5. Rodar a migração:
   ```bash
   turso db shell galvao-store < packages/db/schema.sql
   ```

### PASSO 2 — Preencher variáveis de ambiente

**`apps/store/.env.local`** — adicionar as que faltam:
```env
DATABASE_URL=libsql://<seu-banco>.turso.io
DATABASE_AUTH_TOKEN=<token-gerado>
MERCADOPAGO_WEBHOOK_SECRET=<gerar no painel MP>
```

**`apps/admin/.env.local`** — adicionar as que faltam:
```env
DATABASE_URL=libsql://<seu-banco>.turso.io
DATABASE_AUTH_TOKEN=<token-gerado>
RESEND_API_KEY=re_REDACTED_REVOGAR
MERCADOPAGO_ACCESS_TOKEN=TEST-8206096742567619-...
CRON_SECRET=REDACTED_CRON_ROTACIONAR
```

**Variáveis recomendadas (rate limiting + error tracking):**
- Criar conta grátis em [upstash.com](https://upstash.com) → Redis → copiar `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` para os dois `.env.local`
- Criar conta em [sentry.io](https://sentry.io) → criar projeto Next.js → copiar `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_AUTH_TOKEN`

### PASSO 3 — Seed com produtos reais

Quando o cliente enviar a lista de produtos (planilha ou lista), rodar:
```bash
# Editar packages/db/seed.ts com os dados reais
cd packages/db && pnpm seed
```

### PASSO 4 — Deploy na Vercel

**Store:**
1. Acesse [vercel.com](https://vercel.com) → Add New Project → importar repositório
2. Root Directory: `apps/store`
3. Framework: Next.js (detecta automático)
4. Adicionar todas as variáveis de ambiente (copiar do `.env.local`)
5. Trocar `NEXT_PUBLIC_SITE_URL` para `https://galvaosstore.com.br`
6. Deploy → configurar domínio `galvaosstore.com.br`

**Admin:**
1. Add New Project → mesmo repositório
2. Root Directory: `apps/admin`
3. Adicionar variáveis de ambiente do admin
4. Trocar `NEXT_PUBLIC_APP_URL` e `STORE_URL` para as URLs de produção
5. Deploy → configurar domínio `admin.galvaosstore.com.br` (domínio privado)

### PASSO 5 — Configurar Mercado Pago produção

1. Acessar [mercadopago.com.br](https://mercadopago.com.br) → Suas integrações
2. Trocar `MERCADOPAGO_ACCESS_TOKEN` de `TEST-...` para `APP_USR-...`
3. Configurar webhook: `https://galvaosstore.com.br/api/pagamento/webhook`
4. Copiar o `MERCADOPAGO_WEBHOOK_SECRET` gerado para a variável na Vercel

### PASSO 6 — Verificar domínio no Resend

1. Acessar [resend.com](https://resend.com) → Domains → Add Domain → `galvaosstore.com.br`
2. Adicionar os registros DNS indicados no provedor do domínio
3. Aguardar verificação (pode levar até 24h)
4. Após verificado, e-mails saem de `noreply@galvaosstore.com.br` em vez de `onboarding@resend.dev`

### PASSO 7 — Renovar token WhatsApp (se quiser notificações WA)

1. Acessar [Meta for Developers](https://developers.facebook.com) → seu app → WhatsApp → API Setup
2. Gerar novo token de acesso permanente
3. Atualizar `WHATSAPP_TOKEN` na Vercel (store + admin)

### PASSO 8 — Teste ponta a ponta

```bash
# Testar cron de limpeza de reservas em produção
curl -H "Authorization: Bearer REDACTED_CRON_ROTACIONAR" \
  https://galvaosstore.com.br/api/cron/clear-reservations
```

- [ ] Compra completa com PIX (sandbox → confirmar no painel MP)
- [ ] Compra com cartão (sandbox)
- [ ] Cadastro de cliente + login
- [ ] Admin: criar produto + fazer upload de foto
- [ ] Admin: repor estoque → verificar e-mail "avise-me" disparado
- [ ] Newsletter: inscrição → verificar e-mail de boas-vindas

---

## O que Falta (aguardando cliente)

| Item                         | Estado                                    |
| ---------------------------- | ----------------------------------------- |
| Lista de produtos reais      | Cliente envia → seed na DB (Passo 3)      |
| Token WhatsApp               | Expirado — renovar em Meta for Developers |
| Número WhatsApp brasileiro   | Actualmente sai de número USA             |
| Domínio verificado no Resend | E-mails saem de `onboarding@resend.dev`   |
| Mercado Pago produção        | Actualmente em sandbox (Passo 5)          |
| CNPJ + Certificado A1        | Necessário para emissão de NFe (futuro)   |

---

## Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Iniciar store (http://localhost:3010)
pnpm --filter @galvao/store dev

# Iniciar admin (http://localhost:3011)
pnpm --filter @galvao/admin dev

# TypeScript check
cd apps/store && node_modules/.bin/tsc --noEmit
cd apps/admin && node_modules/.bin/tsc --noEmit

# Testar cron de limpeza de reservas
curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3010/api/cron/clear-reservations

# Seed de dados de exemplo
cd packages/db && pnpm seed
```
