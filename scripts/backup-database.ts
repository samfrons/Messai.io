#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'backups', 'database')
  const backupFile = path.join(backupDir, `messai-backup-${timestamp}.json`)

  console.log('🔵 Starting database backup...')
  console.log(`📁 Backup location: ${backupFile}`)

  try {
    // Create backup directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true })

    // Fetch all data
    console.log('📊 Fetching data...')
    const [
      users,
      experiments,
      measurements,
      papers,
      mfcDesigns,
      experimentPapers
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.experiment.findMany(),
      prisma.measurement.findMany(),
      prisma.researchPaper.findMany(),
      prisma.mFCDesign.findMany(),
      prisma.experimentPaper.findMany()
    ])

    const data = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        counts: {
          users: users.length,
          experiments: experiments.length,
          measurements: measurements.length,
          papers: papers.length,
          mfcDesigns: mfcDesigns.length,
          experimentPapers: experimentPapers.length
        }
      },
      data: {
        users,
        experiments,
        measurements,
        papers,
        mfcDesigns,
        experimentPapers
      }
    }

    // Write backup file
    console.log('💾 Writing backup file...')
    await fs.writeFile(backupFile, JSON.stringify(data, null, 2))

    // Create a compressed version
    const { execSync } = require('child_process')
    try {
      execSync(`gzip -k "${backupFile}"`)
      console.log('🗜️  Created compressed backup')
    } catch (e) {
      console.log('⚠️  Could not create compressed backup (gzip not available)')
    }

    // Keep only last 10 backups
    const files = await fs.readdir(backupDir)
    const backupFiles = files
      .filter(f => f.startsWith('messai-backup-') && f.endsWith('.json'))
      .sort()
      .reverse()

    if (backupFiles.length > 10) {
      console.log('🧹 Cleaning old backups...')
      for (const oldFile of backupFiles.slice(10)) {
        await fs.unlink(path.join(backupDir, oldFile)).catch(() => {})
        await fs.unlink(path.join(backupDir, `${oldFile}.gz`)).catch(() => {})
      }
    }

    console.log('✅ Backup completed successfully!')
    console.log(`📊 Backup Summary:`)
    console.log(`   - Papers: ${papers.length.toLocaleString()}`)
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Experiments: ${experiments.length}`)
    console.log(`   - File size: ${((await fs.stat(backupFile)).size / 1024 / 1024).toFixed(2)} MB`)
    
    return backupFile
  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Also create a lightweight backup with just paper metadata
async function backupPapersMetadata() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'backups', 'papers-metadata')
  const backupFile = path.join(backupDir, `papers-metadata-${timestamp}.json`)

  try {
    await fs.mkdir(backupDir, { recursive: true })

    console.log('\n📑 Creating papers metadata backup...')
    const papers = await prisma.researchPaper.findMany({
      select: {
        id: true,
        title: true,
        doi: true,
        pubmedId: true,
        arxivId: true,
        source: true,
        publicationDate: true,
        powerOutput: true,
        efficiency: true,
        systemType: true,
        createdAt: true
      }
    })

    const metadata = {
      timestamp: new Date().toISOString(),
      totalPapers: papers.length,
      bySource: papers.reduce((acc, p) => {
        acc[p.source] = (acc[p.source] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      withPerformanceData: papers.filter(p => p.powerOutput || p.efficiency).length,
      papers: papers
    }

    await fs.writeFile(backupFile, JSON.stringify(metadata, null, 2))
    console.log(`✅ Papers metadata backup created: ${backupFile}`)
    
  } catch (error) {
    console.error('❌ Metadata backup failed:', error)
  }
}

// Run both backups
async function main() {
  console.log('🚀 MESSAi Database Backup Tool\n')
  
  try {
    // Full backup
    await backupDatabase()
    
    // Metadata backup
    await backupPapersMetadata()
    
    console.log('\n✅ All backups completed successfully!')
    console.log('💡 Tip: Add this to your crontab for automated backups:')
    console.log('   0 */6 * * * cd /path/to/messai && npm run db:backup')
    
  } catch (error) {
    console.error('\n❌ Backup process failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { backupDatabase, backupPapersMetadata }