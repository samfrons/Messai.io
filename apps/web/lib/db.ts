import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Database Configuration Strategy:
 * - Development: SQLite (fast, no external dependencies)
 * - Production: PostgreSQL (scalable, advanced features)
 * - Database provider is swapped automatically based on connection URL
 */
function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === 'production'
  const databaseUrl = process.env.DATABASE_URL
  
  // Determine database provider from URL
  const isPostgreSQL = databaseUrl?.includes('postgres')
  const isSQLite = !isPostgreSQL
  
  // Default URLs
  const sqliteUrl = 'file:./prisma/dev.db'
  const fallbackUrl = sqliteUrl
  
  // Select appropriate URL
  let connectionUrl: string
  if (isProduction) {
    // Production: require explicit DATABASE_URL (PostgreSQL)
    if (!databaseUrl || !isPostgreSQL) {
      throw new Error(
        'Production requires PostgreSQL DATABASE_URL. ' +
        'Please set DATABASE_URL=postgresql://...'
      )
    }
    connectionUrl = databaseUrl
  } else {
    // Development: prefer SQLite for local dev
    connectionUrl = databaseUrl || fallbackUrl
  }
  
  // Client configuration
  const config: any = {
    datasources: {
      db: {
        url: connectionUrl
      }
    },
    log: isProduction ? ['error'] : ['error', 'warn']
  }
  
  // Add query timeout for production
  if (isProduction) {
    config.datasources.db.queryTimeout = 30000 // 30 seconds
  }
  
  const client = new PrismaClient(config)
  
  // Connection testing
  client.$connect().catch((error) => {
    console.error('Failed to connect to database:', error)
    if (isProduction) {
      process.exit(1)
    }
  })
  
  // Performance monitoring in production
  if (isProduction) {
    client.$use(async (params, next) => {
      const start = Date.now()
      const result = await next(params)
      const duration = Date.now() - start
      
      // Log slow queries (> 1s)
      if (duration > 1000) {
        console.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`)
      }
      
      return result
    })
  }

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Connection utility
export async function getDatabaseInfo() {
  try {
    const url = process.env.DATABASE_URL || 'file:./prisma/dev.db'
    const isPostgreSQL = url.includes('postgres')
    const isSQLite = url.includes('file:')
    
    return {
      provider: isPostgreSQL ? 'postgresql' : isSQLite ? 'sqlite' : 'unknown',
      url: url.replace(/:[^:]*@/, ':***@'), // mask password
      connected: true
    }
  } catch (error) {
    return {
      provider: 'unknown',
      url: 'unknown',
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Health check utility
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { healthy: true, timestamp: new Date() }
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }
  }
}

export default prisma