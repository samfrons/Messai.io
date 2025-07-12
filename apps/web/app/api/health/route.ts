import { NextResponse } from 'next/server'

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      core: 'operational',
      ui: 'operational',
      api: 'operational'
    },
    environment: process.env.NODE_ENV || 'development'
  }

  return NextResponse.json(healthCheck)
}