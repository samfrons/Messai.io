import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCitationManager } from '@/lib/citation-relationships'

const prisma = new PrismaClient()
const citationManager = getCitationManager(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paperId = params.id
    const { searchParams } = new URL(request.url)
    const depth = parseInt(searchParams.get('depth') || '1', 10)

    if (!paperId) {
      return NextResponse.json(
        { error: 'Paper ID is required' },
        { status: 400 }
      )
    }

    // Check if paper exists
    const mainPaper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      select: { id: true, title: true }
    })

    if (!mainPaper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      )
    }

    // Use citation manager to build network
    const networkData = await citationManager.buildCitationNetwork(paperId, depth)

    return NextResponse.json(networkData)

  } catch (error) {
    console.error('Citation network error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}