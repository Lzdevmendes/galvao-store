"use server";

import { db } from "@/lib/db";
import { sendOrderCreatedEmail } from "@/lib/email";
import {
  meServiceToMethod,
  quoteMelhorEnvio,
  type MEProduct,
} from "@/lib/melhor-envio";
import { checkMemory, getRealIpFromHeaders, limiters } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";
import { fmt } from "@/lib/utils";
import {
  isValidCep,
  isValidCpf,
  isValidPhone,
  sanitizeText,
} from "@/lib/validate";
import { waSendOrderCreated } from "@/lib/whatsapp";
import { sql } from "drizzle-orm";

// ── Types ──────────────────────────────────────────────────────────────────

export type ShippingOption = {
  method: "sedex" | "pac" | "local_delivery";
  label: string;
  priceInCents: number;
  days: number;
  description: string;
};

export type CartItemData = {
  variantId: string;
  productName: string;
  brandName: string;
  imageUrl: string;
  size: string;
  color: string;
  priceInCents: number;
  pricePromoInCents: number | null;
  quantity: number;
};

export type CheckoutPayload = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  shippingMethod: "sedex" | "pac" | "local_delivery";
  shippingInCents: number;
  estimatedDays: number;
  paymentMethod: "pix" | "credit_card" | "boleto";
  cardToken?: string;
  cardInstallments?: number;
  cardPaymentMethodId?: string;
  couponCode?: string;
  couponDiscountInCents?: number;
  couponId?: string;
  cartItems: CartItemData[];
  idempotencyKey?: string;
};

export type CreateOrderResult =
  | {
      success: true;
      orderId: string;
      orderNumber: string;
      paymentMethod: string;
      pixQr?: string;
      pixKey?: string;
      pixExpiresAt?: string;
      boletoUrl?: string;
      boletoBarCode?: string;
      boletoExpiresAt?: string;
    }
  | { success: false; error: string };

// ── Calculate Shipping ─────────────────────────────────────────────────────

type ShippingInput = {
  variantId: string;
  quantity: number;
  priceInCents: number;
  pricePromoInCents: number | null;
};

export async function calculateShipping(
  cep: string,
  items: ShippingInput[],
): Promise<ShippingOption[]> {
  const cleanCep = cep.replace(/\D/g, "");
  const options: ShippingOption[] = [];

  // 1. Entrega local (carro próprio) — prioridade se CEP bater
  const zones = await db.all<{
    name: string;
    fee_in_cents: number;
    min_days: number;
    max_days: number;
  }>(sql`
    SELECT name, fee_in_cents, min_days, max_days
    FROM delivery_zones
    WHERE active = 1 AND ${cleanCep} LIKE cep_prefix || '%'
    LIMIT 1
  `);

  if (zones.length > 0) {
    const z = zones[0];
    const daysLabel =
      z.min_days === 0
        ? "Hoje ou amanhã"
        : `${z.min_days}–${z.max_days} dias úteis`;
    options.push({
      method: "local_delivery",
      label: "Entrega Local Galvão",
      priceInCents: z.fee_in_cents,
      days: z.max_days,
      description: daysLabel,
    });
  }

  // 2. Melhor Envio (Correios) — SEDEX e PAC com preços reais
  const meClientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const meClientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
  const originCep = process.env.SHIPPING_ORIGIN_CEP ?? "11671207";
  const sandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";

  if (meClientId && meClientSecret && items.length > 0) {
    try {
      // Buscar dimensões de todas as variantes em uma única query (evita N+1)
      const dimRows = await db.all<{
        id: string;
        sku: string;
        weight_g: number;
        height_cm: number;
        width_cm: number;
        length_cm: number;
      }>(sql`
        SELECT id, sku, weight_g, height_cm, width_cm, length_cm
        FROM product_variants
        WHERE id IN (${sql.join(
          items.map((i) => sql`${i.variantId}`),
          sql`,`,
        )})
      `);
      const dimMap = new Map(dimRows.map((r) => [r.id, r]));
      const meProducts: MEProduct[] = items.map((item) => {
        const v = dimMap.get(item.variantId);
        const unitPrice =
          item.pricePromoInCents != null &&
          item.pricePromoInCents < item.priceInCents
            ? item.pricePromoInCents
            : item.priceInCents;
        return {
          id: v?.sku ?? item.variantId,
          quantity: item.quantity,
          weightKg: (v?.weight_g ?? 500) / 1000,
          heightCm: v?.height_cm ?? 12,
          widthCm: v?.width_cm ?? 22,
          lengthCm: v?.length_cm ?? 30,
          insuranceValue: unitPrice / 100,
        };
      });

      const quotes = await quoteMelhorEnvio(
        originCep,
        cleanCep,
        meProducts,
        meClientId,
        meClientSecret,
        sandbox,
      );

      // Agrupar por método → pegar o mais barato de cada
      const byMethod = new Map<"sedex" | "pac", (typeof quotes)[0]>();
      for (const q of quotes) {
        const method = meServiceToMethod(q.serviceId);
        const current = byMethod.get(method);
        if (!current || q.priceInCents < current.priceInCents)
          byMethod.set(method, q);
      }

      const sedex = byMethod.get("sedex");
      if (sedex) {
        options.push({
          method: "sedex",
          label: "SEDEX",
          priceInCents: sedex.priceInCents,
          days: sedex.days,
          description: `Correios · até ${sedex.days} dias úteis`,
        });
      }

      const pac = byMethod.get("pac");
      if (pac) {
        options.push({
          method: "pac",
          label: "PAC",
          priceInCents: pac.priceInCents,
          days: pac.days,
          description: `Correios · até ${pac.days} dias úteis`,
        });
      }
    } catch (err) {
      console.warn(
        "[calculateShipping] Melhor Envio falhou, usando fallback:",
        err instanceof Error ? err.message : err,
      );
      options.push({
        method: "sedex",
        label: "SEDEX",
        priceInCents: 2990,
        days: 3,
        description: "Correios · até 3 dias úteis (estimado)",
      });
      options.push({
        method: "pac",
        label: "PAC",
        priceInCents: 1490,
        days: 7,
        description: "Correios · até 7 dias úteis (estimado)",
      });
    }
  } else {
    // Sem credenciais → valores fixos para dev/demo
    options.push({
      method: "sedex",
      label: "SEDEX",
      priceInCents: 2990,
      days: 3,
      description: "Correios · até 3 dias úteis",
    });
    options.push({
      method: "pac",
      label: "PAC",
      priceInCents: 1490,
      days: 7,
      description: "Correios · até 7 dias úteis",
    });
  }

  return options;
}

// ── Validate Coupon ────────────────────────────────────────────────────────

export async function validateCoupon(
  code: string,
  subtotalInCents: number,
): Promise<
  | { valid: true; discountInCents: number; couponId: string; type: string }
  | { valid: false; error: string }
> {
  const now = new Date().toISOString();

  const rows = await db.all<{
    id: string;
    type: string;
    value: number;
    min_order_in_cents: number | null;
  }>(sql`
    SELECT id, type, value, min_order_in_cents
    FROM coupons
    WHERE UPPER(code) = UPPER(${code})
      AND active = 1
      AND (starts_at IS NULL OR starts_at <= ${now})
      AND (expires_at IS NULL OR expires_at >= ${now})
      AND (max_uses IS NULL OR used_count < max_uses)
    LIMIT 1
  `);

  const coupon = rows[0];
  if (!coupon) return { valid: false, error: "Cupom inválido ou expirado." };

  const minOrder = coupon.min_order_in_cents ?? 0;
  if (subtotalInCents < minOrder) {
    return {
      valid: false,
      error: `Pedido mínimo de ${fmt(minOrder)} para este cupom.`,
    };
  }

  let discountInCents = 0;
  if (coupon.type === "percent")
    discountInCents = Math.round((subtotalInCents * coupon.value) / 100);
  else if (coupon.type === "fixed")
    discountInCents = Math.min(coupon.value, subtotalInCents);

  return {
    valid: true,
    discountInCents,
    couponId: coupon.id,
    type: coupon.type,
  };
}

// ── Create Order ───────────────────────────────────────────────────────────

export async function createOrder(
  payload: CheckoutPayload,
): Promise<CreateOrderResult> {
  try {
    // Rate limiting anti-fraude — 5 tentativas por IP / 5min
    // Impede bots de testar cartões roubados em loop
    const ip = await getRealIpFromHeaders();
    const limitKey = `checkout:${ip}`;
    if (limiters.checkout) {
      const { success } = await limiters.checkout.limit(limitKey);
      if (!success)
        return {
          success: false,
          error: "Muitas tentativas. Tente novamente em alguns minutos.",
        };
    } else if (!checkMemory(limitKey, 5, 5 * 60 * 1000)) {
      return {
        success: false,
        error: "Muitas tentativas. Tente novamente em alguns minutos.",
      };
    }

    // Validação dos dados pessoais no servidor (o frontend já valida, mas o server é autoritativo)
    const name = sanitizeText(payload.name);
    if (!name || name.length < 3 || name.length > 120)
      return { success: false, error: "Nome inválido." };
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
      return { success: false, error: "E-mail inválido." };
    if (payload.cpf && !isValidCpf(payload.cpf))
      return { success: false, error: "CPF inválido." };
    if (payload.phone && !isValidPhone(payload.phone))
      return { success: false, error: "Telefone inválido." };
    if (!isValidCep(payload.cep))
      return { success: false, error: "CEP inválido." };
    if (!payload.street || payload.street.length > 200)
      return { success: false, error: "Endereço inválido." };
    if (!payload.city || payload.city.length > 100)
      return { success: false, error: "Cidade inválida." };
    if (!payload.state || payload.state.length !== 2)
      return { success: false, error: "Estado inválido." };
    if (!["pix", "credit_card", "boleto"].includes(payload.paymentMethod))
      return { success: false, error: "Método de pagamento inválido." };
    if (!payload.cartItems?.length || payload.cartItems.length > 50)
      return { success: false, error: "Carrinho inválido." };

    // Idempotência: evita double-submit se o user clicar duas vezes
    if (payload.idempotencyKey) {
      const cached = await db.all<{ result_json: string }>(sql`
        SELECT result_json FROM checkout_idempotency WHERE key = ${payload.idempotencyKey} LIMIT 1
      `);
      if (cached.length > 0) {
        return JSON.parse(cached[0].result_json) as CreateOrderResult;
      }
    }

    const saveAndReturn = async (
      result: CreateOrderResult,
    ): Promise<CreateOrderResult> => {
      if (payload.idempotencyKey && result.success) {
        await db.run(sql`
          INSERT OR IGNORE INTO checkout_idempotency (key, order_id, result_json)
          VALUES (${payload.idempotencyKey}, ${(result as { orderId: string }).orderId}, ${JSON.stringify(result)})
        `);
      }
      return result;
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Garantir que o utilizador logado existe na tabela users do SQLite
    // (Supabase gere auth; SQLite é o BD de negócio — precisamos sincronizar o UUID)
    if (user) {
      await db.run(sql`
        INSERT INTO users (id, email, name, created_at, updated_at)
        VALUES (${user.id}, ${user.email ?? payload.email}, ${payload.name}, datetime('now'), datetime('now'))
        ON CONFLICT(id) DO NOTHING
      `);
    }

    // Número do pedido sequencial
    const countRows = await db.all<{ n: number }>(
      sql`SELECT COUNT(*) as n FROM orders`,
    );
    const nextNum = (countRows[0]?.n ?? 0) + 1;
    const orderNumber = `GS-${new Date().getFullYear()}-${String(nextNum).padStart(6, "0")}`;
    const orderId = crypto.randomUUID();

    // Buscar preços e estoque — fonte autoritativa é o banco, nunca o cliente
    const allVariantIds = payload.cartItems.map((i) => i.variantId);
    const variantRows = await db.all<{
      id: string;
      stock: number;
      stock_reserved: number;
      sku: string;
      price_in_cents: number;
      price_promo_in_cents: number | null;
    }>(sql`
      SELECT id, stock, stock_reserved, sku, price_in_cents, price_promo_in_cents
      FROM product_variants
      WHERE id IN (${sql.join(
        allVariantIds.map((id) => sql`${id}`),
        sql`,`,
      )})
    `);
    const variantMap = new Map(variantRows.map((v) => [v.id, v]));

    // Validar estoque
    for (const item of payload.cartItems) {
      const v = variantMap.get(item.variantId);
      if (!v) {
        return {
          success: false,
          error: `Produto não encontrado: ${item.productName} tam. ${item.size}. Atualize o carrinho e tente novamente.`,
        };
      }
      if (v.stock - v.stock_reserved < item.quantity) {
        return {
          success: false,
          error: `Estoque insuficiente para ${item.productName} (tam. ${item.size}).`,
        };
      }
    }

    // Calcular totais com preços do banco — ignora preços vindos do cliente
    const subtotalInCents = payload.cartItems.reduce((acc, item) => {
      const v = variantMap.get(item.variantId)!;
      const price =
        v.price_promo_in_cents != null &&
        v.price_promo_in_cents < v.price_in_cents
          ? v.price_promo_in_cents
          : v.price_in_cents;
      return acc + price * item.quantity;
    }, 0);

    // Re-validar cupom no servidor com o subtotal real do banco
    let couponDiscount = 0;
    if (payload.couponCode && payload.couponId) {
      const couponCheck = await validateCoupon(
        payload.couponCode,
        subtotalInCents,
      );
      couponDiscount = couponCheck.valid ? couponCheck.discountInCents : 0;
    }

    const pixDiscount =
      payload.paymentMethod === "pix" ? Math.round(subtotalInCents * 0.05) : 0;
    const totalDiscount = couponDiscount + pixDiscount;
    const totalInCents =
      subtotalInCents - totalDiscount + payload.shippingInCents;

    // Criar pedido
    await db.run(sql`
      INSERT INTO orders (
        id, user_id, order_number, status,
        customer_name, customer_email, customer_phone, customer_cpf,
        ship_cep, ship_street, ship_number, ship_complement,
        ship_district, ship_city, ship_state,
        delivery_method, shipping_in_cents, estimated_days,
        payment_method,
        subtotal_in_cents, discount_in_cents, total_in_cents,
        coupon_code, created_at, updated_at
      ) VALUES (
        ${orderId}, ${user?.id ?? null}, ${orderNumber}, 'pending_payment',
        ${payload.name}, ${payload.email}, ${payload.phone || null}, ${payload.cpf || null},
        ${payload.cep}, ${payload.street}, ${payload.number}, ${payload.complement || null},
        ${payload.district}, ${payload.city}, ${payload.state},
        ${payload.shippingMethod}, ${payload.shippingInCents}, ${payload.estimatedDays},
        ${payload.paymentMethod},
        ${subtotalInCents}, ${totalDiscount}, ${totalInCents},
        ${payload.couponCode || null}, datetime('now'), datetime('now')
      )
    `);

    // Inserir itens — preço unitário sempre do banco (variantMap)
    await Promise.all(
      payload.cartItems.map((item) => {
        const v = variantMap.get(item.variantId)!;
        const price =
          v.price_promo_in_cents != null &&
          v.price_promo_in_cents < v.price_in_cents
            ? v.price_promo_in_cents
            : v.price_in_cents;
        const sku = v.sku;
        return db.run(sql`
        INSERT INTO order_items (
          id, order_id, variant_id,
          product_name, product_sku, brand_name,
          variant_size, variant_color, image_url,
          qty, unit_in_cents, total_in_cents
        ) VALUES (
          ${crypto.randomUUID()}, ${orderId}, ${item.variantId},
          ${item.productName}, ${sku}, ${item.brandName},
          ${item.size}, ${item.color}, ${item.imageUrl || null},
          ${item.quantity}, ${price}, ${price * item.quantity}
        )
      `);
      }),
    );

    // Reservar estoque em paralelo
    await Promise.all(
      payload.cartItems.map((item) =>
        db.run(sql`
        UPDATE product_variants
        SET stock_reserved = stock_reserved + ${item.quantity}
        WHERE id = ${item.variantId}
      `),
      ),
    );

    // Primeiro evento da timeline
    await db.run(sql`
      INSERT INTO order_events (id, order_id, type, created_by, created_at)
      VALUES (${crypto.randomUUID()}, ${orderId}, 'pending_payment', 'system', datetime('now'))
    `);

    // Registrar uso do cupom
    if (payload.couponId) {
      await db.run(
        sql`UPDATE coupons SET used_count = used_count + 1 WHERE id = ${payload.couponId}`,
      );
      await db.run(sql`
        INSERT INTO coupon_uses (id, coupon_id, user_id, order_id, used_at)
        VALUES (${crypto.randomUUID()}, ${payload.couponId}, ${user?.id ?? null}, ${orderId}, datetime('now'))
      `);
    }

    // Preparar dados comuns para e-mail — preços sempre do variantMap (banco)
    const emailItems = payload.cartItems.map((item) => {
      const v = variantMap.get(item.variantId)!;
      const unitPrice =
        v.price_promo_in_cents != null &&
        v.price_promo_in_cents < v.price_in_cents
          ? v.price_promo_in_cents
          : v.price_in_cents;
      return {
        productName: item.productName,
        brandName: item.brandName,
        variantSize: item.size,
        variantColor: item.color || null,
        imageUrl: item.imageUrl || null,
        qty: item.quantity,
        unitInCents: unitPrice,
        totalInCents: unitPrice * item.quantity,
      };
    });

    const emailTotals = {
      subtotalInCents,
      discountInCents: totalDiscount,
      shippingInCents: payload.shippingInCents,
      totalInCents,
      couponCode: payload.couponCode ?? null,
      paymentMethod: payload.paymentMethod,
    };

    const emailAddress = {
      street: payload.street,
      number: payload.number,
      complement: payload.complement || null,
      district: payload.district,
      city: payload.city,
      state: payload.state,
      cep: payload.cep,
    };

    // Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      // Dev mode sem chaves MP — enviar e-mail sem dados de pagamento
      void sendOrderCreatedEmail(payload.email, {
        orderNumber,
        customerName: payload.name,
        createdAt: new Date().toISOString(),
        items: emailItems,
        totals: emailTotals,
        address: emailAddress,
        deliveryMethod: payload.shippingMethod,
        estimatedDays: payload.estimatedDays,
        paymentMethod: payload.paymentMethod,
      }).catch((e) => console.error("[email] order-created:", e));
      void waSendOrderCreated(
        payload.phone || null,
        orderNumber,
        payload.name,
      ).catch((e) => console.error("[whatsapp] order-created:", e));

      return saveAndReturn({
        success: true,
        orderId,
        orderNumber,
        paymentMethod: payload.paymentMethod,
      });
    }

    // ── Sandbox bypass: conta TEST- geralmente não tem PIX configurado ────
    // Retorna dados simulados para testar o fluxo completo sem chamar a API real
    const isSandbox = accessToken.startsWith("TEST-");
    if (isSandbox && payload.paymentMethod === "pix") {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const fakeKey = `00020126580014BR.GOV.BCB.PIX0136${orderId.replace(/-/g, "").slice(0, 32)}5204000053039865406${(totalInCents / 100).toFixed(2)}5802BR5925GALVAO STORE LTDA6009SAO PAULO62070503***6304ABCD`;
      await db.run(sql`
        UPDATE orders SET pix_key = ${fakeKey}, pix_expires_at = ${expiresAt}
        WHERE id = ${orderId}
      `);
      void sendOrderCreatedEmail(payload.email, {
        orderNumber,
        customerName: payload.name,
        createdAt: new Date().toISOString(),
        items: emailItems,
        totals: emailTotals,
        address: emailAddress,
        deliveryMethod: payload.shippingMethod,
        estimatedDays: payload.estimatedDays,
        paymentMethod: "pix",
        pixKey: fakeKey,
        pixExpiresAt: expiresAt,
      }).catch((e) => console.error("[email] order-created pix sandbox:", e));
      void waSendOrderCreated(
        payload.phone || null,
        orderNumber,
        payload.name,
      ).catch((e) => console.error("[whatsapp] order-created pix sandbox:", e));
      return saveAndReturn({
        success: true,
        orderId,
        orderNumber,
        paymentMethod: "pix",
        pixKey: fakeKey,
        pixExpiresAt: expiresAt,
      });
    }

    if (isSandbox && payload.paymentMethod === "boleto") {
      const fakeUrl = `https://boleto.sandbox.mercadopago.com/sandbox/${orderId}`;
      const fakeBarCode = `23793.38128 60007.827136 98000.063305 2 10010000${totalInCents}`;
      const expiresAt = new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      await db.run(sql`
        UPDATE orders SET boleto_url = ${fakeUrl}, boleto_bar_code = ${fakeBarCode}, boleto_expires_at = ${expiresAt}
        WHERE id = ${orderId}
      `);
      void sendOrderCreatedEmail(payload.email, {
        orderNumber,
        customerName: payload.name,
        createdAt: new Date().toISOString(),
        items: emailItems,
        totals: emailTotals,
        address: emailAddress,
        deliveryMethod: payload.shippingMethod,
        estimatedDays: payload.estimatedDays,
        paymentMethod: "boleto",
        boletoUrl: fakeUrl,
        boletoBarCode: fakeBarCode,
        boletoExpiresAt: expiresAt,
      }).catch((e) =>
        console.error("[email] order-created boleto sandbox:", e),
      );
      void waSendOrderCreated(
        payload.phone || null,
        orderNumber,
        payload.name,
      ).catch((e) =>
        console.error("[whatsapp] order-created boleto sandbox:", e),
      );
      return saveAndReturn({
        success: true,
        orderId,
        orderNumber,
        paymentMethod: "boleto",
        boletoUrl: fakeUrl,
        boletoBarCode: fakeBarCode,
        boletoExpiresAt: expiresAt,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const { MercadoPagoConfig, Payment } = await import("mercadopago");
    const mpClient = new MercadoPagoConfig({ accessToken });
    const mpPayment = new Payment(mpClient);

    // Helper: desfaz o pedido se o MP falhar (para o utilizador poder tentar de novo)
    const rollbackOrder = async () => {
      try {
        // Apagar na ordem inversa das FK constraints
        await db.run(sql`DELETE FROM order_events WHERE order_id = ${orderId}`);
        await db.run(sql`DELETE FROM order_items  WHERE order_id = ${orderId}`);
        // Apagar coupon_uses e reverter contador se houve cupão
        if (payload.couponId) {
          await db.run(
            sql`DELETE FROM coupon_uses WHERE order_id = ${orderId}`,
          );
          await db.run(
            sql`UPDATE coupons SET used_count = MAX(0, used_count - 1) WHERE id = ${payload.couponId}`,
          );
        }
        // Libertar stock reservado em paralelo
        await Promise.all(
          payload.cartItems.map((item) =>
            db.run(sql`
            UPDATE product_variants
            SET stock_reserved = MAX(0, stock_reserved - ${item.quantity})
            WHERE id = ${item.variantId}
          `),
          ),
        );
        await db.run(sql`DELETE FROM orders WHERE id = ${orderId}`);
      } catch (e) {
        console.error("[rollbackOrder] falhou:", e);
      }
    };

    const totalBRL = totalInCents / 100;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";
    // MP não aceita localhost como notification_url — omitir em dev
    const notificationUrl = siteUrl.startsWith("http://localhost")
      ? undefined
      : `${siteUrl}/api/webhooks/mercadopago`;
    const firstName = payload.name.split(" ")[0];
    const lastName = payload.name.split(" ").slice(1).join(" ") || firstName;

    // ── Wrapper MP com rollback automático em caso de falha ──────────────
    try {
      // ── PIX ────────────────────────────────────────────────────────────
      if (payload.paymentMethod === "pix") {
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const result = await mpPayment.create({
          body: {
            transaction_amount: totalBRL,
            payment_method_id: "pix",
            payer: {
              email: payload.email,
              first_name: firstName,
              last_name: lastName,
              identification: {
                type: "CPF",
                number: payload.cpf.replace(/\D/g, ""),
              },
            },
            description: `Pedido ${orderNumber} - Galvão Store`,
            external_reference: orderId,
            notification_url: notificationUrl,
            date_of_expiration: expiresAt,
          },
        });

        const pixQr =
          result.point_of_interaction?.transaction_data?.qr_code_base64 ??
          undefined;
        const pixKey =
          result.point_of_interaction?.transaction_data?.qr_code ?? undefined;

        await db.run(sql`
          UPDATE orders
          SET payment_id = ${String(result.id)},
              pix_qr_code = ${pixQr ?? null},
              pix_key = ${pixKey ?? null},
              pix_expires_at = ${expiresAt}
          WHERE id = ${orderId}
        `);

        void sendOrderCreatedEmail(payload.email, {
          orderNumber,
          customerName: payload.name,
          createdAt: new Date().toISOString(),
          items: emailItems,
          totals: emailTotals,
          address: emailAddress,
          deliveryMethod: payload.shippingMethod,
          estimatedDays: payload.estimatedDays,
          paymentMethod: "pix",
          pixQrCode: pixQr,
          pixKey,
          pixExpiresAt: expiresAt,
        }).catch((e) => console.error("[email] order-created pix:", e));
        void waSendOrderCreated(
          payload.phone || null,
          orderNumber,
          payload.name,
        ).catch((e) => console.error("[whatsapp] order-created pix:", e));

        return saveAndReturn({
          success: true,
          orderId,
          orderNumber,
          paymentMethod: "pix",
          pixQr,
          pixKey,
          pixExpiresAt: expiresAt,
        });
      }

      // ── Boleto ──────────────────────────────────────────────────────────
      if (payload.paymentMethod === "boleto") {
        const result = await mpPayment.create({
          body: {
            transaction_amount: totalBRL,
            payment_method_id: "bolbradesco",
            payer: {
              email: payload.email,
              first_name: firstName,
              last_name: lastName,
              identification: {
                type: "CPF",
                number: payload.cpf.replace(/\D/g, ""),
              },
            },
            description: `Pedido ${orderNumber} - Galvão Store`,
            external_reference: orderId,
            notification_url: notificationUrl,
          },
        });

        const boletoUrl =
          result.transaction_details?.external_resource_url ?? undefined;
        const resultAny = result as unknown as Record<string, unknown>;
        const boletoBarCode =
          typeof resultAny.barcode === "object" && resultAny.barcode !== null
            ? ((resultAny.barcode as Record<string, unknown>).content as
                | string
                | undefined)
            : undefined;
        const boletoExpAt = result.date_of_expiration ?? undefined;

        await db.run(sql`
          UPDATE orders
          SET payment_id = ${String(result.id)},
              boleto_url = ${boletoUrl ?? null},
              boleto_bar_code = ${boletoBarCode ?? null},
              boleto_expires_at = ${boletoExpAt ?? null}
          WHERE id = ${orderId}
        `);

        void sendOrderCreatedEmail(payload.email, {
          orderNumber,
          customerName: payload.name,
          createdAt: new Date().toISOString(),
          items: emailItems,
          totals: emailTotals,
          address: emailAddress,
          deliveryMethod: payload.shippingMethod,
          estimatedDays: payload.estimatedDays,
          paymentMethod: "boleto",
          boletoUrl,
          boletoBarCode,
          boletoExpiresAt: boletoExpAt,
        }).catch((e) => console.error("[email] order-created boleto:", e));
        void waSendOrderCreated(
          payload.phone || null,
          orderNumber,
          payload.name,
        ).catch((e) => console.error("[whatsapp] order-created boleto:", e));

        return saveAndReturn({
          success: true,
          orderId,
          orderNumber,
          paymentMethod: "boleto",
          boletoUrl,
          boletoBarCode,
          boletoExpiresAt: boletoExpAt,
        });
      }

      // ── Cartão ──────────────────────────────────────────────────────────
      if (payload.paymentMethod === "credit_card" && payload.cardToken) {
        const result = await mpPayment.create({
          body: {
            transaction_amount: totalBRL,
            token: payload.cardToken,
            installments: payload.cardInstallments ?? 1,
            payment_method_id: payload.cardPaymentMethodId!,
            payer: {
              email: payload.email,
              identification: {
                type: "CPF",
                number: payload.cpf.replace(/\D/g, ""),
              },
            },
            description: `Pedido ${orderNumber} - Galvão Store`,
            external_reference: orderId,
            notification_url: notificationUrl,
          },
        });

        if (result.status === "approved") {
          await db.run(sql`
            UPDATE orders SET status = 'paid', payment_id = ${String(result.id)}, paid_at = datetime('now')
            WHERE id = ${orderId}
          `);
          await Promise.all(
            payload.cartItems.map((item) =>
              db.run(sql`
              UPDATE product_variants
              SET stock = stock - ${item.quantity},
                  stock_reserved = stock_reserved - ${item.quantity}
              WHERE id = ${item.variantId}
            `),
            ),
          );
        } else {
          await db.run(
            sql`UPDATE orders SET payment_id = ${String(result.id)} WHERE id = ${orderId}`,
          );
        }

        void sendOrderCreatedEmail(payload.email, {
          orderNumber,
          customerName: payload.name,
          createdAt: new Date().toISOString(),
          items: emailItems,
          totals: emailTotals,
          address: emailAddress,
          deliveryMethod: payload.shippingMethod,
          estimatedDays: payload.estimatedDays,
          paymentMethod: "credit_card",
        }).catch((e) => console.error("[email] order-created card:", e));
        void waSendOrderCreated(
          payload.phone || null,
          orderNumber,
          payload.name,
        ).catch((e) => console.error("[whatsapp] order-created card:", e));

        return saveAndReturn({
          success: true,
          orderId,
          orderNumber,
          paymentMethod: "credit_card",
        });
      }

      return saveAndReturn({
        success: true,
        orderId,
        orderNumber,
        paymentMethod: payload.paymentMethod,
      });
    } catch (mpErr) {
      // Desfaz o pedido para o utilizador poder tentar novamente
      await rollbackOrder();
      // Log interno completo — mensagem para o cliente nunca revela detalhes internos
      console.error(
        "[createOrder] MP ERRO:",
        mpErr instanceof Error ? mpErr.message : JSON.stringify(mpErr),
      );
      return {
        success: false,
        error:
          "Erro ao processar pagamento. Tente novamente ou escolha outra forma de pagamento.",
      };
    }
  } catch (err) {
    // Log interno completo — cliente vê mensagem genérica (não vazamos stack trace)
    console.error("[createOrder] ERRO INTERNO:", err);
    return {
      success: false,
      error: "Erro interno. Por favor tente novamente em alguns instantes.",
    };
  }
}
