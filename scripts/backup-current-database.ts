#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function backupDatabase() {
  console.log('📦 Creating database backup...\n')
  
  try {
    // Get all data
    const papers = await prisma.researchPaper.findMany({
      include: {
        experiments: true
      }
    })
    
    const users = await prisma.user.findMany()
    const experiments = await prisma.experiment.findMany()
    const measurements = await prisma.measurement.findMany()
    const designs = await prisma.mFCDesign.findMany()
    
    const backup = {
      timestamp: new Date().toISOString(),
      counts: {
        papers: papers.length,
        users: users.length,
        experiments: experiments.length,
        measurements: measurements.length,
        designs: designs.length
      },
      data: {
        papers,
        users,
        experiments,
        measurements,
        designs
      }
    }
    
    // Create backup file
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const filename = `database-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    const filepath = path.join(backupDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))
    
    console.log('✅ Database backup created successfully!')
    console.log('📊 Backup contents:')
    console.log(`   • Papers: ${backup.counts.papers}`)
    console.log(`   • Users: ${backup.counts.users}`)
    console.log(`   • Experiments: ${backup.counts.experiments}`)
    console.log(`   • Measurements: ${backup.counts.measurements}`)
    console.log(`   • Designs: ${backup.counts.designs}`)
    console.log(`📁 Backup file: ${filepath}`)
    
    // Also create a SQL dump if possible
    try {
      const { execSync } = require('child_process')
      const sqlDumpPath = filepath.replace('.json', '.sql')
      execSync(`sqlite3 prisma/dev.db .dump > "${sqlDumpPath}"`)
      console.log(`📁 SQL dump: ${sqlDumpPath}`)
    } catch (error) {
      console.log('⚠️ Could not create SQL dump (sqlite3 command not available)')
    }
    
    return filepath
    
  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  backupDatabase()
}