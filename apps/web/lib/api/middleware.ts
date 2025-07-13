// Unified API middleware for MESSAI platform

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { z } from 'zod'
import { 
  ApiResponse, 
  ApiContext, 
  API_ERROR_CODES, 
  UserRole, 
  Permission, 
  ROLE_PERMISSIONS,
  RATE_LIMITS
} from './types'
import { randomUUID } from 'crypto'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Creates a standardized API response
 */
export function createApiResponse<T>(
  data?: T,
  options?: {
    success?: boolean
    error?: {
      code: string
      message: string
      details?: any
      field?: string
    }
    meta?: Partial<ApiResponse['meta']>
    status?: number
  }
): Response {
  const response: ApiResponse<T> = {
    success: options?.success ?? !options?.error,
    data,
    error: options?.error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: randomUUID(),
      version: '1.0.0',
      ...options?.meta,
    },
  }

  return NextResponse.json(response, { status: options?.status || 200 })
}

/**
 * Creates standardized error responses
 */
export function createErrorResponse(
  code: keyof typeof API_ERROR_CODES,
  message: string,
  options?: {
    details?: any
    field?: string
    status?: number
    requestId?: string
  }
): Response {
  const errorMap: Record<string, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    TOKEN_EXPIRED: 401,
    INSUFFICIENT_PERMISSIONS: 403,
    VALIDATION_ERROR: 400,
    INVALID_INPUT: 400,
    MISSING_FIELD: 400,
    INVALID_FORMAT: 400,
    NOT_FOUND: 404,
    ALREADY_EXISTS: 409,
    CONFLICT: 409,
    RESOURCE_LOCKED: 423,
    RATE_LIMIT_EXCEEDED: 429,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500,
    DATABASE_ERROR: 500,
    EXTERNAL_SERVICE_ERROR: 502,
    TIMEOUT: 504,
    INVALID_PARAMETERS: 400,
    PREDICTION_FAILED: 422,
    SIMULATION_ERROR: 422,
    CALCULATION_ERROR: 422,
  }

  const status = options?.status || errorMap[code] || 500

  return createApiResponse(undefined, {
    success: false,
    error: {
      code: API_ERROR_CODES[code],
      message,
      details: options?.details,
      field: options?.field,
    },
    meta: {
      requestId: options?.requestId || randomUUID(),
    },
    status,
  })
}

/**
 * Validates request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; error?: Response }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        error: createErrorResponse('VALIDATION_ERROR', firstError.message, {
          field: firstError.path.join('.'),
          details: error.errors,
        }),
      }
    }
    return {
      error: createErrorResponse('INVALID_INPUT', 'Invalid request body'),
    }
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { data?: T; error?: Response } {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    
    // Convert common query params to appropriate types
    const convertedParams = Object.entries(params).reduce((acc, [key, value]) => {
      // Convert numeric strings
      if (/^\d+$/.test(value)) {
        acc[key] = parseInt(value, 10)
      }
      // Convert float strings
      else if (/^\d*\.\d+$/.test(value)) {
        acc[key] = parseFloat(value)
      }
      // Convert boolean strings
      else if (value === 'true' || value === 'false') {
        acc[key] = value === 'true'
      }
      // Keep as string
      else {
        acc[key] = value
      }
      return acc
    }, {} as any)

    const validatedData = schema.parse(convertedParams)
    return { data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        error: createErrorResponse('VALIDATION_ERROR', firstError.message, {
          field: firstError.path.join('.'),
          details: error.errors,
        }),
      }
    }
    return {
      error: createErrorResponse('INVALID_INPUT', 'Invalid query parameters'),
    }
  }
}

/**
 * Authentication middleware
 */
export async function requireAuth(request: NextRequest): Promise<{
  user?: ApiContext['user']
  error?: Response
}> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        error: createErrorResponse('UNAUTHORIZED', 'Authentication required'),
      }
    }

    // Get user role from session or database
    const userRole = (session.user as any).role || UserRole.DEMO
    const permissions = ROLE_PERMISSIONS[userRole] || []

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        role: userRole,
        permissions,
      },
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return {
      error: createErrorResponse('INTERNAL_ERROR', 'Authentication check failed'),
    }
  }
}

/**
 * Permission-based authorization middleware
 */
export function requirePermission(permission: Permission) {
  return (user: ApiContext['user']): Response | null => {
    if (!user) {
      return createErrorResponse('UNAUTHORIZED', 'Authentication required')
    }

    if (!user.permissions.includes(permission)) {
      return createErrorResponse(
        'INSUFFICIENT_PERMISSIONS',
        `Missing required permission: ${permission}`
      )
    }

    return null
  }
}

/**
 * Rate limiting middleware
 */
export function rateLimit(request: NextRequest, user?: ApiContext['user']): {
  allowed: boolean
  rateLimitInfo?: ApiContext['rateLimitInfo']
  error?: Response
} {
  // Get rate limit config based on user role
  const role = user?.role || UserRole.DEMO
  const limit = RATE_LIMITS[role]
  
  // Create rate limit key (use user ID if available, otherwise IP)
  const identifier = user?.id || request.ip || 'anonymous'
  const key = `rate_limit:${identifier}`
  
  const now = Math.floor(Date.now() / 1000)
  const windowStart = Math.floor(now / limit.window) * limit.window
  const resetTime = windowStart + limit.window

  // Get current count
  const current = rateLimitStore.get(key)
  
  if (!current || current.resetTime <= now) {
    // Reset window
    rateLimitStore.set(key, { count: 1, resetTime })
    return {
      allowed: true,
      rateLimitInfo: {
        remaining: limit.requests - 1,
        resetTime: resetTime * 1000, // Convert to milliseconds
      },
    }
  }

  if (current.count >= limit.requests) {
    return {
      allowed: false,
      error: createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        `Rate limit exceeded. Max ${limit.requests} requests per ${limit.window} seconds.`,
        {
          details: {
            limit: limit.requests,
            window: limit.window,
            resetTime: resetTime * 1000,
          },
        }
      ),
    }
  }

  // Increment count
  current.count++
  rateLimitStore.set(key, current)

  return {
    allowed: true,
    rateLimitInfo: {
      remaining: limit.requests - current.count,
      resetTime: resetTime * 1000,
    },
  }
}

/**
 * Performance tracking middleware
 */
export function createPerformanceTracker(): {
  start: () => void
  end: () => { executionTime: number }
} {
  let startTime: number

  return {
    start: () => {
      startTime = performance.now()
    },
    end: () => ({
      executionTime: Math.round(performance.now() - startTime),
    }),
  }
}

/**
 * Main API middleware wrapper
 */
export function withApiMiddleware<T = any>(
  handler: (
    request: NextRequest,
    context: ApiContext
  ) => Promise<Response | T>,
  options?: {
    requireAuth?: boolean
    permissions?: Permission[]
    rateLimit?: boolean
    skipRateLimit?: boolean
  }
) {
  return async (request: NextRequest, params?: any): Promise<Response> => {
    const requestId = randomUUID()
    const performanceTracker = createPerformanceTracker()
    performanceTracker.start()

    try {
      // Create base context
      const context: ApiContext = {
        requestId,
        startTime: Date.now(),
      }

      // Authentication check
      if (options?.requireAuth !== false) {
        const authResult = await requireAuth(request)
        if (authResult.error) {
          return authResult.error
        }
        context.user = authResult.user
      }

      // Permission checks
      if (options?.permissions && context.user) {
        for (const permission of options.permissions) {
          const permissionError = requirePermission(permission)(context.user)
          if (permissionError) {
            return permissionError
          }
        }
      }

      // Rate limiting
      if (options?.rateLimit !== false && !options?.skipRateLimit) {
        const rateLimitResult = rateLimit(request, context.user)
        if (!rateLimitResult.allowed) {
          return rateLimitResult.error!
        }
        context.rateLimitInfo = rateLimitResult.rateLimitInfo
      }

      // Execute handler
      const result = await handler(request, context)

      // If handler returns a Response, return it directly
      if (result instanceof Response) {
        return result
      }

      // Otherwise, wrap in standard API response
      const performance = performanceTracker.end()
      return createApiResponse(result, {
        meta: {
          requestId,
          performance,
        },
      })
    } catch (error) {
      console.error('API middleware error:', error)
      
      const performance = performanceTracker.end()
      return createErrorResponse('INTERNAL_ERROR', 'Internal server error', {
        requestId,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      })
    }
  }
}

/**
 * Utility function to add security headers
 */
export function addSecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response)
  
  newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  newResponse.headers.set('X-Frame-Options', 'DENY')
  newResponse.headers.set('X-XSS-Protection', '1; mode=block')
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Add CORS headers for API routes
  newResponse.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  
  return newResponse
}