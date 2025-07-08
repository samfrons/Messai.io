#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking abstract data in database')
  console.log('====================================')
  
  // Check papers with abstracts
  const stats = await prisma.researchPaper.aggregate({
    _count: {
      _all: true,
      abstract: true
    }
  })
  
  console.log(`\n📊 Database Statistics:`)
  console.log(`   Total papers: ${stats._count._all}`)
  console.log(`   Papers with abstracts: ${stats._count.abstract}`)
  console.log(`   Percentage with abstracts: ${((stats._count.abstract / stats._count._all) * 100).toFixed(1)}%`)
  
  // Get sample papers with abstracts
  const samplesWithAbstract = await prisma.researchPaper.findMany({
    where: {
      abstract: { not: null }
    },
    take: 5,
    select: {
      id: true,
      title: true,
      abstract: true,
      aiSummary: true
    }
  })
  
  console.log('\n📄 Sample papers WITH abstracts:')
  for (const paper of samplesWithAbstract) {
    console.log(`\n   ID: ${paper.id}`)
    console.log(`   Title: ${paper.title.substring(0, 60)}...`)
    console.log(`   Abstract length: ${paper.abstract?.length || 0} characters`)
    console.log(`   Has AI Summary: ${paper.aiSummary ? 'Yes' : 'No'}`)
    if (paper.abstract) {
      console.log(`   Abstract preview: ${paper.abstract.substring(0, 100)}...`)
    }
  }
  
  // Check papers without abstracts but with other data
  const papersWithoutAbstract = await prisma.researchPaper.findMany({
    where: {
      abstract: null,
      doi: { not: null }
    },
    take: 5,
    select: {
      id: true,
      title: true,
      doi: true,
      source: true
    }
  })
  
  console.log('\n\n📄 Sample papers WITHOUT abstracts (but have DOI):')
  for (const paper of papersWithoutAbstract) {
    console.log(`\n   ID: ${paper.id}`)
    console.log(`   Title: ${paper.title.substring(0, 60)}...`)
    console.log(`   DOI: ${paper.doi}`)
    console.log(`   Source: ${paper.source}`)
  }
  
  // Test API endpoint
  console.log('\n\n🌐 Testing API endpoint...')
  try {
    const response = await fetch('http://localhost:3003/api/papers?limit=5')
    if (response.ok) {
      const data = await response.json()
      console.log(`   API returned ${data.papers.length} papers`)
      
      const paperWithAbstract = data.papers.find((p: any) => p.abstract)
      if (paperWithAbstract) {
        console.log('\n   Sample paper from API:')
        console.log(`   Title: ${paperWithAbstract.title.substring(0, 60)}...`)
        console.log(`   Has abstract: ${!!paperWithAbstract.abstract}`)
        console.log(`   Abstract type: ${typeof paperWithAbstract.abstract}`)
        if (paperWithAbstract.abstract) {
          console.log(`   Abstract preview: ${paperWithAbstract.abstract.substring(0, 100)}...`)
        }
      }
    } else {
      console.log(`   API error: ${response.status}`)
    }
  } catch (error) {
    console.log('   Could not test API (server may not be running)')
  }
  
  // Check specific paper page
  if (samplesWithAbstract.length > 0) {
    const testPaperId = samplesWithAbstract[0].id
    console.log(`\n\n🔍 Testing paper detail page for ID: ${testPaperId}`)
    try {
      const response = await fetch(`http://localhost:3003/api/papers/${testPaperId}`)
      if (response.ok) {
        const paper = await response.json()
        console.log(`   Paper loaded successfully`)
        console.log(`   Has abstract: ${!!paper.abstract}`)
        console.log(`   Abstract length: ${paper.abstract?.length || 0}`)
      }
    } catch (error) {
      console.log('   Could not test paper detail API')
    }
  }
  
  await prisma.$disconnect()
  console.log('\n✅ Check complete!')
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export { main }