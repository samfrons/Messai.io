import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/papers/route'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/db'

// Mock dependencies
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn()
}))

vi.mock('@/lib/db', () => ({
  default: {
    researchPaper: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn()
    }
  }
}))

vi.mock('@/lib/auth/auth-options', () => ({
  authOptions: {}
}))

describe('/api/papers API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/papers', () => {
    it('filters real papers when realOnly=true', async () => {
      const mockPapers = [
        {
          id: '1',
          title: 'Real Paper',
          source: 'crossref_api',
          doi: '10.1234/test',
          user: { id: '1', name: 'Test', email: 'test@example.com' },
          _count: { experiments: 0 }
        }
      ]

      vi.mocked(getServerSession).mockResolvedValue(null)
      vi.mocked(prisma.researchPaper.findMany).mockResolvedValue(mockPapers)
      vi.mocked(prisma.researchPaper.count).mockResolvedValue(1)

      const url = new URL('http://localhost/api/papers?realOnly=true&page=1&limit=10')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.papers).toEqual(mockPapers)
      expect(data.pagination.total).toBe(1)

      // Verify the where clause includes real paper filters
      const findManyCall = vi.mocked(prisma.researchPaper.findMany).mock.calls[0][0]
      expect(findManyCall.where).toMatchObject({
        isPublic: true,
        OR: expect.arrayContaining([
          { source: { in: expect.arrayContaining(['crossref_api', 'arxiv_api', 'pubmed_api']) } },
          { doi: { not: null } },
          { arxivId: { not: null } },
          { pubmedId: { not: null } }
        ])
      })
    })

    it('shows all papers when realOnly=false', async () => {
      const mockPapers = [
        {
          id: '1',
          title: 'Real Paper',
          source: 'crossref_api',
          user: { id: '1', name: 'Test', email: 'test@example.com' },
          _count: { experiments: 0 }
        },
        {
          id: '2',
          title: 'AI Paper',
          source: 'ai_smart_literature',
          user: { id: '2', name: 'AI', email: 'ai@example.com' },
          _count: { experiments: 0 }
        }
      ]

      vi.mocked(getServerSession).mockResolvedValue(null)
      vi.mocked(prisma.researchPaper.findMany).mockResolvedValue(mockPapers)
      vi.mocked(prisma.researchPaper.count).mockResolvedValue(2)

      const url = new URL('http://localhost/api/papers?realOnly=false&page=1&limit=10')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.papers).toEqual(mockPapers)
      expect(data.pagination.total).toBe(2)

      // Verify no real paper filter is applied
      const findManyCall = vi.mocked(prisma.researchPaper.findMany).mock.calls[0][0]
      expect(findManyCall.where).toEqual({ isPublic: true })
    })

    it('handles search with real papers filter', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)
      vi.mocked(prisma.researchPaper.findMany).mockResolvedValue([])
      vi.mocked(prisma.researchPaper.count).mockResolvedValue(0)

      const url = new URL('http://localhost/api/papers?search=MFC&realOnly=true&page=1&limit=10')
      const request = new NextRequest(url)

      const response = await GET(request)

      expect(response.status).toBe(200)

      // Verify complex query structure with search + real filter
      const findManyCall = vi.mocked(prisma.researchPaper.findMany).mock.calls[0][0]
      expect(findManyCall.where).toMatchObject({
        AND: expect.arrayContaining([
          {
            OR: expect.arrayContaining([
              { source: { in: expect.arrayContaining(['crossref_api', 'arxiv_api', 'pubmed_api']) } },
              { doi: { not: null } }
            ])
          },
          {
            OR: expect.arrayContaining([
              { title: { contains: 'MFC', mode: 'insensitive' } },
              { abstract: { contains: 'MFC', mode: 'insensitive' } }
            ])
          }
        ])
      })
    })

    it('handles authenticated user properly', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'user@example.com' }
      }

      vi.mocked(getServerSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.researchPaper.findMany).mockResolvedValue([])
      vi.mocked(prisma.researchPaper.count).mockResolvedValue(0)

      const url = new URL('http://localhost/api/papers?page=1&limit=10')
      const request = new NextRequest(url)

      const response = await GET(request)

      expect(response.status).toBe(200)

      // Verify authenticated user sees public + own papers
      const findManyCall = vi.mocked(prisma.researchPaper.findMany).mock.calls[0][0]
      expect(findManyCall.where).toMatchObject({
        OR: [
          { isPublic: true },
          { uploadedBy: 'user-123' }
        ]
      })
    })

    it('handles database errors gracefully', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)
      vi.mocked(prisma.researchPaper.findMany).mockRejectedValue(new Error('Database error'))

      const url = new URL('http://localhost/api/papers?page=1&limit=10')
      const request = new NextRequest(url)

      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch papers')
    })

    it('validates pagination parameters', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)
      vi.mocked(prisma.researchPaper.findMany).mockResolvedValue([])
      vi.mocked(prisma.researchPaper.count).mockResolvedValue(0)

      const url = new URL('http://localhost/api/papers?page=2&limit=20')
      const request = new NextRequest(url)

      const response = await GET(request)

      expect(response.status).toBe(200)

      const findManyCall = vi.mocked(prisma.researchPaper.findMany).mock.calls[0][0]
      expect(findManyCall.skip).toBe(20) // (page-1) * limit = (2-1) * 20
      expect(findManyCall.take).toBe(20)
    })
  })

  describe('POST /api/papers', () => {
    it('creates paper with valid data', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'user@example.com' }
      }
      
      const mockCreatedPaper = {
        id: 'paper-123',
        title: 'Test Paper',
        authors: '["John Doe"]',
        externalUrl: 'https://example.com/paper',
        source: 'user',
        uploadedBy: 'user-123',
        user: { id: 'user-123', name: 'Test User', email: 'user@example.com' }
      }

      vi.mocked(getServerSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.researchPaper.create).mockResolvedValue(mockCreatedPaper)

      const requestData = {
        title: 'Test Paper',
        authors: ['John Doe'],
        externalUrl: 'https://example.com/paper',
        doi: '10.1234/test'
      }

      const request = new NextRequest('http://localhost/api/papers', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedPaper)
      
      // Verify proper data transformation
      const createCall = vi.mocked(prisma.researchPaper.create).mock.calls[0][0]
      expect(createCall.data.authors).toBe('["John Doe"]') // Converted to JSON string
      expect(createCall.data.uploadedBy).toBe('user-123')
    })

    it('requires authentication', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/papers', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Authentication required')
    })

    it('validates required fields', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'user@example.com' }
      }

      vi.mocked(getServerSession).mockResolvedValue(mockSession)

      const request = new NextRequest('http://localhost/api/papers', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }), // Missing authors and externalUrl
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Title, authors, and external URL are required')
    })

    it('handles duplicate DOI conflicts', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'user@example.com' }
      }

      const duplicateError = {
        code: 'P2002',
        meta: { target: ['doi'] }
      }

      vi.mocked(getServerSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.researchPaper.create).mockRejectedValue(duplicateError)

      const request = new NextRequest('http://localhost/api/papers', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Paper',
          authors: ['John Doe'],
          externalUrl: 'https://example.com/paper',
          doi: '10.1234/existing'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.error).toBe('Paper with this doi already exists')
    })

    it('processes MES-specific fields correctly', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'user@example.com' }
      }

      vi.mocked(getServerSession).mockResolvedValue(mockSession)
      vi.mocked(prisma.researchPaper.create).mockResolvedValue({
        id: 'paper-123',
        user: { id: 'user-123', name: 'Test', email: 'user@example.com' }
      } as any)

      const requestData = {
        title: 'MFC Paper',
        authors: ['John Doe'],
        externalUrl: 'https://example.com/paper',
        systemType: 'MFC',
        powerOutput: 25000,
        efficiency: 85.5,
        organismTypes: ['Geobacter', 'Shewanella'],
        anodeMaterials: ['Carbon cloth', 'Graphene'],
        cathodeMaterials: ['Platinum', 'Stainless steel']
      }

      const request = new NextRequest('http://localhost/api/papers', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(201)

      const createCall = vi.mocked(prisma.researchPaper.create).mock.calls[0][0]
      expect(createCall.data.systemType).toBe('MFC')
      expect(createCall.data.powerOutput).toBe(25000)
      expect(createCall.data.efficiency).toBe(85.5)
      expect(createCall.data.organismTypes).toBe('["Geobacter","Shewanella"]')
      expect(createCall.data.anodeMaterials).toBe('["Carbon cloth","Graphene"]')
      expect(createCall.data.cathodeMaterials).toBe('["Platinum","Stainless steel"]')
    })
  })
})