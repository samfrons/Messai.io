// Database connection and utilities
import { PrismaClient } from '@prisma/client'

// Global declaration for dev environment
declare global {
  var __prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export { prisma }
export default prisma

// Database utility functions
export const connectDb = async () => {
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

export const disconnectDb = async () => {
  try {
    await prisma.$disconnect()
    console.log('Database disconnected successfully')
  } catch (error) {
    console.error('Database disconnection failed:', error)
  }
}

// Health check function
export const checkDbHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date().toISOString() }
  }
}

// Transaction wrapper
export const withTransaction = async <T>(
  operation: (tx: PrismaClient) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(async (tx) => {
    return await operation(tx)
  })
}

// Common database operations for papers
export const paperOperations = {
  // Get all papers with pagination
  async getAllPapers(page: number = 1, limit: number = 20, searchTerm?: string) {
    const skip = (page - 1) * limit
    
    const where = searchTerm ? {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' as const } },
        { abstract: { contains: searchTerm, mode: 'insensitive' as const } },
        { authors: { hasSome: [searchTerm] } }
      ]
    } : undefined

    const [papers, total] = await Promise.all([
      prisma.paper.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          citations: true,
          _count: {
            select: { citations: true }
          }
        }
      }),
      prisma.paper.count({ where })
    ])

    return {
      papers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  // Get paper by ID
  async getPaperById(id: string) {
    return await prisma.paper.findUnique({
      where: { id },
      include: {
        citations: true,
        _count: {
          select: { citations: true }
        }
      }
    })
  },

  // Create new paper
  async createPaper(data: any) {
    return await prisma.paper.create({
      data,
      include: {
        citations: true
      }
    })
  },

  // Update paper
  async updatePaper(id: string, data: any) {
    return await prisma.paper.update({
      where: { id },
      data,
      include: {
        citations: true
      }
    })
  },

  // Delete paper
  async deletePaper(id: string) {
    return await prisma.paper.delete({
      where: { id }
    })
  },

  // Search papers by performance metrics
  async searchByPerformance(filters: {
    minPowerDensity?: number
    maxPowerDensity?: number
    minEfficiency?: number
    maxEfficiency?: number
    fuelCellType?: string[]
  }) {
    const where: any = {}

    if (filters.minPowerDensity !== undefined || filters.maxPowerDensity !== undefined) {
      where.powerDensity = {}
      if (filters.minPowerDensity !== undefined) where.powerDensity.gte = filters.minPowerDensity
      if (filters.maxPowerDensity !== undefined) where.powerDensity.lte = filters.maxPowerDensity
    }

    if (filters.minEfficiency !== undefined || filters.maxEfficiency !== undefined) {
      where.efficiency = {}
      if (filters.minEfficiency !== undefined) where.efficiency.gte = filters.minEfficiency
      if (filters.maxEfficiency !== undefined) where.efficiency.lte = filters.maxEfficiency
    }

    if (filters.fuelCellType && filters.fuelCellType.length > 0) {
      where.systemType = { in: filters.fuelCellType }
    }

    return await prisma.paper.findMany({
      where,
      orderBy: [
        { powerDensity: 'desc' },
        { efficiency: 'desc' }
      ],
      take: 50
    })
  }
}

// User operations
export const userOperations = {
  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        experiments: true,
        _count: {
          select: { experiments: true }
        }
      }
    })
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        experiments: true
      }
    })
  },

  async createUser(data: any) {
    return await prisma.user.create({
      data
    })
  },

  async updateUser(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data
    })
  }
}

// Experiment operations
export const experimentOperations = {
  async getAllExperiments(userId?: string) {
    const where = userId ? { userId } : undefined
    
    return await prisma.experiment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })
  },

  async getExperimentById(id: string) {
    return await prisma.experiment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })
  },

  async createExperiment(data: any) {
    return await prisma.experiment.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })
  }
}

// Database cleanup and maintenance
export const maintenanceOperations = {
  async cleanupOldSessions() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    return await prisma.session.deleteMany({
      where: {
        expires: {
          lt: oneWeekAgo
        }
      }
    })
  },

  async getDbStats() {
    const [paperCount, userCount, experimentCount] = await Promise.all([
      prisma.paper.count(),
      prisma.user.count(),
      prisma.experiment.count()
    ])

    return {
      papers: paperCount,
      users: userCount,
      experiments: experimentCount,
      timestamp: new Date().toISOString()
    }
  }
}