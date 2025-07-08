import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Simple papers API called')
    
    // Simple query - just get 10 public papers
    const papers = await prisma.researchPaper.findMany({
      where: { isPublic: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { experiments: true }
        }
      }
    })
    
    console.log(`Found ${papers.length} papers`)
    
    return NextResponse.json({
      papers,
      count: papers.length
    })
  } catch (error) {
    console.error('Error in simple papers API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch papers', details: error },
      { status: 500 }
    )
  }
}