#!/usr/bin/env npx tsx

import { RealPaperFetcher } from './fetch-real-papers'
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
  const userId = process.argv[2] || 'cmcno7mde0000o1adjp1ub0j2'
  
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }
  })

  if (!user) {
    console.error(`❌ User with ID ${userId} not found`)
    process.exit(1)
  }

  console.log(`🚀 Fetching papers for specific domains for user: ${user.name || user.email}`)
  
  const fetcher = new RealPaperFetcher()
  
  // Focus on the specific domains requested
  const domainSearchTerms = [
    // Electroanalytical methodologies
    'cyclic voltammetry microbial fuel cell',
    'impedance spectroscopy bioelectrochemical',
    'chronoamperometry microbial electrochemical',
    'electrochemical characterization bioelectrochemical',
    
    // Brewery & industrial applications
    'brewery wastewater microbial fuel cell',
    'beer brewery bioelectrochemical treatment',
    'distillery wastewater MFC',
    'industrial brewery fuel cell',
    
    // Algal & photosynthetic systems
    'algal microbial fuel cell',
    'photosynthetic microbial fuel cell',
    'microalgae bioelectrochemical system',
    'algae cathode MFC',
    
    // Waste to energy systems
    'waste to energy bioelectrochemical',
    'anaerobic digestion microbial fuel cell',
    'food waste bioelectrochemical',
    'municipal waste MFC',
    
    // Bioreactors and fermentation
    'bioreactor microbial fuel cell',
    'fermentation coupled MFC',
    'continuous flow bioelectrochemical reactor',
    'membrane bioreactor MFC'
  ]
  
  let allPapers: any[] = []
  
  console.log(`\n📋 Searching ${domainSearchTerms.length} specialized terms...\n`)
  
  for (const term of domainSearchTerms) {
    try {
      console.log(`\n🔍 Searching for: "${term}"`)
      
      const [crossRefPapers, arxivPapers, pubmedPapers] = await Promise.all([
        fetcher.fetchFromCrossRef(term, 30),
        fetcher.fetchFromArxiv(term, 10),
        fetcher.fetchFromPubMed(term, 20)
      ])
      
      const standardPapers = await fetcher.convertToStandardFormat(crossRefPapers, arxivPapers, pubmedPapers)
      allPapers.push(...standardPapers)
      
      console.log(`  📊 Found: ${crossRefPapers.length} CrossRef + ${arxivPapers.length} arXiv + ${pubmedPapers.length} PubMed = ${standardPapers.length} total`)
      
      // Rate limiting between searches
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error(`❌ Search failed for "${term}":`, error)
    }
  }
  
  // Remove duplicates
  const uniquePapers = allPapers.filter((paper, index, self) => {
    return index === self.findIndex(p => 
      (p.doi && paper.doi && p.doi === paper.doi) ||
      (p.arxivId && paper.arxivId && p.arxivId === paper.arxivId) ||
      (p.title === paper.title)
    )
  })
  
  console.log(`\n📊 Search Results Summary:`)
  console.log(`  Total papers found: ${allPapers.length}`)
  console.log(`  Unique papers: ${uniquePapers.length}`)
  console.log(`  Duplicates removed: ${allPapers.length - uniquePapers.length}`)
  
  // Import papers
  const results = await fetcher.importPapers(uniquePapers, userId)
  
  console.log(`\n✅ Import Complete:`)
  console.log(`  Added: ${results.added}`)
  console.log(`  Skipped (duplicates): ${results.skipped}`)
  console.log(`  Errors: ${results.errors}`)
  
  // Get updated statistics
  const totalCount = await prisma.researchPaper.count()
  const withParams = await prisma.researchPaper.count({
    where: {
      OR: [
        { experimentalConditions: { not: null } },
        { performanceMetrics: { not: null } },
        { reactorConfiguration: { not: null } }
      ]
    }
  })
  
  console.log(`\n📈 Updated Database Statistics:`)
  console.log(`  Total papers: ${totalCount}`)
  console.log(`  With extracted parameters: ${withParams} (${((withParams / totalCount) * 100).toFixed(1)}%)`)
  
  await prisma.$disconnect()
}

if (require.main === module) {
  main().catch(console.error)
}

export { main }