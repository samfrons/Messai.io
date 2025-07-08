import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    console.log('Public papers API called')
    
    // Direct query without any auth or complex logic
    const papers = await prisma.researchPaper.findMany({
      where: { isPublic: true },
      take: 5,
      select: {
        id: true,
        title: true,
        authors: true,
        abstract: true,
        source: true,
        doi: true,
        createdAt: true,
        _count: {
          select: { experiments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ 
      success: true,
      papers,
      count: papers.length 
    })
  } catch (error: any) {
    console.error('Public papers API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}