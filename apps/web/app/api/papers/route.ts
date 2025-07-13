import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'

// GET /api/papers - List papers with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const userId = searchParams.get('userId') || undefined
    const realOnly = searchParams.get('realOnly') === 'true'
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    // Base visibility filter
    if (session?.user?.id) {
      // Authenticated users see public papers + their own papers
      where.OR = [
        { isPublic: true },
        { uploadedBy: session.user.id }
      ]
    } else {
      // Unauthenticated users see only public papers
      where.isPublic = true
    }
    
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
          // Include AI fields
          aiSummary: true,
          aiKeyFindings: true,
          aiInsights: true,
          aiProcessingDate: true,
          aiConfidence: true,
          // Include relations
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
      }),
      prisma.researchPaper.count({ where })
    ])
    
    return NextResponse.json({
      papers,
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
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.authors || !data.externalUrl) {
      return NextResponse.json(
        { error: 'Title, authors, and external URL are required' },
        { status: 400 }
      )
    }
    
    // Ensure authors and keywords are JSON strings
    const authors = typeof data.authors === 'string' 
      ? data.authors 
      : JSON.stringify(data.authors)
    
    const keywords = typeof data.keywords === 'string'
      ? data.keywords
      : JSON.stringify(data.keywords || [])
    
    // Handle MES-specific fields
    const organismTypes = data.organismTypes
      ? (typeof data.organismTypes === 'string' ? data.organismTypes : JSON.stringify(data.organismTypes))
      : null
      
    const anodeMaterials = data.anodeMaterials
      ? (typeof data.anodeMaterials === 'string' ? data.anodeMaterials : JSON.stringify(data.anodeMaterials))
      : null
      
    const cathodeMaterials = data.cathodeMaterials
      ? (typeof data.cathodeMaterials === 'string' ? data.cathodeMaterials : JSON.stringify(data.cathodeMaterials))
      : null
    
    const paper = await prisma.researchPaper.create({
      data: {
        title: data.title,
        authors,
        abstract: data.abstract || null,
        doi: data.doi || null,
        pubmedId: data.pubmedId || null,
        arxivId: data.arxivId || null,
        ieeeId: data.ieeeId || null,
        publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
        journal: data.journal || null,
        volume: data.volume || null,
        issue: data.issue || null,
        pages: data.pages || null,
        keywords,
        externalUrl: data.externalUrl,
        organismTypes,
        anodeMaterials,
        cathodeMaterials,
        powerOutput: data.powerOutput || null,
        efficiency: data.efficiency || null,
        systemType: data.systemType || null,
        source: data.source || 'user',
        uploadedBy: session.user.id,
        isPublic: data.isPublic !== false
      },
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
    
    return NextResponse.json(paper, { status: 201 })
  } catch (error: any) {
    console.error('Error creating paper:', error)
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      return NextResponse.json(
        { error: `Paper with this ${field} already exists` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create paper' },
      { status: 500 }
    )
  }
}