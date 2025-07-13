// Comprehensive API testing utilities for MESSAI platform

import { NextRequest } from 'next/server'
import { vi } from 'vitest'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/db'
import { UserRole, Permission, ApiResponse } from '@/lib/api/types'

// Mock session types
export interface MockSession {
  user: {
    id: string
    email: string
    name?: string
    role?: UserRole
  }
}

// Test user fixtures
export const TEST_USERS = {
  admin: {
    id: 'admin-123',
    email: 'admin@messai.io',
    name: 'Admin User',
    role: UserRole.ADMIN,
  },
  researcher: {
    id: 'researcher-123',
    email: 'researcher@university.edu',
    name: 'Dr. Research',
    role: UserRole.RESEARCHER,
  },
  student: {
    id: 'student-123',
    email: 'student@university.edu',
    name: 'Student User',
    role: UserRole.STUDENT,
  },
  industry: {
    id: 'industry-123',
    email: 'engineer@company.com',
    name: 'Industry Engineer',
    role: UserRole.INDUSTRY,
  },
  demo: {
    id: 'demo-123',
    email: 'demo@messai.io',
    name: 'Demo User',
    role: UserRole.DEMO,
  },
} as const

// Test data fixtures
export const TEST_PAPERS = {
  valid: {
    id: 'paper-123',
    title: 'Enhanced Power Generation in Microbial Fuel Cells',
    authors: ['Dr. John Smith', 'Dr. Jane Doe'],
    abstract: 'This study investigates enhanced power generation using novel electrode materials...',
    doi: '10.1234/example.2024.001',
    journal: 'Bioelectrochemistry',
    publicationDate: '2024-01-15',
    systemType: 'MFC',
    powerOutput: 250000,
    efficiency: 85.5,
    organismTypes: ['Geobacter sulfurreducens', 'Shewanella oneidensis'],
    anodeMaterials: ['Carbon cloth', 'Graphene oxide'],
    cathodeMaterials: ['Platinum mesh', 'Stainless steel'],
    externalUrl: 'https://example.com/paper',
    isPublic: true,
    uploadedBy: TEST_USERS.researcher.id,
  },
  minimal: {
    title: 'Minimal Paper',
    authors: ['Test Author'],
    externalUrl: 'https://example.com/minimal',
  },
  invalid: {
    title: '', // Invalid: empty title
    authors: [], // Invalid: no authors
    externalUrl: 'not-a-url', // Invalid: malformed URL
  },
} as const

export const TEST_PARAMETERS = {
  valid: {
    temperature: 30,
    ph: 7.2,
    substrateConcentration: 1.5,
    designType: 'benchtop-bioreactor',
  },
  outOfRange: {
    temperature: 50, // Too high
    ph: 10, // Too high
    substrateConcentration: -1, // Negative
    designType: 'invalid-design',
  },
} as const

/**
 * Creates a mock NextRequest for testing
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string
    body?: any
    headers?: Record<string, string>
    searchParams?: Record<string, string>
  }
): NextRequest {
  const requestUrl = new URL(url)
  
  // Add search params if provided
  if (options?.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      requestUrl.searchParams.set(key, value)
    })
  }

  const init: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  }

  if (options?.body) {
    init.body = JSON.stringify(options.body)
  }

  return new NextRequest(requestUrl, init)
}

/**
 * Mock authentication session
 */
export function mockSession(user?: typeof TEST_USERS[keyof typeof TEST_USERS] | null) {
  const session = user ? { user } : null
  vi.mocked(getServerSession).mockResolvedValue(session)
  return session
}

/**
 * Mock database responses
 */
export function mockDatabase() {
  const mocks = {
    // Research Papers
    researchPaper: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    // Parameters
    parameter: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    // Experiments
    experiment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    // Users
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  }

  // Mock the entire prisma module
  Object.assign(prisma, mocks)
  
  return mocks
}

/**
 * Parse API response for testing
 */
export async function parseApiResponse<T = any>(response: Response): Promise<{
  data: ApiResponse<T>
  status: number
  headers: Headers
}> {
  const data = await response.json()
  return {
    data,
    status: response.status,
    headers: response.headers,
  }
}

/**
 * API response assertions
 */
export const apiAssertions = {
  /**
   * Assert successful API response
   */
  success<T>(response: ApiResponse<T>, expectedData?: Partial<T>) {
    expect(response.success).toBe(true)
    expect(response.error).toBeUndefined()
    expect(response.meta).toBeDefined()
    expect(response.meta.timestamp).toBeDefined()
    expect(response.meta.requestId).toBeDefined()
    
    if (expectedData && response.data) {
      expect(response.data).toMatchObject(expectedData)
    }
  },

  /**
   * Assert error API response
   */
  error(response: ApiResponse, expectedCode?: string, expectedStatus?: number) {
    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
    expect(response.error!.code).toBeDefined()
    expect(response.error!.message).toBeDefined()
    
    if (expectedCode) {
      expect(response.error!.code).toBe(expectedCode)
    }
  },

  /**
   * Assert pagination metadata
   */
  pagination(
    response: ApiResponse,
    expected: { page: number; limit: number; total?: number }
  ) {
    expect(response.meta.pagination).toBeDefined()
    expect(response.meta.pagination!.page).toBe(expected.page)
    expect(response.meta.pagination!.limit).toBe(expected.limit)
    
    if (expected.total !== undefined) {
      expect(response.meta.pagination!.total).toBe(expected.total)
    }
  },

  /**
   * Assert rate limit headers
   */
  rateLimit(headers: Headers, expectedRemaining?: number) {
    const remaining = headers.get('X-RateLimit-Remaining')
    const resetTime = headers.get('X-RateLimit-Reset')
    
    expect(remaining).toBeDefined()
    expect(resetTime).toBeDefined()
    
    if (expectedRemaining !== undefined) {
      expect(parseInt(remaining!)).toBe(expectedRemaining)
    }
  },

  /**
   * Assert security headers
   */
  security(headers: Headers) {
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(headers.get('X-Frame-Options')).toBe('DENY')
    expect(headers.get('X-XSS-Protection')).toBe('1; mode=block')
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
  },
}

/**
 * Database test utilities
 */
export const dbUtils = {
  /**
   * Mock successful database operations
   */
  mockSuccess(mocks: ReturnType<typeof mockDatabase>) {
    // Research papers
    mocks.researchPaper.findMany.mockResolvedValue([TEST_PAPERS.valid])
    mocks.researchPaper.count.mockResolvedValue(1)
    mocks.researchPaper.create.mockResolvedValue(TEST_PAPERS.valid)
    mocks.researchPaper.findFirst.mockResolvedValue(TEST_PAPERS.valid)
    mocks.researchPaper.findUnique.mockResolvedValue(TEST_PAPERS.valid)
  },

  /**
   * Mock database errors
   */
  mockError(mocks: ReturnType<typeof mockDatabase>, errorType: 'connection' | 'constraint' | 'timeout') {
    const errors = {
      connection: new Error('Database connection failed'),
      constraint: { code: 'P2002', meta: { target: ['doi'] } },
      timeout: new Error('Query timeout'),
    }

    const error = errors[errorType]
    
    // Apply to all operations
    Object.values(mocks).forEach(model => {
      Object.values(model).forEach(method => {
        method.mockRejectedValue(error)
      })
    })
  },

  /**
   * Mock empty results
   */
  mockEmpty(mocks: ReturnType<typeof mockDatabase>) {
    mocks.researchPaper.findMany.mockResolvedValue([])
    mocks.researchPaper.count.mockResolvedValue(0)
    mocks.researchPaper.findFirst.mockResolvedValue(null)
    mocks.researchPaper.findUnique.mockResolvedValue(null)
  },
}

/**
 * Integration test setup helper
 */
export function setupApiTest() {
  const mocks = mockDatabase()
  
  // Clear all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    dbUtils.mockSuccess(mocks)
  })

  return { mocks }
}

/**
 * Performance testing utilities
 */
export const performanceUtils = {
  /**
   * Measure API response time
   */
  async measureResponseTime<T>(
    apiCall: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = await apiCall()
    const duration = performance.now() - start
    
    return { result, duration }
  },

  /**
   * Load testing helper
   */
  async loadTest(
    apiCall: () => Promise<Response>,
    options: { concurrent: number; iterations: number }
  ): Promise<{
    results: Array<{ status: number; duration: number }>
    averageTime: number
    successRate: number
  }> {
    const results: Array<{ status: number; duration: number }> = []

    for (let i = 0; i < options.iterations; i++) {
      const promises = Array(options.concurrent)
        .fill(null)
        .map(async () => {
          const { result, duration } = await performanceUtils.measureResponseTime(apiCall)
          return { status: result.status, duration }
        })

      const batchResults = await Promise.all(promises)
      results.push(...batchResults)
    }

    const averageTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length
    const successCount = results.filter(r => r.status >= 200 && r.status < 300).length
    const successRate = successCount / results.length

    return { results, averageTime, successRate }
  },
}