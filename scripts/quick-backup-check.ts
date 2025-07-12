#!/usr/bin/env npx tsx

import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkMasterData() {
  try {
    const paperCount = await prisma.researchPaper.count()
    const userCount = await prisma.user.count()
    const experimentCount = await prisma.experiment.count()

    console.log('=== MASTER BRANCH DATABASE STATUS ===')
    console.log(`Papers: ${paperCount}`)
    console.log(`Users: ${userCount}`)
    console.log(`Experiments: ${experimentCount}`)
    console.log(`Timestamp: ${new Date().toISOString()}`)
    
    return { paperCount, userCount, experimentCount }
  } catch (error) {
    console.error('Database check failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkMasterData()