import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Check if we should use Prisma Accelerate
  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL
  const hasAccelerate = !!accelerateUrl
  
  // Determine which URL to use
  let connectionUrl: string
  
  if (hasAccelerate && process.env.DATABASE_URL?.includes('postgres')) {
    // Use Accelerate URL if available and we're using PostgreSQL
    connectionUrl = accelerateUrl
    console.log('Using Prisma Accelerate for connection pooling')
  } else if (process.env.DATABASE_URL?.includes('postgres')) {
    // PostgreSQL without Accelerate
    connectionUrl = process.env.DATABASE_URL
  } else {
    // SQLite for local development
    connectionUrl = 'file:/Users/samfrons/Desktop/Messai/prisma/dev.db'
  }

  // For non-Accelerate PostgreSQL connections, add connection pooling params
  let finalUrl = connectionUrl
  
  if (!hasAccelerate && connectionUrl.includes('postgres')) {
    try {
      const url = new URL(connectionUrl.replace('postgresql://', 'postgres://'))
      url.searchParams.set('connection_limit', '5') // Reduce connection limit
      url.searchParams.set('pool_timeout', '10') // Shorter timeout
      finalUrl = url.toString().replace('postgres://', 'postgresql://')
    } catch (e) {
      console.warn('Failed to parse database URL:', e)
    }
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: finalUrl
      }
    },
    log: isProduction ? ['error'] : ['error', 'warn'],
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Handle cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

export default prisma