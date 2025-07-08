import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === 'production'
  const isLocalDev = !isProduction && !process.env.DATABASE_URL?.includes('postgres')
  
  // Use SQLite for local development if no PostgreSQL URL is set
  const databaseUrl = isLocalDev 
    ? 'file:/Users/samfrons/Desktop/Messai/prisma/dev.db' 
    : (process.env.DATABASE_URL || 'file:./prisma/dev.db')
  
  // For production with Prisma Accelerate, use PRISMA_DATABASE_URL if available
  const connectionUrl = isProduction && process.env.PRISMA_DATABASE_URL 
    ? process.env.PRISMA_DATABASE_URL 
    : databaseUrl

  const client = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl
      }
    },
    log: isProduction ? ['error'] : ['error', 'warn'],
  })

  // Note: To use Prisma Accelerate, install these packages:
  // npm install @prisma/extension-accelerate
  // Then uncomment and use:
  // if (isProduction && process.env.PRISMA_DATABASE_URL) {
  //   return client.$extends(withAccelerate())
  // }

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma