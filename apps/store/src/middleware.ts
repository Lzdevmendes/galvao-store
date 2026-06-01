import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { limiters, getRealIp, checkMemory, rateLimitResponse } from '@/lib/ratelimit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getRealIp(request)

  // ── 1. Rate limiting por rota ───────────────────────────────────────────
  // O webhook MP é explicitamente excluído — nunca bloquear notificações de pagamento
  const isWebhook = pathname.startsWith('/api/webhooks/')

  if (!isWebhook) {
    // Login — 5 tentativas por IP / 15min
    if (pathname === '/auth/login' && request.method === 'POST') {
      if (limiters.login) {
        const { success, reset } = await limiters.login.limit(ip)
        if (!success) {
          const retryAfter = reset ? Math.ceil((reset - Date.now()) / 1000) : 900
          const url = request.nextUrl.clone()
          url.pathname = '/auth/login'
          url.searchParams.set('error', 'too_many_requests')
          return NextResponse.redirect(url, {
            headers: { 'Retry-After': String(retryAfter) },
          })
        }
      } else if (!checkMemory(`login:${ip}`, 5, 15 * 60 * 1000)) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('error', 'too_many_requests')
        return NextResponse.redirect(url)
      }
    }

    // API global — 300 req/min por IP (DDoS e scraping)
    // Aplicado em todas as rotas /api/* exceto o webhook
    if (pathname.startsWith('/api/')) {
      if (limiters.apiGlobal) {
        const { success } = await limiters.apiGlobal.limit(ip)
        if (!success) return rateLimitResponse(60)
      } else if (!checkMemory(`api:${ip}`, 300, 60 * 1000)) {
        return rateLimitResponse(60)
      }
    }
  }

  // ── 2. Supabase session — só para rotas que precisam de auth (não /api/*)
  // Evita chamar getUser() em todas as API routes públicas (adiciona ~50ms por req)
  const needsAuth = pathname.startsWith('/conta') || pathname === '/auth/login' || pathname === '/auth/cadastro'
  if (!needsAuth) return NextResponse.next({ request })

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── 3. Protecção de rotas autenticadas ───────────────────────────────────
  if (!user && pathname.startsWith('/conta')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/auth/login' || pathname === '/auth/cadastro')) {
    return NextResponse.redirect(new URL('/conta', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/conta/:path*',
    '/auth/login',
    '/auth/cadastro',
    '/api/:path*',  // rate limiting only — sem auth check para /api
  ],
}
