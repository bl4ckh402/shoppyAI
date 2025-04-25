import { NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { type Database } from "@/types/supabase"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define public routes
  const isPublicRoute = 
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname.startsWith('/landing') ||
    req.nextUrl.pathname.startsWith('/sign-in') ||
    req.nextUrl.pathname.startsWith('/sign-up') ||
    req.nextUrl.pathname.startsWith('/reset-password')

  // If there's no session and the route is protected
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/sign-in', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a session and trying to access auth pages
  if (session && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    // Check if there's a redirect parameter
    const redirectTo = req.nextUrl.searchParams.get('redirect')
    if (redirectTo && !isPublicRoute) {
      // If there's a redirect to a protected route, go there
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }
    // Otherwise go to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
