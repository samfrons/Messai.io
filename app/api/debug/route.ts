import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
  });
}