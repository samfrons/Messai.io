#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...')
  
  // Get initial counts
  const initialCount = await prisma.researchPaper.count()
  const withAbstract = await prisma.researchPaper.count({
    where: { abstract: { not: null } }
  })
  
  console.log(`\n📊 Initial database state:`)
  console.log(`  Total papers: ${initialCount}`)
  console.log(`  Papers with abstracts: ${withAbstract}`)
  console.log(`  Papers without abstracts: ${initialCount - withAbstract}`)
  
  // Step 1: Delete papers without abstracts
  console.log('\n🗑️  Removing papers without abstracts...')
  const deletedNoAbstract = await prisma.researchPaper.deleteMany({
    where: {
      OR: [
        { abstract: null },
        { abstract: '' }
      ]
    }
  })
  console.log(`  Removed ${deletedNoAbstract.count} papers without abstracts`)
  
  // Step 2: Remove off-topic degradation papers
  console.log('\n🗑️  Removing off-topic degradation papers...')
  const offTopicPapers = await prisma.researchPaper.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: 'degradation' } },
            { title: { contains: 'degrade' } },
            { title: { contains: 'Degradation' } },
            { title: { contains: 'Degrade' } }
          ]
        },
        {
          NOT: {
            OR: [
              { title: { contains: 'electrode' } },
              { title: { contains: 'fuel cell' } },
              { title: { contains: 'MFC' } },
              { title: { contains: 'bioelectrochemical' } },
              { title: { contains: 'electrolysis' } },
              { title: { contains: 'microbial' } },
              { title: { contains: 'Electrode' } },
              { title: { contains: 'Fuel Cell' } },
              { title: { contains: 'Bioelectrochemical' } },
              { title: { contains: 'Microbial' } }
            ]
          }
        }
      ]
    },
    select: { id: true, title: true }
  })
  
  console.log(`  Found ${offTopicPapers.length} off-topic papers`)
  for (const paper of offTopicPapers.slice(0, 5)) {
    console.log(`    - ${paper.title.substring(0, 60)}...`)
  }
  if (offTopicPapers.length > 5) {
    console.log(`    ... and ${offTopicPapers.length - 5} more`)
  }
  
  const deletedOffTopic = await prisma.researchPaper.deleteMany({
    where: {
      id: { in: offTopicPapers.map(p => p.id) }
    }
  })
  console.log(`  Removed ${deletedOffTopic.count} off-topic papers`)
  
  // Step 3: Remove papers with suspicious sources
  console.log('\n🗑️  Checking for AI-generated papers...')
  const suspiciousSources = [
    'ai_smart_literature',
    'ai_generated',
    'synthetic_data',
    'automated_content'
  ]
  
  const deletedSuspicious = await prisma.researchPaper.deleteMany({
    where: {
      source: { in: suspiciousSources }
    }
  })
  console.log(`  Removed ${deletedSuspicious.count} AI-generated papers`)
  
  // Final statistics
  const finalCount = await prisma.researchPaper.count()
  const finalWithAbstract = await prisma.researchPaper.count({
    where: { abstract: { not: null } }
  })
  
  console.log('\n✅ Cleanup complete!')
  console.log(`\n📊 Final database state:`)
  console.log(`  Total papers: ${finalCount} (removed ${initialCount - finalCount})`)
  console.log(`  Papers with abstracts: ${finalWithAbstract} (${((finalWithAbstract/finalCount)*100).toFixed(1)}%)`)
  
  // Show source distribution
  const sources = await prisma.researchPaper.groupBy({
    by: ['source'],
    _count: true,
    orderBy: { _count: { source: 'desc' } }
  })
  
  console.log('\n📚 Papers by source:')
  for (const source of sources) {
    console.log(`  ${source.source}: ${source._count} papers`)
  }
}

async function main() {
  try {
    await cleanupDatabase()
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()