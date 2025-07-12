import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'
import { createStringFilter, createSearchFilters } from '@/lib/database-utils'

// GET /api/papers - List papers with pagination and advanced filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const userId = searchParams.get('userId') || undefined
    const realOnly = searchParams.get('realOnly') === 'true'
    const requireMicrobial = searchParams.get('requireMicrobial') !== 'false' // Default true
    const algaeOnly = searchParams.get('algaeOnly') === 'true'
    
    // Advanced filters
    const microbes = searchParams.get('microbes')?.split(',').filter(Boolean) || []
    const systemTypes = searchParams.get('systemTypes')?.split(',').filter(Boolean) || []
    const configurations = searchParams.get('configurations')?.split(',').filter(Boolean) || []
    const minPower = searchParams.get('minPower') ? parseFloat(searchParams.get('minPower')!) : null
    const minEfficiency = searchParams.get('minEfficiency') ? parseFloat(searchParams.get('minEfficiency')!) : null
    const hasFullData = searchParams.get('hasFullData') === 'true'
    const sortBy = searchParams.get('sortBy') || 'date' // date, power, efficiency, relevance
    
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
                          'extensive_electrode_biofacade_collection', 'crossref_comprehensive',
                          'pubmed_comprehensive']
      
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
        { title: createStringFilter(search) },
        { abstract: createStringFilter(search) },
        { keywords: createStringFilter(search) },
        { journal: createStringFilter(search) },
        { authors: createStringFilter(search) }
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
    
    // Advanced filters
    const advancedFilters: any[] = []
    
    // Microbe filter - search in multiple fields
    if (microbes.length > 0) {
      const microbeConditions = microbes.map(microbe => ({
        OR: [
          { organismTypes: createStringFilter(microbe) },
          { microbialCommunity: createStringFilter(microbe) },
          { microbialClassification: createStringFilter(microbe) },
          { abstract: createStringFilter(microbe) }
        ]
      }))
      advancedFilters.push({ OR: microbeConditions })
    }
    
    // System type filter - enhanced with configuration data
    if (systemTypes.length > 0) {
      const systemConditions = systemTypes.map(type => ({
        OR: [
          { systemType: type },
          { systemConfiguration: createStringFilter(`"type":"${type}"`) }
        ]
      }))
      advancedFilters.push({ OR: systemConditions })
    }
    
    // Configuration filter
    if (configurations.length > 0) {
      const configConditions = configurations.map(config => ({
        systemConfiguration: createStringFilter(config)
      }))
      advancedFilters.push({ OR: configConditions })
    }
    
    // Performance filters
    if (minPower !== null) {
      advancedFilters.push({ powerOutput: { gte: minPower } })
    }
    
    if (minEfficiency !== null) {
      advancedFilters.push({ efficiency: { gte: minEfficiency } })
    }
    
    // Has full data filter
    if (hasFullData) {
      advancedFilters.push({
        AND: [
          { powerOutput: { not: null } },
          { efficiency: { not: null } },
          { systemConfiguration: { not: null } },
          { microbialCommunity: { not: null } }
        ]
      })
    }
    
    // Apply advanced filters
    if (advancedFilters.length > 0) {
      if (!where.AND) {
        where.AND = []
      } else if (!Array.isArray(where.AND)) {
        where.AND = [where.AND]
      }
      where.AND.push(...advancedFilters)
    }
    
    // Microbial relevance filter
    if (requireMicrobial || algaeOnly) {
      const microbialKeywords = [
        'microb', 'bacteria', 'biofilm', 'bioelectrochemical', 'microorganism',
        'biological', 'biocathode', 'bioanode', 'electroactive', 'electrogenic',
        'geobacter', 'shewanella', 'pseudomonas', 'consortium', 'mfc', 'mec', 'mdc', 'mes'
      ]
      
      const algaeKeywords = [
        'algae', 'algal', 'microalgae', 'chlorella', 'spirulina', 'chlamydomonas',
        'cyanobacteria', 'photosynthetic', 'phototrophic', 'biophotovoltaic'
      ]
      
      const keywordsToUse = algaeOnly ? algaeKeywords : [...microbialKeywords, ...algaeKeywords]
      
      // Create conditions for each field we want to check
      const fieldConditions = keywordsToUse.map(keyword => ({
        OR: [
          { title: createStringFilter(keyword) },
          { abstract: createStringFilter(keyword) },
          { keywords: createStringFilter(keyword) },
          { organismTypes: createStringFilter(keyword) },
          { microbialCommunity: createStringFilter(keyword) }
        ]
      }))
      
      // Papers must match at least one keyword in at least one field
      if (fieldConditions.length > 0) {
        if (!where.AND) {
          where.AND = []
        } else if (!Array.isArray(where.AND)) {
          where.AND = [where.AND]
        }
        where.AND.push({ OR: fieldConditions })
      }
    }
    
    // Determine sort order
    let orderBy: any = { createdAt: 'desc' } // default
    
    switch (sortBy) {
      case 'power':
        orderBy = { powerOutput: 'desc' }
        break
      case 'efficiency':
        orderBy = { efficiency: 'desc' }
        break
      case 'relevance':
        // For relevance, we'll use a combination of factors
        // This is simplified - in production, use a scoring algorithm
        orderBy = [
          { powerOutput: 'desc' },
          { efficiency: 'desc' },
          { createdAt: 'desc' }
        ]
        break
      case 'date':
      default:
        orderBy = { createdAt: 'desc' }
    }
    
    const [papers, total] = await Promise.all([
      prisma.researchPaper.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          keywords: true,
          // New categorization fields
          microbialCommunity: true,
          microbialClassification: true,
          systemConfiguration: true,
          performanceBenchmarks: true
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
        // Parse new categorization fields
        microbialCommunity: parseJsonField(paper.microbialCommunity),
        microbialClassification: parseJsonField(paper.microbialClassification),
        systemConfiguration: parseJsonField(paper.systemConfiguration),
        performanceBenchmarks: parseJsonField(paper.performanceBenchmarks),
        // Enhanced display fields
        hasPerformanceData: !!(paper.powerOutput || paper.efficiency || paper.performanceBenchmarks || (paper.keywords && paper.keywords.includes('HAS_PERFORMANCE_DATA'))),
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
        uploadedBy: session?.user?.id || null,
        isPublic: data.isPublic !== false
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