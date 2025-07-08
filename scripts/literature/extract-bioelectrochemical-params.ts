#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import { EnhancedParameterExtractor } from './enhanced-parameter-extraction'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

async function main() {
  const extractor = new EnhancedParameterExtractor()
  const limit = process.argv[2] ? parseInt(process.argv[2]) : 100
  
  console.log('🚀 Starting parameter extraction for bioelectrochemical systems papers...')
  
  // Find bioelectrochemical system papers that haven't been processed with enhanced extraction
  const papers = await prisma.researchPaper.findMany({
    where: {
      AND: [
        {
          abstract: { not: null }
        },
        {
          OR: [
            // Microbial electrochemical systems
            { title: { contains: 'microbial', mode: 'insensitive' } },
            { title: { contains: 'bioelectrochemical', mode: 'insensitive' } },
            { abstract: { contains: 'MFC', mode: 'insensitive' } },
            { abstract: { contains: 'MEC', mode: 'insensitive' } },
            { abstract: { contains: 'MDC', mode: 'insensitive' } },
            { abstract: { contains: 'MES', mode: 'insensitive' } },
            { abstract: { contains: 'fuel cell', mode: 'insensitive' } },
            { abstract: { contains: 'electrolysis cell', mode: 'insensitive' } },
            // Waste to energy systems
            { title: { contains: 'waste to energy', mode: 'insensitive' } },
            { title: { contains: 'wastewater treatment', mode: 'insensitive' } },
            { abstract: { contains: 'waste to energy', mode: 'insensitive' } },
            { abstract: { contains: 'anaerobic digestion', mode: 'insensitive' } },
            // Bioreactors
            { title: { contains: 'bioreactor', mode: 'insensitive' } },
            { abstract: { contains: 'bioreactor', mode: 'insensitive' } },
            { abstract: { contains: 'fermentation', mode: 'insensitive' } },
            // Electrolysis and electrochemical
            { title: { contains: 'electrolysis', mode: 'insensitive' } },
            { title: { contains: 'electrochemical', mode: 'insensitive' } },
            { abstract: { contains: 'electrolysis', mode: 'insensitive' } },
            { abstract: { contains: 'electrochemical reactor', mode: 'insensitive' } },
            // General bioelectrochemical
            { systemType: { not: null } }
          ]
        },
        {
          // Hasn't been processed with enhanced extraction
          experimentalConditions: null
        },
        {
          // Is a real paper
          OR: [
            { doi: { not: null } },
            { pubmedId: { not: null } },
            { arxivId: { not: null } }
          ]
        }
      ]
    },
    select: {
      id: true,
      title: true,
      abstract: true
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`\nFound ${papers.length} bioelectrochemical system papers to process`)
  
  let processed = 0
  let successful = 0
  
  for (const paper of papers) {
    const success = await extractor.processPaper(paper)
    processed++
    if (success) successful++
    
    if (processed % 10 === 0) {
      console.log(`\n📊 Progress: ${processed}/${papers.length} papers processed (${successful} successful)`)
    }
  }
  
  console.log(`\n✅ Extraction complete!`)
  console.log(`   Total processed: ${processed}`)
  console.log(`   Successfully extracted: ${successful}`)
  console.log(`   Extraction rate: ${((successful / processed) * 100).toFixed(1)}%`)
  
  await extractor.getExtractionStats()
  await prisma.$disconnect()
}

if (require.main === module) {
  main().catch(console.error)
}