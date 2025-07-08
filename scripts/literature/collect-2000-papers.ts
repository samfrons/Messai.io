#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

// Configuration
const CROSSREF_DELAY = 1000 // 1 second between requests
const PUBMED_DELAY = 500 // 0.5 seconds for PubMed
const ARXIV_DELAY = 2000 // 2 seconds for arXiv
const BATCH_SIZE = 100 // Papers per search
const TARGET_PAPERS = 2000 // Total target

// Comprehensive search queries for different time periods and topics
const SEARCH_QUERIES = [
  // Early foundational work (2000-2010)
  { query: '"microbial fuel cell"', yearStart: 2000, yearEnd: 2010, expectedCount: 300 },
  { query: '"bioelectrochemical system"', yearStart: 2000, yearEnd: 2010, expectedCount: 200 },
  { query: '"microbial electrolysis cell"', yearStart: 2005, yearEnd: 2010, expectedCount: 100 },
  { query: '"microbial desalination cell"', yearStart: 2008, yearEnd: 2010, expectedCount: 50 },
  
  // Mid-period development (2011-2015)
  { query: '"microbial fuel cell" AND power', yearStart: 2011, yearEnd: 2015, expectedCount: 250 },
  { query: '"bioelectrochemical" AND wastewater', yearStart: 2011, yearEnd: 2015, expectedCount: 200 },
  { query: '"microbial fuel cell" AND optimization', yearStart: 2011, yearEnd: 2015, expectedCount: 150 },
  { query: 'MFC AND electrode', yearStart: 2011, yearEnd: 2015, expectedCount: 200 },
  
  // Recent innovations (2016-2020)
  { query: '"microbial fuel cell" AND graphene', yearStart: 2016, yearEnd: 2020, expectedCount: 150 },
  { query: '"bioelectrochemical" AND "carbon nanotube"', yearStart: 2016, yearEnd: 2020, expectedCount: 100 },
  { query: 'MFC AND "power density"', yearStart: 2016, yearEnd: 2020, expectedCount: 200 },
  { query: '"microbial electrochemical" AND performance', yearStart: 2016, yearEnd: 2020, expectedCount: 150 },
  
  // Latest research (2021-2025)
  { query: 'MXene AND "microbial fuel cell"', yearStart: 2021, yearEnd: 2025, expectedCount: 80 },
  { query: '"machine learning" AND MFC', yearStart: 2021, yearEnd: 2025, expectedCount: 50 },
  { query: '"pilot scale" AND "microbial fuel cell"', yearStart: 2021, yearEnd: 2025, expectedCount: 70 },
  { query: '"3D printing" AND bioelectrochemical', yearStart: 2021, yearEnd: 2025, expectedCount: 40 },
  
  // Specific materials and organisms
  { query: 'Geobacter AND electrode', yearStart: 2000, yearEnd: 2025, expectedCount: 150 },
  { query: 'Shewanella AND "electron transfer"', yearStart: 2000, yearEnd: 2025, expectedCount: 120 },
  { query: '"carbon cloth" AND MFC', yearStart: 2010, yearEnd: 2025, expectedCount: 100 },
  { query: '"stainless steel" AND "microbial fuel cell"', yearStart: 2010, yearEnd: 2025, expectedCount: 80 },
  
  // Applications
  { query: '"brewery wastewater" AND MFC', yearStart: 2010, yearEnd: 2025, expectedCount: 60 },
  { query: '"dairy wastewater" AND bioelectrochemical', yearStart: 2010, yearEnd: 2025, expectedCount: 50 },
  { query: '"heavy metal removal" AND MFC', yearStart: 2015, yearEnd: 2025, expectedCount: 70 },
  { query: '"biosensor" AND "microbial fuel cell"', yearStart: 2015, yearEnd: 2025, expectedCount: 90 },
]

// Paper validation schema
const PaperSchema = z.object({
  title: z.string().min(10),
  authors: z.array(z.string()).min(1),
  abstract: z.string().optional(),
  doi: z.string().optional(),
  pubmedId: z.string().optional(),
  arxivId: z.string().optional(),
  publicationDate: z.date().optional(),
  journal: z.string().optional(),
  externalUrl: z.string().url()
})

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchFromCrossRef(query: string, yearStart: number, yearEnd: number, rows: number = 100): Promise<any[]> {
  try {
    const url = 'https://api.crossref.org/works'
    const params = new URLSearchParams({
      query,
      filter: `from-pub-date:${yearStart},until-pub-date:${yearEnd},type:journal-article`,
      rows: rows.toString(),
      select: 'DOI,title,author,published,publisher,subject,abstract,URL,container-title,volume,issue,page',
      sort: 'relevance',
      order: 'desc'
    })
    
    console.log(`   🔍 CrossRef search: "${query}" (${yearStart}-${yearEnd})`)
    
    const response = await axios.get(`${url}?${params}`, {
      headers: {
        'User-Agent': 'MESSAi Research Platform (mailto:research@messai.io)',
        'Accept': 'application/json'
      },
      timeout: 30000
    })
    
    if (response.data?.message?.items) {
      const items = response.data.message.items
      console.log(`   ✅ Found ${items.length} papers from CrossRef`)
      return items
    }
    
    return []
  } catch (error: any) {
    console.error(`   ❌ CrossRef error: ${error.message}`)
    return []
  }
}

async function fetchFromPubMed(query: string, yearStart: number, yearEnd: number, retmax: number = 100): Promise<any[]> {
  try {
    // Step 1: Search for PMIDs
    const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
    const dateFilter = `${yearStart}/01/01:${yearEnd}/12/31[pdat]`
    const searchParams = new URLSearchParams({
      db: 'pubmed',
      term: `${query} AND ${dateFilter}`,
      retmax: retmax.toString(),
      retmode: 'json',
      sort: 'relevance'
    })
    
    console.log(`   🔍 PubMed search: "${query}" (${yearStart}-${yearEnd})`)
    
    const searchResponse = await axios.get(`${searchUrl}?${searchParams}`, {
      timeout: 30000
    })
    
    const pmids = searchResponse.data?.esearchresult?.idlist || []
    
    if (pmids.length === 0) {
      console.log(`   ✅ No papers found in PubMed`)
      return []
    }
    
    // Step 2: Fetch details
    const fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
    const fetchParams = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml'
    })
    
    const fetchResponse = await axios.get(`${fetchUrl}?${fetchParams}`, {
      timeout: 30000
    })
    
    // Parse XML (simplified)
    const papers = parsePubMedXML(fetchResponse.data)
    console.log(`   ✅ Found ${papers.length} papers from PubMed`)
    
    return papers
  } catch (error: any) {
    console.error(`   ❌ PubMed error: ${error.message}`)
    return []
  }
}

function parsePubMedXML(xml: string): any[] {
  const papers: any[] = []
  const articleMatches = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || []
  
  for (const articleXml of articleMatches) {
    try {
      const pmid = articleXml.match(/<PMID.*?>(.*?)<\/PMID>/)?.[1]
      const title = articleXml.match(/<ArticleTitle>(.*?)<\/ArticleTitle>/)?.[1]?.replace(/<[^>]*>/g, '')
      const abstract = articleXml.match(/<AbstractText.*?>(.*?)<\/AbstractText>/s)?.[1]?.replace(/<[^>]*>/g, '')
      const doi = articleXml.match(/<ELocationID EIdType="doi".*?>(.*?)<\/ELocationID>/)?.[1]
      const journal = articleXml.match(/<Title>(.*?)<\/Title>/)?.[1]
      
      // Parse authors
      const authorMatches = articleXml.match(/<Author.*?>[\s\S]*?<\/Author>/g) || []
      const authors = authorMatches.map(authorXml => {
        const lastName = authorXml.match(/<LastName>(.*?)<\/LastName>/)?.[1] || ''
        const firstName = authorXml.match(/<ForeName>(.*?)<\/ForeName>/)?.[1] || ''
        return `${firstName} ${lastName}`.trim()
      }).filter(Boolean)
      
      // Parse date
      const year = articleXml.match(/<Year>(.*?)<\/Year>/)?.[1]
      const month = articleXml.match(/<Month>(.*?)<\/Month>/)?.[1] || '01'
      const day = articleXml.match(/<Day>(.*?)<\/Day>/)?.[1] || '01'
      
      if (pmid && title) {
        papers.push({
          pmid,
          title,
          abstract,
          authors,
          doi,
          journal,
          publicationDate: year ? new Date(`${year}-${month}-${day}`) : null,
          externalUrl: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        })
      }
    } catch (e) {
      // Skip malformed entries
    }
  }
  
  return papers
}

async function processAndStorePapers(papers: any[], source: string, searchQuery: string): Promise<{ added: number, skipped: number }> {
  let added = 0
  let skipped = 0
  
  for (const paper of papers) {
    try {
      // Extract and validate paper data
      const paperData: any = {
        title: paper.title?.[0] || paper.title || '',
        authors: [],
        abstract: paper.abstract || null,
        doi: paper.DOI || paper.doi || null,
        pubmedId: paper.pmid || null,
        arxivId: paper.arxivId || null,
        publicationDate: null,
        journal: paper['container-title']?.[0] || paper.journal || null,
        externalUrl: paper.URL || paper.externalUrl || '',
        source,
        keywords: JSON.stringify([searchQuery]),
        isPublic: true,
        uploadedBy: 'cmcno7mde0000o1adjp1ub0j2' // Sam Frons user
      }
      
      // Process authors
      if (paper.author && Array.isArray(paper.author)) {
        paperData.authors = paper.author.map((a: any) => 
          `${a.given || ''} ${a.family || ''}`.trim()
        ).filter(Boolean)
      } else if (paper.authors && Array.isArray(paper.authors)) {
        paperData.authors = paper.authors
      }
      
      if (paperData.authors.length === 0) {
        paperData.authors = ['Unknown Author']
      }
      
      paperData.authors = JSON.stringify(paperData.authors)
      
      // Process date
      if (paper.published?.['date-parts']?.[0]) {
        const [year, month = 1, day = 1] = paper.published['date-parts'][0]
        paperData.publicationDate = new Date(year, month - 1, day)
      } else if (paper.publicationDate) {
        paperData.publicationDate = new Date(paper.publicationDate)
      }
      
      // Skip if no title or no identifiable ID
      if (!paperData.title || paperData.title.length < 10) {
        skipped++
        continue
      }
      
      // Check for duplicates
      const existing = await prisma.researchPaper.findFirst({
        where: {
          OR: [
            paperData.doi ? { doi: paperData.doi } : {},
            paperData.pubmedId ? { pubmedId: paperData.pubmedId } : {},
            { title: paperData.title }
          ].filter(obj => Object.keys(obj).length > 0)
        }
      })
      
      if (existing) {
        skipped++
        continue
      }
      
      // Ensure we have a valid external URL
      if (!paperData.externalUrl && paperData.doi) {
        paperData.externalUrl = `https://doi.org/${paperData.doi}`
      } else if (!paperData.externalUrl && paperData.pubmedId) {
        paperData.externalUrl = `https://pubmed.ncbi.nlm.nih.gov/${paperData.pubmedId}/`
      }
      
      if (!paperData.externalUrl) {
        skipped++
        continue
      }
      
      // Extract basic performance data from title/abstract
      const text = `${paperData.title} ${paperData.abstract || ''}`.toLowerCase()
      
      // Extract power output
      const powerMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mw\/m[²2]|w\/m[²2]|mw\s*m-2)/i)
      if (powerMatch) {
        let value = parseFloat(powerMatch[1])
        if (powerMatch[2].toLowerCase().includes('w/m')) {
          value *= 1000 // Convert W/m² to mW/m²
        }
        paperData.powerOutput = value
      }
      
      // Extract efficiency
      const efficiencyMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:coulombic\s*efficiency|CE)/i)
      if (efficiencyMatch) {
        paperData.efficiency = parseFloat(efficiencyMatch[1])
      }
      
      // Extract system type
      if (text.includes('microbial fuel cell') || text.includes('mfc')) {
        paperData.systemType = 'MFC'
      } else if (text.includes('microbial electrolysis') || text.includes('mec')) {
        paperData.systemType = 'MEC'
      } else if (text.includes('microbial desalination') || text.includes('mdc')) {
        paperData.systemType = 'MDC'
      } else if (text.includes('microbial electrosynthesis') || text.includes('mes')) {
        paperData.systemType = 'MES'
      } else if (text.includes('bioelectrochemical')) {
        paperData.systemType = 'BES'
      }
      
      // Create the paper
      await prisma.researchPaper.create({ data: paperData })
      added++
      
      if (added % 10 === 0) {
        console.log(`      Progress: ${added} papers added...`)
      }
      
    } catch (error: any) {
      console.error(`      Error processing paper: ${error.message}`)
      skipped++
    }
  }
  
  return { added, skipped }
}

async function main() {
  console.log('🚀 Starting collection of 2000+ real research papers')
  console.log('================================================')
  
  const startTime = Date.now()
  let totalAdded = 0
  let totalSkipped = 0
  let totalSearched = 0
  
  // Get current count
  const initialCount = await prisma.researchPaper.count()
  console.log(`\n📊 Current database has ${initialCount} papers`)
  console.log(`🎯 Target: ${TARGET_PAPERS} papers (need ${Math.max(0, TARGET_PAPERS - initialCount)} more)\n`)
  
  // Process each search query
  for (const searchConfig of SEARCH_QUERIES) {
    console.log(`\n🔎 Search: "${searchConfig.query}" (${searchConfig.yearStart}-${searchConfig.yearEnd})`)
    console.log(`   Expected: ~${searchConfig.expectedCount} papers`)
    
    // Search CrossRef
    await sleep(CROSSREF_DELAY)
    const crossrefPapers = await fetchFromCrossRef(
      searchConfig.query,
      searchConfig.yearStart,
      searchConfig.yearEnd,
      BATCH_SIZE
    )
    
    if (crossrefPapers.length > 0) {
      const result = await processAndStorePapers(crossrefPapers, 'crossref_api', searchConfig.query)
      totalAdded += result.added
      totalSkipped += result.skipped
      totalSearched += crossrefPapers.length
      console.log(`   📥 CrossRef: Added ${result.added}, Skipped ${result.skipped}`)
    }
    
    // Search PubMed
    await sleep(PUBMED_DELAY)
    const pubmedPapers = await fetchFromPubMed(
      searchConfig.query,
      searchConfig.yearStart,
      searchConfig.yearEnd,
      Math.floor(BATCH_SIZE / 2)
    )
    
    if (pubmedPapers.length > 0) {
      const result = await processAndStorePapers(pubmedPapers, 'pubmed_api', searchConfig.query)
      totalAdded += result.added
      totalSkipped += result.skipped
      totalSearched += pubmedPapers.length
      console.log(`   📥 PubMed: Added ${result.added}, Skipped ${result.skipped}`)
    }
    
    // Check if we've reached our target
    const currentCount = await prisma.researchPaper.count()
    console.log(`   📈 Total papers in database: ${currentCount}`)
    
    if (currentCount >= TARGET_PAPERS) {
      console.log(`\n✅ Target reached! ${currentCount} papers in database`)
      break
    }
  }
  
  // Final statistics
  const finalCount = await prisma.researchPaper.count()
  const duration = Math.round((Date.now() - startTime) / 1000)
  
  console.log('\n================================================')
  console.log('📊 Final Statistics:')
  console.log(`   Initial papers: ${initialCount}`)
  console.log(`   Final papers: ${finalCount}`)
  console.log(`   Papers added: ${totalAdded}`)
  console.log(`   Papers skipped: ${totalSkipped}`)
  console.log(`   Total searched: ${totalSearched}`)
  console.log(`   Success rate: ${((totalAdded / totalSearched) * 100).toFixed(1)}%`)
  console.log(`   Time taken: ${duration} seconds`)
  
  // Get breakdown by source
  const sourceBreakdown = await prisma.researchPaper.groupBy({
    by: ['source'],
    _count: true,
    orderBy: { _count: { source: 'desc' } }
  })
  
  console.log('\n📈 Papers by source:')
  for (const source of sourceBreakdown) {
    console.log(`   ${source.source}: ${source._count} papers`)
  }
  
  // Get year distribution for recent papers
  const recentPapers = await prisma.researchPaper.findMany({
    where: {
      publicationDate: { gte: new Date('2019-01-01') }
    },
    select: { publicationDate: true }
  })
  
  const yearCounts = recentPapers.reduce((acc, paper) => {
    if (paper.publicationDate) {
      const year = paper.publicationDate.getFullYear()
      acc[year] = (acc[year] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>)
  
  console.log('\n📅 Recent papers by year:')
  Object.entries(yearCounts)
    .sort(([a], [b]) => parseInt(b) - parseInt(a))
    .forEach(([year, count]) => {
      console.log(`   ${year}: ${count} papers`)
    })
  
  await prisma.$disconnect()
  console.log('\n✅ Collection complete!')
  
  if (finalCount < TARGET_PAPERS) {
    console.log(`\n⚠️  Note: Target of ${TARGET_PAPERS} papers not reached.`)
    console.log('   Consider running additional searches or adjusting search parameters.')
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export { main }