# Galvão's Store — Briefing completo para recriar a proposta de design

> **Como usar:** cole este documento inteiro no "claude design" e peça para recriar a proposta
> visual/conceitual do projeto. Ele cobre a parte **comercial** (o que é, para quem, porquê) e a
> parte **técnica/design system** (cores, fontes, telas, padrões). Tudo aqui reflete o estado real
> do código em produção.

---

## PARTE 1 — Proposta comercial

### O que é
**Galvão's Store** é um e-commerce de **chuteiras e tênis esportivos** das maiores marcas, sediado em
**Caraguatatuba/SP** (litoral norte paulista). Vende campo, society, futsal e tênis casual/corrida,
com operação online (entrega nacional via Correios) e **entrega local própria** na região (por zona de CEP).

### Público-alvo
Jogadores amadores e semiprofissionais, jovens (16–35) apaixonados por futebol, e pais comprando para
filhos. Sensíveis a preço, parcelamento e autenticidade do produto. Maioria mobile-first.

### Marcas
Nike, Adidas, Puma, Umbro e New Balance. Cada marca tem hero próprio (stencil grande + stripe colorida +
meta-stats) e navegação por linhas de produto (ex.: Nike Phantom/Mercurial, Adidas F50/Predator).

### Proposta de valor / diferenciais
- **Frete grátis** acima de R$ 399.
- **12x sem juros** no cartão; **5% OFF no PIX** (aplicado no servidor).
- **Entrega local própria** (carro) para CEPs da região — mais rápida e barata que Correios.
- Estoque real por tamanho/cor, aviso de "última unidade" e **"Avise-me"** quando esgota.
- Atendimento próximo via **WhatsApp** em cada etapa do pedido.

### Jornada do cliente
Descoberta (home / marca / categoria / busca) → PDP (galeria com zoom, seletor de tamanho com estoque
real, parcelamento, avaliações) → carrinho (drawer) → checkout em **3 passos** (dados → frete → pagamento)
→ confirmação `/pedido/[id]` (banner de status, PIX com QR + countdown, tracker de 5 etapas) → e-mail +
WhatsApp automáticos → conta (pedidos, rastreio, favoritos, cupons, **privacidade/LGPD**) → avaliação pós-entrega.

### Tom de marca
Esportivo, energético, confiável e "de quem entende de bola". Direto, brasileiro, sem ser informal demais.
Visual premium mas acessível — transmite que o produto é original e a loja é séria.

---

## PARTE 2 — Especificação técnica e design system

### Stack
Next.js 15 (App Router, RSC/SSR) · monorepo Turborepo + pnpm · Drizzle ORM + Turso (SQLite edge) ·
Supabase Auth · Mercado Pago (PIX/cartão/boleto) · Resend (e-mails) · Upstash Redis (rate limit) ·
Sentry · dois apps: **loja** (`:3010`) e **admin** (`:3011`).

### Identidade visual — cores
- **Brand Orange** `#F26B1F` — CTA, preços em oferta, destaques (cor-assinatura)
- **Brand Teal** `#1FB5A8` — complemento
- **Brand Green** `#2CB35A` — preços (convenção BR)
- **Brand Yellow** `#FFC83A` — badges "top venda"
- **Brand Red** `#E23B3B` — erros, cancelados
- Escala de cinzas **Ink** `#F8F9FB` (ink-50) → `#0B0E12` (ink-950)
- Temas via `data-theme` no `<html>`: claro (loja) e escuro (admin)

### Tipografia
- **Display/Hero:** Bebas Neue (só heroes e banners)
- **Headings UI:** Archivo Black
- **Body:** Archivo (400–900)
- **UI/componentes:** Space Grotesk
- **Mono (SKU/códigos):** JetBrains Mono

### Tokens
Radii: xs 4 · sm 6 · md 10 · lg 16 · xl 22 · pill 999px. Espaçamento e cores via CSS vars
(`--bg`, `--fg`, `--border`, `--brand-orange`, etc.). Easing premium `cubic-bezier(0.16,1,0.3,1)`.

### Linguagem visual — "Liquid Glass Premium"
A loja passou por um redesign **liquid glass claro (Apple-like)**: vidro fosco (`backdrop-filter` blur
10–20px), bordas hairline, highlights sutis, fundo ambiente com glows laranja/teal. Header transparente
sobre o hero, **ilha de vidro flutuante** reativa ao scroll, hero overlay full-bleed nas marcas, e glint
specular reativo ao ponteiro. O **admin** usa **dark glass** (vidro fumado sobre `#0F1318`). Animações com
Framer Motion (regra: arrays multi-keyframe usam `tween`, não `spring`).

### Mapa de telas — Loja
Home · `/produtos` (catálogo com filtros+paginação) · `/[marca]` · `/categoria/[slug]` · `/produto/[slug]`
(PDP) · `/busca` · `/checkout` (3 passos) · `/pedido/[id]` · `/conta` + sub (pedidos, endereços, favoritos,
cupons, dados, **privacidade**, avaliar) · `/auth` (login, cadastro, esqueci-senha, callback Google) ·
legais (`/privacidade`, `/termos`, `/politica-trocas`, `/tamanhos`).

### Mapa de telas — Admin
Dashboard (KPIs + gráficos) · Pedidos (lista + detalhe com timeline/status/rastreio) · Produtos (CRUD +
variantes + upload de imagens com reorder) · Estoque (ajuste + histórico) · Cupons (CRUD) · Clientes
(lista + visão 360° com LTV/score) · Relatórios (gráficos + export CSV) · Configurações (parâmetros da loja).

### Componentes-chave
Badge (orange/teal/sale/new/stock/soft) · ProductCard (4 estilos de borda) · SizePicker (grid com estoque) ·
OrderTracker (5 dots) · PriceTag (R$ + parcelas + PIX) · MobileTabBar · SiteHeader (busca colapsável) ·
BrandNav (ilha de vidro) · CartDrawer · CookieBanner (consentimento LGPD).

### Padrões de UX
- **Mobile-first**, breakpoint **768px** (≤768 mobile: tabbar fixa, hero mobile, tabelas→cards;
  769+ desktop: sidebar, hero desktop).
- `touch-action: manipulation`, inputs 16px (anti-zoom iOS), `100dvh`, safe-area.
- Skeletons com shimmer durante fetch RSC.
- Acessibilidade: `aria-label` em botões de ícone, contraste ≥ 4.5:1.

### Princípios não-visuais que a proposta deve respeitar
Dinheiro sempre em centavos (integer); preços recalculados no servidor; **LGPD** (consentimento prévio
para analytics, exportar/apagar dados, double opt-in de newsletter); segurança (rate limit, HMAC no
webhook, validação no boundary).

---

## Pedido ao claude design
Com base no acima, **recrie a proposta do projeto** (visão de produto + conceito visual + amostras de telas
principais: home, PDP, checkout, admin dashboard), mantendo a identidade de marca (laranja #F26B1F, teal,
Bebas/Archivo/Space Grotesk) e o estilo **liquid glass premium**. O objetivo é uma loja confiável e premium
que qualquer utilizador use com tranquilidade.
