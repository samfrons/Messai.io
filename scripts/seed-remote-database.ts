#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function seedRemoteDatabase() {
  console.log('🚀 Seeding remote database with cleaned data...\n')
  
  try {
    // Find the latest backup file
    const backupDir = path.join(process.cwd(), 'backups')
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database-backup-') && file.endsWith('.json'))
      .sort()
      .reverse()
    
    if (backupFiles.length === 0) {
      throw new Error('No backup files found. Run backup-current-database.ts first.')
    }
    
    const latestBackup = backupFiles[0]
    const backupPath = path.join(backupDir, latestBackup)
    
    console.log(`📁 Using backup: ${latestBackup}`)
    
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
    const { data } = backup
    
    // Check if remote database is empty
    const existingPapers = await prisma.researchPaper.count()
    if (existingPapers > 0) {
      console.log(`⚠️ Remote database already has ${existingPapers} papers.`)
      console.log('This script will add to existing data (no duplicates based on DOI/title).')
    }
    
    console.log('📊 Backup data:')
    console.log(`   • Papers: ${data.papers.length}`)
    console.log(`   • Users: ${data.users.length}`)
    console.log(`   • Experiments: ${data.experiments.length}`)
    console.log(`   • Measurements: ${data.measurements.length}`)
    console.log(`   • Designs: ${data.designs.length}\\n`)
    
    // Seed designs first (no dependencies)
    console.log('🏗️ Seeding MFC designs...')
    for (const design of data.designs) {
      try {
        await prisma.mFCDesign.upsert({
          where: { id: design.id },
          update: design,
          create: design
        })
      } catch (error) {
        console.log(`⚠️ Design ${design.id} already exists, skipping...`)
      }
    }
    
    // Seed users (papers may reference users)
    console.log('👥 Seeding users...')
    for (const user of data.users) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        })
      } catch (error) {
        console.log(`⚠️ User ${user.id} already exists, skipping...`)
      }
    }
    
    // Seed papers (most important data)
    console.log('📚 Seeding research papers...')
    let addedPapers = 0
    let skippedPapers = 0
    
    for (const paper of data.papers) {
      try {
        // Try to find existing paper by DOI or title
        const existing = await prisma.researchPaper.findFirst({
          where: {
            OR: [
              { doi: paper.doi },
              { title: paper.title }
            ]
          }
        })
        
        if (existing) {
          // Update existing paper with cleaned data
          await prisma.researchPaper.update({
            where: { id: existing.id },
            data: {
              ...paper,
              id: existing.id, // Keep existing ID
              experiments: undefined // Remove relation data
            }
          })
          console.log(`✅ Updated: "${paper.title.substring(0, 50)}..."`)
        } else {
          // Create new paper
          await prisma.researchPaper.create({
            data: {
              ...paper,
              experiments: undefined // Remove relation data
            }
          })
          addedPapers++
          console.log(`🆕 Added: "${paper.title.substring(0, 50)}..."`)
        }
      } catch (error) {
        console.error(`❌ Error with paper "${paper.title.substring(0, 30)}...":`, error.message)
        skippedPapers++
      }
    }
    
    // Seed experiments
    console.log('\\n🧪 Seeding experiments...')
    for (const experiment of data.experiments) {
      try {
        await prisma.experiment.upsert({
          where: { id: experiment.id },
          update: experiment,
          create: experiment
        })
      } catch (error) {
        console.log(`⚠️ Experiment ${experiment.id} error:`, error.message)
      }
    }
    
    // Seed measurements
    console.log('📊 Seeding measurements...')
    for (const measurement of data.measurements) {
      try {
        await prisma.measurement.upsert({
          where: { id: measurement.id },
          update: measurement,
          create: measurement
        })
      } catch (error) {
        console.log(`⚠️ Measurement ${measurement.id} error:`, error.message)
      }
    }
    
    // Final verification
    const finalCounts = {
      papers: await prisma.researchPaper.count(),
      users: await prisma.user.count(),
      experiments: await prisma.experiment.count(),
      measurements: await prisma.measurement.count(),
      designs: await prisma.mFCDesign.count()
    }
    
    console.log('\\n✅ Remote database seeding complete!')
    console.log('📊 Final counts:')
    console.log(`   • Papers: ${finalCounts.papers}`)
    console.log(`   • Users: ${finalCounts.users}`)
    console.log(`   • Experiments: ${finalCounts.experiments}`)
    console.log(`   • Measurements: ${finalCounts.measurements}`)
    console.log(`   • Designs: ${finalCounts.designs}`)
    console.log(`\\n📈 Summary:`)
    console.log(`   • Papers added: ${addedPapers}`)
    console.log(`   • Papers skipped: ${skippedPapers}`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedRemoteDatabase()
}