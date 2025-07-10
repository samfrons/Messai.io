#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'
import { createReadStream } from 'fs'
import { createGunzip } from 'zlib'
import { pipeline } from 'stream/promises'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

async function restoreDatabase(backupPath: string) {
  console.log('🔄 Starting database restore...')
  console.log(`📁 Restore from: ${backupPath}`)

  // Safety check
  console.log('\n⚠️  WARNING: This will DELETE all existing data!')
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  try {
    // Read backup file
    let backupData: string
    if (backupPath.endsWith('.gz')) {
      console.log('🗜️  Decompressing backup...')
      const chunks: Buffer[] = []
      await pipeline(
        createReadStream(backupPath),
        createGunzip(),
        async function* (source) {
          for await (const chunk of source) {
            chunks.push(chunk)
            yield chunk
          }
        }
      )
      backupData = Buffer.concat(chunks).toString()
    } else {
      backupData = await fs.readFile(backupPath, 'utf-8')
    }

    const backup = JSON.parse(backupData)
    
    console.log('\n📊 Backup metadata:')
    console.log(`   Created: ${backup.metadata.timestamp}`)
    console.log(`   Papers: ${backup.metadata.counts.papers.toLocaleString()}`)
    console.log(`   Users: ${backup.metadata.counts.users}`)
    console.log(`   Experiments: ${backup.metadata.counts.experiments}`)

    // Clear existing data (in correct order due to foreign keys)
    console.log('\n🗑️  Clearing existing data...')
    await prisma.$transaction([
      prisma.experimentPaper.deleteMany(),
      prisma.measurement.deleteMany(),
      prisma.experiment.deleteMany(),
      prisma.researchPaper.deleteMany(),
      prisma.mFCDesign.deleteMany(),
      prisma.account.deleteMany(),
      prisma.session.deleteMany(),
      prisma.user.deleteMany(),
    ])

    // Restore data
    console.log('\n📥 Restoring data...')
    
    // Restore in correct order
    if (backup.data.users?.length > 0) {
      console.log(`   Restoring ${backup.data.users.length} users...`)
      await prisma.user.createMany({ data: backup.data.users })
    }

    if (backup.data.mfcDesigns?.length > 0) {
      console.log(`   Restoring ${backup.data.mfcDesigns.length} MFC designs...`)
      await prisma.mFCDesign.createMany({ data: backup.data.mfcDesigns })
    }

    if (backup.data.papers?.length > 0) {
      console.log(`   Restoring ${backup.data.papers.length} papers...`)
      // Batch insert papers to handle large datasets
      const batchSize = 100
      for (let i = 0; i < backup.data.papers.length; i += batchSize) {
        const batch = backup.data.papers.slice(i, i + batchSize)
        await prisma.researchPaper.createMany({ data: batch })
        if (i % 1000 === 0) {
          console.log(`      Progress: ${i}/${backup.data.papers.length}`)
        }
      }
    }

    if (backup.data.experiments?.length > 0) {
      console.log(`   Restoring ${backup.data.experiments.length} experiments...`)
      await prisma.experiment.createMany({ data: backup.data.experiments })
    }

    if (backup.data.measurements?.length > 0) {
      console.log(`   Restoring ${backup.data.measurements.length} measurements...`)
      await prisma.measurement.createMany({ data: backup.data.measurements })
    }

    if (backup.data.experimentPapers?.length > 0) {
      console.log(`   Restoring ${backup.data.experimentPapers.length} experiment-paper links...`)
      await prisma.experimentPaper.createMany({ data: backup.data.experimentPapers })
    }

    console.log('\n✅ Restore completed successfully!')
    
    // Verify
    const counts = await prisma.$transaction([
      prisma.researchPaper.count(),
      prisma.user.count(),
      prisma.experiment.count()
    ])
    
    console.log('\n📊 Verification:')
    console.log(`   Papers restored: ${counts[0].toLocaleString()}`)
    console.log(`   Users restored: ${counts[1]}`)
    console.log(`   Experiments restored: ${counts[2]}`)

  } catch (error) {
    console.error('❌ Restore failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// List available backups
async function listBackups() {
  const backupDir = path.join(process.cwd(), 'backups', 'database')
  
  try {
    const files = await fs.readdir(backupDir)
    const backupFiles = files
      .filter(f => f.startsWith('messai-backup-') && (f.endsWith('.json') || f.endsWith('.json.gz')))
      .sort()
      .reverse()

    console.log('📋 Available backups:\n')
    
    for (const file of backupFiles) {
      const filePath = path.join(backupDir, file)
      const stats = await fs.stat(filePath)
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
      console.log(`   ${file} (${sizeMB} MB)`)
    }
    
    return backupFiles
  } catch (error) {
    console.log('No backups found')
    return []
  }
}

async function main() {
  console.log('🔄 MESSAi Database Restore Tool\n')
  
  const args = process.argv.slice(2)
  
  if (args[0] === '--list') {
    await listBackups()
    return
  }
  
  if (!args[0]) {
    console.log('Usage:')
    console.log('  npm run db:restore -- --list              # List available backups')
    console.log('  npm run db:restore -- <backup-file>       # Restore from specific backup')
    console.log('  npm run db:restore -- --latest            # Restore from latest backup')
    return
  }
  
  let backupPath = args[0]
  
  if (args[0] === '--latest') {
    const backups = await listBackups()
    if (backups.length === 0) {
      console.error('❌ No backups found')
      process.exit(1)
    }
    backupPath = path.join(process.cwd(), 'backups', 'database', backups[0])
    console.log(`\n📌 Using latest backup: ${backups[0]}`)
  }
  
  if (!backupPath.startsWith('/')) {
    backupPath = path.join(process.cwd(), backupPath)
  }
  
  try {
    await restoreDatabase(backupPath)
  } catch (error) {
    console.error('\n❌ Restore process failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { restoreDatabase, listBackups }