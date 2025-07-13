import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // This API route handles production domain routing
  // In production (messai.io), it serves the marketing content
  
  const host = req.headers.get('host')
  const pathname = req.nextUrl.pathname
  
  // If accessing from messai.io, serve marketing content
  if (host === 'messai.io' || host === 'www.messai.io') {
    // In a real setup, this would proxy to the marketing worktree
    // For now, return a redirect to indicate production mode
    return NextResponse.redirect(new URL('/marketing', req.url))
  }
  
  // For app.messai.io or other domains, continue with the app
  return NextResponse.next()
}

export async function POST(req: NextRequest) {
  return GET(req)
}