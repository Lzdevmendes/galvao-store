// Service worker da Galvão's Store.
// Estratégia: network-first para páginas/API (preço e estoque nunca podem ficar
// desatualizados) e cache-first para assets estáticos versionados.

const CACHE_VERSION = 'galvao-static-v1'
const STATIC_PATH_PREFIXES = ['/_next/static/', '/icons/', '/products/']
const STATIC_EXTENSIONS = /\.(?:png|jpg|jpeg|webp|avif|svg|ico|woff2?|ttf)$/

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

function isStaticAsset(url) {
  return (
    STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    STATIC_EXTENSIONS.test(url.pathname)
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Nunca cachear API/dados dinâmicos (preço, estoque, carrinho, pedidos, auth).
  if (url.pathname.startsWith('/api/')) return

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // Páginas (home, catálogo, PDP, checkout...) — network-first: nunca servir
  // preço/estoque desatualizado. Cache só é usado como fallback offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches
            .open(CACHE_VERSION)
            .then((cache) => cache.put(request, response.clone()))
        }
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || Response.error()))
  )
})
