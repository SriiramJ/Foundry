import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Allow access to public routes and API routes
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register') ||
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname.startsWith('/api/register') ||
      request.nextUrl.pathname.startsWith('/reset-password') ||
      request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }
  
  // Redirect to login if not authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Admin role restrictions
  if (token.role === 'ADMIN') {
    // Admin can only access admin routes and API
    if (!request.nextUrl.pathname.startsWith('/admin') && 
        !request.nextUrl.pathname.startsWith('/api/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }
  
  // Non-admin users cannot access admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|api/register|api/messages|api/comments|_next/static|_next/image|favicon.ico).*)',
  ]
}