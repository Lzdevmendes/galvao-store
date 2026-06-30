# Deploy & Env — Galvão's Store

Checklist de go-live. Dois projetos Vercel separados: **store** (`apps/store`) e **admin** (`apps/admin`).
Variáveis abaixo derivadas do código real (`process.env.*`). Ver valores de exemplo em `.env.example`.

---

## 1. Serviços a criar (obter credenciais antes do deploy)

| Serviço | Para quê | Credenciais |
|---------|----------|-------------|
| **Turso** (turso.tech) | Banco SQLite edge | `DATABASE_URL` + `DATABASE_AUTH_TOKEN` |
| **Supabase** (supabase.com) | Auth + Storage de imagens | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Mercado Pago** (produção) | PIX/cartão/boleto | `MERCADOPAGO_ACCESS_TOKEN` (`APP_USR-...`), `MERCADOPAGO_WEBHOOK_SECRET` |
| **Resend** | E-mails transacionais | `RESEND_API_KEY` + **domínio verificado** (DNS TXT) |
| **Upstash Redis** | Rate limiting distribuído | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` |
| **Melhor Envio** | Frete real Correios | `MELHOR_ENVIO_CLIENT_ID` + `_SECRET` |
| **Sentry** (opcional) | Error tracking | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` |

---

## 2. Vercel — projeto STORE (`apps/store`)

**Obrigatórias (core de e-commerce):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DATABASE_URL
DATABASE_AUTH_TOKEN
NEXT_PUBLIC_SITE_URL          # https://galvaosstore.com.br
NEXT_PUBLIC_APP_URL           # = SITE_URL
MERCADOPAGO_ACCESS_TOKEN      # APP_USR-... (produção)
MERCADOPAGO_WEBHOOK_SECRET
RESEND_API_KEY
CRON_SECRET                   # openssl rand -hex 32
SHIPPING_ORIGIN_CEP           # 11671207 (CEP da loja)
```

**Recomendadas / opcionais:**
```
MELHOR_ENVIO_CLIENT_ID, MELHOR_ENVIO_CLIENT_SECRET, MELHOR_ENVIO_SANDBOX=false   # sem isto, frete cai p/ fallback
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN                                  # sem isto, rate limit é in-memory (não ideal em prod)
NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_CLARITY_ID                    # analytics
NEXT_PUBLIC_WHATSAPP_PHONE, NEXT_PUBLIC_INSTAGRAM, NEXT_PUBLIC_FACEBOOK           # footer/social
WHATSAPP_TOKEN, WHATSAPP_PHONE_ID                                                 # notificações WA (token atual expirado)
NEXT_PUBLIC_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT=store, SENTRY_AUTH_TOKEN       # Sentry
```

- Root directory: `apps/store` · Framework: Next.js · `vercel.json` já define o cron de 30min.

---

## 3. Vercel — projeto ADMIN (`apps/admin`)

**Obrigatórias:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # operações admin + Storage
DATABASE_URL
DATABASE_AUTH_TOKEN
ADMIN_EMAILS                  # e-mails autorizados, vírgula p/ múltiplos
STORE_URL                     # https://galvaosstore.com.br (links p/ a loja)
NEXT_PUBLIC_APP_URL
RESEND_API_KEY                # e-mail "avise-me" ao repor estoque
```

**Opcionais:** `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, Sentry (`SENTRY_PROJECT=admin`).

- Root directory: `apps/admin` · `vercel.json` já força `X-Robots-Tag: noindex` (admin nunca indexado).
- Domínio privado/subdomínio (ex: `admin.galvaosstore.com.br`).

---

## 4. Banco de dados (Turso)

```bash
# Criar DB e token
turso db create galvao-store
turso db tokens create galvao-store        # → DATABASE_AUTH_TOKEN

# Aplicar schema (com DATABASE_URL + DATABASE_AUTH_TOKEN no ambiente)
pnpm --filter @galvao/db db:push           # ou aplicar migrations de packages/db/drizzle/

# Seed do catálogo (PASSO FINAL — ver secção 6)
pnpm --filter @galvao/db db:seed
```

> **Importante:** o schema agora inclui `newsletter_subscriptions`, `stock_alerts`,
> `checkout_idempotency` e `user_consents` (antes só existiam no SQLite local). O `db:push`/
> migrations criam-nas — sem isso, newsletter, avise-me, checkout e consentimento quebram em prod.
> Teste de garantia: `pnpm --filter @galvao/db test` (aplica as migrations numa DB limpa).

---

## 5. Wiring pós-deploy (configurar nos painéis externos)

- [ ] **Mercado Pago → Webhooks:** apontar para `https://galvaosstore.com.br/api/webhooks/mercadopago`; copiar o secret gerado → `MERCADOPAGO_WEBHOOK_SECRET`.
- [ ] **Supabase → Auth → URL Configuration:** adicionar `https://galvaosstore.com.br` (Site URL) + redirect `…/auth/callback`. Se quiser Google OAuth: ativar provider no Supabase + criar credenciais no Google Cloud Console.
- [ ] **Supabase → Storage:** confirmar bucket de imagens de produto existe e está acessível (upload do admin escreve nele).
- [ ] **Resend → Domains:** verificar `galvaosstore.com.br` (DNS TXT) — sem isto, e-mails saem de `onboarding@resend.dev`.
- [ ] **DNS / Domínio:** apontar `galvaosstore.com.br` → Vercel store; subdomínio admin → Vercel admin.
- [ ] **Cron:** garantir `CRON_SECRET` igual nos dois lados; os crons da store (`/api/cron/clear-reservations` a cada 30min e `/api/cron/anonymize-data` diário às 03:00 — anonimização LGPD pós-5-anos) já estão em `apps/store/vercel.json`.
- [ ] **LGPD:** confirmar que os scripts de analytics só carregam após consentimento (banner de cookies) e que `/conta/privacidade` (exportar/apagar dados) está acessível.

---

## 6. Passo final — catálogo real

Duas vias (ambas prontas):
1. **Admin UI:** `/produtos/novo` → criar → editar (upload de fotos 1500×1500 + stock por variante).
2. **Seed:** substituir os produtos demo em `packages/db/src/seed.ts` pela planilha real e correr `pnpm --filter @galvao/db db:seed`.

---

## 7. Segredos — pendências de revogação (ver memória)

- 🔴 GitHub PAT `gho_...` embutido no `git remote` — revogar + `git remote set-url origin https://github.com/Lzdevmendes/galvao-store.git`.
- 🔴 `RESEND_API_KEY` antiga — revogar em resend.com.
- 🟠 `CRON_SECRET` antiga (`galvao-cron-2026`) — gerar nova.

---

## 8. Smoke test pós-go-live

- [ ] Home, listagem por marca/categoria, PDP, busca carregam com o catálogo real.
- [ ] Checkout completo: PIX (QR + copia-e-cola), cartão, boleto.
- [ ] Webhook MP confirma pagamento → estoque decrementa → e-mail dispara.
- [ ] Login/cadastro de cliente + área "Minha conta".
- [ ] Admin: login (só `ADMIN_EMAILS`), CRUD produto, upload imagem, mudar status de pedido.
- [ ] Cron de limpeza de reservas responde 200 com `Authorization: Bearer $CRON_SECRET`.
