import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/reset-password', '/how-it-works', '/2fa-verify']

// API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/register',
  '/api/razorpay/webhook',
  '/api/2fa/verify',
  '/api/forgot-password',
  '/api/reset-password',
]

// Routes only accessible by ADMIN role
const ADMIN_ROUTES = ['/admin', '/api/admin']

// Routes accessible by all authenticated non-admin users
const PROTECTED_ROUTES = [
  '/dashboard',
  '/post-problem',
  '/problems',
  '/knowledge-base',
  '/mentors',
  '/messages',
  '/profile',
  '/settings',
  '/upgrade',
  '/apply-mentor',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Allow public API routes without auth
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow public pages without auth
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If already logged in and visiting login/register, redirect to appropriate page
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (token && (pathname === '/login' || pathname === '/register')) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Get JWT token for all other routes
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // No token — redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Token expired (access token expired AND refresh token expired) — force re-login
  if (token.error === 'RefreshTokenExpired' || token.error === 'UserNotFound') {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    loginUrl.searchParams.set('error', 'SessionExpired')
    return NextResponse.redirect(loginUrl)
  }

  // ── 2FA gate ─────────────────────────────────────────────────────────────────
  // If user has 2FA enabled but hasn't verified this session, force them to /2fa-verify
  if (
    (token as any).twoFactorEnabled &&
    !(token as any).twoFactorVerified &&
    pathname !== '/2fa-verify'
  ) {
    return NextResponse.redirect(new URL('/2fa-verify', request.url))
  }

  // ── ADMIN role ──────────────────────────────────────────────────────────────
  if (token.role === 'ADMIN') {
    // Admin can only access /admin routes and /api/admin
    if (
      !pathname.startsWith('/admin') &&
      !pathname.startsWith('/api/admin')
    ) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // ── Non-admin trying to access admin routes ─────────────────────────────────
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Authenticated non-admin — allow all protected routes ────────────────────
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
