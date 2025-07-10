#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

interface SearchQuery {
  query: string
  category: string
  source: 'arxiv' | 'pubmed' | 'crossref'
  minYear?: number
}

class EnhancedPaperSearch {
  // Comprehensive search queries for different sources
  private searchQueries: SearchQuery[] = [
    // arXiv queries - focus on recent papers with performance data
    {
      query: 'all:"microbial fuel cell" AND (all:"power density" OR all:"current density")',
      category: 'MFC_PERFORMANCE',
      source: 'arxiv',
      minYear: 2018
    },
    {
      query: 'all:"bioelectrochemical systems" AND all:"electrode" AND all:"performance"',
      category: 'BES_PERFORMANCE',
      source: 'arxiv',
      minYear: 2018
    },
    {
      query: 'all:"MXene" AND all:"microbial" AND all:"electrode"',
      category: 'MXENE_ELECTRODE',
      source: 'arxiv',
      minYear: 2020
    },
    {
      query: 'all:"graphene" AND (all:"MFC" OR all:"bioelectrochemical")',
      category: 'GRAPHENE_BES',
      source: 'arxiv',
      minYear: 2019
    },
    {
      query: '(all:"algal fuel cell" OR all:"photosynthetic MFC")',
      category: 'ALGAL_MFC',
      source: 'arxiv',
      minYear: 2019
    },
    {
      query: 'all:"microbial electrolysis" AND all:"hydrogen production"',
      category: 'MEC_HYDROGEN',
      source: 'arxiv',
      minYear: 2018
    },
    {
      query: 'all:"microbial desalination cell" AND all:"performance"',
      category: 'MDC_PERFORMANCE',
      source: 'arxiv',
      minYear: 2019
    },
    
    // PubMed queries - biomedical applications
    {
      query: 'MFC[Title] AND (power[Title/Abstract] OR performance[Title/Abstract])',
      category: 'MFC_BIOMEDICAL',
      source: 'pubmed',
      minYear: 2020
    },
    {
      query: '"bioelectrochemical system"[Title/Abstract] AND electrode[Title/Abstract]',
      category: 'BES_BIOMEDICAL',
      source: 'pubmed',
      minYear: 2020
    },
    {
      query: '"microbial fuel cell"[Title/Abstract] AND ("wastewater treatment"[Title/Abstract] OR "waste treatment"[Title/Abstract])',
      category: 'MFC_WASTEWATER',
      source: 'pubmed',
      minYear: 2019
    },
    
    // CrossRef queries - high-impact journals
    {
      query: 'microbial fuel cell power density',
      category: 'HIGH_IMPACT_MFC',
      source: 'crossref',
      minYear: 2020
    },
    {
      query: 'bioelectrochemical systems electrode materials',
      category: 'HIGH_IMPACT_BES',
      source: 'crossref',
      minYear: 2020
    }
  ]

  async fetchFromArxiv(query: string, maxResults: number = 50): Promise<any[]> {
    try {
      console.log(`  🔍 arXiv: "${query.substring(0, 50)}..."`)
      
      const params = new URLSearchParams({
        search_query: query,
        start: '0',
        max_results: maxResults.toString(),
        sortBy: 'relevance',
        sortOrder: 'descending'
      })

      const response = await axios.get(`http://export.arxiv.org/api/query?${params}`)
      const papers = this.parseArxivXML(response.data)
      
      console.log(`  ✅ Found ${papers.length} papers`)
      return papers
    } catch (error) {
      console.error(`  ❌ arXiv error:`, error)
      return []
    }
  }

  async fetchFromPubMed(query: string, maxResults: number = 50, minYear?: number): Promise<any[]> {
    try {
      console.log(`  🔍 PubMed: "${query.substring(0, 50)}..."`)
      
      // Search for IDs
      const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
      const searchParams: any = {
        db: 'pubmed',
        term: query,
        retmax: maxResults,
        retmode: 'json',
        sort: 'relevance'
      }
      
      if (minYear) {
        searchParams.mindate = `${minYear}/01/01`
        searchParams.datetype = 'pdat'
      }

      const searchResponse = await axios.get(searchUrl, { params: searchParams })
      const ids = searchResponse.data.esearchresult?.idlist || []

      if (ids.length === 0) {
        console.log(`  ✅ No papers found`)
        return []
      }

      // Fetch summaries
      const summaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
      const summaryParams = {
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'json'
      }

      const summaryResponse = await axios.get(summaryUrl, { params: summaryParams })
      const papers = this.parsePubMedSummary(summaryResponse.data)
      
      console.log(`  ✅ Found ${papers.length} papers`)
      return papers
    } catch (error) {
      console.error(`  ❌ PubMed error:`, error)
      return []
    }
  }

  async fetchFromCrossRef(query: string, maxResults: number = 50, minYear?: number): Promise<any[]> {
    try {
      console.log(`  🔍 CrossRef: "${query.substring(0, 50)}..."`)
      
      const url = 'https://api.crossref.org/works'
      const params: any = {
        query: query,
        rows: maxResults,
        sort: 'relevance',
        order: 'desc',
        filter: []
      }
      
      if (minYear) {
        params.filter.push(`from-pub-date:${minYear}`)
      }
      
      // Filter for high-impact journals
      params.filter.push('type:journal-article')
      params.filter = params.filter.join(',')

      const response = await axios.get(url, { params })
      const papers = response.data.message?.items || []
      
      console.log(`  ✅ Found ${papers.length} papers`)
      return papers
    } catch (error) {
      console.error(`  ❌ CrossRef error:`, error)
      return []
    }
  }

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
      
      if (idMatch && titleMatch && summaryMatch) {
        papers.push({
          arxivId: idMatch[1].split('/').pop(),
          title: titleMatch[1].trim().replace(/\s+/g, ' '),
          abstract: summaryMatch[1].trim().replace(/\s+/g, ' '),
          authors: authors,
          publishedDate: publishedMatch?.[1] || new Date().toISOString(),
          url: idMatch[1],
          source: 'arxiv'
        })
      }
    }
    
    return papers
  }

  private parsePubMedSummary(data: any): any[] {
    const papers = []
    const result = data.result
    
    if (!result) return papers
    
    for (const id of result.uids || []) {
      const paper = result[id]
      if (paper) {
        papers.push({
          pubmedId: id,
          title: paper.title || '',
          abstract: '', // Will be fetched separately if needed
          authors: paper.authors?.map((a: any) => a.name) || [],
          publishedDate: paper.pubdate || new Date().toISOString(),
          journal: paper.source || '',
          doi: paper.doi || null,
          source: 'pubmed'
        })
      }
    }
    
    return papers
  }

  async savePapers(papers: any[], category: string): Promise<number> {
    let saved = 0
    
    for (const paper of papers) {
      try {
        // Skip if no abstract
        if (!paper.abstract || paper.abstract.length < 50) continue
        
        const paperData: any = {
          title: paper.title || 'Untitled',
          authors: JSON.stringify(paper.authors || []),
          abstract: paper.abstract,
          publicationDate: paper.publishedDate ? new Date(paper.publishedDate) : new Date(),
          journal: paper.journal || paper.source?.toUpperCase() || '',
          doi: paper.DOI || paper.doi || null,
          pubmedId: paper.pubmedId || null,
          arxivId: paper.arxivId || null,
          keywords: JSON.stringify([category, paper.source || 'unknown']),
          externalUrl: paper.url || paper.URL || (paper.doi ? `https://doi.org/${paper.doi}` : ''),
          source: `${paper.source}_api`,
          isPublic: true
        }

        // Check if paper exists (only check non-null values)
        const whereConditions = []
        if (paperData.title) whereConditions.push({ title: paperData.title })
        if (paperData.doi) whereConditions.push({ doi: paperData.doi })
        if (paperData.pubmedId) whereConditions.push({ pubmedId: paperData.pubmedId })
        if (paperData.arxivId) whereConditions.push({ arxivId: paperData.arxivId })
        
        const existing = whereConditions.length > 0 ? await prisma.researchPaper.findFirst({
          where: { OR: whereConditions }
        }) : null

        if (!existing && paperData.abstract) {
          await prisma.researchPaper.create({ data: paperData })
          saved++
          console.log(`    ✅ ${paperData.title.substring(0, 50)}...`)
        }
      } catch (error) {
        console.error(`    ❌ Error saving paper:`, error)
      }
    }
    
    return saved
  }

  async runEnhancedSearch() {
    console.log('🚀 Starting enhanced paper search...\n')
    
    let totalSaved = 0
    const startTime = Date.now()

    // Group queries by source
    const arxivQueries = this.searchQueries.filter(q => q.source === 'arxiv')
    const pubmedQueries = this.searchQueries.filter(q => q.source === 'pubmed')
    const crossrefQueries = this.searchQueries.filter(q => q.source === 'crossref')

    // Process arXiv queries
    console.log('📚 Searching arXiv...')
    for (const query of arxivQueries) {
      const papers = await this.fetchFromArxiv(query.query, 50)
      const saved = await this.savePapers(papers, query.category)
      totalSaved += saved
      await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limiting
    }

    // Process PubMed queries
    console.log('\n📚 Searching PubMed...')
    for (const query of pubmedQueries) {
      const papers = await this.fetchFromPubMed(query.query, 50, query.minYear)
      const saved = await this.savePapers(papers, query.category)
      totalSaved += saved
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Process CrossRef queries
    console.log('\n📚 Searching CrossRef...')
    for (const query of crossrefQueries) {
      const papers = await this.fetchFromCrossRef(query.query, 50, query.minYear)
      const saved = await this.savePapers(papers, query.category)
      totalSaved += saved
      await new Promise(resolve => setTimeout(resolve, 2000)) // Longer delay for CrossRef
    }

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1)
    
    console.log('\n✅ Enhanced search complete!')
    console.log(`\n📊 Summary:`)
    console.log(`  Total new papers saved: ${totalSaved}`)
    console.log(`  Time taken: ${duration} minutes`)
    
    // Show final database stats
    const totalPapers = await prisma.researchPaper.count()
    const withAbstracts = await prisma.researchPaper.count({
      where: { abstract: { not: null } }
    })
    
    console.log(`\n📚 Database status:`)
    console.log(`  Total papers: ${totalPapers}`)
    console.log(`  Papers with abstracts: ${withAbstracts} (${((withAbstracts/totalPapers)*100).toFixed(1)}%)`)
  }
}

async function main() {
  const searcher = new EnhancedPaperSearch()
  try {
    await searcher.runEnhancedSearch()
  } catch (error) {
    console.error('Error during search:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()