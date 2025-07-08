#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Schema for validating real papers
const RealPaperSchema = z.object({
  title: z.string().min(10),
  authors: z.array(z.string()).min(1),
  abstract: z.string().optional(),
  doi: z.string().optional(),
  pubmedId: z.string().optional(),
  arxivId: z.string().optional(),
  journal: z.string().optional(),
  publicationDate: z.string().optional(),
  source: z.enum(['crossref_api', 'pubmed_api', 'arxiv_api']),
  externalUrl: z.string().url(),
  keywords: z.array(z.string()).optional()
})

// Quality criteria for papers
interface QualityCriteria {
  hasAbstract: boolean
  hasVerifiableId: boolean // DOI, PubMed ID, or arXiv ID
  hasAuthors: boolean
  isRecentEnough: boolean // Published after 2000
  isRelevantField: boolean
  hasPerformanceData?: boolean
}

// Targeted search for early MFC papers (2000-2014)
const EARLY_MFC_SEARCHES = [
  {
    query: '"microbial fuel cell" AND "electricity generation"',
    category: 'EARLY_MFC_ELECTRICITY',
    minYear: 2000,
    maxYear: 2014,
    expectedResults: 100
  },
  {
    query: '"microbial fuel cell" AND wastewater AND treatment',
    category: 'EARLY_MFC_WASTEWATER',
    minYear: 2000,
    maxYear: 2014,
    expectedResults: 80
  },
  {
    query: '"bioelectrochemical system" AND performance',
    category: 'EARLY_BES_PERFORMANCE',
    minYear: 2000,
    maxYear: 2014,
    expectedResults: 60
  },
  {
    query: 'Geobacter AND "electron transfer" AND electrode',
    category: 'EARLY_GEOBACTER',
    minYear: 2000,
    maxYear: 2014,
    expectedResults: 50
  },
  {
    query: 'Shewanella AND biofilm AND electrode',
    category: 'EARLY_SHEWANELLA',
    minYear: 2000,
    maxYear: 2014,
    expectedResults: 40
  }
]

// CrossRef API integration with better date handling
async function searchCrossRef(query: string, minYear: number, maxYear: number, rows: number = 50) {
  const baseUrl = 'https://api.crossref.org/works'
  const params = new URLSearchParams({
    query: query,
    filter: `from-pub-date:${minYear},until-pub-date:${maxYear}`,
    rows: rows.toString(),
    select: 'DOI,title,author,published,published-print,publisher,subject,abstract,URL,container-title'
  })
  
  try {
    const response = await axios.get(`${baseUrl}?${params}`, {
      headers: {
        'User-Agent': 'MESSAi Literature System (mailto:research@messai.io)'
      },
      timeout: 30000
    })
    
    return response.data.message.items || []
  } catch (error) {
    console.error('CrossRef API error:', error)
    return []
  }
}

// Parse CrossRef response with better date handling
function parseCrossRefItem(item: any) {
  // Try multiple date sources
  let publicationDate = null
  let year = null
  
  // Check published-print first (most reliable for print journals)
  if (item['published-print']?.['date-parts']?.[0]) {
    const dateParts = item['published-print']['date-parts'][0]
    year = dateParts[0]
    publicationDate = dateParts.join('-')
  }
  // Then check published (online date)
  else if (item.published?.['date-parts']?.[0]) {
    const dateParts = item.published['date-parts'][0]
    year = dateParts[0]
    publicationDate = dateParts.join('-')
  }
  
  return {
    title: item.title?.[0] || '',
    authors: (item.author || []).map((a: any) => `${a.given || ''} ${a.family || ''}`).filter(Boolean),
    abstract: item.abstract || null,
    doi: item.DOI,
    journal: item['container-title']?.[0] || null,
    publicationDate: publicationDate,
    year: year,
    externalUrl: item.URL || `https://doi.org/${item.DOI}`,
    source: 'crossref_api' as const,
    keywords: item.subject || []
  }
}

// Quality validation function
function validatePaperQuality(paper: any): QualityCriteria {
  const publicationYear = paper.year || 0
  
  return {
    hasAbstract: !!(paper.abstract && paper.abstract.length > 100),
    hasVerifiableId: !!(paper.doi || paper.pubmedId || paper.arxivId),
    hasAuthors: !!(paper.authors && paper.authors.length > 0),
    isRecentEnough: publicationYear >= 2000 && publicationYear <= 2014,
    isRelevantField: checkRelevance(paper),
    hasPerformanceData: checkForPerformanceData(paper)
  }
}

// Check if paper is relevant to our field
function checkRelevance(paper: any): boolean {
  const relevantTerms = [
    'microbial fuel cell', 'bioelectrochemical', 'microbial electrolysis',
    'bioelectricity', 'electroactive bacteria', 'electron transfer',
    'biocathode', 'bioanode', 'biofilm electrode', 'microbial desalination'
  ]
  
  const text = `${paper.title} ${paper.abstract || ''} ${(paper.keywords || []).join(' ')}`.toLowerCase()
  
  return relevantTerms.some(term => text.includes(term))
}

// Check for performance data indicators
function checkForPerformanceData(paper: any): boolean {
  const performanceTerms = [
    'mW/m2', 'mA/cm2', 'power density', 'current density',
    'coulombic efficiency', 'voltage', 'removal efficiency',
    'hydrogen production', 'W/m3', 'A/m2'
  ]
  
  const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase()
  
  return performanceTerms.some(term => text.includes(term))
}

// Main collection function
async function collectEarlyMFCPapers() {
  console.log('🚀 Starting Early MFC Paper Collection (2000-2014)')
  console.log('📋 Target: Real papers from the early days of MFC research')
  console.log(`🔍 Configured searches: ${EARLY_MFC_SEARCHES.length}`)
  console.log(`🎯 Expected total: ~${EARLY_MFC_SEARCHES.reduce((sum, s) => sum + s.expectedResults, 0)} papers\n`)
  
  const stats = {
    totalSearches: 0,
    totalFound: 0,
    totalAdded: 0,
    totalSkipped: 0,
    totalDuplicates: 0,
    byCategory: {} as Record<string, number>
  }
  
  for (const search of EARLY_MFC_SEARCHES) {
    console.log(`\n🔍 Searching: ${search.category}`)
    console.log(`   Query: "${search.query}"`)
    console.log(`   Year Range: ${search.minYear}-${search.maxYear}`)
    console.log(`   Expected: ~${search.expectedResults} papers`)
    
    stats.totalSearches++
    
    // Search CrossRef
    console.log('   📚 Searching CrossRef...')
    const crossrefResults = await searchCrossRef(search.query, search.minYear, search.maxYear, search.expectedResults)
    console.log(`   Found ${crossrefResults.length} results from CrossRef`)
    
    // Process results
    let categoryAdded = 0
    for (const item of crossrefResults) {
      try {
        const paper = parseCrossRefItem(item)
        
        // Debug: Show what we're processing
        if (stats.totalFound < 5) {
          console.log(`\n   📄 Processing: "${paper.title.substring(0, 50)}..."`)
          console.log(`      Year: ${paper.year}, DOI: ${paper.doi}`)
        }
        
        // Validate quality
        const quality = validatePaperQuality(paper)
        
        if (!quality.hasVerifiableId) {
          stats.totalSkipped++
          continue
        }
        
        if (!quality.isRelevantField) {
          stats.totalSkipped++
          continue
        }
        
        if (!quality.isRecentEnough) {
          stats.totalSkipped++
          continue
        }
        
        // Check if paper already exists
        const existing = await prisma.researchPaper.findFirst({
          where: {
            OR: [
              { doi: paper.doi },
              { title: paper.title }
            ]
          }
        })
        
        if (existing) {
          stats.totalDuplicates++
          continue
        }
        
        // Add the paper
        const newPaper = await prisma.researchPaper.create({
          data: {
            title: paper.title,
            authors: JSON.stringify(paper.authors),
            abstract: paper.abstract,
            doi: paper.doi,
            journal: paper.journal,
            publicationDate: paper.publicationDate ? new Date(paper.publicationDate) : null,
            keywords: JSON.stringify(paper.keywords),
            externalUrl: paper.externalUrl,
            source: paper.source,
            isPublic: true
          }
        })
        
        console.log(`   ✅ Added: "${paper.title.substring(0, 50)}..." (${paper.year})`)
        categoryAdded++
        stats.totalAdded++
        
      } catch (error) {
        console.error(`   ❌ Error processing paper:`, error)
      }
    }
    
    stats.byCategory[search.category] = categoryAdded
    stats.totalFound += crossrefResults.length
    console.log(`   📊 Added ${categoryAdded} papers in this category`)
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Final report
  console.log('\n📊 Collection Summary:')
  console.log(`Total searches: ${stats.totalSearches}`)
  console.log(`Total papers found: ${stats.totalFound}`)
  console.log(`Total papers added: ${stats.totalAdded}`)
  console.log(`Total duplicates: ${stats.totalDuplicates}`)
  console.log(`Total skipped: ${stats.totalSkipped}`)
  
  console.log('\n📈 Papers added by category:')
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`   ${category}: ${count}`)
  }
  
  // Check final database state
  const totalPapers = await prisma.researchPaper.count()
  const earlyPapers = await prisma.researchPaper.count({
    where: {
      publicationDate: {
        gte: new Date('2000-01-01'),
        lt: new Date('2015-01-01')
      }
    }
  })
  
  console.log(`\n🗄️ Database now contains:`)
  console.log(`   Total papers: ${totalPapers}`)
  console.log(`   Papers from 2000-2014: ${earlyPapers}`)
  
  await prisma.$disconnect()
}

// Run the collection
collectEarlyMFCPapers().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})