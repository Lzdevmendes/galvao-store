# Glossário — Entidades do Schema Drizzle

## Produto e Catálogo

### `brands`
Marcas de calçados: Nike, Adidas, Puma, Umbro, etc. Cada produto pertence a uma marca. Campos: `slug`, `name`, `tagline`, `logoUrl`, `heroImage`, `gradientCss`.

### `categories`
Categorias de produto com hierarquia (ex: Calçados > Campo). Campo `surfaceType` indica a superfície: `FG` (campo natural), `SG` (gramado sintético), `IC` (quadra), `AG` (sintético multi-trava), `TF` (futsal).

### `products`
O produto base (ex: "Nike Phantom GX II"). Um produto tem múltiplas variantes. Campos de SEO: `metaTitle`, `metaDescription`. `status`: `draft | published | archived`. `rating` = média × 10 (ex: 4.8 → 48).

### `product_variants`
**Unidade real de venda** — produto num tamanho/cor específicos. Campos monetários em centavos: `price_in_cents`, `price_promo_in_cents`, `cost_in_cents`. Estoque: `stock` (total físico), `stock_reserved` (reservado em pedidos). Dimensões para frete: `weight_g`, `height_cm`, `width_cm`, `length_cm`.

### `product_images`
Fotos do produto ligadas a `products` (e opcionalmente a `product_variants`). `sort_order` define a ordem de exibição. `is_primary` = foto principal do produto.

### `stock_movements`
Log de auditoria de toda entrada/saída de estoque. `delta` positivo = entrada, negativo = saída. `reason`: `purchase | return | adjustment | reservation | reservation_expired | import`.

### `reviews`
Avaliações de produto (1–5 estrelas). `approved = false` por padrão — precisam ser moderadas. `order_id` confirma que o cliente realmente comprou.

---

## Pedidos e Pagamento

### `orders`
Pedido de compra. Campos chave:
- `order_number`: ex `GS-2026-000042` — sequencial, único
- `status`: `pending_payment | paid | processing | shipped | delivered | cancelled | refunded`
- `payment_method`: `pix | credit_card | boleto`
- `payment_id`: ID da transação no Mercado Pago
- `subtotal_in_cents`, `discount_in_cents`, `total_in_cents`: valores em centavos
- `ship_*`: snapshot do endereço de entrega no momento da compra
- `customer_*`: snapshot dos dados do cliente no momento da compra

### `order_items`
Snapshot dos itens no momento da compra — não muda se o produto for editado depois. Campos: `product_name`, `product_sku`, `brand_name`, `variant_size`, `variant_color`, `qty`, `unit_in_cents`, `total_in_cents`.

### `order_events`
Timeline de eventos do pedido. `type` pode ser qualquer `OrderStatus` ou `note_added | tracking_added`. `created_by`: `system | admin_user_id | customer`.

---

## Usuários e Endereços

### `users`
Perfil do cliente no banco de negócio (SQLite). O `id` é o mesmo UUID do Supabase Auth. Campos: `name`, `phone`, `cpf`, `birthday`, `is_club_member`, `marketing_opt_in`.

### `addresses`
Endereços de entrega do cliente. `is_default = true` para o endereço principal. Ligado a `users` com cascade delete.

### `admin_users`
Usuários do backoffice. `role`: `owner | manager | staff | marketing`. Separado dos `users` (clientes). A autenticação real é via Supabase Auth + `ADMIN_EMAILS` env var.

---

## Carrinho e Wishlist

### `cart_items`
Carrinho server-side para usuários logados. `reserved_until` = TTL de 30min do `stock_reserved`. Guest cart fica em localStorage (Zustand), sincronizado ao fazer login.

### `wishlists`
Lista de desejos. Ligada a `product_variants` (não a `products`) porque a variante tem o estoque real.

---

## Cupons e Comércio

### `coupons`
Cupons de desconto. `type`: `percent` (% do subtotal) ou `fixed` (valor fixo em centavos) ou `shipping` (frete grátis). `max_uses` = usos totais, `max_uses_per_customer` = usos por cliente. `used_count` incrementado atomicamente no `createOrder`.

### `coupon_uses`
Histórico de uso de cupons. Liga `coupon_id`, `user_id` e `order_id`.

### `checkout_idempotency`
Prevenção de double-submit. Chave única por tentativa de checkout → `order_id` + `result_json`. Se a mesma chave chegar duas vezes, retorna o resultado cacheado.

---

## Configurações e Auditoria

### `delivery_zones`
Zonas de entrega local por prefixo de CEP. `cep_prefix = '11'` → todos os CEPs começando com 11. `fee_in_cents`, `min_days`, `max_days`.

### `stock_alerts`
"Avise-me" quando produto volta ao estoque. `notified_at` é preenchido após envio do e-mail para evitar reenvio.

### `newsletter_subscriptions`
E-mails inscritos. Unique por e-mail.

### `app_settings`
Configurações key/value da loja (ex: `store.name`, `shipping.free_above`). Flexível.

### `audit_log`
Log de alterações críticas (preço, estoque, status de pedido). `before`/`after` em JSON. Usado para rastreabilidade.

### `internal_notes`
Notas internas do admin sobre pedidos ou clientes. Não visíveis ao cliente.
