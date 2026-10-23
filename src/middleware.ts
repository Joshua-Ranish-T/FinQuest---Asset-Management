import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes requiring authentication
const protectedPrefixes = [
  '/dashboard',
  '/assets',
  '/liabilities',
  '/money',
  '/goals',
  '/snapshots',
  '/settings',
  '/essentials',
  '/analytics',
  '/profile',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current path requires authentication
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Check authentication cookies: fb-session (signed token) or fb-auth flag
  const hasAuth = request.cookies.has('fb-session') || request.cookies.has('fb-auth');

  if (isProtected && !hasAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already authed and visits /login, redirect to /dashboard
  if (pathname === '/login' && hasAuth) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const target = redirectParam && !redirectParam.startsWith('/login') ? redirectParam : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc.)
     * - api routes (handled directly by API handlers)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
