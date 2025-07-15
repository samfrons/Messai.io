// Database utility functions for MESSAI
import { prisma } from './db'

export interface DatabaseConfig {
  batchSize?: number
  timeout?: number
  retries?: number
  logQueries?: boolean
}

export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: Record<string, 'asc' | 'desc'>
  include?: Record<string, boolean | object>
  where?: Record<string, any>
}

export interface BulkOperationResult {
  success: boolean
  processed: number
  errors: string[]
  warnings: string[]
  duration: number
}

// Database connection utilities
export const dbUtils = {
  // Test database connection
  async testConnection(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      await prisma.$queryRaw`SELECT 1`
      const latency = Date.now() - startTime
      
      return { connected: true, latency }
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  },

  // Execute raw query with error handling
  async executeRawQuery(query: string, params: any[] = []): Promise<any> {
    try {
      return await prisma.$queryRawUnsafe(query, ...params)
    } catch (error) {
      console.error('Raw query execution failed:', error)
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  // Get database statistics
  async getDatabaseStats(): Promise<Record<string, number>> {
    try {
      const [paperCount, userCount, experimentCount, citationCount] = await Promise.all([
        prisma.paper.count(),
        prisma.user.count(),
        prisma.experiment.count(),
        prisma.citation.count()
      ])

      return {
        papers: paperCount,
        users: userCount,
        experiments: experimentCount,
        citations: citationCount,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Failed to get database stats:', error)
      return {}
    }
  },

  // Clean up old records
  async cleanup(config: { olderThanDays: number; dryRun?: boolean } = { olderThanDays: 90 }): Promise<BulkOperationResult> {
    const startTime = Date.now()
    const cutoffDate = new Date(Date.now() - config.olderThanDays * 24 * 60 * 60 * 1000)
    
    try {
      let processed = 0
      const errors: string[] = []
      const warnings: string[] = []

      // Clean up old sessions
      if (!config.dryRun) {
        const sessionResult = await prisma.session.deleteMany({
          where: {
            expires: { lt: cutoffDate }
          }
        })
        processed += sessionResult.count
      } else {
        const sessionCount = await prisma.session.count({
          where: {
            expires: { lt: cutoffDate }
          }
        })
        warnings.push(`Would delete ${sessionCount} expired sessions`)
      }

      return {
        success: true,
        processed,
        errors,
        warnings,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        processed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        duration: Date.now() - startTime
      }
    }
  }
}

// Paper-specific database utilities
export const paperDbUtils = {
  // Bulk import papers
  async bulkImport(papers: any[], config: DatabaseConfig = {}): Promise<BulkOperationResult> {
    const { batchSize = 100, timeout = 30000 } = config
    const startTime = Date.now()
    
    let processed = 0
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Process in batches
      for (let i = 0; i < papers.length; i += batchSize) {
        const batch = papers.slice(i, i + batchSize)
        
        try {
          await prisma.$transaction(async (tx) => {
            for (const paper of batch) {
              await tx.paper.upsert({
                where: { doi: paper.doi || `temp-${Date.now()}-${Math.random()}` },
                update: paper,
                create: {
                  ...paper,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              })
              processed++
            }
          }, { timeout })
        } catch (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return {
        success: errors.length === 0,
        processed,
        errors,
        warnings,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        processed,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings,
        duration: Date.now() - startTime
      }
    }
  },

  // Search papers with advanced filtering
  async searchPapers(searchTerm: string, options: QueryOptions = {}): Promise<any[]> {
    const {
      limit = 50,
      offset = 0,
      orderBy = { createdAt: 'desc' },
      include = {},
      where = {}
    } = options

    try {
      const searchWhere = {
        ...where,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' as const } },
          { abstract: { contains: searchTerm, mode: 'insensitive' as const } },
          { authors: { hasSome: [searchTerm] } },
          { keywords: { hasSome: [searchTerm] } }
        ]
      }

      return await prisma.paper.findMany({
        where: searchWhere,
        take: limit,
        skip: offset,
        orderBy,
        include
      })
    } catch (error) {
      console.error('Paper search failed:', error)
      return []
    }
  },

  // Get papers by performance metrics
  async getByPerformanceRange(filters: {
    powerDensityRange?: [number, number]
    efficiencyRange?: [number, number]
    yearRange?: [number, number]
    systemTypes?: string[]
  }): Promise<any[]> {
    const where: any = {}

    if (filters.powerDensityRange) {
      where.powerDensity = {
        gte: filters.powerDensityRange[0],
        lte: filters.powerDensityRange[1]
      }
    }

    if (filters.efficiencyRange) {
      where.efficiency = {
        gte: filters.efficiencyRange[0],
        lte: filters.efficiencyRange[1]
      }
    }

    if (filters.yearRange) {
      where.year = {
        gte: filters.yearRange[0],
        lte: filters.yearRange[1]
      }
    }

    if (filters.systemTypes && filters.systemTypes.length > 0) {
      where.systemType = { in: filters.systemTypes }
    }

    try {
      return await prisma.paper.findMany({
        where,
        orderBy: [
          { powerDensity: 'desc' },
          { efficiency: 'desc' }
        ],
        take: 100
      })
    } catch (error) {
      console.error('Performance range search failed:', error)
      return []
    }
  },

  // Duplicate detection
  async findDuplicates(): Promise<Array<{ doi?: string; title: string; count: number; ids: string[] }>> {
    try {
      // Find papers with same DOI
      const doiDuplicates = await prisma.$queryRaw<Array<{ doi: string; count: bigint }>>`
        SELECT doi, COUNT(*) as count 
        FROM "Paper" 
        WHERE doi IS NOT NULL 
        GROUP BY doi 
        HAVING COUNT(*) > 1
      `

      // Find papers with very similar titles
      const titleDuplicates = await prisma.$queryRaw<Array<{ title: string; count: bigint }>>`
        SELECT title, COUNT(*) as count 
        FROM "Paper" 
        GROUP BY LOWER(TRIM(title)) 
        HAVING COUNT(*) > 1
      `

      const duplicates = []

      // Process DOI duplicates
      for (const dup of doiDuplicates) {
        const papers = await prisma.paper.findMany({
          where: { doi: dup.doi },
          select: { id: true, title: true }
        })

        duplicates.push({
          doi: dup.doi,
          title: papers[0]?.title || 'Unknown',
          count: Number(dup.count),
          ids: papers.map(p => p.id)
        })
      }

      return duplicates
    } catch (error) {
      console.error('Duplicate detection failed:', error)
      return []
    }
  }
}

// User and experiment utilities
export const userDbUtils = {
  // Get user activity summary
  async getUserActivity(userId: string, days: number = 30): Promise<{
    experimentsCreated: number
    papersAccessed: number
    lastActive: Date | null
    totalActivity: number
  }> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    try {
      const [experimentsCreated, user] = await Promise.all([
        prisma.experiment.count({
          where: {
            userId,
            createdAt: { gte: cutoffDate }
          }
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { lastLoginAt: true }
        })
      ])

      return {
        experimentsCreated,
        papersAccessed: 0, // Would need activity tracking
        lastActive: user?.lastLoginAt || null,
        totalActivity: experimentsCreated
      }
    } catch (error) {
      console.error('Failed to get user activity:', error)
      return {
        experimentsCreated: 0,
        papersAccessed: 0,
        lastActive: null,
        totalActivity: 0
      }
    }
  },

  // Clean up inactive users
  async cleanupInactiveUsers(inactiveDays: number = 365, dryRun: boolean = true): Promise<BulkOperationResult> {
    const startTime = Date.now()
    const cutoffDate = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000)

    try {
      const inactiveUsers = await prisma.user.findMany({
        where: {
          OR: [
            { lastLoginAt: { lt: cutoffDate } },
            { lastLoginAt: null, createdAt: { lt: cutoffDate } }
          ]
        },
        select: { id: true, email: true, lastLoginAt: true }
      })

      if (dryRun) {
        return {
          success: true,
          processed: 0,
          errors: [],
          warnings: [`Would remove ${inactiveUsers.length} inactive users`],
          duration: Date.now() - startTime
        }
      }

      // In a real scenario, you'd want to archive rather than delete
      // This is just a placeholder for the cleanup logic
      return {
        success: true,
        processed: inactiveUsers.length,
        errors: [],
        warnings: ['User cleanup not implemented - would archive users'],
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        processed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        duration: Date.now() - startTime
      }
    }
  }
}

// Database backup and restore utilities
export const backupUtils = {
  // Create database backup
  async createBackup(options: { includeUserData?: boolean; format?: 'json' | 'sql' } = {}): Promise<{
    success: boolean
    backupId?: string
    size?: number
    error?: string
  }> {
    try {
      const { includeUserData = false, format = 'json' } = options
      
      // This would implement actual backup logic
      // For now, it's a placeholder
      const backupId = `backup_${Date.now()}`
      
      console.log(`Creating ${format} backup (includeUserData: ${includeUserData})`)
      
      return {
        success: true,
        backupId,
        size: 1024 * 1024 // Placeholder size
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // List available backups
  async listBackups(): Promise<Array<{
    id: string
    createdAt: Date
    size: number
    type: string
  }>> {
    // Placeholder - would list actual backups
    return [
      {
        id: 'backup_123456789',
        createdAt: new Date(),
        size: 1024 * 1024,
        type: 'automatic'
      }
    ]
  }
}

// String filter utility function
export const createStringFilter = (
  value: string | undefined,
  mode: 'contains' | 'startsWith' | 'endsWith' | 'equals' = 'contains',
  caseSensitive: boolean = false
): any => {
  if (!value || value.trim() === '') {
    return undefined
  }

  const trimmedValue = value.trim()
  
  switch (mode) {
    case 'contains':
      return {
        contains: trimmedValue,
        mode: caseSensitive ? 'default' : 'insensitive'
      }
    case 'startsWith':
      return {
        startsWith: trimmedValue,
        mode: caseSensitive ? 'default' : 'insensitive'
      }
    case 'endsWith':
      return {
        endsWith: trimmedValue,
        mode: caseSensitive ? 'default' : 'insensitive'
      }
    case 'equals':
      return {
        equals: trimmedValue,
        mode: caseSensitive ? 'default' : 'insensitive'
      }
    default:
      return {
        contains: trimmedValue,
        mode: caseSensitive ? 'default' : 'insensitive'
      }
  }
}

// Advanced filter builders
export const createDateRangeFilter = (
  startDate?: Date | string,
  endDate?: Date | string
): any => {
  const filter: any = {}
  
  if (startDate) {
    filter.gte = typeof startDate === 'string' ? new Date(startDate) : startDate
  }
  
  if (endDate) {
    filter.lte = typeof endDate === 'string' ? new Date(endDate) : endDate
  }
  
  return Object.keys(filter).length > 0 ? filter : undefined
}

export const createNumericRangeFilter = (
  min?: number,
  max?: number
): any => {
  const filter: any = {}
  
  if (typeof min === 'number' && !isNaN(min)) {
    filter.gte = min
  }
  
  if (typeof max === 'number' && !isNaN(max)) {
    filter.lte = max
  }
  
  return Object.keys(filter).length > 0 ? filter : undefined
}

export const createArrayFilter = (
  values: string[] | undefined,
  mode: 'hasEvery' | 'hasSome' | 'isEmpty' = 'hasSome'
): any => {
  if (!values || values.length === 0) {
    return undefined
  }
  
  const validValues = values.filter(v => v && v.trim() !== '')
  
  if (validValues.length === 0) {
    return undefined
  }
  
  switch (mode) {
    case 'hasEvery':
      return { hasEvery: validValues }
    case 'hasSome':
      return { hasSome: validValues }
    case 'isEmpty':
      return { isEmpty: true }
    default:
      return { hasSome: validValues }
  }
}

// Export all utilities
export default {
  db: dbUtils,
  papers: paperDbUtils,
  users: userDbUtils,
  backup: backupUtils
}