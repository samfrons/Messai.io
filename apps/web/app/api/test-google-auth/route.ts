import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3003';
  
  return NextResponse.json({
    configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    clientIdSet: !!process.env.GOOGLE_CLIENT_ID,
    clientSecretSet: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    callbackUrl: `${baseUrl}/api/auth/callback/google`,
    expectedRedirectUris: [
      `${baseUrl}/api/auth/callback/google`,
      'http://localhost:3003/api/auth/callback/google',
      'https://www.messai.io/api/auth/callback/google',
      'https://messai-red.vercel.app/api/auth/callback/google',
    ],
    nodeEnv: process.env.NODE_ENV,
  });
}