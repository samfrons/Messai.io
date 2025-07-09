import { NextRequest, NextResponse } from 'next/server'

// Stub for NextAuth's internal logging endpoint
export async function POST(request: NextRequest) {
  // Ignore log requests in research-only version
  return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
  // Ignore log requests in research-only version
  return NextResponse.json({ ok: true })
}