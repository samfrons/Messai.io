import { NextRequest, NextResponse } from 'next/server'
// Authentication removed for research-only version
import prisma from '@/lib/db'

// GET /api/papers/[id] - Get a single paper
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // No authentication in research-only version
    const session = null
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
    
    // Research version shows all public papers
    if (!paper.isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Transform paper data similar to list endpoint
    const parseJsonField = (field: string | null): any => {
      if (!field) return null
      
      // If it's already an array or object, return as-is
      if (typeof field === 'object') return field
      
      // Handle string fields
      if (typeof field === 'string') {
        const trimmed = field.trim()
        
        // Skip obviously non-JSON strings
        if (!trimmed.startsWith('[') && !trimmed.startsWith('{') && !trimmed.startsWith('"')) {
          return field
        }
        
        try {
          const parsed = JSON.parse(trimmed)
          // If parsed result is an object, make sure it's properly handled
          if (typeof parsed === 'object' && parsed !== null) {
            if (Array.isArray(parsed)) {
              return parsed.filter(item => item && typeof item === 'string' && item.trim().length > 0)
            }
            // Convert object to array of values if it has string values
            if (typeof parsed === 'object') {
              const values = Object.values(parsed).filter(val => typeof val === 'string' && val.trim().length > 0)
              return values.length > 0 ? values : null
            }
          }
          return parsed
        } catch {
          return field
        }
      }
      
      return field
    }

    // Parse AI extraction data
    let aiData = null
    if (paper.aiDataExtraction) {
      try {
        aiData = JSON.parse(paper.aiDataExtraction)
      } catch {
        aiData = null
      }
    }

    const transformedPaper = {
      ...paper,
      // Parse JSON string fields into arrays/objects
      authors: parseJsonField(paper.authors),
      anodeMaterials: parseJsonField(paper.anodeMaterials),
      cathodeMaterials: parseJsonField(paper.cathodeMaterials),
      organismTypes: parseJsonField(paper.organismTypes),
      keywords: parseJsonField(paper.keywords),
      // Add processed AI data for easy frontend access
      aiData,
      // Enhanced display fields
      hasPerformanceData: !!(paper.powerOutput || paper.efficiency || (paper.keywords && paper.keywords.includes('HAS_PERFORMANCE_DATA'))),
      isAiProcessed: !!paper.aiProcessingDate,
      processingMethod: paper.aiModelVersion || null,
      confidenceScore: paper.aiConfidence || null
    }
    
    return NextResponse.json(transformedPaper)
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
  // Updates disabled in research-only version
  return NextResponse.json(
    { error: 'Paper updates are not available in research-only version' },
    { status: 403 }
  )
}

// DELETE /api/papers/[id] - Delete a paper
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Deletion disabled in research-only version
  return NextResponse.json(
    { error: 'Paper deletion is not available in research-only version' },
    { status: 403 }
  )
}