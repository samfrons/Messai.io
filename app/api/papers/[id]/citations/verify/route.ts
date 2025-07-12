import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { verifyCitations } from '@/lib/citation-verifier'
import { getDemoConfig } from '@/lib/demo-mode'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          error: 'Citation verification not available in demo mode',
          isDemo: true 
        },
        { status: 403 }
      )
    }

    const { id: paperId } = await params

    // Verify citations
    const result = await verifyCitations(paperId)

    return NextResponse.json({
      success: true,
      paperId: result.paperId,
      title: result.title,
      verifiedCount: result.verifiedCitations.length,
      unverifiedCount: result.unverifiedCitations.length,
      citedByCount: result.citedByCount,
      citationNetworkSize: result.citationNetworkSize,
      verifiedCitations: result.verifiedCitations,
      unverifiedCitations: result.unverifiedCitations
    })

  } catch (error) {
    if (error instanceof Error && error.message === 'Paper not found') {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message.includes('RATE_LIMIT')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to verify citations' },
      { status: 500 }
    )
  }
}