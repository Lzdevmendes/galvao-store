'use client'

// ── Helpers de eventos GA4 + Meta Pixel ────────────────────
// Importar onde necessário: add_to_cart, begin_checkout, purchase

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?:  (...args: unknown[]) => void
  }
}

function ga(event: string, params?: Record<string, unknown>) {
  window.gtag?.('event', event, params)
}
function fb(event: string, params?: Record<string, unknown>) {
  window.fbq?.('track', event, params)
}

// ── Eventos de produto ────────────────────────────────────
export function trackViewItem(product: { id: string; name: string; brand: string; price: number; category?: string }) {
  ga('view_item', {
    currency: 'BRL',
    value: product.price / 100,
    items: [{ item_id: product.id, item_name: product.name, item_brand: product.brand, item_category: product.category, price: product.price / 100 }],
  })
  fb('ViewContent', { content_ids: [product.id], content_name: product.name, content_type: 'product', value: product.price / 100, currency: 'BRL' })
}

export function trackAddToCart(product: { id: string; name: string; brand: string; price: number; qty?: number }) {
  ga('add_to_cart', {
    currency: 'BRL',
    value: (product.price * (product.qty ?? 1)) / 100,
    items: [{ item_id: product.id, item_name: product.name, item_brand: product.brand, price: product.price / 100, quantity: product.qty ?? 1 }],
  })
  fb('AddToCart', { content_ids: [product.id], content_name: product.name, value: product.price / 100, currency: 'BRL' })
}

export function trackBeginCheckout(total: number, items: { id: string; name: string; price: number; qty: number }[]) {
  ga('begin_checkout', {
    currency: 'BRL',
    value: total / 100,
    items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price / 100, quantity: i.qty })),
  })
  fb('InitiateCheckout', { value: total / 100, currency: 'BRL', num_items: items.length })
}

export function trackPurchase(order: { id: string; number: string; total: number; shipping: number; coupon?: string | null; items: { id: string; name: string; price: number; qty: number }[] }) {
  ga('purchase', {
    transaction_id: order.number,
    currency:       'BRL',
    value:          order.total / 100,
    shipping:       order.shipping / 100,
    coupon:         order.coupon ?? undefined,
    items:          order.items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price / 100, quantity: i.qty })),
  })
  fb('Purchase', { value: order.total / 100, currency: 'BRL', content_ids: order.items.map(i => i.id) })
}

export function trackSearch(query: string) {
  ga('search', { search_term: query })
  fb('Search', { search_string: query })
}
