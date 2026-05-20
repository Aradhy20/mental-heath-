import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes require authentication
const protectedRoutes = ['/dashboard', '/chat', '/mood', '/journal', '/insights', '/games', '/settings', '/nearby', '/resilience', '/assessments', '/multimodal', '/admin']
const authRoutes      = ['/auth']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('mindful_token')?.value
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some(r => pathname.startsWith(r))
  const isAuthRoute      = authRoutes.some(r => pathname.startsWith(r))

  // 1. Redirect unauthenticated users from protected routes to /auth
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // 2. Redirect authenticated users from /auth back to /dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
