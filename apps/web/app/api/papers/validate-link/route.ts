import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { zenBrowser } from '@/lib/zen-browser'
import { getDemoConfig } from '@/lib/demo-mode'
import { z } from 'zod'

const validateLinkSchema = z.object({
  url: z.string().url('Invalid URL format')
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check demo mode
    const demoConfig = getDemoConfig()
    if (demoConfig.isDemo) {
      return NextResponse.json(
        { 
          error: 'Link validation not available in demo mode',
          isDemo: true 
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateLinkSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { url } = validation.data

    // Validate the link
    console.log(`[API] Validating link: ${url}`)
    const isValid = await zenBrowser.validateLink(url)

    return NextResponse.json({
      url,
      isValid,
      checkedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('[API] Link validation error:', error)
    
    if (error instanceof Error && error.message.includes('RATE_LIMIT')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to validate link' },
      { status: 500 }
    )
  }
}