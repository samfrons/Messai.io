// Unified API types and response schemas for MESSAI platform

import { z } from 'zod'

// Standard API Response Schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    field: z.string().optional(),
  }).optional(),
  meta: z.object({
    timestamp: z.string(),
    requestId: z.string(),
    version: z.string().default('1.0.0'),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }).optional(),
    performance: z.object({
      executionTime: z.number(),
      queriesExecuted: z.number().optional(),
    }).optional(),
  }),
})

export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & {
  data?: T
}

// Standard Error Codes
export const API_ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource Errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Scientific/Domain Specific
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  PREDICTION_FAILED: 'PREDICTION_FAILED',
  SIMULATION_ERROR: 'SIMULATION_ERROR',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
} as const

export type ApiErrorCode = keyof typeof API_ERROR_CODES

// User Roles and Permissions
export enum UserRole {
  ADMIN = 'admin',
  RESEARCHER = 'researcher', 
  STUDENT = 'student',
  INDUSTRY = 'industry',
  DEMO = 'demo',
}

export enum Permission {
  // Research Data
  READ_PAPERS = 'papers:read',
  WRITE_PAPERS = 'papers:write',
  DELETE_PAPERS = 'papers:delete',
  MODERATE_PAPERS = 'papers:moderate',
  
  // Laboratory Features
  USE_LABORATORY = 'lab:use',
  MANAGE_EXPERIMENTS = 'experiments:manage',
  ACCESS_3D_MODELS = 'models:access',
  
  // Predictions & AI
  USE_PREDICTIONS = 'predictions:use',
  ACCESS_AI_FEATURES = 'ai:access',
  
  // Parameters & Data
  READ_PARAMETERS = 'parameters:read',
  WRITE_PARAMETERS = 'parameters:write',
  
  // Administration
  MANAGE_USERS = 'users:manage',
  VIEW_ANALYTICS = 'analytics:view',
  SYSTEM_CONFIG = 'system:config',
}

// Role-Permission Matrix
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.RESEARCHER]: [
    Permission.READ_PAPERS,
    Permission.WRITE_PAPERS,
    Permission.USE_LABORATORY,
    Permission.MANAGE_EXPERIMENTS,
    Permission.ACCESS_3D_MODELS,
    Permission.USE_PREDICTIONS,
    Permission.ACCESS_AI_FEATURES,
    Permission.READ_PARAMETERS,
    Permission.WRITE_PARAMETERS,
  ],
  [UserRole.INDUSTRY]: [
    Permission.READ_PAPERS,
    Permission.USE_LABORATORY,
    Permission.MANAGE_EXPERIMENTS,
    Permission.ACCESS_3D_MODELS,
    Permission.USE_PREDICTIONS,
    Permission.ACCESS_AI_FEATURES,
    Permission.READ_PARAMETERS,
  ],
  [UserRole.STUDENT]: [
    Permission.READ_PAPERS,
    Permission.USE_LABORATORY,
    Permission.ACCESS_3D_MODELS,
    Permission.USE_PREDICTIONS,
    Permission.READ_PARAMETERS,
  ],
  [UserRole.DEMO]: [
    Permission.READ_PAPERS,
    Permission.USE_LABORATORY,
    Permission.ACCESS_3D_MODELS,
    Permission.USE_PREDICTIONS,
    Permission.READ_PARAMETERS,
  ],
}

// Rate Limiting Tiers
export const RATE_LIMITS = {
  [UserRole.ADMIN]: { requests: 10000, window: 3600 }, // 10k/hour
  [UserRole.RESEARCHER]: { requests: 1000, window: 3600 }, // 1k/hour
  [UserRole.INDUSTRY]: { requests: 2000, window: 3600 }, // 2k/hour
  [UserRole.STUDENT]: { requests: 500, window: 3600 }, // 500/hour
  [UserRole.DEMO]: { requests: 100, window: 3600 }, // 100/hour
} as const

// Request Context
export interface ApiContext {
  requestId: string
  startTime: number
  user?: {
    id: string
    email: string
    role: UserRole
    permissions: Permission[]
  }
  rateLimitInfo?: {
    remaining: number
    resetTime: number
  }
}

// Validation Schemas for Common Endpoints
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export const SearchSchema = z.object({
  q: z.string().min(1).max(500).optional(),
  filters: z.record(z.any()).optional(),
  sort: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Scientific Parameter Validation
export const ScientificParametersSchema = z.object({
  temperature: z.number().min(0).max(100),
  ph: z.number().min(0).max(14),
  substrateConcentration: z.number().min(0),
  designType: z.string().optional(),
})

// Paper Validation Schema
export const PaperCreateSchema = z.object({
  title: z.string().min(1).max(500),
  authors: z.array(z.string()).min(1),
  abstract: z.string().optional(),
  doi: z.string().optional(),
  pubmedId: z.string().optional(),
  arxivId: z.string().optional(),
  externalUrl: z.string().url(),
  journal: z.string().optional(),
  publicationDate: z.string().datetime().optional(),
  keywords: z.array(z.string()).optional(),
  systemType: z.string().optional(),
  powerOutput: z.number().optional(),
  efficiency: z.number().min(0).max(100).optional(),
  organismTypes: z.array(z.string()).optional(),
  anodeMaterials: z.array(z.string()).optional(),
  cathodeMaterials: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
})

export type PaperCreateInput = z.infer<typeof PaperCreateSchema>

// Laboratory Model Schema
export const LabModelSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['bioreactor', 'fuel-cell', 'electrolysis', 'desalination']),
  parameters: z.record(z.any()),
  isPublic: z.boolean().default(false),
})

export type LabModelInput = z.infer<typeof LabModelSchema>