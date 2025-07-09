import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../../app/api/papers/route'
import prisma from '../../lib/db'

// Mock Prisma
vi.mock('../../lib/db', () => ({
  default: {
    researchPaper: {
      findMany: vi.fn(),
      count: vi.fn()
    }
  }
}))

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => null)
}))

describe('/api/papers - Filtering Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockPapers = [
    {
      id: '1',
      title: 'MFC with Geobacter',
      authors: JSON.stringify(['Author 1']),
      abstract: 'Study of microbial fuel cells',
      doi: '10.1016/test.2024.001',
      source: 'crossref_api',
      anodeMaterials: JSON.stringify(['carbon cloth']),
      cathodeMaterials: JSON.stringify(['platinum']),
      organismTypes: JSON.stringify(['Geobacter']),
      powerOutput: 1500,
      efficiency: 85,
      isPublic: true,
      _count: { experiments: 2 }
    },
    {
      id: '2',
      title: 'MEC for Hydrogen',
      authors: JSON.stringify(['Author 2']),
      abstract: 'Hydrogen production in MEC',
      doi: '10.1016/test.2024.002',
      source: 'pubmed_api',
      isPublic: true,
      _count: { experiments: 0 }
    }
  ]

  describe('Real Papers Filtering', () => {
    it('should filter real papers when realOnly=true', async () => {
      prisma.researchPaper.findMany.mockResolvedValue(mockPapers)
      prisma.researchPaper.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/papers?realOnly=true')
      const response = await GET(request)
      const data = await response.json()

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      expect(findManyCall.where.OR).toBeDefined()
      
      // Should include all real sources
      const sources = findManyCall.where.OR.find(condition => condition.source)?.source.in
      expect(sources).toContain('crossref_api')
      expect(sources).toContain('crossref_comprehensive')
      expect(sources).toContain('pubmed_api')
      expect(sources).toContain('pubmed_comprehensive')
      expect(sources).toContain('arxiv_api')
    })

    it('should show all papers when realOnly=false', async () => {
      prisma.researchPaper.findMany.mockResolvedValue(mockPapers)
      prisma.researchPaper.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/papers?realOnly=false')
      const response = await GET(request)
      
      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      expect(findManyCall.where.OR).toBeUndefined()
    })
  })

  describe('Search Functionality', () => {
    it('should search across multiple fields', async () => {
      prisma.researchPaper.findMany.mockResolvedValue([mockPapers[0]])
      prisma.researchPaper.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/papers?search=Geobacter')
      const response = await GET(request)

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      const searchConditions = findManyCall.where.AND[1].OR

      // Should search in title, abstract, keywords, journal, and authors
      expect(searchConditions).toHaveLength(5)
      expect(searchConditions[0].title.contains).toBe('Geobacter')
      expect(searchConditions[0].title.mode).toBe('insensitive')
    })

    it('should combine search with real papers filter', async () => {
      prisma.researchPaper.findMany.mockResolvedValue([])
      prisma.researchPaper.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/papers?search=MFC&realOnly=true')
      const response = await GET(request)

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      expect(findManyCall.where.AND).toHaveLength(2)
      expect(findManyCall.where.AND[0].OR).toBeDefined() // Real papers filter
      expect(findManyCall.where.AND[1].OR).toBeDefined() // Search conditions
    })
  })

  describe('Pagination', () => {
    it('should paginate results correctly', async () => {
      prisma.researchPaper.findMany.mockResolvedValue(mockPapers)
      prisma.researchPaper.count.mockResolvedValue(25)

      const request = new NextRequest('http://localhost:3000/api/papers?page=2&limit=10')
      const response = await GET(request)
      const data = await response.json()

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      expect(findManyCall.skip).toBe(10)
      expect(findManyCall.take).toBe(10)

      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3
      })
    })

    it('should use default pagination values', async () => {
      prisma.researchPaper.findMany.mockResolvedValue(mockPapers)
      prisma.researchPaper.count.mockResolvedValue(100)

      const request = new NextRequest('http://localhost:3000/api/papers')
      const response = await GET(request)
      const data = await response.json()

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      expect(findManyCall.skip).toBe(0)
      expect(findManyCall.take).toBe(10)
    })

    it('should limit maximum page size', async () => {
      prisma.researchPaper.findMany.mockResolvedValue([])
      prisma.researchPaper.count.mockResolvedValue(1000)

      const request = new NextRequest('http://localhost:3000/api/papers?limit=200')
      const response = await GET(request)

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      expect(findManyCall.take).toBe(100) // Should cap at 100
    })
  })

  describe('Data Transformation', () => {
    it('should parse JSON fields in response', async () => {
      prisma.researchPaper.findMany.mockResolvedValue([mockPapers[0]])
      prisma.researchPaper.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/papers')
      const response = await GET(request)
      const data = await response.json()

      const paper = data.papers[0]
      expect(Array.isArray(paper.authors)).toBe(true)
      expect(paper.authors).toEqual(['Author 1'])
      expect(Array.isArray(paper.anodeMaterials)).toBe(true)
      expect(paper.anodeMaterials).toEqual(['carbon cloth'])
      expect(Array.isArray(paper.organismTypes)).toBe(true)
      expect(paper.organismTypes).toEqual(['Geobacter'])
    })

    it('should add computed fields', async () => {
      prisma.researchPaper.findMany.mockResolvedValue([mockPapers[0]])
      prisma.researchPaper.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/papers')
      const response = await GET(request)
      const data = await response.json()

      const paper = data.papers[0]
      expect(paper.hasPerformanceData).toBe(true)
      expect(paper.isAiProcessed).toBe(false)
    })

    it('should handle null/undefined values gracefully', async () => {
      const paperWithNulls = {
        ...mockPapers[0],
        anodeMaterials: null,
        cathodeMaterials: undefined,
        organismTypes: 'invalid json'
      }
      
      prisma.researchPaper.findMany.mockResolvedValue([paperWithNulls])
      prisma.researchPaper.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/papers')
      const response = await GET(request)
      const data = await response.json()

      const paper = data.papers[0]
      expect(paper.anodeMaterials).toBeNull()
      expect(paper.cathodeMaterials).toBeNull()
      expect(paper.organismTypes).toBe('invalid json') // Falls back to original
    })
  })

  describe('User-specific Filtering', () => {
    it('should filter by userId when provided', async () => {
      prisma.researchPaper.findMany.mockResolvedValue([])
      prisma.researchPaper.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/papers?userId=user123')
      const response = await GET(request)

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      expect(findManyCall.where.uploadedBy).toBe('user123')
    })

    it('should combine userId with other filters', async () => {
      prisma.researchPaper.findMany.mockResolvedValue([])
      prisma.researchPaper.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/papers?userId=user123&realOnly=true')
      const response = await GET(request)

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      expect(findManyCall.where.uploadedBy).toBe('user123')
      expect(findManyCall.where.OR).toBeDefined() // Real papers filter
    })
  })

  describe('Ordering', () => {
    it('should order by createdAt descending by default', async () => {
      prisma.researchPaper.findMany.mockResolvedValue(mockPapers)
      prisma.researchPaper.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/papers')
      const response = await GET(request)

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      expect(findManyCall.orderBy).toEqual({ createdAt: 'desc' })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      prisma.researchPaper.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/papers')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch papers')
    })
  })

  describe('Source Filtering Enhancement', () => {
    it('should include all comprehensive sources in real papers filter', async () => {
      prisma.researchPaper.findMany.mockResolvedValue([])
      prisma.researchPaper.count.mockResolvedValue(6022)

      const request = new NextRequest('http://localhost:3000/api/papers?realOnly=true')
      const response = await GET(request)

      const findManyCall = prisma.researchPaper.findMany.mock.calls[0][0]
      const sources = findManyCall.where.OR.find(condition => condition.source)?.source.in

      // Should include both regular and comprehensive sources
      expect(sources).toContain('crossref_api')
      expect(sources).toContain('crossref_comprehensive')
      expect(sources).toContain('pubmed_api')
      expect(sources).toContain('pubmed_comprehensive')
      expect(sources).toContain('arxiv_api')
      
      // Should support additional sources
      expect(sources).toContain('comprehensive_search')
      expect(sources).toContain('advanced_electrode_biofacade_search')
    })
  })
})