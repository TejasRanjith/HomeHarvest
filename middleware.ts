import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Improved path exclusion to prevent infinite loops
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') || // Ensure API routes are public if needed
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.') // Exclude static files
  ) {
    return supabaseResponse
  }

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    // If auth check fails, treat as unauthenticated user
    user = null
  }

  if (!user && (pathname.startsWith('/vendor') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname.startsWith('/admin')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile as Record<string, unknown>).role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      // If profile check fails, redirect to home for safety
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).)*',
  ],
}
