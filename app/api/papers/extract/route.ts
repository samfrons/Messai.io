import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
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

    // Save to database if requested
    let savedPaper = null
    if (save && session.user?.id) {
      // Check if paper already exists
      const existing = await prisma.paper.findFirst({
        where: {
          OR: [
            { title: paperData.title },
            ...(paperData.doi ? [{ doi: paperData.doi }] : []),
            { externalUrl: url }
          ]
        }
      })

      if (existing) {
        return NextResponse.json(
          { 
            error: 'Paper already exists in database',
            existingId: existing.id 
          },
          { status: 409 }
        )
      }

      // Save new paper
      savedPaper = await prisma.paper.create({
        data: {
          title: paperData.title,
          authors: JSON.stringify(paperData.authors),
          abstract: paperData.abstract || null,
          journal: paperData.journal || null,
          publicationDate: paperData.publicationDate ? new Date(paperData.publicationDate) : null,
          doi: paperData.doi || null,
          externalUrl: url,
          powerOutput: paperData.powerOutput || null,
          efficiency: paperData.efficiency || null,
          systemType: paperData.systemType || 'MFC',
          source: 'zen_extraction',
          dataQuality: 'HIGH',
          isRealPaper: true,
          userId: session.user.id
        }
      })

      console.log(`[API] Saved paper with ID: ${savedPaper.id}`)
    }

    return NextResponse.json({
      success: true,
      data: paperData,
      saved: save,
      paperId: savedPaper?.id || null
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