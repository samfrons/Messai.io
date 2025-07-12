import { PrismaClient as SqliteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Script to migrate data from SQLite to PostgreSQL

const sqlitePrisma = new SqliteClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

async function exportData() {
  console.log('🔄 Starting SQLite data export...')
  
  try {
    // Export all data from each model
    const data = {
      users: await sqlitePrisma.user.findMany({
        include: {
          accounts: true,
          sessions: true,
          experiments: true,
          researchPapers: true,
          insights: true,
          userProfile: true
        }
      }),
      researchPapers: await sqlitePrisma.researchPaper.findMany({
        include: {
          experiments: true
        }
      }),
      experiments: await sqlitePrisma.experiment.findMany({
        include: {
          user: true,
          dataPoints: true,
          papers: true
        }
      }),
      dataPoints: await sqlitePrisma.dataPoint.findMany(),
      insights: await sqlitePrisma.insight.findMany(),
      userProfiles: await sqlitePrisma.userProfile.findMany()
    }
    
    // Save to JSON file
    const exportPath = path.join(__dirname, '../data-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2))
    
    console.log(`✅ Data exported to ${exportPath}`)
    console.log(`📊 Export summary:`)
    console.log(`   - Users: ${data.users.length}`)
    console.log(`   - Research Papers: ${data.researchPapers.length}`)
    console.log(`   - Experiments: ${data.experiments.length}`)
    console.log(`   - Data Points: ${data.dataPoints.length}`)
    
    return data
  } catch (error) {
    console.error('❌ Export failed:', error)
    throw error
  } finally {
    await sqlitePrisma.$disconnect()
  }
}

async function importData(postgresUrl: string) {
  const postgresPrisma = new PostgresClient({
    datasources: {
      db: {
        url: postgresUrl
      }
    }
  })
  
  console.log('🔄 Starting PostgreSQL data import...')
  
  try {
    // Read exported data
    const exportPath = path.join(__dirname, '../data-export.json')
    const data = JSON.parse(fs.readFileSync(exportPath, 'utf-8'))
    
    // Import in correct order to respect foreign key constraints
    console.log('📥 Importing users...')
    for (const user of data.users) {
      await postgresPrisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image,
          institution: user.institution,
          researchInterests: user.researchInterests,
          preferredSystemTypes: user.preferredSystemTypes,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      })
    }
    
    console.log('📥 Importing user accounts...')
    for (const user of data.users) {
      for (const account of user.accounts) {
        await postgresPrisma.account.create({
          data: {
            ...account,
            expires_at: account.expires_at || null
          }
        })
      }
    }
    
    console.log('📥 Importing research papers...')
    for (const paper of data.researchPapers) {
      await postgresPrisma.researchPaper.create({
        data: {
          ...paper,
          publicationDate: paper.publicationDate ? new Date(paper.publicationDate) : null,
          aiProcessingDate: paper.aiProcessingDate ? new Date(paper.aiProcessingDate) : null,
          createdAt: new Date(paper.createdAt),
          updatedAt: new Date(paper.updatedAt),
          experiments: undefined // Handle relations separately
        }
      })
    }
    
    console.log('📥 Importing experiments...')
    for (const experiment of data.experiments) {
      await postgresPrisma.experiment.create({
        data: {
          ...experiment,
          startDate: new Date(experiment.startDate),
          endDate: experiment.endDate ? new Date(experiment.endDate) : null,
          createdAt: new Date(experiment.createdAt),
          updatedAt: new Date(experiment.updatedAt),
          dataPoints: undefined,
          papers: undefined
        }
      })
    }
    
    console.log('📥 Importing data points...')
    for (const dataPoint of data.dataPoints) {
      await postgresPrisma.dataPoint.create({
        data: {
          ...dataPoint,
          timestamp: new Date(dataPoint.timestamp)
        }
      })
    }
    
    console.log('📥 Importing paper-experiment relations...')
    for (const paper of data.researchPapers) {
      for (const relation of paper.experiments) {
        await postgresPrisma.paperToExperiment.create({
          data: relation
        })
      }
    }
    
    console.log('✅ Import completed successfully!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  } finally {
    await postgresPrisma.$disconnect()
  }
}

// Main migration function
async function migrate() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (command === 'export') {
    await exportData()
  } else if (command === 'import') {
    const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (!postgresUrl || !postgresUrl.includes('postgres')) {
      console.error('❌ PostgreSQL URL not found. Set POSTGRES_URL or DATABASE_URL')
      process.exit(1)
    }
    await importData(postgresUrl)
  } else if (command === 'full') {
    // Full migration
    await exportData()
    const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (!postgresUrl || !postgresUrl.includes('postgres')) {
      console.error('❌ PostgreSQL URL not found. Set POSTGRES_URL or DATABASE_URL')
      process.exit(1)
    }
    await importData(postgresUrl)
  } else {
    console.log(`
📦 SQLite to PostgreSQL Migration Tool

Usage:
  npm run migrate:export     Export SQLite data to JSON
  npm run migrate:import     Import JSON data to PostgreSQL
  npm run migrate:full       Full migration (export + import)

Environment:
  Set POSTGRES_URL or DATABASE_URL for PostgreSQL connection
    `)
  }
}

// Run migration
migrate().catch(console.error)