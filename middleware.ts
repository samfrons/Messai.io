import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Research-only version - minimal middleware
export async function middleware(request: NextRequest) {
  // Research version - no authentication or protected routes
  // Just pass through all requests
  return NextResponse.next();
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