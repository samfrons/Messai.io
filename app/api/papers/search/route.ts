import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'

// GET /api/papers/search - Advanced search with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    
    // Extract search parameters
    const query = searchParams.get('q') || ''
    const systemType = searchParams.get('systemType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const journal = searchParams.get('journal')
    const hasOrganism = searchParams.get('hasOrganism') === 'true'
    const minPower = searchParams.get('minPower')
    const maxPower = searchParams.get('maxPower')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const skip = (page - 1) * limit
    
    // Build complex where clause
    const where: any = {}
    
    // Base visibility filter
    if (session?.user?.id) {
      where.OR = [
        { isPublic: true },
        { uploadedBy: session.user.id }
      ]
    } else {
      where.isPublic = true
    }
    
    // Full-text search across multiple fields
    if (query) {
      where.AND = where.AND || []
      where.AND.push({
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { abstract: { contains: query, mode: 'insensitive' } },
          { keywords: { contains: query, mode: 'insensitive' } },
          { authors: { contains: query, mode: 'insensitive' } },
          { journal: { contains: query, mode: 'insensitive' } }
        ]
      })
    }
    
    // Filter by system type
    if (systemType) {
      where.systemType = systemType
    }
    
    // Date range filter
    if (startDate || endDate) {
      where.publicationDate = {}
      if (startDate) {
        where.publicationDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.publicationDate.lte = new Date(endDate)
      }
    }
    
    // Journal filter
    if (journal) {
      where.journal = { contains: journal, mode: 'insensitive' }
    }
    
    // MES-specific filters
    if (hasOrganism) {
      where.organismTypes = { not: null }
    }
    
    if (minPower || maxPower) {
      where.powerOutput = {}
      if (minPower) {
        where.powerOutput.gte = parseFloat(minPower)
      }
      if (maxPower) {
        where.powerOutput.lte = parseFloat(maxPower)
      }
    }
    
    // Execute search with pagination
    const [papers, total, facets] = await Promise.all([
      prisma.researchPaper.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { publicationDate: 'desc' },
          { createdAt: 'desc' }
        ],
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
      }),
      prisma.researchPaper.count({ where }),
      // Get facets for filtering
      prisma.researchPaper.groupBy({
        by: ['systemType', 'journal'],
        where: query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { abstract: { contains: query, mode: 'insensitive' } },
            { keywords: { contains: query, mode: 'insensitive' } }
          ]
        } : undefined,
        _count: true
      })
    ])
    
    // Process facets
    const systemTypeFacets = facets
      .filter(f => f.systemType)
      .reduce((acc, f) => {
        acc[f.systemType!] = f._count
        return acc
      }, {} as Record<string, number>)
    
    const journalFacets = facets
      .filter(f => f.journal)
      .reduce((acc, f) => {
        acc[f.journal!] = f._count
        return acc
      }, {} as Record<string, number>)
    
    return NextResponse.json({
      papers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      facets: {
        systemTypes: systemTypeFacets,
        journals: Object.entries(journalFacets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .reduce((acc, [k, v]) => {
            acc[k] = v
            return acc
          }, {} as Record<string, number>)
      }
    })
  } catch (error) {
    console.error('Error searching papers:', error)
    return NextResponse.json(
      { error: 'Failed to search papers' },
      { status: 500 }
    )
  }
}