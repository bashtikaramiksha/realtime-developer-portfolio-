import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-jwt-key-minimum-32-characters-long-123456'
);

// Define protected and auth-only routes
const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ONLY_ROUTES = ['/login', '/signup', '/forgot-password'];

async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    await jose.jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-page routes (extra safety net)
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Determine authentication state
  let isAuthenticated = false;
  if (accessToken) {
    isAuthenticated = await verifyAccessToken(accessToken);
  }

  // Case 1: Route is protected (e.g., /dashboard)
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    // If access token is expired but refresh token exists, let the page load
    // and let the client-side AuthContext handle the token refresh
    if (refreshToken) {
      // Allow through — the client-side AuthContext.checkSession() will
      // call /api/auth/refresh to get a new access token
      return NextResponse.next();
    }

    // No tokens at all — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clean up any stale access token cookie
    if (accessToken) {
      response.cookies.delete('access_token');
    }
    return response;
  }

  // Case 2: Route is auth-only (e.g., /login, /signup) and user is already authenticated
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(route => pathname.startsWith(route));
  if (isAuthOnlyRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (all Next.js internals: static files, images, HMR websocket, etc.)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
