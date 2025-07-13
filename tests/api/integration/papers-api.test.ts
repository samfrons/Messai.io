// Integration tests for Papers API with unified middleware

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/apps/web/app/api/papers/route'
import {
  createMockRequest,
  mockSession,
  parseApiResponse,
  apiAssertions,
  TEST_USERS,
  TEST_PAPERS,
  setupApiTest,
  performanceUtils,
} from '@/lib/test/api-test-utils'
import { UserRole, Permission } from '@/lib/api/types'

describe('Papers API Integration Tests', () => {
  const { mocks } = setupApiTest()

  describe('GET /api/papers', () => {
    describe('Authentication & Authorization', () => {
      it('allows public access to public papers', async () => {
        mockSession(null)
        
        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { page: '1', limit: '10' },
        })

        const response = await GET(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(200)
        apiAssertions.success(data)
        apiAssertions.pagination(data, { page: 1, limit: 10 })

        // Verify only public papers query
        expect(mocks.researchPaper.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              isPublic: true,
            }),
          })
        )
      })

      it('allows authenticated users to see public + own papers', async () => {
        mockSession(TEST_USERS.researcher)

        const request = createMockRequest('http://localhost/api/papers')
        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        apiAssertions.success(data)

        // Verify visibility query for authenticated users
        expect(mocks.researchPaper.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: [
                { isPublic: true },
                { uploadedBy: TEST_USERS.researcher.id },
              ],
            }),
          })
        )
      })

      it('filters by specific user when userId provided', async () => {
        mockSession(TEST_USERS.admin)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { userId: TEST_USERS.researcher.id },
        })

        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        apiAssertions.success(data)

        expect(mocks.researchPaper.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              uploadedBy: TEST_USERS.researcher.id,
            }),
          })
        )
      })
    })

    describe('Search & Filtering', () => {
      it('performs text search across multiple fields', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { search: 'microbial fuel cell' },
        })

        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        apiAssertions.success(data)

        const whereClause = mocks.researchPaper.findMany.mock.calls[0][0].where
        expect(whereClause).toMatchObject({
          AND: expect.arrayContaining([
            {
              OR: expect.arrayContaining([
                { title: { contains: 'microbial fuel cell', mode: 'insensitive' } },
                { abstract: { contains: 'microbial fuel cell', mode: 'insensitive' } },
                { keywords: { contains: 'microbial fuel cell', mode: 'insensitive' } },
              ]),
            },
          ]),
        })
      })

      it('filters real papers only when realOnly=true', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { realOnly: 'true' },
        })

        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        apiAssertions.success(data)

        const whereClause = mocks.researchPaper.findMany.mock.calls[0][0].where
        expect(whereClause.OR).toEqual(
          expect.arrayContaining([
            { source: { in: expect.arrayContaining(['crossref_api', 'pubmed_api', 'arxiv_api']) } },
            { doi: { not: null } },
            { arxivId: { not: null } },
            { pubmedId: { not: null } },
          ])
        )
      })

      it('filters by microbe types', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { microbes: 'Geobacter,Shewanella' },
        })

        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        apiAssertions.success(data)

        const whereClause = mocks.researchPaper.findMany.mock.calls[0][0].where
        expect(whereClause.AND).toEqual(
          expect.arrayContaining([
            {
              OR: expect.arrayContaining([
                {
                  OR: expect.arrayContaining([
                    { organismTypes: { contains: 'Geobacter', mode: 'insensitive' } },
                    { microbialCommunity: { contains: 'Geobacter', mode: 'insensitive' } },
                  ]),
                },
                {
                  OR: expect.arrayContaining([
                    { organismTypes: { contains: 'Shewanella', mode: 'insensitive' } },
                    { microbialCommunity: { contains: 'Shewanella', mode: 'insensitive' } },
                  ]),
                },
              ]),
            },
          ])
        )
      })

      it('filters by performance metrics', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { 
            minPower: '100', 
            minEfficiency: '50',
            hasFullData: 'true',
          },
        })

        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        apiAssertions.success(data)

        const whereClause = mocks.researchPaper.findMany.mock.calls[0][0].where
        expect(whereClause.AND).toEqual(
          expect.arrayContaining([
            { powerOutput: { gte: 100 } },
            { efficiency: { gte: 50 } },
            {
              AND: [
                { powerOutput: { not: null } },
                { efficiency: { not: null } },
                { systemConfiguration: { not: null } },
                { microbialCommunity: { not: null } },
              ],
            },
          ])
        )
      })

      it('applies microbial relevance filter by default', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { requireMicrobial: 'true' },
        })

        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        apiAssertions.success(data)

        const whereClause = mocks.researchPaper.findMany.mock.calls[0][0].where
        const microbialFilter = whereClause.AND?.find((clause: any) => clause.OR?.some((condition: any) => 
          condition.OR?.some((field: any) => 
            field.title?.contains?.includes('microb') || 
            field.abstract?.contains?.includes('bioelectrochemical')
          )
        ))

        expect(microbialFilter).toBeDefined()
      })

      it('filters algae-specific papers when algaeOnly=true', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { algaeOnly: 'true' },
        })

        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        apiAssertions.success(data)

        const whereClause = mocks.researchPaper.findMany.mock.calls[0][0].where
        const algaeFilter = whereClause.AND?.find((clause: any) => clause.OR?.some((condition: any) => 
          condition.OR?.some((field: any) => 
            field.title?.contains?.includes('algae') || 
            field.abstract?.contains?.includes('microalgae')
          )
        ))

        expect(algaeFilter).toBeDefined()
      })
    })

    describe('Sorting & Pagination', () => {
      it('sorts by different criteria', async () => {
        mockSession(null)

        const sortTests = [
          { sortBy: 'power', expected: { powerOutput: 'desc' } },
          { sortBy: 'efficiency', expected: { efficiency: 'desc' } },
          { sortBy: 'date', expected: { createdAt: 'desc' } },
          { 
            sortBy: 'relevance', 
            expected: [
              { powerOutput: 'desc' },
              { efficiency: 'desc' },
              { createdAt: 'desc' },
            ] 
          },
        ]

        for (const { sortBy, expected } of sortTests) {
          vi.clearAllMocks()
          
          const request = createMockRequest('http://localhost/api/papers', {
            searchParams: { sortBy },
          })

          const response = await GET(request)
          const { data } = await parseApiResponse(response)

          apiAssertions.success(data)

          expect(mocks.researchPaper.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
              orderBy: expected,
            })
          )
        }
      })

      it('handles pagination correctly', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { page: '3', limit: '20' },
        })

        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        apiAssertions.success(data)
        apiAssertions.pagination(data, { page: 3, limit: 20 })

        expect(mocks.researchPaper.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 40, // (page - 1) * limit = (3 - 1) * 20
            take: 20,
          })
        )
      })

      it('calculates pagination metadata correctly', async () => {
        mockSession(null)
        mocks.researchPaper.count.mockResolvedValue(157)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { page: '2', limit: '25' },
        })

        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        expect(data.meta.pagination).toEqual({
          page: 2,
          limit: 25,
          total: 157,
          totalPages: Math.ceil(157 / 25), // 7
        })
      })
    })

    describe('Data Transformation', () => {
      it('transforms JSON fields correctly', async () => {
        mockSession(null)
        
        const mockPaper = {
          ...TEST_PAPERS.valid,
          authors: '["Dr. John Smith", "Dr. Jane Doe"]',
          anodeMaterials: '["Carbon cloth", "Graphene oxide"]',
          aiDataExtraction: '{"powerOutput": 250, "confidence": 0.95}',
        }

        mocks.researchPaper.findMany.mockResolvedValue([mockPaper])

        const request = createMockRequest('http://localhost/api/papers')
        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        const transformedPaper = data.data.papers[0]

        expect(transformedPaper.authors).toEqual(['Dr. John Smith', 'Dr. Jane Doe'])
        expect(transformedPaper.anodeMaterials).toEqual(['Carbon cloth', 'Graphene oxide'])
        expect(transformedPaper.aiData).toEqual({ powerOutput: 250, confidence: 0.95 })
        expect(transformedPaper.hasPerformanceData).toBe(true)
        expect(transformedPaper.isAiProcessed).toBe(true)
      })

      it('handles malformed JSON gracefully', async () => {
        mockSession(null)
        
        const mockPaper = {
          ...TEST_PAPERS.valid,
          authors: 'invalid json{',
          anodeMaterials: null,
          aiDataExtraction: '',
        }

        mocks.researchPaper.findMany.mockResolvedValue([mockPaper])

        const request = createMockRequest('http://localhost/api/papers')
        const response = await GET(request)
        const { data } = await parseApiResponse(response)

        const transformedPaper = data.data.papers[0]

        expect(transformedPaper.authors).toBe('invalid json{') // Keep as-is
        expect(transformedPaper.anodeMaterials).toBeNull()
        expect(transformedPaper.aiData).toBeNull()
      })
    })

    describe('Error Handling', () => {
      it('handles database errors gracefully', async () => {
        mockSession(null)
        mocks.researchPaper.findMany.mockRejectedValue(new Error('Database connection failed'))

        const request = createMockRequest('http://localhost/api/papers')
        const response = await GET(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(500)
        apiAssertions.error(data, 'INTERNAL_ERROR')
        expect(data.error!.message).toBe('Failed to fetch papers')
      })

      it('validates pagination limits', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/papers', {
          searchParams: { page: '0', limit: '150' }, // Invalid values
        })

        const response = await GET(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(400)
        apiAssertions.error(data, 'VALIDATION_ERROR')
      })
    })

    describe('Performance', () => {
      it('completes within acceptable time limits', async () => {
        mockSession(null)

        const { duration } = await performanceUtils.measureResponseTime(async () => {
          const request = createMockRequest('http://localhost/api/papers')
          return GET(request)
        })

        expect(duration).toBeLessThan(2000) // 2 seconds max
      })

      it('handles concurrent requests efficiently', async () => {
        mockSession(null)

        const { successRate, averageTime } = await performanceUtils.loadTest(
          async () => {
            const request = createMockRequest('http://localhost/api/papers')
            return GET(request)
          },
          { concurrent: 5, iterations: 3 }
        )

        expect(successRate).toBeGreaterThan(0.9) // 90% success rate
        expect(averageTime).toBeLessThan(1000) // 1 second average
      })
    })
  })

  describe('POST /api/papers', () => {
    describe('Authentication & Authorization', () => {
      it('requires authentication', async () => {
        mockSession(null)

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: TEST_PAPERS.minimal,
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(401)
        apiAssertions.error(data, 'UNAUTHORIZED')
      })

      it('allows researchers to create papers', async () => {
        mockSession(TEST_USERS.researcher)
        mocks.researchPaper.create.mockResolvedValue({
          ...TEST_PAPERS.valid,
          id: 'new-paper-123',
        })

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: TEST_PAPERS.minimal,
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(201)
        apiAssertions.success(data)
        expect(data.data.id).toBe('new-paper-123')
      })

      it('allows students with proper permissions', async () => {
        const studentWithPermissions = {
          ...TEST_USERS.student,
          permissions: [Permission.WRITE_PAPERS],
        }
        mockSession(studentWithPermissions as any)

        mocks.researchPaper.create.mockResolvedValue({
          ...TEST_PAPERS.valid,
          id: 'student-paper-123',
        })

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: TEST_PAPERS.minimal,
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(201)
        apiAssertions.success(data)
      })
    })

    describe('Input Validation', () => {
      it('validates required fields', async () => {
        mockSession(TEST_USERS.researcher)

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: { title: 'Test' }, // Missing required fields
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(400)
        apiAssertions.error(data, 'VALIDATION_ERROR')
      })

      it('validates URL format', async () => {
        mockSession(TEST_USERS.researcher)

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: {
            ...TEST_PAPERS.minimal,
            externalUrl: 'not-a-valid-url',
          },
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(400)
        apiAssertions.error(data, 'VALIDATION_ERROR')
        expect(data.error!.field).toBe('externalUrl')
      })

      it('validates scientific parameters', async () => {
        mockSession(TEST_USERS.researcher)

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: {
            ...TEST_PAPERS.minimal,
            efficiency: 150, // Invalid: > 100%
            powerOutput: -100, // Invalid: negative
          },
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(400)
        apiAssertions.error(data, 'VALIDATION_ERROR')
      })
    })

    describe('Data Processing', () => {
      it('processes MES-specific fields correctly', async () => {
        mockSession(TEST_USERS.researcher)
        mocks.researchPaper.create.mockResolvedValue(TEST_PAPERS.valid)

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: {
            ...TEST_PAPERS.valid,
            authors: ['Dr. John Smith', 'Dr. Jane Doe'], // Array
            organismTypes: ['Geobacter', 'Shewanella'], // Array
          },
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(201)

        const createCall = mocks.researchPaper.create.mock.calls[0][0]
        expect(createCall.data.authors).toBe('["Dr. John Smith","Dr. Jane Doe"]')
        expect(createCall.data.organismTypes).toBe('["Geobacter","Shewanella"]')
        expect(createCall.data.uploadedBy).toBe(TEST_USERS.researcher.id)
      })

      it('sets default values correctly', async () => {
        mockSession(TEST_USERS.researcher)
        mocks.researchPaper.create.mockResolvedValue(TEST_PAPERS.valid)

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: TEST_PAPERS.minimal,
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(201)

        const createCall = mocks.researchPaper.create.mock.calls[0][0]
        expect(createCall.data.isPublic).toBe(true) // Default
        expect(createCall.data.source).toBe('user') // Default
      })
    })

    describe('Error Handling', () => {
      it('handles duplicate DOI conflicts', async () => {
        mockSession(TEST_USERS.researcher)
        mocks.researchPaper.create.mockRejectedValue({
          code: 'P2002',
          meta: { target: ['doi'] },
        })

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: {
            ...TEST_PAPERS.minimal,
            doi: '10.1234/existing',
          },
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(409)
        apiAssertions.error(data, 'CONFLICT')
        expect(data.error!.message).toContain('doi already exists')
      })

      it('handles database connection errors', async () => {
        mockSession(TEST_USERS.researcher)
        mocks.researchPaper.create.mockRejectedValue(new Error('Connection timeout'))

        const request = createMockRequest('http://localhost/api/papers', {
          method: 'POST',
          body: TEST_PAPERS.minimal,
        })

        const response = await POST(request)
        const { data, status } = await parseApiResponse(response)

        expect(status).toBe(500)
        apiAssertions.error(data, 'INTERNAL_ERROR')
      })
    })
  })
})