import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes
// Removed '/dashboard' and '/designs' from protected routes to allow public access
const protectedRoutes = ['/experiment', '/profile', '/settings', '/onboarding'];
const authRoutes = ['/auth/login', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Get the token (user session)
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    
    // Check if user has completed onboarding
    // For new users, redirect to welcome page
    if (pathname === '/auth/signup') {
      url.pathname = '/auth/welcome';
    } else {
      url.pathname = '/dashboard';
    }
    
    return NextResponse.redirect(url);
  }
  
  // Protect routes that require authentication
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    // Preserve the original URL as callback
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  // Check email verification for certain routes
  if (isProtectedRoute && token && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
    // Allow limited access to dashboard for unverified users
    if (pathname === '/dashboard' && !token.emailVerified) {
      // User can access dashboard but with limited functionality
      // The dashboard component should check verification status
    } else if (pathname !== '/dashboard' && !token.emailVerified) {
      // Redirect to dashboard for other protected routes
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('verify', 'required');
      return NextResponse.redirect(url);
    }
  }
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Add security headers to all responses
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Add HSTS header for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};