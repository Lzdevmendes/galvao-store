// Service worker da Galvão's Store.
// Estratégia: network-first para páginas/API (preço e estoque nunca podem ficar
// desatualizados) e cache-first para assets estáticos versionados.
//
// Em dev (localhost/LAN), o cache-first de /_next/static/ serve chunks JS
// desatualizados contra HTML novo do SSR (hydration mismatch) — e como o
// próprio SW intercepta o JS que registra/desregistra o SW, um cliente que já
// tenha isso instalado nunca se autocorrige sozinho via código de página.
// O browser sempre revalida ESTE arquivo byte-a-byte (nunca serve do cache do
// SW), então o kill-switch precisa viver aqui: em dev o SW se autodesregistra
// e limpa tudo, em vez de confiar em `sw-register.tsx`.
const IS_DEV_HOST =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(self.location.hostname)

const CACHE_VERSION = 'galvao-static-v1'
const STATIC_PATH_PREFIXES = ['/_next/static/', '/icons/', '/products/']
const STATIC_EXTENSIONS = /\.(?:png|jpg|jpeg|webp|avif|svg|ico|woff2?|ttf)$/

self.addEventListener('install', (event) => {
  if (!IS_DEV_HOST) {
    event.waitUntil(
      caches.open(CACHE_VERSION)
        .then((cache) => cache.addAll(['/offline.html']))
        .then(() => self.skipWaiting())
    )
    return
  }
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  if (IS_DEV_HOST) {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    )
    return
  }

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
  if (IS_DEV_HOST) return // deixa o browser tratar normalmente, sem cache do SW

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
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached
          if (request.mode === 'navigate') return caches.match('/offline.html')
          return Response.error()
        })
      )
  )
})
