import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'

// GET /api/papers/[id] - Get a single paper
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    const paper = await prisma.researchPaper.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        authors: true,
        abstract: true,
        doi: true,
        pubmedId: true,
        arxivId: true,
        ieeeId: true,
        publicationDate: true,
        journal: true,
        volume: true,
        issue: true,
        pages: true,
        keywords: true,
        externalUrl: true,
        organismTypes: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        powerOutput: true,
        efficiency: true,
        systemType: true,
        source: true,
        uploadedBy: true,
        isPublic: true,
        // AI fields
        aiSummary: true,
        aiKeyFindings: true,
        aiMethodology: true,
        aiImplications: true,
        aiDataExtraction: true,
        aiInsights: true,
        aiProcessingDate: true,
        aiModelVersion: true,
        aiConfidence: true,
        // Timestamps
        createdAt: true,
        updatedAt: true,
        // Relations
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true
          }
        },
        experiments: {
          include: {
            experiment: {
              select: {
                id: true,
                name: true,
                status: true,
                userId: true
              }
            }
          }
        },
        _count: {
          select: { experiments: true }
        }
      }
    })
    
    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      )
    }
    
    // Check access permissions
    if (!paper.isPublic && paper.uploadedBy !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(paper)
  } catch (error) {
    console.error('Error fetching paper:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper' },
      { status: 500 }
    )
  }
}

// PUT /api/papers/[id] - Update a paper
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user owns the paper
    const existingPaper = await prisma.researchPaper.findUnique({
      where: { id },
      select: { uploadedBy: true }
    })
    
    if (!existingPaper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      )
    }
    
    if (existingPaper.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own papers' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    
    // Prepare update data
    const updateData: any = {}
    
    // Update only provided fields
    if (data.title !== undefined) updateData.title = data.title
    if (data.abstract !== undefined) updateData.abstract = data.abstract
    if (data.journal !== undefined) updateData.journal = data.journal
    if (data.volume !== undefined) updateData.volume = data.volume
    if (data.issue !== undefined) updateData.issue = data.issue
    if (data.pages !== undefined) updateData.pages = data.pages
    if (data.externalUrl !== undefined) updateData.externalUrl = data.externalUrl
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic
    if (data.powerOutput !== undefined) updateData.powerOutput = data.powerOutput
    if (data.efficiency !== undefined) updateData.efficiency = data.efficiency
    if (data.systemType !== undefined) updateData.systemType = data.systemType
    
    // Handle JSON fields
    if (data.authors !== undefined) {
      updateData.authors = typeof data.authors === 'string' 
        ? data.authors 
        : JSON.stringify(data.authors)
    }
    
    if (data.keywords !== undefined) {
      updateData.keywords = typeof data.keywords === 'string'
        ? data.keywords
        : JSON.stringify(data.keywords)
    }
    
    if (data.organismTypes !== undefined) {
      updateData.organismTypes = data.organismTypes
        ? (typeof data.organismTypes === 'string' ? data.organismTypes : JSON.stringify(data.organismTypes))
        : null
    }
    
    if (data.anodeMaterials !== undefined) {
      updateData.anodeMaterials = data.anodeMaterials
        ? (typeof data.anodeMaterials === 'string' ? data.anodeMaterials : JSON.stringify(data.anodeMaterials))
        : null
    }
    
    if (data.cathodeMaterials !== undefined) {
      updateData.cathodeMaterials = data.cathodeMaterials
        ? (typeof data.cathodeMaterials === 'string' ? data.cathodeMaterials : JSON.stringify(data.cathodeMaterials))
        : null
    }
    
    if (data.publicationDate !== undefined) {
      updateData.publicationDate = data.publicationDate ? new Date(data.publicationDate) : null
    }
    
    const paper = await prisma.researchPaper.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return NextResponse.json(paper)
  } catch (error: any) {
    console.error('Error updating paper:', error)
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      return NextResponse.json(
        { error: `Paper with this ${field} already exists` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update paper' },
      { status: 500 }
    )
  }
}

// DELETE /api/papers/[id] - Delete a paper
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user owns the paper
    const paper = await prisma.researchPaper.findUnique({
      where: { id },
      select: { uploadedBy: true }
    })
    
    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      )
    }
    
    if (paper.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own papers' },
        { status: 403 }
      )
    }
    
    await prisma.researchPaper.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Paper deleted successfully' })
  } catch (error) {
    console.error('Error deleting paper:', error)
    return NextResponse.json(
      { error: 'Failed to delete paper' },
      { status: 500 }
    )
  }
}