#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

// Progress tracking file
const PROGRESS_FILE = path.join(process.cwd(), 'scripts/literature/collection-progress.json')

interface CollectionProgress {
  crossrefOffset: number
  pubmedOffset: number
  arxivOffset: number
  processedPapers: Set<string>
  totalCollected: number
  totalImported: number
  lastRun: string
}

interface StandardPaper {
  title: string
  authors: string[]
  abstract?: string
  journal?: string
  publicationDate?: string
  doi?: string
  pubmedId?: string
  arxivId?: string
  externalUrl?: string
  source: string
  keywords?: string[]
  hasPerformanceData?: boolean
}

class MassivePaperCollector {
  private progress: CollectionProgress
  private fuzzyTitleCache: Map<string, string> = new Map()

  constructor() {
    this.progress = {
      crossrefOffset: 0,
      pubmedOffset: 0,
      arxivOffset: 0,
      processedPapers: new Set(),
      totalCollected: 0,
      totalImported: 0,
      lastRun: new Date().toISOString()
    }
  }

  // Save progress for resume capability
  private async saveProgress() {
    const progressData = {
      ...this.progress,
      processedPapers: Array.from(this.progress.processedPapers)
    }
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(progressData, null, 2))
    console.log(`💾 Progress saved: ${this.progress.totalCollected} collected, ${this.progress.totalImported} imported`)
  }

  // Load previous progress
  private async loadProgress() {
    try {
      const data = await fs.readFile(PROGRESS_FILE, 'utf-8')
      const loaded = JSON.parse(data)
      this.progress = {
        ...loaded,
        processedPapers: new Set(loaded.processedPapers)
      }
      console.log(`📂 Resuming from: CrossRef offset ${this.progress.crossrefOffset}, PubMed offset ${this.progress.pubmedOffset}`)
      return true
    } catch {
      console.log('🆕 Starting fresh collection')
      return false
    }
  }

  // Generate fuzzy title for matching
  private generateFuzzyTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
      .substring(0, 50) // Take first 50 chars for comparison
  }

  // Check for duplicate using fuzzy matching
  private isDuplicate(title: string): boolean {
    const fuzzyTitle = this.generateFuzzyTitle(title)
    
    // Check exact fuzzy match
    if (this.fuzzyTitleCache.has(fuzzyTitle)) {
      return true
    }

    // Check similar titles (Levenshtein distance)
    for (const [cachedFuzzy, originalTitle] of this.fuzzyTitleCache.entries()) {
      const similarity = this.calculateSimilarity(fuzzyTitle, cachedFuzzy)
      if (similarity > 0.85) { // 85% similarity threshold
        console.log(`   ⚠️ Duplicate detected: "${title.substring(0, 50)}..." similar to "${originalTitle.substring(0, 50)}..."`)
        return true
      }
    }

    // Not a duplicate, add to cache
    this.fuzzyTitleCache.set(fuzzyTitle, title)
    return false
  }

  // Calculate string similarity (simple implementation)
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  // Levenshtein distance for fuzzy matching
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Verify paper has performance benchmarks
  private hasPerformanceBenchmarks(paper: StandardPaper): boolean {
    const text = `${paper.title} ${paper.abstract || ''} ${(paper.keywords || []).join(' ')}`.toLowerCase()
    
    // Performance indicators
    const performanceTerms = [
      'mw/m', 'w/m', 'ma/cm', 'a/m', // Power/current density
      'power density', 'current density',
      'coulombic efficiency', 'energy efficiency',
      'voltage', 'open circuit',
      'maximum power', 'peak power',
      'performance', 'output'
    ]
    
    // Check for at least 2 performance indicators
    let matches = 0
    for (const term of performanceTerms) {
      if (text.includes(term)) {
        matches++
        if (matches >= 2) return true
      }
    }
    
    // Check for numeric values with units
    const hasNumericData = /\d+\.?\d*\s*(mW|W|mA|A|V|%)/i.test(text)
    
    return hasNumericData && matches >= 1
  }

  // Fetch papers from CrossRef with pagination
  private async fetchFromCrossRef(offset: number = 0, rows: number = 200): Promise<{papers: any[], hasMore: boolean}> {
    try {
      const query = '"microbial fuel cell" AND (performance OR power OR current OR efficiency)'
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${rows}&offset=${offset}&filter=has-abstract:true`
      
      console.log(`   📡 CrossRef: Fetching offset ${offset}...`)
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'MESSAi/1.0 (mailto:research@messai.io)'
        },
        timeout: 30000
      })
      
      const items = response.data.message.items || []
      const totalResults = response.data.message['total-results'] || 0
      const hasMore = offset + rows < totalResults
      
      console.log(`   ✓ CrossRef: Got ${items.length} papers (${offset + items.length}/${totalResults} total)`)
      
      return { papers: items, hasMore }
    } catch (error: any) {
      console.error(`   ❌ CrossRef error:`, error.message)
      return { papers: [], hasMore: false }
    }
  }

  // Fetch papers from PubMed with pagination
  private async fetchFromPubMed(offset: number = 0, rows: number = 100): Promise<{papers: any[], hasMore: boolean}> {
    try {
      const query = 'microbial fuel cell[Title/Abstract] AND (performance[Title/Abstract] OR power[Title/Abstract] OR current[Title/Abstract])'
      
      // First, get the search results
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retstart=${offset}&retmax=${rows}&retmode=json`
      
      console.log(`   📡 PubMed: Searching offset ${offset}...`)
      const searchResponse = await axios.get(searchUrl, { timeout: 30000 })
      const searchData = searchResponse.data
      
      if (!searchData.esearchresult || !searchData.esearchresult.idlist) {
        return { papers: [], hasMore: false }
      }
      
      const ids = searchData.esearchresult.idlist
      const totalCount = parseInt(searchData.esearchresult.count) || 0
      const hasMore = offset + rows < totalCount
      
      if (ids.length === 0) {
        return { papers: [], hasMore }
      }
      
      // Fetch details for the IDs
      const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`
      const fetchResponse = await axios.get(fetchUrl, { timeout: 30000 })
      
      console.log(`   ✓ PubMed: Got ${ids.length} papers (${offset + ids.length}/${totalCount} total)`)
      
      // Parse XML response (simplified - in production use proper XML parser)
      const papers = this.parsePubMedXML(fetchResponse.data, ids)
      
      return { papers, hasMore }
    } catch (error: any) {
      console.error(`   ❌ PubMed error:`, error.message)
      return { papers: [], hasMore: false }
    }
  }

  // Parse PubMed XML response
  private parsePubMedXML(xml: string, ids: string[]): any[] {
    const papers: any[] = []
    
    // Simple regex parsing (in production, use proper XML parser)
    const articles = xml.split('<PubmedArticle>')
    
    for (let i = 1; i < articles.length && i <= ids.length; i++) {
      const article = articles[i]
      
      const title = article.match(/<ArticleTitle>(.*?)<\/ArticleTitle>/s)?.[1] || ''
      const abstract = article.match(/<AbstractText.*?>(.*?)<\/AbstractText>/s)?.[1] || ''
      
      papers.push({
        pmid: ids[i - 1],
        title: this.cleanXMLText(title),
        abstract: this.cleanXMLText(abstract)
      })
    }
    
    return papers
  }

  // Clean XML text
  private cleanXMLText(text: string): string {
    return text
      .replace(/<[^>]+>/g, '') // Remove XML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Fetch papers from arXiv with pagination
  private async fetchFromArxiv(offset: number = 0, rows: number = 50): Promise<{papers: any[], hasMore: boolean}> {
    try {
      const query = 'all:"microbial fuel cell" AND (all:performance OR all:power OR all:current)'
      const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&start=${offset}&max_results=${rows}`
      
      console.log(`   📡 arXiv: Fetching offset ${offset}...`)
      const response = await axios.get(url, { timeout: 30000 })
      
      // Parse arXiv XML response
      const papers = this.parseArxivXML(response.data)
      
      // arXiv doesn't provide total count easily, so check if we got full batch
      const hasMore = papers.length === rows
      
      console.log(`   ✓ arXiv: Got ${papers.length} papers`)
      
      return { papers, hasMore }
    } catch (error: any) {
      console.error(`   ❌ arXiv error:`, error.message)
      return { papers: [], hasMore: false }
    }
  }

  // Parse arXiv XML response
  private parseArxivXML(xml: string): any[] {
    const papers: any[] = []
    
    const entries = xml.split('<entry>')
    for (let i = 1; i < entries.length; i++) {
      const entry = entries[i]
      
      const id = entry.match(/<id>(.*?)<\/id>/)?.[1]?.split('/').pop() || ''
      const title = entry.match(/<title>(.*?)<\/title>/s)?.[1] || ''
      const summary = entry.match(/<summary>(.*?)<\/summary>/s)?.[1] || ''
      
      papers.push({
        arxivId: id,
        title: this.cleanXMLText(title),
        abstract: this.cleanXMLText(summary)
      })
    }
    
    return papers
  }

  // Convert to standard format
  private convertToStandardFormat(source: string, papers: any[]): StandardPaper[] {
    const standardPapers: StandardPaper[] = []
    
    for (const paper of papers) {
      let standardPaper: StandardPaper | null = null
      
      if (source === 'crossref') {
        standardPaper = {
          title: paper.title?.[0] || 'Untitled',
          authors: paper.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
          abstract: paper.abstract,
          journal: paper['container-title']?.[0],
          publicationDate: paper.published?.['date-parts']?.[0] ? 
            new Date(paper.published['date-parts'][0][0], 
                     (paper.published['date-parts'][0][1] || 1) - 1, 
                     paper.published['date-parts'][0][2] || 1).toISOString() : undefined,
          doi: paper.DOI,
          externalUrl: paper.URL,
          source: 'crossref_comprehensive',
          keywords: paper.subject || []
        }
      } else if (source === 'pubmed') {
        standardPaper = {
          title: paper.title,
          authors: ['Authors to be extracted'],
          abstract: paper.abstract,
          pubmedId: paper.pmid,
          externalUrl: `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`,
          source: 'pubmed_comprehensive',
          keywords: [] // PubMed doesn't provide keywords in basic fetch
        }
      } else if (source === 'arxiv') {
        standardPaper = {
          title: paper.title,
          authors: ['Authors to be extracted'],
          abstract: paper.abstract,
          arxivId: paper.arxivId,
          externalUrl: `https://arxiv.org/abs/${paper.arxivId}`,
          source: 'arxiv_comprehensive',
          keywords: [] // arXiv doesn't provide keywords in basic fetch
        }
      }
      
      if (standardPaper && !this.isDuplicate(standardPaper.title)) {
        // Check for performance benchmarks
        standardPaper.hasPerformanceData = this.hasPerformanceBenchmarks(standardPaper)
        
        if (standardPaper.hasPerformanceData) {
          standardPapers.push(standardPaper)
          
          // Generate unique ID for tracking
          const paperId = crypto.createHash('md5').update(standardPaper.title).digest('hex')
          this.progress.processedPapers.add(paperId)
        }
      }
    }
    
    return standardPapers
  }

  // Import papers to database
  private async importPapers(papers: StandardPaper[]): Promise<number> {
    let imported = 0
    
    for (const paper of papers) {
      try {
        // Check if paper already exists
        const existing = await prisma.researchPaper.findFirst({
          where: {
            OR: [
              { doi: paper.doi || undefined },
              { pubmedId: paper.pubmedId || undefined },
              { arxivId: paper.arxivId || undefined },
              { title: paper.title }
            ]
          }
        })
        
        if (!existing) {
          await prisma.researchPaper.create({
            data: {
              title: paper.title,
              authors: JSON.stringify(paper.authors),
              abstract: paper.abstract,
              journal: paper.journal,
              publicationDate: paper.publicationDate,
              doi: paper.doi,
              pubmedId: paper.pubmedId,
              arxivId: paper.arxivId,
              externalUrl: paper.externalUrl,
              source: paper.source,
              keywords: paper.keywords ? JSON.stringify(paper.keywords) : null,
              isPublic: true,
              uploadedBy: 'cmcno7mde0000o1adjp1ub0j2' // System user
            }
          })
          imported++
        }
      } catch (error: any) {
        console.error(`   ❌ Import error for "${paper.title.substring(0, 50)}...":`, error.message)
      }
    }
    
    return imported
  }

  // Main collection method
  async collectAllPapers() {
    console.log('🚀 Starting MASSIVE MFC paper collection...')
    console.log('   Target: ALL papers mentioning "microbial fuel cell" with performance benchmarks\n')
    
    // Load previous progress if available
    const resumed = await this.loadProgress()
    
    // Initialize fuzzy cache from processed papers
    if (resumed) {
      const existingPapers = await prisma.researchPaper.findMany({
        select: { title: true }
      })
      
      for (const paper of existingPapers) {
        this.fuzzyTitleCache.set(this.generateFuzzyTitle(paper.title), paper.title)
      }
      console.log(`   📊 Loaded ${this.fuzzyTitleCache.size} existing papers for duplicate detection\n`)
    }
    
    let continueCollection = true
    let batchCount = 0
    
    while (continueCollection) {
      batchCount++
      console.log(`\n📦 Batch ${batchCount}:`)
      
      const batchPapers: StandardPaper[] = []
      
      // Fetch from all sources in parallel
      const [crossrefResult, pubmedResult, arxivResult] = await Promise.all([
        this.fetchFromCrossRef(this.progress.crossrefOffset, 200),
        this.fetchFromPubMed(this.progress.pubmedOffset, 100),
        this.fetchFromArxiv(this.progress.arxivOffset, 50)
      ])
      
      // Convert and filter papers
      const crossrefPapers = this.convertToStandardFormat('crossref', crossrefResult.papers)
      const pubmedPapers = this.convertToStandardFormat('pubmed', pubmedResult.papers)
      const arxivPapers = this.convertToStandardFormat('arxiv', arxivResult.papers)
      
      batchPapers.push(...crossrefPapers, ...pubmedPapers, ...arxivPapers)
      
      console.log(`\n   📊 Batch summary:`)
      console.log(`      CrossRef: ${crossrefPapers.length} papers with performance data`)
      console.log(`      PubMed: ${pubmedPapers.length} papers with performance data`)
      console.log(`      arXiv: ${arxivPapers.length} papers with performance data`)
      console.log(`      Total: ${batchPapers.length} unique papers to import`)
      
      // Import papers
      if (batchPapers.length > 0) {
        const imported = await this.importPapers(batchPapers)
        this.progress.totalImported += imported
        console.log(`   ✅ Imported ${imported} new papers`)
      }
      
      // Update progress
      this.progress.totalCollected += batchPapers.length
      
      // Update offsets
      if (crossrefResult.hasMore) this.progress.crossrefOffset += 200
      if (pubmedResult.hasMore) this.progress.pubmedOffset += 100
      if (arxivResult.hasMore) this.progress.arxivOffset += 50
      
      // Check if we should continue
      continueCollection = crossrefResult.hasMore || pubmedResult.hasMore || arxivResult.hasMore
      
      // Save progress after each batch
      await this.saveProgress()
      
      // Rate limiting between batches
      if (continueCollection) {
        console.log('\n   ⏳ Waiting 5 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
      
      // No limit - collect ALL papers
      // Safety check: stop after 1000 batches (extremely unlikely but prevents infinite loops)
      if (batchCount >= 1000) {
        console.log('\n   ⚠️ Reached maximum batch limit (1000) as a safety measure.')
        break
      }
    }
    
    // Final statistics
    console.log('\n' + '='.repeat(80))
    console.log('✅ COLLECTION COMPLETE!')
    console.log('='.repeat(80))
    
    const totalInDb = await prisma.researchPaper.count()
    const withPerformance = await prisma.researchPaper.count({
      where: {
        OR: [
          { powerOutput: { not: null } },
          { efficiency: { not: null } },
          { keywords: { contains: 'HAS_PERFORMANCE_DATA' } }
        ]
      }
    })
    
    console.log(`\n📊 Final Statistics:`)
    console.log(`   Total papers collected: ${this.progress.totalCollected}`)
    console.log(`   Papers imported: ${this.progress.totalImported}`)
    console.log(`   Total papers in database: ${totalInDb}`)
    console.log(`   Papers with performance data: ${withPerformance}`)
    console.log(`   Duplicate papers filtered: ${this.progress.totalCollected - this.progress.totalImported}`)
    
    // Optional: Delete progress file after successful completion
    // await fs.unlink(PROGRESS_FILE).catch(() => {})
  }
}

async function main() {
  const collector = new MassivePaperCollector()
  
  try {
    await collector.collectAllPapers()
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { MassivePaperCollector }