// Comprehensive tests for unified API middleware

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
  createApiResponse,
  createErrorResponse,
  validateRequestBody,
  validateQueryParams,
  requireAuth,
  requirePermission,
  rateLimit,
  withApiMiddleware,
} from '@/lib/api/middleware'
import {
  API_ERROR_CODES,
  UserRole,
  Permission,
  PaperCreateSchema,
  PaginationSchema,
} from '@/lib/api/types'
import {
  createMockRequest,
  mockSession,
  mockDatabase,
  parseApiResponse,
  apiAssertions,
  TEST_USERS,
  TEST_PAPERS,
  setupApiTest,
} from '@/lib/test/api-test-utils'

describe('Unified API Middleware', () => {
  const { mocks } = setupApiTest()

  describe('createApiResponse', () => {
    it('creates successful response with data', async () => {
      const response = createApiResponse({ message: 'success' })
      const { data, status } = await parseApiResponse(response)

      apiAssertions.success(data, { message: 'success' })
      expect(status).toBe(200)
    })

    it('creates error response', async () => {
      const response = createApiResponse(undefined, {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error message',
        },
        status: 400,
      })

      const { data, status } = await parseApiResponse(response)

      apiAssertions.error(data, 'TEST_ERROR')
      expect(status).toBe(400)
    })

    it('includes metadata in response', async () => {
      const response = createApiResponse({ test: true }, {
        meta: {
          pagination: { page: 1, limit: 10, total: 100, totalPages: 10 },
          performance: { executionTime: 150 },
        },
      })

      const { data } = await parseApiResponse(response)

      expect(data.meta.timestamp).toBeDefined()
      expect(data.meta.requestId).toBeDefined()
      expect(data.meta.version).toBe('1.0.0')
      expect(data.meta.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
      })
      expect(data.meta.performance).toEqual({ executionTime: 150 })
    })
  })

  describe('createErrorResponse', () => {
    it('creates standardized error response', async () => {
      const response = createErrorResponse('VALIDATION_ERROR', 'Invalid input')
      const { data, status } = await parseApiResponse(response)

      expect(status).toBe(400)
      apiAssertions.error(data, 'VALIDATION_ERROR')
      expect(data.error!.message).toBe('Invalid input')
    })

    it('includes error details and field', async () => {
      const response = createErrorResponse('VALIDATION_ERROR', 'Invalid field', {
        field: 'email',
        details: { expected: 'string', received: 'number' },
      })

      const { data } = await parseApiResponse(response)

      expect(data.error!.field).toBe('email')
      expect(data.error!.details).toEqual({ expected: 'string', received: 'number' })
    })

    it('maps error codes to correct HTTP status', async () => {
      const testCases = [
        { code: 'UNAUTHORIZED' as const, expectedStatus: 401 },
        { code: 'FORBIDDEN' as const, expectedStatus: 403 },
        { code: 'NOT_FOUND' as const, expectedStatus: 404 },
        { code: 'CONFLICT' as const, expectedStatus: 409 },
        { code: 'RATE_LIMIT_EXCEEDED' as const, expectedStatus: 429 },
        { code: 'INTERNAL_ERROR' as const, expectedStatus: 500 },
      ]

      for (const { code, expectedStatus } of testCases) {
        const response = createErrorResponse(code, 'Test message')
        const { status } = await parseApiResponse(response)
        expect(status).toBe(expectedStatus)
      }
    })
  })

  describe('validateRequestBody', () => {
    it('validates valid request body', async () => {
      const request = createMockRequest('http://localhost/api/test', {
        method: 'POST',
        body: TEST_PAPERS.valid,
      })

      const result = await validateRequestBody(request, PaperCreateSchema)

      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data!.title).toBe(TEST_PAPERS.valid.title)
    })

    it('rejects invalid request body', async () => {
      const request = createMockRequest('http://localhost/api/test', {
        method: 'POST',
        body: TEST_PAPERS.invalid,
      })

      const result = await validateRequestBody(request, PaperCreateSchema)

      expect(result.data).toBeUndefined()
      expect(result.error).toBeDefined()

      const { data } = await parseApiResponse(result.error!)
      apiAssertions.error(data, 'VALIDATION_ERROR')
    })

    it('handles malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: 'invalid json{',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await validateRequestBody(request, PaperCreateSchema)

      expect(result.data).toBeUndefined()
      expect(result.error).toBeDefined()

      const { data } = await parseApiResponse(result.error!)
      apiAssertions.error(data, 'INVALID_INPUT')
    })
  })

  describe('validateQueryParams', () => {
    it('validates and converts query parameters', () => {
      const request = createMockRequest('http://localhost/api/test', {
        searchParams: { page: '2', limit: '20' },
      })

      const result = validateQueryParams(request, PaginationSchema)

      expect(result.error).toBeUndefined()
      expect(result.data).toEqual({ page: 2, limit: 20 })
    })

    it('applies default values', () => {
      const request = createMockRequest('http://localhost/api/test')

      const result = validateQueryParams(request, PaginationSchema)

      expect(result.error).toBeUndefined()
      expect(result.data).toEqual({ page: 1, limit: 10 })
    })

    it('handles type conversion', () => {
      const request = createMockRequest('http://localhost/api/test', {
        searchParams: {
          page: '3',
          limit: '50',
          active: 'true',
          score: '95.5',
        },
      })

      const schema = PaginationSchema.extend({
        active: z.boolean(),
        score: z.number(),
      })

      const result = validateQueryParams(request, schema)

      expect(result.error).toBeUndefined()
      expect(result.data).toEqual({
        page: 3,
        limit: 50,
        active: true,
        score: 95.5,
      })
    })
  })

  describe('requireAuth', () => {
    it('allows authenticated users', async () => {
      const session = mockSession(TEST_USERS.researcher)
      const request = createMockRequest('http://localhost/api/test')

      const result = await requireAuth(request)

      expect(result.error).toBeUndefined()
      expect(result.user).toBeDefined()
      expect(result.user!.id).toBe(TEST_USERS.researcher.id)
      expect(result.user!.role).toBe(UserRole.RESEARCHER)
      expect(result.user!.permissions).toContain(Permission.USE_LABORATORY)
    })

    it('rejects unauthenticated users', async () => {
      mockSession(null)
      const request = createMockRequest('http://localhost/api/test')

      const result = await requireAuth(request)

      expect(result.user).toBeUndefined()
      expect(result.error).toBeDefined()

      const { data } = await parseApiResponse(result.error!)
      apiAssertions.error(data, 'UNAUTHORIZED')
    })

    it('assigns default role for users without role', async () => {
      const userWithoutRole = { ...TEST_USERS.researcher }
      delete (userWithoutRole as any).role
      mockSession(userWithoutRole as any)

      const request = createMockRequest('http://localhost/api/test')
      const result = await requireAuth(request)

      expect(result.user!.role).toBe(UserRole.DEMO)
    })
  })

  describe('requirePermission', () => {
    it('allows users with required permission', () => {
      const user = {
        id: 'test',
        email: 'test@test.com',
        role: UserRole.RESEARCHER,
        permissions: [Permission.USE_LABORATORY, Permission.READ_PAPERS],
      }

      const result = requirePermission(Permission.USE_LABORATORY)(user)

      expect(result).toBeNull()
    })

    it('rejects users without required permission', async () => {
      const user = {
        id: 'test',
        email: 'test@test.com',
        role: UserRole.STUDENT,
        permissions: [Permission.READ_PAPERS],
      }

      const result = requirePermission(Permission.MANAGE_USERS)(user)

      expect(result).toBeDefined()

      const { data } = await parseApiResponse(result!)
      apiAssertions.error(data, 'INSUFFICIENT_PERMISSIONS')
    })

    it('rejects unauthenticated requests', async () => {
      const result = requirePermission(Permission.USE_LABORATORY)(undefined)

      expect(result).toBeDefined()

      const { data } = await parseApiResponse(result!)
      apiAssertions.error(data, 'UNAUTHORIZED')
    })
  })

  describe('rateLimit', () => {
    beforeEach(() => {
      // Clear rate limit store before each test
      vi.clearAllMocks()
    })

    it('allows requests within rate limit', () => {
      const user = {
        id: 'test',
        email: 'test@test.com',
        role: UserRole.RESEARCHER,
        permissions: [],
      }
      const request = createMockRequest('http://localhost/api/test')

      const result = rateLimit(request, user)

      expect(result.allowed).toBe(true)
      expect(result.rateLimitInfo).toBeDefined()
      expect(result.rateLimitInfo!.remaining).toBe(999) // 1000 - 1
    })

    it('has different limits for different user roles', () => {
      const request = createMockRequest('http://localhost/api/test')

      // Admin user
      const adminResult = rateLimit(request, {
        id: 'admin',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        permissions: [],
      })

      expect(adminResult.rateLimitInfo!.remaining).toBe(9999) // 10000 - 1

      // Demo user
      const demoResult = rateLimit(request, {
        id: 'demo',
        email: 'demo@test.com',
        role: UserRole.DEMO,
        permissions: [],
      })

      expect(demoResult.rateLimitInfo!.remaining).toBe(99) // 100 - 1
    })

    it('uses IP for anonymous users', () => {
      const request = createMockRequest('http://localhost/api/test')

      const result = rateLimit(request, undefined)

      expect(result.allowed).toBe(true)
      expect(result.rateLimitInfo!.remaining).toBe(99) // Demo tier: 100 - 1
    })
  })

  describe('withApiMiddleware', () => {
    it('wraps handler with full middleware stack', async () => {
      mockSession(TEST_USERS.researcher)

      const handler = vi.fn().mockResolvedValue({ message: 'success' })
      const wrappedHandler = withApiMiddleware(handler, {
        requireAuth: true,
        permissions: [Permission.READ_PAPERS],
        rateLimit: true,
      })

      const request = createMockRequest('http://localhost/api/test')
      const response = await wrappedHandler(request)
      const { data } = await parseApiResponse(response)

      expect(handler).toHaveBeenCalled()
      apiAssertions.success(data, { message: 'success' })
      expect(data.meta.requestId).toBeDefined()
      expect(data.meta.performance).toBeDefined()
    })

    it('returns handler response directly if it is a Response', async () => {
      mockSession(TEST_USERS.researcher)

      const customResponse = createApiResponse({ custom: true })
      const handler = vi.fn().mockResolvedValue(customResponse)
      const wrappedHandler = withApiMiddleware(handler)

      const request = createMockRequest('http://localhost/api/test')
      const response = await wrappedHandler(request)

      expect(response).toBe(customResponse)
    })

    it('handles authentication failures', async () => {
      mockSession(null)

      const handler = vi.fn()
      const wrappedHandler = withApiMiddleware(handler, {
        requireAuth: true,
      })

      const request = createMockRequest('http://localhost/api/test')
      const response = await wrappedHandler(request)
      const { data } = await parseApiResponse(response)

      expect(handler).not.toHaveBeenCalled()
      apiAssertions.error(data, 'UNAUTHORIZED')
    })

    it('handles permission failures', async () => {
      mockSession(TEST_USERS.student)

      const handler = vi.fn()
      const wrappedHandler = withApiMiddleware(handler, {
        requireAuth: true,
        permissions: [Permission.MANAGE_USERS],
      })

      const request = createMockRequest('http://localhost/api/test')
      const response = await wrappedHandler(request)
      const { data } = await parseApiResponse(response)

      expect(handler).not.toHaveBeenCalled()
      apiAssertions.error(data, 'INSUFFICIENT_PERMISSIONS')
    })

    it('handles unexpected errors', async () => {
      mockSession(TEST_USERS.researcher)

      const handler = vi.fn().mockRejectedValue(new Error('Unexpected error'))
      const wrappedHandler = withApiMiddleware(handler)

      const request = createMockRequest('http://localhost/api/test')
      const response = await wrappedHandler(request)
      const { data } = await parseApiResponse(response)

      apiAssertions.error(data, 'INTERNAL_ERROR')
    })

    it('skips auth when requireAuth is false', async () => {
      const handler = vi.fn().mockResolvedValue({ message: 'public' })
      const wrappedHandler = withApiMiddleware(handler, {
        requireAuth: false,
      })

      const request = createMockRequest('http://localhost/api/test')
      const response = await wrappedHandler(request)
      const { data } = await parseApiResponse(response)

      expect(handler).toHaveBeenCalled()
      apiAssertions.success(data, { message: 'public' })
    })

    it('provides context to handler', async () => {
      mockSession(TEST_USERS.researcher)

      const handler = vi.fn().mockImplementation((request, context) => {
        expect(context.requestId).toBeDefined()
        expect(context.user).toBeDefined()
        expect(context.user!.id).toBe(TEST_USERS.researcher.id)
        return { contextReceived: true }
      })

      const wrappedHandler = withApiMiddleware(handler)

      const request = createMockRequest('http://localhost/api/test')
      await wrappedHandler(request)

      expect(handler).toHaveBeenCalledWith(
        request,
        expect.objectContaining({
          requestId: expect.any(String),
          user: expect.objectContaining({
            id: TEST_USERS.researcher.id,
          }),
        })
      )
    })
  })
})