import { NextRequest, NextResponse } from 'next/server'

// Stub NextAuth API route for research-only version
// This prevents client-side errors when NextAuth tries to reach these endpoints

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url)
  
  // Handle different NextAuth endpoints
  if (pathname.endsWith('/session')) {
    // Return empty session
    return NextResponse.json({})
  }
  
  if (pathname.endsWith('/providers')) {
    // Return empty providers list
    return NextResponse.json({})
  }
  
  if (pathname.endsWith('/csrf')) {
    // Return dummy CSRF token
    return NextResponse.json({ csrfToken: 'dummy-csrf-token' })
  }
  
  // Default response for other auth endpoints
  return NextResponse.json({ message: 'Auth disabled in research-only version' })
}

export async function POST(request: NextRequest) {
  // Handle signin/signout/callback posts
  return NextResponse.json({ message: 'Auth disabled in research-only version' })
}