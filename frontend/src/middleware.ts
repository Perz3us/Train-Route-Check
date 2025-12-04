import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes are protected
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/profile',
  '/routes',
  '/stations',
  '/tracking',
];

// Define which routes are public (don't require authentication)
const publicRoutes = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/track',
  '/tracking',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || 
                        pathname.startsWith('/api/') || 
                        pathname.startsWith('/_next/') ||
                        pathname.startsWith('/static/') ||
                        pathname.includes('.') || // Allow static files
                        pathname === '/';
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Get the auth token from cookies
  const token = request.cookies.get('authToken')?.value;
  
  // If it's a protected route and there's no token, redirect to login
  // But only if it's NOT a public route (in case of overlap)
  if (isProtectedRoute && !isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is logged in and trying to access login page, let them through
  // The client-side code will handle the redirect to the appropriate dashboard
  if (pathname === '/login' && token) {
    // We'll let the client-side code handle the redirect
    // to avoid complexity in server-side token verification
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};