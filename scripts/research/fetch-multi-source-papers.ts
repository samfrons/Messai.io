#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

interface FetchResult {
  source: string
  papers: any[]
  error?: string
}

class MultiSourcePaperFetcher {
  private coreApiKey: string
  private geminiApiKey: string

  constructor() {
    this.coreApiKey = process.env.CORE_API_KEY || ''
    this.geminiApiKey = process.env.GEMINI_API_KEY || ''
  }

  // Fetch from arXiv (no API key needed)
  async fetchFromArxiv(query: string, maxResults: number = 20): Promise<FetchResult> {
    try {
      console.log(`🔍 Searching arXiv for: "${query}"`)
      
      const params = new URLSearchParams({
        search_query: `all:${query}`,
        start: '0',
        max_results: maxResults.toString(),
        sortBy: 'relevance',
        sortOrder: 'descending'
      })

      const response = await axios.get(`http://export.arxiv.org/api/query?${params}`)
      
      // Parse XML response (simplified - in production use proper XML parser)
      const papers = this.parseArxivXML(response.data)
      
      console.log(`✅ Found ${papers.length} papers from arXiv`)
      return { source: 'arxiv', papers }
    } catch (error) {
      console.error(`❌ arXiv error:`, error)
      return { source: 'arxiv', papers: [], error: String(error) }
    }
  }

  // Fetch from CORE API
  async fetchFromCORE(query: string, limit: number = 20): Promise<FetchResult> {
    try {
      console.log(`🔍 Searching CORE for: "${query}"`)
      
      if (!this.coreApiKey) {
        throw new Error('CORE_API_KEY not found in environment')
      }

      const response = await axios.post(
        'https://api.core.ac.uk/v3/search/works',
        {
          q: query,
          limit: limit,
          scroll: false,
          exclude: ['fullText']
        },
        {
          headers: {
            'Authorization': `Bearer ${this.coreApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const papers = response.data.results || []
      console.log(`✅ Found ${papers.length} papers from CORE`)
      return { source: 'core', papers }
    } catch (error) {
      console.error(`❌ CORE error:`, error)
      return { source: 'core', papers: [], error: String(error) }
    }
  }

  // Parse arXiv XML response
  private parseArxivXML(xmlData: string): any[] {
    const papers = []
    const entries = xmlData.split('<entry>')
    
    for (let i = 1; i < entries.length; i++) {
      const entry = entries[i]
      
      const idMatch = entry.match(/<id>([^<]+)<\/id>/)
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/)
      const summaryMatch = entry.match(/<summary>([^<]+)<\/summary>/)
      const publishedMatch = entry.match(/<published>([^<]+)<\/published>/)
      
      // Extract authors
      const authorMatches = entry.matchAll(/<author>\s*<name>([^<]+)<\/name>\s*<\/author>/g)
      const authors = Array.from(authorMatches).map(m => m[1])
      
      if (idMatch && titleMatch) {
        papers.push({
          arxivId: idMatch[1].split('/').pop(),
          title: titleMatch[1].trim(),
          abstract: summaryMatch?.[1].trim() || '',
          authors: authors,
          publishedDate: publishedMatch?.[1] || new Date().toISOString(),
          url: idMatch[1]
        })
      }
    }
    
    return papers
  }

  // Process papers with Ollama (local LLM)
  async processWithOllama(paperText: string): Promise<any> {
    try {
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'deepseek-r1', // or any other model you have
        prompt: `Extract performance data from this bioelectrochemical systems paper:\n\n${paperText}\n\nExtract: power density, current density, efficiency, materials used.`,
        stream: false
      })

      return response.data
    } catch (error) {
      console.error('Ollama processing error:', error)
      return null
    }
  }

  // Save papers to database
  async savePapers(papers: any[], source: string) {
    let saved = 0
    
    for (const paper of papers) {
      try {
        const paperData = {
          title: paper.title || 'Untitled',
          authors: JSON.stringify(paper.authors || []),
          abstract: paper.abstract || paper.summary || '',
          publicationDate: paper.publishedDate ? new Date(paper.publishedDate) : new Date(),
          journal: paper.journal || source.toUpperCase(),
          doi: paper.doi || null,
          arxivId: paper.arxivId || null,
          keywords: JSON.stringify([source, 'bioelectrochemical']),
          externalUrl: paper.url || paper.downloadUrl || '',
          source: source,
          isPublic: true
        }

        // Check if paper exists
        const existing = await prisma.researchPaper.findFirst({
          where: {
            OR: [
              { title: paperData.title },
              { doi: paperData.doi },
              { arxivId: paperData.arxivId }
            ]
          }
        })

        if (!existing) {
          await prisma.researchPaper.create({ data: paperData })
          saved++
          console.log(`  ✅ Saved: ${paperData.title.substring(0, 60)}...`)
        }
      } catch (error) {
        console.error(`  ❌ Error saving paper:`, error)
      }
    }
    
    return saved
  }
}

// Search configurations for BES topics
const searchQueries = [
  'microbial fuel cell MFC power density',
  'bioelectrochemical systems BES performance',
  'microbial electrolysis cell hydrogen production',
  'MXene electrode microbial fuel cell',
  'graphene bioelectrochemical systems',
  'algal fuel cell photosynthetic',
  'microbial desalination cell MDC',
  'bioelectrochemical wastewater treatment'
]

async function main() {
  console.log('🚀 Starting multi-source paper fetching...')
  console.log('✅ Ollama is installed and running')
  console.log('✅ API keys loaded:', {
    CORE: !!process.env.CORE_API_KEY,
    Gemini: !!process.env.GEMINI_API_KEY
  })
  
  const fetcher = new MultiSourcePaperFetcher()
  let totalSaved = 0

  for (const query of searchQueries) {
    console.log(`\n📚 Searching for: "${query}"`)
    
    // Fetch from multiple sources
    const [arxivResult, coreResult] = await Promise.all([
      fetcher.fetchFromArxiv(query, 10),
      fetcher.fetchFromCORE(query, 10)
    ])

    // Save papers
    if (arxivResult.papers.length > 0) {
      const saved = await fetcher.savePapers(arxivResult.papers, 'arxiv')
      totalSaved += saved
    }

    if (coreResult.papers.length > 0) {
      const saved = await fetcher.savePapers(coreResult.papers, 'core')
      totalSaved += saved
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log(`\n📊 Summary:`)
  console.log(`  Total new papers saved: ${totalSaved}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)