import { NextRequest, NextResponse } from 'next/server'
// Authentication removed for research-only version
import { zenBrowser } from '@/lib/zen-browser'
import { getDemoConfig } from '@/lib/demo-mode'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const extractPaperSchema = z.object({
  url: z.string().url('Invalid URL format'),
  save: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    // No authentication in research-only version

    // Check demo mode
    const demoConfig = getDemoConfig()
    if (demoConfig.isDemo) {
      return NextResponse.json(
        { 
          error: 'Paper extraction not available in demo mode',
          isDemo: true 
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = extractPaperSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { url, save } = validation.data

    // Extract paper data
    console.log(`[API] Extracting paper from: ${url}`)
    const paperData = await zenBrowser.extractPaper(url)

    // Validate extracted data
    if (!paperData.title || !paperData.authors || paperData.authors.length === 0) {
      return NextResponse.json(
        { 
          error: 'Could not extract sufficient paper metadata',
          data: paperData 
        },
        { status: 422 }
      )
    }

    // Saving disabled in research-only version
    const savedPaper = null

    return NextResponse.json({
      success: true,
      data: paperData,
      saved: false,
      paperId: null
    })

  } catch (error) {
    console.error('[API] Paper extraction error:', error)
    
    if (error instanceof Error && error.message.includes('RATE_LIMIT')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to extract paper data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}