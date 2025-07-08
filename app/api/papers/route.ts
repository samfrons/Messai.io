import { NextRequest, NextResponse } from 'next/server'
// Authentication removed for research-only version
import prisma from '@/lib/db'

// GET /api/papers - List papers with pagination
export async function GET(request: NextRequest) {
  try {
    // No authentication in research-only version
    const session = null
    const searchParams = request.nextUrl.searchParams
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const userId = searchParams.get('userId') || undefined
    const realOnly = searchParams.get('realOnly') === 'true'
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    // Research version shows all public papers
    where.isPublic = true
    
    if (userId) {
      where.uploadedBy = userId
    }
    
    // Filter for real papers only if requested
    if (realOnly) {
      const realSources = ['crossref_api', 'arxiv_api', 'pubmed_api', 'local_pdf', 'web_search', 
                          'comprehensive_search', 'advanced_electrode_biofacade_search', 
                          'extensive_electrode_biofacade_collection']
      
      const realPaperConditions = [
        { source: { in: realSources } },
        { doi: { not: null } },
        { arxivId: { not: null } },
        { pubmedId: { not: null } }
      ]
      
      if (where.AND) {
        where.AND.push({ OR: realPaperConditions })
      } else if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: realPaperConditions }
        ]
        delete where.OR
      } else {
        where.OR = realPaperConditions
      }
    }
    
    if (search) {
      const searchConditions = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { keywords: { contains: search, mode: 'insensitive' } },
        { journal: { contains: search, mode: 'insensitive' } },
        { authors: { contains: search, mode: 'insensitive' } }
      ]
      
      if (where.OR) {
        // Combine visibility OR with search OR using AND
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ]
        delete where.OR
      } else {
        where.OR = searchConditions
      }
    }
    
    const [papers, total] = await Promise.all([
      prisma.researchPaper.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          authors: true,
          abstract: true,
          journal: true,
          publicationDate: true,
          systemType: true,
          powerOutput: true,
          doi: true,
          externalUrl: true,
          source: true,
          arxivId: true,
          pubmedId: true,
          efficiency: true,
          uploadedBy: true,
          createdAt: true,
          updatedAt: true,
          // Enhanced AI extraction fields
          anodeMaterials: true,
          cathodeMaterials: true,
          organismTypes: true,
          aiDataExtraction: true,
          aiModelVersion: true,
          aiProcessingDate: true,
          aiConfidence: true,
          keywords: true
        }
      }),
      prisma.researchPaper.count({ where })
    ])
    
    // Transform papers to parse JSON fields and provide cleaner data
    const transformedPapers = papers.map(paper => {
      // Parse JSON fields safely
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

      return {
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
    })
    
    return NextResponse.json({
      papers: transformedPapers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching papers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    )
  }
}

// POST /api/papers - Create a new paper
export async function POST(request: NextRequest) {
  // Paper creation disabled in research-only version
  return NextResponse.json(
    { error: 'Paper creation is not available in research-only version' },
    { status: 403 }
  )
}