import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Middleware function with authentication
export default withAuth(
  function middleware(req) {
    const token = (req as any).nextauth?.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isPublicPage = ['/', '/about', '/docs', '/api/predictions'].includes(req.nextUrl.pathname);

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Add security headers
    const response = NextResponse.next();
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
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
        const isPublicPage = ['/', '/about', '/docs', '/api/predictions'].includes(req.nextUrl.pathname);
        
        // Allow access to auth pages and public pages
        if (isAuthPage || isPublicPage) {
          return true;
        }

        // Require authentication for all other pages
        return !!token;
      },
    },
  }
);

// Configure which routes need authentication
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