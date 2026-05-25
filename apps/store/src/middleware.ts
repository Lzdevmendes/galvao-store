import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const ratelimit = hasUpstash
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'galvao:login',
    })
  : null

// Fallback in-memory (single-instance dev only)
const loginAttempts = new Map<string, { count: number; firstAt: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const reqMethod = request.method

  if (pathname === '/auth/login' && reqMethod === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

    if (ratelimit) {
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('error', 'too_many_requests')
        return NextResponse.redirect(url)
      }
    } else {
      const now = Date.now()
      const window = 15 * 60 * 1000
      for (const [key, val] of loginAttempts.entries()) {
        if (now - val.firstAt > window) loginAttempts.delete(key)
      }
      const entry = loginAttempts.get(ip) ?? { count: 0, firstAt: now }
      entry.count++
      if (entry.count === 1) entry.firstAt = now
      loginAttempts.set(ip, entry)
      if (entry.count > 5) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('error', 'too_many_requests')
        return NextResponse.redirect(url)
      }
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
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

  if (!user && pathname.startsWith('/conta')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/auth/login' || pathname === '/auth/cadastro')) {
    const url = request.nextUrl.clone()
    url.pathname = '/conta'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/conta/:path*',
    '/auth/login',
    '/auth/cadastro',
  ],
}
