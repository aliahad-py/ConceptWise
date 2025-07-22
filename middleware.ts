
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/studio'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseIdToken');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // Redirect to login page if trying to access a protected route without a token
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    // Redirect to studio if trying to access an auth route with a token
    const url = request.nextUrl.clone();
    url.pathname = '/studio';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
