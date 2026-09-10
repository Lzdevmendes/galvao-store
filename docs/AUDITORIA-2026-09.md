# Auditoria Completa — Galvão's Store (2026-09-08)

Auditoria sénior ponta-a-ponta do monorepo (`apps/store`, `apps/admin`, `packages/db`,
`packages/ui`), cobrindo as 11 áreas pedidas. Executada por leitura de código + comandos
reais (`test`, `test:e2e`, `tsc --noEmit`, `pnpm audit`, `build` + Lighthouse) — nada foi
estimado sem confirmação.

**Regra desta rodada:** só a secção 4 (PWA) foi implementada (aprovado explicitamente).
Todo o resto é recomendação — nenhuma outra alteração de código foi feita. Correções
avançam secção a secção, com a tua aprovação, em commits separados (título apenas, sem
body, sem marca de AI, conforme o estilo já registado).

---

## Resumo executivo — Top 5 🔴

1. **`updateVariantPrice` sem `requireAdmin()`** — `apps/admin/src/app/produtos/[id]/actions.ts:40-58`.
   Server action que altera preço/preço-promo/custo de qualquer variante **sem nenhuma
   verificação de autenticação**. Server actions do Next são endpoints HTTP reais — dá para
   chamar directamente, sem passar pela UI/middleware. Único ponto onde a Regra 4 do
   CLAUDE.md está a ser violada hoje. Corrigir antes de qualquer outra coisa.
2. **Dependências com vulnerabilidades HIGH em produção** — `pnpm audit`: `next@15.3.3` (3
   HIGH — DoS e SSRF em Server Actions) e `drizzle-orm@0.43.1` (HIGH — SQL injection via
   identificadores mal escapados, relevante porque o projeto usa bastante SQL cru). Total:
   1 crítica + 23 altas + 13 moderadas + 3 baixas no repo inteiro.
3. **Fluxos financeiros mais críticos do projeto sem teste automatizado** —
   `checkout/actions.ts` (createOrder: recálculo de preço, cupom, reserva de estoque) e
   `api/webhooks/mercadopago/route.ts` (idempotência do pagamento) não têm nenhum teste que
   exercite o código real — só cobertura indireta/parcial. São exactamente as duas Regras
   Invioláveis #1 e #2 do CLAUDE.md, e é onde uma regressão custaria dinheiro real.
4. **Cadastro e recuperação de senha sem rate limit algum** — `apps/store/src/app/auth/cadastro/page.tsx`
   e `.../esqueci-senha/page.tsx` chamam `supabase.auth.signUp`/`resetPasswordForEmail`
   directo do client, sem passar por nenhum limiter da aplicação (os limiters `loginEmail`
   e `frete` já definidos em `ratelimit.ts` também nunca são chamados — código morto que dá
   falsa sensação de protecção). Vector de abuso real: spam de contas, enumeração de e-mail
   via reset de senha.
5. **Segredos ainda não revogados (pendência repetida)** — confirmado agora que o PAT do
   GitHub **continua embutido e activo** em `.git/config` (`git remote -v`), e `DEPLOY.md`
   continua a listar `RESEND_API_KEY` antiga e `CRON_SECRET` antiga como pendentes. Isto já
   tinha sido apontado em Junho — ainda não foi resolvido. Acção manual tua nos painéis
   (GitHub, Resend), não é algo que eu corrija em código.

---

## 1. Frontend / UI

**🟠 1.1 `@galvao/ui` órfão — duas fontes de verdade para o design system**
`packages/ui/src/badge.tsx` tem um `Badge` mais completo (cva, variantes `bestseller`/
`exclusive`, `DiscountBadge`, `PixBadge`) mas **zero imports** em `apps/store` ou
`apps/admin` (confirmado por grep). A store usa uma versão local mais simples
(`apps/store/src/components/ui/badge.tsx`, 6 variantes via classes CSS). Duas
implementações divergentes do mesmo componente.
**Recomendação:** decidir entre (a) terminar a migração para `@galvao/ui` nos dois apps,
ou (b) remover o package se não há plano de o adoptar — hoje é código morto que confunde
qual é "a" fonte do design system.

**🟡 1.2 Badges de produto reimplementados inline**
`apps/store/src/components/catalog/product-card.tsx:39-44` monta 4 variantes de badge com
`<span style={{...}}>` inline e hex hardcoded, duplicando as classes `.badge-*` já
documentadas no CLAUDE.md. Mudar a paleta exige editar dois lugares.
**Recomendação:** trocar por `<Badge variant="...">` (estendendo a variante local se faltar
`bestseller`/`exclusive`).

**🟠 1.3 Rotas sem `loading.tsx` próprio (store)**
`/categoria/[slug]`, `/contato`, `/ofertas`, `/pedido/[id]` (confirmação de pedido —
tráfego crítico pós-checkout), `/conta/pedidos/[id]`, `/conta/avaliar/[orderId]`,
`/conta/privacidade`. Estáticas de baixa prioridade também sem: `/politica-trocas`,
`/privacidade`, `/tamanhos`, `/termos`.
**Recomendação:** priorizar `/pedido/[id]` e `/categoria/[slug]` primeiro (tráfego real),
seguindo o padrão `.skeleton` já usado nos outros `loading.tsx`.

**🟠 1.4 Rotas sem `loading.tsx` próprio (admin)**
`clientes/[id]`, `pedidos/[id]`, `produtos/[id]`, `produtos/novo` — justamente as páginas
de detalhe/edição mais usadas na operação diária.
**Recomendação:** mesmo padrão de skeleton/`.mobile-cards` já usado em `estoque`/`cupons`/
`pedidos` (lista).

**🟡 1.5 `error.tsx` só existe em 3 lugares** (store: raiz, `/checkout`, `/conta`; admin: só
raiz). O resto herda o error boundary genérico do segmento pai — aceitável no Next, mas
nenhuma página de detalhe tem mensagem contextual. Baixa prioridade.

**🟡 1.6 Sem página 404 customizada por secção** — confirmado como comportamento padrão do
Next (só `not-found.tsx` na raiz de cada app), não é um gap real.

**Sem acção — tipografia store vs admin.** Store usa Bebas Neue + Archivo + Space Grotesk;
admin usa só Space Grotesk + JetBrains Mono. Parece decisão deliberada (ferramenta interna
vs. loja com marca) — não recomendo unificar via `packages/ui` só por uniformidade.

---

## 2. Testes

### Resultado real dos comandos

| Comando | Resultado |
|---|---|
| `pnpm --filter @galvao/store test` | ✅ 62 testes, 0 falhas |
| `pnpm --filter @galvao/admin test` | ✅ 9 testes, 0 falhas |
| `pnpm --filter @galvao/db test` | ✅ 3 testes, 0 falhas |
| `tsc --noEmit` (store) | ✅ exit 0 |
| `tsc --noEmit` (admin) | ✅ exit 0 |
| `pnpm --filter @galvao/store test:e2e` | ⚠️ 8 passaram, 36 falharam — 34 delas só por falta do browser do Playwright neste ambiente (`pnpm exec playwright install` nunca foi rodado aqui), não bug de código |

**🔴 2.1 `checkout/actions.ts` (createOrder) sem teste unitário/integração directo** — só
cobertura e2e indirecta (que hoje só testa validação de formulário no client, não o
create-order de facto). Concentra a Regra #1 (preço sempre do servidor) e a reserva de
estoque — maior risco de regressão silenciosa do projecto.
**Recomendação:** teste de integração com DB de teste cobrindo: preço recalculado ignora
valor do client; cupom inválido/expirado rejeitado; estoque insuficiente rejeitado; dupla
submissão com a mesma idempotency key não duplica pedido.

**🔴 2.2 `api/webhooks/mercadopago/route.ts` sem teste que exercite a rota** —
`mercadopago-signature.test.ts` testa só a matemática do HMAC isoladamente, nunca importa o
`route.ts`. A idempotência (Regra #2) não tem nenhum teste automatizado a provar que uma
segunda notificação do mesmo pagamento não decrementa estoque duas vezes.
**Recomendação:** teste de integração que chama o handler duas vezes com o mesmo payload
assinado e confirma que o estoque só é decrementado uma vez.

**🟠 2.3 `/api/newsletter/unsubscribe` retorna 500 em vez de 200 para token inválido** —
achado real do e2e (`e2e/lgpd.spec.ts:18`, que rodou sem depender do browser). O handler faz
`await db.run(...)` sem `try/catch` — qualquer falha sobe crua como 500, sem log/Sentry e
sem página branded. Rota pública, chamada direto de e-mail — viola a Regra #5.
**Recomendação:** envolver em `try/catch`, logar no servidor, devolver a mesma página HTML
branded mesmo em erro.

**🟠 2.4 Admin CRUD com cobertura parcial** — só `estoque-actions.test.ts` e
`require-admin.test.ts`. Sem teste para `cupons`, `pedidos/[id]`, `produtos/[id]`,
`produtos/novo`, `configuracoes`. Prioridade menor que checkout/webhook (o middleware do
admin já dá uma camada de protecção), mas o achado 3.1 (secção Segurança) mostra que essa
camada sozinha não basta.

**🟡 2.5 Sem teste unitário de catálogo** — só via `e2e/catalog.spec.ts` (não confirmado
neste ambiente por falta do browser). Prioridade baixa.

**🟡 2.6 Ambiente local sem browser do Playwright instalado** — rodar
`pnpm exec playwright install --with-deps` antes de confiar no e2e; incluir esse passo no
README/CI proposto (secção 8).

**🟡 2.7 Flakiness de rate limit em e2e** — `checkout-flow.spec.ts:68` ("Newsletter API
aceita email válido") recebeu 429 ao rodar `chromium` e `mobile` em paralelo contra o mesmo
dev server (o limiter de IP é partilhado). Não é bug de produto — desenho de teste.
**Recomendação:** `test.describe.configure({ mode: 'serial' })` nesse spec, ou mock do
limiter em teste.

**Estimativa de cobertura por área:** checkout (create-order) fraca · webhook MP fraca ·
crons boa (testados directamente) · admin CRUD parcial (só estoque) · catálogo fraca (só
e2e) · LGPD/consentimento/newsletter boa.

---

## 3. Segurança

### As "5 Regras Invioláveis" — validadas linha a linha

| Regra | Status |
|---|---|
| 1. Preço/total sempre do servidor (`checkout/actions.ts`) | ✅ confirmado — `variantMap` recalcula tudo, cupom revalidado no servidor, payload do cliente nunca usado para valores monetários |
| 2. Webhook MP idempotente | ✅ confirmado — `UPDATE ... WHERE status != 'paid'` + `rowsAffected === 0`; HMAC com `timingSafeEqual`; janela anti-replay de 300s |
| 3. Dinheiro sempre `integer(..._in_cents)` | ✅ confirmado — nenhum campo `real`/`float` no schema |
| 4. `requireAdmin()` em toda action/rota admin | 🔴 **1 excepção** — ver 3.1 abaixo |
| 5. Erros genéricos ao cliente | 🟡 2 exceções menores — ver 3.3/3.4 |

**🔴 3.1 `updateVariantPrice` sem `requireAdmin()`** — `apps/admin/src/app/produtos/[id]/actions.ts:40-58`
(já no resumo executivo). Diferente de `updateProduct` no mesmo ficheiro, que chama
`requireAdmin()` correctamente.
**Recomendação:** adicionar a mesma guarda logo no início da função, igual ao padrão usado
nas outras ~10 actions do admin.

**🔴 3.2 `pnpm audit`: 1 crítica + 23 altas + 13 moderadas + 3 baixas** (já no resumo
executivo). Prioridade: `next` (3 HIGH — DoS/SSRF em Server Actions, 4 MODERATE — cache
confusion/disclosure de endpoints internos) e `drizzle-orm` (HIGH — SQL injection) primeiro,
por impacto directo em produção. `sharp` tem 4 CVEs herdados do libvips (usado no upload de
imagens do admin). A crítica é em `vitest` (só dev/CI, não afecta produção).
**Recomendação:** `pnpm up next drizzle-orm` para as versões patch mais recentes, testar, e
só depois tratar o resto.

**🟠 3.3 `.gitignore` não cobre `.env*` de forma ampla** — cobre `.env`, `.env.local`,
`.env.*.local`, mas não `.env.production`/`.env.development` sem o sufixo `.local`.
Confirmado lendo `.gitignore` na raiz.
**Recomendação:** trocar para padrão `.env*` com excepção explícita `!.env.example`.

**🟡 3.4 `apps/admin/src/app/api/images/upload/route.ts:46`** — em erro de storage, devolve
`storageErr.message` (mensagem interna do Supabase Storage) directo ao cliente. Rota é
admin-only, risco baixo, mas inconsistente com a Regra 5.
**Recomendação:** logar no servidor, devolver mensagem genérica.

**🟡 3.5 `apps/store/src/app/checkout/error.tsx:11`** renderiza `error.message` como
fallback de UI. Nenhum `throw` com dado sensível identificado no fluxo hoje, mas é um
padrão frágil — qualquer novo `throw new Error(...)` no client do checkout vaza a mensagem
directo ao utilizador.

**🟡 3.6 Comparação de `CRON_SECRET` não é timing-safe** — `api/cron/anonymize-data/route.ts`
(e provavelmente `clear-reservations`) usa `auth !== \`Bearer ${CRON_SECRET}\`` em vez de
`crypto.timingSafeEqual`, diferente do padrão usado no webhook MP. Risco baixo (segredo
longo, endpoint interno), mas inconsistente com a Regra 2.

### Confirmado conforme (sem acção necessária)

- **Magic bytes** (`images/upload/route.ts`) — valida JPEG/PNG/WebP por assinatura binária
  real, rejeita SVG/HTML/executáveis. Correcto.
- **IDOR** — `/api/conta/*`, `/api/favoritos`, `/api/cart/sync`: todas as queries filtram
  por `user.id` da sessão Supabase, nunca aceitam ID vindo do client/query string.
- **Segredos hardcoded no código** — nenhum encontrado (grep amplo por chaves/tokens/
  senhas, HMAC, JWT).

### 🔴 Segredos — pendência manual (não é código)

Confirmado agora (`git remote -v`): o **PAT do GitHub continua embutido e activo** no
remote local. `DEPLOY.md` secção 7 continua a listar como pendente:
- 🔴 GitHub PAT — revogar em GitHub → Developer settings → Tokens, depois
  `git remote set-url origin https://github.com/Lzdevmendes/galvao-store.git`.
- 🔴 `RESEND_API_KEY` antiga — revogar em resend.com.
- 🟠 `CRON_SECRET` antiga — gerar nova com `openssl rand -hex 32`.

Não mexi no remote nem em nada disto — é decisão/acção tua nos painéis externos.

---

## 4. PWA — implementado nesta rodada

Não existia manifest, service worker nem meta tags PWA. Implementado (aprovado
explicitamente por ti, fora do fluxo de aprovação secção-a-secção):

- **`apps/store/public/manifest.json`** — nome, `short_name`, ícones 192×192 e 512×512
  (gerados a partir do `logo.svg` existente, único asset de marca disponível),
  `theme_color: #F26B1F` (laranja da marca), `background_color: #FFFFFF`,
  `display: standalone`.
- **`apps/store/public/sw.js`** — **network-first** para páginas e qualquer coisa que não
  seja asset estático (nunca serve HTML/preço/estoque desactualizado; cache só é usado como
  fallback offline); **cache-first** para `/_next/static/*`, `/icons/*`, `/products/*` e
  extensões de imagem/fonte estáticas. `/api/*` nunca é interceptado (network-only, sem
  cache nenhum).
- **`apps/store/src/components/sw-register.tsx`** — regista o SW num `useEffect`, incluído
  no `RootLayout`.
- **`apps/store/src/app/layout.tsx`** — novo `export const viewport` (Next 15 exige
  `viewport`/`themeColor` fora de `metadata`) com `viewportFit: cover` (substituindo a meta
  tag manual anterior) + `themeColor`; `metadata.manifest`, `metadata.icons` (icon +
  apple-touch-icon 180×180) e `metadata.appleWebApp` adicionados.

**Verificação feita:**
- `tsc --noEmit` (store): ✅ exit 0.
- `pnpm --filter @galvao/store build`: ✅ sucesso (precisou de mais heap de Node neste
  ambiente local — máquina estava sob pressão de memória de outros processos, não é
  problema do código).
- Servidor de produção local (`next start`) + `curl`: `manifest.json` (200, JSON válido),
  `sw.js` (200), `icons/icon-192.png` (200) — todos servidos correctamente.
- **Lighthouse:** a versão instalada (13.4.1) **removeu a categoria PWA** (Chrome descontinuou
  os audits de "installability" no Lighthouse a partir da v10 — passaram a viver só no
  painel Application do DevTools). Não dá para reportar uma nota PWA numérica daqui.
  Verificação manual dos critérios de instalabilidade do Chrome: manifest válido com
  `name`/`icons` 192+512/`start_url`/`display: standalone` ✅, service worker registado com
  handler de `fetch` ✅, servido em HTTPS em produção (Vercel) ✅ — os 3 requisitos estão
  cumpridos. **Recomendo confirmar visualmente** em Chrome DevTools → Application →
  Manifest (ícone "Instalar" na barra de endereço) depois do deploy, ou localmente com
  `next start` + DevTools.
  Categorias que o Lighthouse 13 ainda mede, rodadas contra o build local: performance 64,
  accessibility 95, best-practices 92 — números **não representativos** do ambiente real
  (servidor local sem CDN, máquina sob carga pesada de outros processos durante a medição).
  LCP local ficou em 5.1s / TBT 400ms — vale remedir depois do deploy real antes de tirar
  conclusões.

**🟡 4.1 Ícone é o logótipo completo (mark + wordmark), não um símbolo isolado** — não há
no repo uma versão só do símbolo (a figura do corredor) separada do texto "GALVÃO'S". Em
192px o texto fica praticamente ilegível. Funciona para instalabilidade, mas um ícone
dedicado (só o símbolo, em fundo sólido) ficaria mais nítido no launcher do telemóvel.
Nice-to-have — pedir ao designer/cliente um ícone quadrado dedicado.

**🟡 4.2 Ícones não são `maskable`** — só `purpose: "any"`. Não bloqueia instalação, mas
Android pode cortar o logótipo de forma feia em launchers com ícone adaptativo. Requer um
ícone com margem de segurança (~safe zone 80% central) — mesmo bloqueio do achado 4.1
(precisa de um símbolo isolado antes de fazer a versão maskable).

**🟡 4.3 `apps/admin` não recebeu PWA** — decisão deliberada (uso interno, `noindex`,
`X-Robots-Tag`) — não recomendo fazer o admin instalável.

### Paridade mobile (por leitura de código, sem browser)

- **Checkout mobile:** `.chk-steps-bar`, `sz-grid`, `pdp-mobile-cta` documentados e
  presentes no CSS; formulário de checkout não usa nenhum componente exclusivamente
  desktop (sem `hover`-only actions críticas). Parece funcional.
- **Upload de imagem no admin em touch:** `images/upload/route.ts` usa `<input type=file>`
  padrão — funciona em touch por definição do browser; não há gesto de drag-and-drop
  exclusivo que quebre em mobile.
- **Cart drawer em telas pequenas:** `cart-drawer.tsx` usa Framer Motion com media query já
  documentada no CLAUDE.md (`.pdp-mobile-cta`) — sem indício de overflow horizontal
  forçado. Recomendo validação visual real num dispositivo/emulador antes do go-live, já
  que isto foi só lido, não testado interactivamente.

---

## 5. Usabilidade

**🟢 Feedback assíncrono já bem implementado** nos pontos-chave verificados:
`WishlistButton` (`animating` state), `SizePicker`/adicionar ao carrinho
(`addedFeedback`), checkout `applyCoupon` ("Verificando..." + sucesso/erro), admin
`estoque/adjust-form.tsx` e `pedidos/[id]/order-actions.tsx` (`useTransition` + `toast` +
`disabled={pending}`). Padrão consistente e bem feito — nada a corrigir aqui.

**🟡 5.1 Botão "Aplicar cupom" não fica `disabled` durante a chamada** —
`apps/store/src/app/checkout/page.tsx:189-202`. `couponMsg('Verificando...')` é setado mas
o botão e o input não ficam desabilitados durante o `await validateCoupon(...)` — clique
duplo pode disparar duas validações concorrentes (risco baixo, servidor não é afectado, só
mensagem inconsistente por uma fracção de segundo).
**Recomendação:** state `couponPending` + `disabled={couponPending}` no botão.

**🟡 5.2 `/categoria/[slug]` sem `priority`/`index` no `ProductCard`** —
`apps/store/src/app/categoria/[slug]/page.tsx:87`. Sem `priority={i < 4}` nem `index={i}` —
nenhuma imagem acima da dobra ganha prioridade, e a animação de stagger (que depende de
`index`) não funciona nesta rota. Mesma rota já está sem `loading.tsx` (achado 1.3) —
parece uma página menos mantida que as outras de listagem.
**Recomendação:** alinhar com o padrão já usado em `/produtos` e `/[brand-slug]`.

### Fluxo admin (criar produto, ajustar estoque, mudar status de pedido)

Já confirmado nos testes existentes (`estoque-actions.test.ts`) e no padrão
`useTransition`+`toast` acima — operação parece rápida para o dia a dia. Sem fricção óbvia
encontrada na leitura do código além dos gaps de loading state já listados (1.4).

---

## 6. Correções específicas pedidas

### 6.1 Navbar aparecendo na tela de login

**Hipótese confirmada, mas a causa raiz é diferente da esperada.** `apps/store/src/app/auth/`
não tem `layout.tsx` próprio — confirmado. **Porém**, `SiteHeader`, `BrandNav`, `PromoBar`,
`SiteFooter`, `MobileTabBar`, `CartDrawer` e `WhatsAppButton` são renderizados como
**irmãos directos de `{children}` dentro do próprio `RootLayout`** (`apps/store/src/app/layout.tsx:146-161`),
não como algo que envolve `{children}` através da árvore de layouts. Um `auth/layout.tsx`
novo **não resolveria o bug** — um layout aninhado só consegue envolver o que está dentro
dele, não remover elementos que o layout pai (raiz) já renderiza ao lado de `{children}`.

**Proposta de correcção** (aguardando aprovação, ainda não implementada): criar um único
componente cliente `<SiteChrome>` que envolve esses 7 componentes e usa `usePathname()`
(padrão já usado no projecto — `mobile-tab-bar.tsx`, `brand-nav.tsx`, `page-transition.tsx`,
`hero-marker.tsx`, `wishlist-button.tsx`, `filter-sort-bar.tsx` já importam
`next/navigation`'s `usePathname`) para retornar `null` quando `pathname.startsWith('/auth')`.
Uma alteração contida (1 ficheiro novo + editar `layout.tsx` para usar o wrapper), sem
precisar de reestruturar rotas em route groups. `<main>{children}</main>` continua sempre
visível, incluindo em `/auth/*`.

**🟡 6.1.1 Achado lateral relacionado:** `apps/store/src/middleware.ts:81-82` — quando um
utilizador **já autenticado** navega directamente para `/auth/login` ou `/auth/cadastro`
(ex: link antigo, sessão ainda válida noutro separador), o middleware força redirect para
`/conta` **ignorando qualquer `?redirect=` na URL**. O próprio formulário de login
(`auth/login/page.tsx:12,30`) já lê e respeita `?redirect=` correctamente no submit — só o
middleware, neste caso específico de "já logado + visita directa", não olha para o
parâmetro. Baixo impacto (edge case), mas vale corrigir junto: `url.searchParams.get('redirect') ?? '/conta'`.

### 6.2 Tela de início pós-login

**O que `/conta` mostra hoje:** header com avatar (inicial do nome) + nome + email; grid de
KPIs (Pedidos / Em rota / Favoritos / Cupons) — **hoje são placeholders hardcoded (`—`),
não dados reais**; grid de menu para pedidos/endereços/favoritos/cupons/dados/privacidade;
botão de logout. Redirect (`middleware.ts:74-78`) já honra `?redirect=` para trazer o
utilizador de volta ao checkout quando o login foi disparado a partir dali — só o destino
*default* (sem redirect pendente) é `/conta`.

**3 opções para o destino pós-login** (proposta, decisão é tua):

| Opção | Descrição | Esforço |
|---|---|---|
| **A — Corrigir `/conta` como está (recomendado)** | Manter `/conta` como destino, mas trocar os 4 KPIs placeholder por dados reais (contagem de pedidos, pedidos em trânsito, favoritos, cupons disponíveis do utilizador) — a página já tem a estrutura certa de "dashboard da conta", só falta ligar aos dados. | Baixo — 1 query adicional na página, já existe tudo (schema, queries de pedidos/favoritos/cupons) |
| **B — Redirecionar para a Home (`/`)** | Login vira só "desbloqueio" de funcionalidade — o utilizador volta a navegar de onde estava com sessão activa, sem forçar uma tela de dashboard. Mais next comum em e-commerces menores. | Muito baixo — 1 linha no middleware/login page |
| **C — Tela de boas-vindas dedicada** | Nova página `/conta/bem-vindo` só no primeiro login (ex: após cadastro), depois cai para A ou B nos logins seguintes — útil para onboarding (ex: incentivo a completar perfil/CEP para frete). | Alto — página nova + lógica de "é a primeira vez" |

Sem implementar nenhuma até tua decisão.

---

## 7. Documentação (.md)

**🟡 7.1 Numeração das "5 Regras Invioláveis" no CLAUDE.md está errada** — salta da
regra 5 para a regra 7 (não existe regra 6 escrita), depois continua 8 e 9. Confirmado
lendo o ficheiro: `### 5. Erros internos nunca vazam para o cliente` seguido directamente
de `### 7. E-mail não pode derrubar o fluxo de pedido`.
**Recomendação:** renumerar para 1-7 sequencial (a regra 7 vira 6, 8 vira 7, 9 vira 8) —
correcção mecânica, sem mudar conteúdo.

**Estado dos `agents/*.md`:** na leitura desta auditoria, `overview.md`, `architecture.md`,
`stack.md`, `conventions.md` e `glossary.md` continuam a descrever correctamente a
arquitectura, convenções e domínio actuais — nenhuma divergência grave encontrada contra o
código real, além do que já está listado nas secções acima (ex: tabela de rate limiting do
CLAUDE.md tem 2 pequenas omissões — ver secção 10).

**Nota de hábito (regra 9 do CLAUDE.md):** como nenhuma correcção de código foi aplicada
ainda (excepto PWA), não há o que actualizar em `agents/*.md` por agora. Quando cada secção
for aprovada e implementada, vou actualizar o `.md` correspondente na mesma leva de
commits — vou manter isso como hábito permanente daqui pra frente, como pedido.

**🟡 7.2 PWA precisa de entrar na documentação** — como implementei a secção 4 já nesta
rodada, vou adicionar ao CLAUDE.md uma linha na tabela de "Componentes UI" ou nova secção
curta descrevendo `manifest.json`/`sw.js`/estratégia de cache, assim que confirmares o
relatório (para não misturar a auditoria com a doc antes de estares a ver o texto final).

---

## 8. Deploy automático (proposta — não implementado)

Confirmado: sem `.github/workflows/`, sem husky, sem qualquer gate antes do deploy — só
Vercel + git push. `package.json` raiz já tem os scripts turbo certos para um workflow
(`turbo lint`, `turbo build`, `turbo test`); `apps/store/package.json` tem `test:e2e`
(playwright) separado.

**Proposta de workflow** (`​.github/workflows/ci.yml`, a criar só com tua aprovação):

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  lint-build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint
      - run: pnpm --filter @galvao/store exec tsc --noEmit
      - run: pnpm --filter @galvao/admin exec tsc --noEmit
      - run: pnpm turbo test
      - run: pnpm turbo build
        env:
          # variáveis dummy só para o build passar (sem side-effect real)
          DATABASE_URL: ${{ secrets.CI_DATABASE_URL }}
          DATABASE_AUTH_TOKEN: ${{ secrets.CI_DATABASE_AUTH_TOKEN }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.CI_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.CI_SUPABASE_ANON_KEY }}
```

Falha em qualquer passo bloqueia o merge (branch protection rule a activar no GitHub
separadamente — isso sim precisa de acção manual tua nas settings do repo, não é código).
Playwright (`test:e2e`) fica de fora do gate obrigatório por agora — precisa de
`playwright install --with-deps` (mais ~1-2min de CI) e de um banco de teste isolado; posso
adicionar como job separado não-bloqueante depois, se quiseres.

**Migrations do Drizzle — recomendo manter manual.** `db:push`/migrations automáticas no
deploy são arriscadas: uma migration destrutiva (`DROP COLUMN`, mudança de tipo) aplicada
sem revisão humana pode perder dados em produção sem aviso, e o Turso não tem um "dry run"
nativo integrado ao pipeline. Prós de automatizar: menos passo manual, menos risco de
esquecer. Prós de manter manual (recomendado): humano vê o SQL gerado antes de aplicar,
pode fazer backup antes se a migration for destrutiva, evita que um push directo ao `main`
altere schema de produção sem ninguém a validar. Sugestão intermédia: automatizar só a
*geração* do SQL de migration no CI (fail se houver diff de schema sem migration
correspondente commitada), mantendo a *aplicação* manual via `pnpm --filter @galvao/db db:push`.

**🟡 8.1 Preview deployments da Vercel — não consigo confirmar do código.** Isso depende da
configuração de env vars por ambiente (Production vs Preview) no painel da Vercel, não do
repositório. **Pendência para tu confirmares manualmente:** em cada projecto Vercel
(store e admin) → Settings → Environment Variables → conferir se `DATABASE_URL`/
`DATABASE_AUTH_TOKEN` de Preview apontam para um banco Turso separado (idealmente uma
branch/DB de staging), não para o mesmo `DATABASE_URL` de Production. Se hoje só existe um
valor "para todos os ambientes", os previews estão a escrever no banco real.

---

## 9. LGPD

**🟠 9.1 Slugs divergem do pedido, mas as páginas existem com conteúdo real e completo** —
`/privacidade` (não `/politica-de-privacidade`) e `/termos` (não `/termos-de-uso`).
Conteúdo é substancial (14 secções na política, LGPD art. 7º/18º/41º citados
correctamente, tabela de retenção por tipo de dado, self-service linkado). Não é uma
lacuna de conteúdo — é só uma questão de slug.
**Recomendação:** ou ajustar links/expectativa para os slugs reais, ou criar redirects
`/politica-de-privacidade → /privacidade` e `/termos-de-uso → /termos` (mais barato que
mover rotas, evita quebrar links já indexados/impressos).

**🟠 9.2 WhatsApp Business API processa dados pessoais mas não está listado como terceiro
na política** — `apps/store/src/lib/whatsapp.ts` envia telefone + nome + status do pedido
para a Graph API da Meta em toda notificação (criado/pago/enviado/entregue), chamado de
`checkout/actions.ts` e do webhook MP. `privacidade/page.tsx` secção 5 lista "Meta
Platforms Inc." só no contexto de publicidade/Meta Pixel (com consentimento) — não
menciona o WhatsApp Business API como processador de dados **transacionais** (execução de
contrato, sem gate de consentimento — base legal correcta, só falta estar explícita).
**Recomendação:** adicionar item "Meta Platforms Inc. (WhatsApp Business API) —
notificações transacionais de pedido" na secção de compartilhamento.

**🟡 9.3 Meta Pixel referenciado 3x na política + no banner de cookies, mas nunca é
carregado no código** — `tracking-scripts.tsx` só implementa GTM/GA4/Clarity. Não há
`<Script>` nenhum que carregue `fbevents.js` nem defina `window.fbq`, apesar de: CSP em
`next.config.ts` liberar `connect.facebook.net`; `cookie-banner.tsx` e
`conta/privacidade/privacy-form.tsx` terem o toggle "Meta Pixel"; `.env.example` não ter
`NEXT_PUBLIC_META_PIXEL_ID`. `ga4-events.tsx` chama `window.fbq?.(...)` que é sempre no-op.
**Recomendação:** implementar o carregamento do Pixel gated por `consent.marketing` (mesmo
padrão do `tracking-scripts.tsx`), ou remover as menções da política/banner até
implementar — hoje a política declara um processamento que não acontece.

**✅ 9.4 Gating de consentimento correcto** — `tracking-scripts.tsx` só injecta GTM/GA4/
Clarity após `consent.analytics === true` (localStorage + evento `consent:analytics`), sem
excepção para dev/admin.

**✅ 9.5 Fluxo consentimento/exportar/apagar funciona como documentado** —
`api/consent/route.ts` grava IP+UA+3 decisões; `api/conta/exportar/route.ts` devolve JSON
com profile/addresses/orders/orderItems/wishlist/coupons/reviews/consents; `api/conta/deletar/route.ts`
anonimiza PII, desvincula `orders.user_id = NULL` (preserva histórico fiscal), apaga o auth
user (best-effort) e faz signOut. Confirmado por leitura completa do código.

**✅ 9.6 Cron `anonymize-data` agendado e protegido** — `vercel.json` da store tem
`0 3 * * *`; a rota compara `Authorization: Bearer $CRON_SECRET` antes de rodar (ver 3.6
para o detalhe de comparação não ser timing-safe).

---

## 10. Rate limiting

### Tabela real (`apps/store/src/lib/ratelimit.ts`) vs documentada no CLAUDE.md

| Limiter | Limite real | Chave | No CLAUDE.md? | Onde é aplicado |
|---|---|---|---|---|
| `login` | 5 / 15min | IP | ✅ | `middleware.ts` (POST `/auth/login`) |
| `loginEmail` | 10 / 1h | email | ❌ não documentado | 🔴 **definido, nunca chamado** |
| `newsletter` | 3 / 10min | IP | ✅ | rota newsletter |
| `newsletterEmail` | 1 / 24h | email | ✅ | rota newsletter |
| `aviseme` | 5 / 10min | IP | ✅ | `api/avise-me/route.ts` |
| `checkout` | 5 / 5min | IP | ✅ | `checkout/actions.ts` |
| `cartSync` | 30 / 1min | userId | ✅ | `api/cart/sync/route.ts` |
| `frete` | 20 / 1min | IP | ❌ não documentado | 🔴 **definido, nunca chamado** |
| `apiGlobal` | 300 / 1min | IP | ✅ | `middleware.ts` (`/api/*`, exceto webhook) |
| `consent` | 30 / 10min | IP | ✅ | `api/consent/route.ts` |
| `accountExport` | 3 / 1h | userId | ✅ | `api/conta/exportar/route.ts` |
| `accountDelete` | 3 / 1h | userId | ✅ | `api/conta/deletar/route.ts` |

**🔴 10.1 `loginEmail` e `frete` são limiters mortos** — `ratelimit.ts:34,45`. O comentário
no código promete "protege conta específica de brute force" e "anti-scraping", mas nenhum
dos dois protege nada de facto — falso senso de segurança para quem lê o código.
**Recomendação:** (a) `loginEmail` — chamar junto com `login` no middleware, usando o email
do body do POST de login; (b) `frete` — chamar no ponto onde a cotação Melhor Envio/Frenet
é exposta ao cliente. Ou, se decidires não implementar agora, remover os limiters órfãos.

**🔴 10.2 Cadastro e recuperação de senha sem rate limit da aplicação** (já no resumo
executivo) — `auth/cadastro/page.tsx` e `auth/esqueci-senha/page.tsx` chamam Supabase Auth
directo do client component, sem passar por Server Action nem API route própria — dependem
só dos limites internos (genéricos) do Supabase.
**Recomendação:** mover `signUp`/`resetPasswordForEmail` para Server Actions próprias com
`checkRateLimit`, no mesmo padrão já usado no checkout — também corrige de caminho a Regra
5 (erro do Supabase hoje pode vazar directo pro cliente).

**🟠 10.3 Fallback in-memory não documentado como "só dev"** — `ratelimit.ts:112-133`
funciona por instância de processo; em produção Vercel (múltiplas instâncias serverless)
cada instância tem o seu `Map` próprio, então o limite real efectivo multiplica pelo número
de instâncias activas — não protege de verdade. Sem nenhum comentário no código ou nota em
`agents/*.md` avisando isto.
**Recomendação:** comentário no código + linha no CLAUDE.md/`agents/architecture.md`
deixando explícito que `UPSTASH_REDIS_REST_URL`/`TOKEN` são obrigatórios em produção.

**✅ 10.4 `apiGlobal` cobre `/api/*` correctamente e o webhook MP está isento** —
confirmado em `middleware.ts:37-44`, exclusão explícita antes de qualquer rate limit
(intencional, não mexer).

**🟡 10.5 `getRealIp`/`getRealIpFromHeaders` duplicados** — a mesma lógica anti-spoofing
está implementada duas vezes (uma para `NextRequest`, outra para Server Actions via
`next/headers`). Funciona, candidato a unificação leve — baixa prioridade.

---

## 11. Fluidez geral / performance percebida

**🟢 `next/image` bem configurado nas rotas principais** — home (`priority` nos heros),
`/produtos` e `/[brand-slug]` (`priority={i < 4}`), `ProductCard` com `sizes` responsivo
correcto. Única excepção é `/categoria/[slug]` (achado 5.2).

**🟢 Fetches em RSC já paralelizados onde importa** — home (`Promise.all` para
arrivals/bestSellers/brands/categories), PDP (2 `Promise.all` — produto+user, depois
images/variants/related/favoritos), admin dashboard e `relatorios/page.tsx`.

**🟡 11.1 Fetches sequenciais evitáveis em 2 páginas do admin** —
`admin/produtos/[id]/page.tsx:13-43` (produto → variantes → imagens, 3 `await` em série) e
`admin/pedidos/[id]/page.tsx:40-63` (orders → items → events) — `variantes`/`imagens` e
`items`/`events` dependem só do `id` dos params, não do resultado da query anterior;
podiam entrar num único `Promise.all`. Ganho pequeno (páginas internas, baixo tráfego) mas
gratuito.

**🟢 Regra Framer Motion `spring` vs `tween` seguida em 100% dos 14 ficheiros** —
revisão individual de todos os `type: 'spring'`/`'inertia'` em `home-animations.tsx`,
`page-transition.tsx`, `whatsapp-button.tsx`, `cart-drawer.tsx`, `product-card.tsx`,
`cookie-banner.tsx`, `brand-nav.tsx`, `error.tsx`, `not-found.tsx`, `product-gallery.tsx`:
todos com 2 frames (from→to). O único array de 3+ valores (`whatsapp-button.tsx:78`,
`scale: [1, 1.4, 1]`) já usa `transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}`
— tween, correcto. **Nenhuma violação encontrada.**

---

## Próximos passos

Aguardo a tua aprovação para avançar secção a secção. Sugestão de ordem por impacto/risco:

1. **Segurança (3.1, 3.2)** — `requireAdmin()` em falta + upgrade de `next`/`drizzle-orm`.
2. **Rate limiting (10.1, 10.2)** — limiters mortos + cadastro/reset sem protecção.
3. **Testes (2.1, 2.2)** — cobertura de checkout/webhook.
4. **Navbar no login (6.1)** — `<SiteChrome>` com `usePathname`.
5. **Tela pós-login (6.2)** — depois de decidires entre as 3 opções.
6. **LGPD (9.1, 9.2, 9.3)** — redirects de slug + WhatsApp na política + decisão sobre Meta Pixel.
7. **Frontend/UI (1.x)** — loading states em falta, decisão sobre `@galvao/ui`.
8. **CI (secção 8)** — workflow do GitHub Actions, após tua revisão do YAML proposto.

PWA (secção 4) já está implementado no working tree, **não commitado** — avisa quando
quiseres que eu comite (em commits separados: manifest+ícones, service worker, meta
tags/layout).
