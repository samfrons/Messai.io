import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { discoverPapers } from '@/lib/zen-browser'
import { getDemoConfig } from '@/lib/demo-mode'
import { z } from 'zod'

const discoverPapersSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters'),
  sources: z.array(z.enum(['crossref', 'arxiv', 'pubmed'])).optional(),
  limit: z.number().min(1).max(20).optional().default(5)
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
          error: 'Paper discovery not available in demo mode',
          isDemo: true,
          suggestion: 'Use the existing database of 4,380+ papers for demo purposes'
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = discoverPapersSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { query, sources, limit } = validation.data

    // Discover papers
    console.log(`[API] Discovering papers for query: "${query}"`)
    const papers = await discoverPapers(query, { sources, limit })

    // Filter and format results
    const formattedPapers = papers
      .filter(p => p.title && p.authors && p.authors.length > 0)
      .map(paper => ({
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract || null,
        journal: paper.journal || null,
        publicationDate: paper.publicationDate || null,
        doi: paper.doi || null,
        url: paper.url || null,
        powerOutput: paper.powerOutput || null,
        efficiency: paper.efficiency || null,
        systemType: paper.systemType || null,
        keywords: paper.keywords || []
      }))

    return NextResponse.json({
      success: true,
      query,
      sources: sources || ['crossref', 'arxiv', 'pubmed'],
      count: formattedPapers.length,
      papers: formattedPapers
    })

  } catch (error) {
    console.error('[API] Paper discovery error:', error)
    
    if (error instanceof Error && error.message.includes('RATE_LIMIT')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to discover papers' },
      { status: 500 }
    )
  }
}