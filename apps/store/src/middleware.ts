import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Refresha a sessão sem expor dados sensíveis
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rotas protegidas → redireciona para login
  if (!user && pathname.startsWith('/conta')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Admin → tem de estar logado E ser email admin
  if (pathname.startsWith('/admin')) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
    const isAdmin = user && adminEmails.includes((user.email ?? '').toLowerCase())
    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = user ? '/' : '/auth/login'
      if (!user) url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Usuário logado tentando aceder auth pages → redireciona para conta
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
    '/admin/:path*',
    '/auth/login',
    '/auth/cadastro',
  ],
}
