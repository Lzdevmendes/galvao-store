# Como a Galvão's Store funciona — de ponta a ponta

> Documento técnico e didático. Explica o fluxo completo da loja e o papel de cada peça da stack.

---

## O que é este projeto?

Uma loja online de chuteiras e tênis esportivos (Nike, Adidas, Puma, Umbro...) com sede em Caraguatatuba/SP. O cliente compra pelo site (`galvaosstore.com.br`) e o dono da loja gerencia tudo pelo painel admin (`admin.galvaosstore.com.br`).

O sistema é dividido em dois apps: a **loja pública** (que o cliente vê) e o **admin** (que só o dono vê). Ambos vivem no mesmo repositório de código — isso é o que chamamos de **monorepo**.

---

## Por que é um monorepo com store e admin separados?

Imagine dois funcionários numa empresa:
- Um atende clientes (a loja pública)
- Outro gerencia o estoque e os pedidos (o admin)

Eles usam os mesmos arquivos do estoque (o banco de dados), mas têm interfaces completamente diferentes e regras de acesso diferentes.

**Turborepo** é o gerente desse repositório: ele sabe a ordem certa de compilar as peças, guarda cache dos builds anteriores (não recompila o que não mudou) e orquestra os comandos.

**pnpm workspaces** permite que os dois apps (store e admin) compartilhem código sem copiar — o schema do banco de dados, por exemplo, está em `packages/db` e ambos os apps usam o mesmo código.

---

## Fluxo ponta a ponta: do clique ao pacote na porta

### 1. Cliente navega e adiciona ao carrinho

O cliente entra no site (`/produtos`), filtra por marca/tamanho e vê os produtos. Essas páginas são geradas no servidor (RSC = React Server Components), o que garante velocidade e SEO — o Google consegue indexar os produtos.

Ao clicar em "Adicionar ao carrinho", o produto vai para o **Zustand store** — uma mini memória no browser salva no `localStorage`. Isso significa que o carrinho não some se o cliente fechar e abrir o browser.

**Por que Zustand?** É a solução mais simples para estado global no browser. Alternativas como Redux são mais complexas sem justificativa aqui.

### 2. Cliente faz login → carrinho sincroniza com o banco

Quando o cliente faz login (via Supabase Auth), o componente `CartSync` detecta a mudança de sessão e envia o carrinho do localStorage para o servidor via `POST /api/cart/sync`.

**Por que Supabase Auth?** Gera sessões JWT, cuida de cookies seguros, suporta OAuth (Google, GitHub) e tem SDK pronto para Next.js. Sem ele, precisaríamos implementar autenticação do zero — hash de senhas, tokens, refresh, etc.

### 3. Checkout em 3 passos

O cliente vai para `/checkout`:

**Step 1 — Identificação**: Nome, CPF, telefone, e-mail. Validados com **Zod** no browser e no servidor.

**Step 2 — Frete**: O cliente digita o CEP. O servidor consulta:
1. Tabela `delivery_zones` — se o CEP for da região de Caraguatatuba, oferece Entrega Local com carro próprio.
2. **Melhor Envio** — API dos Correios que retorna preços reais de SEDEX e PAC com base no peso/dimensões dos produtos. Se a API cair, usa valores fixos de fallback.

**Step 3 — Pagamento**: O cliente escolhe PIX (5% desconto automático), cartão crédito ou boleto.

**Por que Zod?** Garante que dados do cliente (formulário) têm o formato esperado antes de processar. Sem isso, um cliente poderia enviar `priceInCents = -1` e pagar negativo.

### 4. `createOrder()` — O coração do checkout

Quando o cliente clica em "Confirmar pedido", o browser chama a **server action** `createOrder` em `apps/store/src/app/checkout/actions.ts`.

Uma server action é código que roda 100% no servidor — o cliente não tem acesso ao código. Isso é importante porque é aqui que calculamos o valor real.

O que acontece dentro de `createOrder`:

```
1. Verificar idempotency key → evitar double-submit se o cliente clicar duas vezes
2. Buscar preços do banco (NÃO do carrinho do cliente)
   → Um cliente mal-intencionado poderia manipular o preço no browser
   → O servidor SEMPRE reconfirma o preço em product_variants
3. Validar estoque: stock - stock_reserved ≥ qty pedida
4. Re-validar cupom no servidor com o subtotal real do banco
5. Calcular total: subtotal - cupom - desconto PIX + frete
6. Criar pedido no banco (status: pending_payment)
7. Reservar estoque: stock_reserved += qty
8. Chamar Mercado Pago API
9. Retornar dados de pagamento (QR Code PIX, URL boleto, etc.)
```

**Por que recalcular o preço no servidor?** Se confiássemos no preço enviado pelo cliente, alguém poderia comprar um tênis de R$530 por R$1,00. Esta é a regra de segurança #1 do e-commerce.

**Por que reservar estoque antes de pagar?** Para garantir que o produto não seja vendido para outra pessoa enquanto o cliente está no processo de pagamento (os 30min de validade do PIX, por exemplo).

### 5. Pagamento via Mercado Pago

**Por que Mercado Pago?** É o gateway de pagamento dominante no Brasil. Suporta PIX (instantâneo, taxa menor), cartão de crédito em até 12x e boleto.

Para cartão: o número do cartão NUNCA passa pelo nosso servidor. O SDK do MP no browser tokeniza o cartão e envia apenas um `token` temporário. Isso mantém a loja fora do escopo PCI (não precisa de certificação especial para dados de cartão).

Para PIX: criamos a cobrança na API do MP e recebemos um QR Code + chave copia-e-cola. O cliente paga no app do banco em até 30min.

### 6. Webhook do Mercado Pago → confirmação de pagamento

Quando o cliente paga, o MP envia um `POST /api/webhooks/mercadopago` para o nosso servidor avisando que o pagamento foi processado.

**Problemas que precisamos resolver:**

**Problema 1: Como saber que veio do MP e não de um atacante?**
O MP assina cada webhook com HMAC-SHA256. Verificamos a assinatura com `timingSafeEqual` (evita timing attacks). Se a assinatura for inválida, retornamos 401.

**Problema 2: Como saber o status real do pagamento?**
Não confiamos no payload do webhook — um atacante poderia enviar `status: approved` falso. O servidor SEMPRE consulta `GET /v1/payments/{id}` na API do MP para confirmar o status real.

**Problema 3: E se o MP enviar o mesmo webhook duas vezes?**
O MP garante "at least once delivery" — o mesmo evento pode chegar várias vezes. Usamos `UPDATE orders SET status = 'paid' WHERE status != 'paid'` e verificamos `rowsAffected`. Se 0 linhas foram alteradas, o pedido já foi processado e retornamos 200 sem fazer nada.

**O que acontece quando o pagamento é confirmado:**
1. Status do pedido → `paid`
2. Estoque definitivo: `stock -= qty`, `stock_reserved -= qty`
3. E-mail de confirmação disparado via Resend (fire-and-forget — não falha o pedido)
4. WhatsApp de confirmação disparado (fire-and-forget)

### 7. E-mails transacionais (Resend + React Email)

**Por que Resend?** Alta deliverability (e-mail cai na caixa de entrada, não no spam), API simples, bom suporte a domínios customizados.

**Por que React Email?** Permite criar templates de e-mail com componentes React. O servidor renderiza o componente para HTML antes de enviar.

Templates implementados:
- Pedido criado (com dados de PIX/boleto se aplicável)
- Pagamento confirmado
- Pedido enviado (com código de rastreio)
- Pedido entregue
- Pedido cancelado
- Boas-vindas à newsletter
- Boas-vindas ao clube
- Carrinho abandonado
- Produto de volta ao estoque ("Avise-me")

**Regra crítica**: E-mail falhou? O pedido não falha. Usamos `void sendEmail(...).catch(...)` — se o Resend estiver fora do ar, o cliente não recebe e-mail, mas o pedido é criado normalmente.

### 8. Admin gerencia o fulfillment

O admin acessa `admin.galvaosstore.com.br`. O middleware verifica que o email do usuário logado está na lista `ADMIN_EMAILS` (variável de ambiente).

Fluxo no admin:
1. Pedido novo aparece como `pending_payment` → `paid`
2. Admin separa o produto → muda para `processing`
3. Admin envia pelos Correios → muda para `shipped` (digita código de rastreio)
4. Produto entregue → `delivered`

Cada mudança de status dispara e-mail automático para o cliente.

O admin também pode:
- Adicionar/editar produtos com upload de fotos (Supabase Storage)
- Ajustar estoque manualmente (com histórico de movimentações)
- Criar e gerenciar cupons de desconto
- Ver relatórios de receita e top produtos

### 9. Cron de limpeza de reservas

Se o cliente criou um pedido PIX mas não pagou em 30min, o estoque fica reservado para sempre — outros clientes não conseguem comprar.

O **Vercel Cron** executa `GET /api/cron/clear-reservations` a cada 30min. Essa rota:
1. Busca pedidos `pending_payment` com `created_at < agora - 30min`
2. Cancela esses pedidos
3. Libera o `stock_reserved` de volta

A rota é protegida por `CRON_SECRET` (Bearer token) para que só o Vercel consiga acioná-la.

---

## O papel de cada peça — resumo

| Peça | Papel | O que quebraria sem ela |
|------|-------|------------------------|
| **Turborepo** | Orquestra o monorepo, cache de builds | Builds manuais, lento |
| **Drizzle/Turso** | Banco de dados (SQLite edge) | Toda a persistência de dados |
| **Supabase Auth** | Login de clientes e admins | Sem autenticação |
| **Supabase Storage** | Fotos de produtos | Sem imagens de produtos |
| **Mercado Pago** | Processar pagamentos BR | Sem como receber dinheiro |
| **Upstash Redis** | Rate limiting distribuído | Brute force no login em produção multi-instância |
| **Sentry** | Error tracking em produção | Erros silenciosos passam despercebidos |
| **Resend/React Email** | E-mails transacionais | Sem comunicação por e-mail |
| **Melhor Envio** | Cálculo de frete Correios | Frete fixo estimado (fallback já existe) |
| **Zod** | Validação de dados externos | Dados malformados causam erros ou brechas |
| **Zustand** | Carrinho client-side | Carrinho perdido ao navegar |
| **WhatsApp API** | Notificações WhatsApp | Sem notificação por WA |

---

## Decisões de arquitetura importantes

### Por que SQLite (Turso) e não PostgreSQL?

SQLite na edge (Turso) tem latência muito baixa para leituras — o banco fica geograficamente próximo do usuário. Para uma loja de pequeno/médio porte com escrita moderada, SQLite é mais que suficiente e muito mais simples de operar. O trade-off é que não tem RLS nativo — toda a segurança de acesso é implementada no código da aplicação.

### Por que não há RLS (Row Level Security)?

RLS é um recurso do PostgreSQL/Supabase que protege dados a nível de banco. Como usamos Turso/SQLite, não há essa opção. A proteção é feita no código: toda query filtra por `user_id` da sessão. O revisão de IDOR (Insecure Direct Object Reference) é responsabilidade do desenvolvedor.

### Por que o admin é um app separado?

Separar o admin permite:
1. Domínio diferente (admin.galvaosstore.com.br) — mais difícil de descobrir
2. Configurações de segurança diferentes (noindex, sem cache de CDN)
3. Deploy independente — pode atualizar o admin sem afetar a loja
4. Se o admin estiver fora do ar, a loja continua funcionando

### Por que React Server Components (RSC)?

RSC renderiza componentes no servidor e envia HTML pronto para o browser. Isso significa:
- Melhor SEO (Google indexa o conteúdo)
- Páginas carregam mais rápido (menos JavaScript no browser)
- Acesso direto ao banco sem precisar de uma API intermediária
- Dados sensíveis ficam no servidor (sem chaves de API expostas)
