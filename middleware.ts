import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  
  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLoginPage = pathname === '/admin/login'

  // Customer account routes
  const isAccountRoute = pathname.startsWith('/account')
  
  // Customer auth routes
  const isAuthRoute = pathname.startsWith('/auth')
  const isAuthLoginPage = pathname === '/auth/login'
  const isAuthSignupPage = pathname === '/auth/signup'
  const isAuthCallbackPage = pathname === '/auth/callback'

  // Protect admin routes (except login page)
  if (isAdminRoute && !isAdminLoginPage) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from admin login page
  if (isAdminLoginPage && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/admin'
    const url = request.nextUrl.clone()
    url.pathname = redirectTo
    url.searchParams.delete('redirectTo')
    return NextResponse.redirect(url)
  }

  // Protect customer account routes
  if (isAccountRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages (except callback)
  if (isAuthRoute && !isAuthCallbackPage && (isAuthLoginPage || isAuthSignupPage)) {
    if (user) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
      const url = request.nextUrl.clone()
      url.pathname = redirectTo
      url.searchParams.delete('redirectTo')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/auth/:path*',
  ],
}
