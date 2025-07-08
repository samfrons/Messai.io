import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

interface CrossRefPaper {
  DOI: string
  title: string[]
  author?: Array<{
    given?: string
    family?: string
  }>
  'container-title'?: string[]
  published?: {
    'date-parts': number[][]
  }
  abstract?: string
  URL?: string
  type: string
  score?: number
}

interface ArxivPaper {
  id: string
  title: string
  summary: string
  authors: Array<{ name: string }>
  published: string
  updated: string
  link: string
  arxiv_primary_category: { term: string }
}

interface PubMedPaper {
  pmid: string
  title: string
  authors: string[]
  abstract: string
  journal: string
  pubdate: string
  doi?: string
}

class RealPaperFetcher {
  private readonly delay = 1000 // 1 second delay between requests to respect rate limits

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async fetchFromCrossRef(query: string, limit: number = 50): Promise<CrossRefPaper[]> {
    console.log(`🔍 Searching CrossRef for: "${query}"`)
    
    try {
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}&sort=score&order=desc&filter=type:journal-article,from-pub-date:2000`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MESSAi Research Platform (mailto:research@messai.io)',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`CrossRef API error: ${response.status}`)
      }

      const data = await response.json() as any
      
      if (data.message && data.message.items) {
        console.log(`✅ Found ${data.message.items.length} papers from CrossRef`)
        return data.message.items as CrossRefPaper[]
      }
      
      return []
    } catch (error) {
      console.error(`❌ CrossRef search failed:`, error)
      return []
    }
  }

  async fetchFromPubMed(query: string, limit: number = 50): Promise<any[]> {
    console.log(`🔍 Searching PubMed for: "${query}"`)
    
    try {
      // First, search for PMIDs
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&sort=relevance&retmode=json`
      
      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) {
        throw new Error(`PubMed search error: ${searchResponse.status}`)
      }

      const searchData = await searchResponse.json() as any
      
      if (!searchData.esearchresult || !searchData.esearchresult.idlist || searchData.esearchresult.idlist.length === 0) {
        console.log(`✅ No papers found in PubMed`)
        return []
      }

      const pmids = searchData.esearchresult.idlist.slice(0, limit)
      
      // Fetch detailed information
      const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`
      
      const fetchResponse = await fetch(fetchUrl)
      if (!fetchResponse.ok) {
        throw new Error(`PubMed fetch error: ${fetchResponse.status}`)
      }

      const xmlText = await fetchResponse.text()
      const papers = this.parsePubMedXML(xmlText)
      
      console.log(`✅ Found ${papers.length} papers from PubMed`)
      return papers
    } catch (error) {
      console.error(`❌ PubMed search failed:`, error)
      return []
    }
  }

  private parsePubMedXML(xmlText: string): any[] {
    const papers: any[] = []
    
    // Simple regex-based XML parsing for PubMed
    const articleMatches = xmlText.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g)
    
    if (articleMatches) {
      for (const articleXml of articleMatches) {
        try {
          const pmidMatch = articleXml.match(/<PMID.*?>(.*?)<\/PMID>/)
          const titleMatch = articleXml.match(/<ArticleTitle>(.*?)<\/ArticleTitle>/)
          const abstractMatch = articleXml.match(/<AbstractText.*?>(.*?)<\/AbstractText>/s)
          const journalMatch = articleXml.match(/<Title>(.*?)<\/Title>/)
          const doiMatch = articleXml.match(/<ELocationID EIdType="doi".*?>(.*?)<\/ELocationID>/)
          
          // Parse publication date
          const pubDateMatch = articleXml.match(/<PubDate>[\s\S]*?<Year>(.*?)<\/Year>[\s\S]*?(?:<Month>(.*?)<\/Month>)?[\s\S]*?(?:<Day>(.*?)<\/Day>)?[\s\S]*?<\/PubDate>/)
          
          // Parse authors
          const authorMatches = articleXml.match(/<Author.*?>[\s\S]*?<LastName>(.*?)<\/LastName>[\s\S]*?(?:<ForeName>(.*?)<\/ForeName>)?[\s\S]*?<\/Author>/g)
          const authors: string[] = []
          
          if (authorMatches) {
            for (const authorXml of authorMatches) {
              const lastNameMatch = authorXml.match(/<LastName>(.*?)<\/LastName>/)
              const firstNameMatch = authorXml.match(/<ForeName>(.*?)<\/ForeName>/)
              
              if (lastNameMatch) {
                const fullName = firstNameMatch 
                  ? `${firstNameMatch[1]} ${lastNameMatch[1]}`
                  : lastNameMatch[1]
                authors.push(fullName)
              }
            }
          }

          if (pmidMatch && titleMatch) {
            const pubYear = pubDateMatch ? parseInt(pubDateMatch[1]) : null
            const pubMonth = pubDateMatch && pubDateMatch[2] ? parseInt(pubDateMatch[2]) : 1
            const pubDay = pubDateMatch && pubDateMatch[3] ? parseInt(pubDateMatch[3]) : 1
            
            papers.push({
              pmid: pmidMatch[1],
              title: titleMatch[1].replace(/<[^>]*>/g, ''), // Remove HTML tags
              abstract: abstractMatch ? abstractMatch[1].replace(/<[^>]*>/g, '') : null,
              authors,
              journal: journalMatch ? journalMatch[1] : null,
              doi: doiMatch ? doiMatch[1] : null,
              publicationDate: pubYear ? new Date(pubYear, (pubMonth || 1) - 1, pubDay || 1) : null,
              externalUrl: doiMatch 
                ? `https://doi.org/${doiMatch[1]}` 
                : `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`
            })
          }
        } catch (e) {
          console.warn(`⚠️ Failed to parse PubMed article: ${e}`)
        }
      }
    }
    
    return papers
  }

  async fetchFromArxiv(query: string, limit: number = 50): Promise<ArxivPaper[]> {
    console.log(`🔍 Searching arXiv for: "${query}"`)
    
    try {
      const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}&sortBy=relevance&sortOrder=descending`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`arXiv API error: ${response.status}`)
      }

      const xmlText = await response.text()
      
      // Simple XML parsing for arXiv feed
      const papers: ArxivPaper[] = []
      const entryMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g)
      
      if (entryMatches) {
        for (const entryXml of entryMatches.slice(0, limit)) {
          try {
            const idMatch = entryXml.match(/<id>(.*?)<\/id>/)
            const titleMatch = entryXml.match(/<title>(.*?)<\/title>/)
            const summaryMatch = entryXml.match(/<summary>(.*?)<\/summary>/)
            const publishedMatch = entryXml.match(/<published>(.*?)<\/published>/)
            const updatedMatch = entryXml.match(/<updated>(.*?)<\/updated>/)
            const categoryMatch = entryXml.match(/<arxiv:primary_category.*?term="(.*?)"/)
            
            const authorMatches = entryXml.match(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g)
            const authors = authorMatches ? authorMatches.map(author => {
              const nameMatch = author.match(/<name>(.*?)<\/name>/)
              return { name: nameMatch ? nameMatch[1] : 'Unknown' }
            }) : []

            if (idMatch && titleMatch && summaryMatch) {
              papers.push({
                id: idMatch[1],
                title: titleMatch[1].replace(/\s+/g, ' ').trim(),
                summary: summaryMatch[1].replace(/\s+/g, ' ').trim(),
                authors,
                published: publishedMatch ? publishedMatch[1] : '',
                updated: updatedMatch ? updatedMatch[1] : '',
                link: idMatch[1],
                arxiv_primary_category: { term: categoryMatch ? categoryMatch[1] : 'unknown' }
              })
            }
          } catch (e) {
            console.warn(`⚠️ Failed to parse arXiv entry: ${e}`)
          }
        }
      }
      
      console.log(`✅ Found ${papers.length} papers from arXiv`)
      return papers
    } catch (error) {
      console.error(`❌ arXiv search failed:`, error)
      return []
    }
  }

  async convertToStandardFormat(crossRefPapers: CrossRefPaper[], arxivPapers: ArxivPaper[], pubmedPapers: any[] = []): Promise<any[]> {
    const standardPapers: any[] = []

    // Convert CrossRef papers
    for (const paper of crossRefPapers) {
      try {
        const authors = paper.author ? 
          paper.author.map(a => `${a.given || ''} ${a.family || ''}`.trim()).filter(name => name) :
          ['Unknown']

        const title = Array.isArray(paper.title) ? paper.title[0] : paper.title || 'Untitled'
        const journal = paper['container-title'] ? paper['container-title'][0] : undefined
        const pubDate = paper.published ? 
          new Date(paper.published['date-parts'][0][0], (paper.published['date-parts'][0][1] || 1) - 1, paper.published['date-parts'][0][2] || 1) :
          undefined

        // Classify system type based on title and abstract
        const systemType = this.classifySystemType(title, paper.abstract)
        
        // Extract potential performance metrics from title and abstract
        const performanceData = this.extractPerformanceData(title, paper.abstract)

        // Ensure we have a proper external URL linking to the actual paper
        const externalUrl = paper.URL || (paper.DOI ? `https://doi.org/${paper.DOI}` : '')

        standardPapers.push({
          title,
          authors: JSON.stringify(authors),
          abstract: paper.abstract || null,
          doi: paper.DOI,
          publicationDate: pubDate,
          journal,
          keywords: JSON.stringify(this.extractKeywords(title, paper.abstract)),
          externalUrl,
          systemType,
          powerOutput: performanceData.powerOutput,
          efficiency: performanceData.efficiency,
          source: 'crossref_api',
          isPublic: true,
          ...performanceData.additionalData
        })
      } catch (e) {
        console.warn(`⚠️ Failed to convert CrossRef paper: ${e}`)
      }
    }

    // Convert PubMed papers
    for (const paper of pubmedPapers) {
      try {
        const systemType = this.classifySystemType(paper.title, paper.abstract)
        const performanceData = this.extractPerformanceData(paper.title, paper.abstract)

        standardPapers.push({
          title: paper.title,
          authors: JSON.stringify(paper.authors),
          abstract: paper.abstract,
          doi: paper.doi,
          pubmedId: paper.pmid,
          publicationDate: paper.publicationDate,
          journal: paper.journal,
          keywords: JSON.stringify(this.extractKeywords(paper.title, paper.abstract)),
          externalUrl: paper.externalUrl, // Already includes proper DOI or PubMed URL
          systemType,
          powerOutput: performanceData.powerOutput,
          efficiency: performanceData.efficiency,
          source: 'pubmed_api',
          isPublic: true,
          ...performanceData.additionalData
        })
      } catch (e) {
        console.warn(`⚠️ Failed to convert PubMed paper: ${e}`)
      }
    }

    // Convert arXiv papers
    for (const paper of arxivPapers) {
      try {
        const authors = paper.authors.map(a => a.name)
        const systemType = this.classifySystemType(paper.title, paper.summary)
        const performanceData = this.extractPerformanceData(paper.title, paper.summary)

        standardPapers.push({
          title: paper.title,
          authors: JSON.stringify(authors),
          abstract: paper.summary,
          arxivId: paper.id.split('/').pop(),
          publicationDate: new Date(paper.published),
          keywords: JSON.stringify(this.extractKeywords(paper.title, paper.summary)),
          externalUrl: paper.link, // Direct link to arXiv paper
          systemType,
          powerOutput: performanceData.powerOutput,
          efficiency: performanceData.efficiency,
          source: 'arxiv_api',
          isPublic: true,
          ...performanceData.additionalData
        })
      } catch (e) {
        console.warn(`⚠️ Failed to convert arXiv paper: ${e}`)
      }
    }

    return standardPapers
  }

  private classifySystemType(title: string, abstract?: string): string {
    const text = `${title} ${abstract || ''}`.toLowerCase()
    
    if (text.includes('microbial fuel cell') || text.includes('mfc')) return 'MFC'
    if (text.includes('microbial electrolysis cell') || text.includes('mec')) return 'MEC'
    if (text.includes('microbial desalination') || text.includes('mdc')) return 'MDC'
    if (text.includes('microbial electrosynthesis') || text.includes('mes')) return 'MES'
    if (text.includes('bioelectrochemical') || text.includes('bioelectrical')) return 'BES'
    if (text.includes('biofuel cell') || text.includes('biological fuel cell')) return 'BFC'
    if (text.includes('sediment') && text.includes('fuel cell')) return 'SMFC'
    if (text.includes('plant') && text.includes('fuel cell')) return 'PMFC'
    
    return 'BES' // Default bioelectrochemical system
  }

  private extractPerformanceData(title: string, abstract?: string): {
    powerOutput?: number,
    efficiency?: number,
    additionalData: any
  } {
    const text = `${title} ${abstract || ''}`.toLowerCase()
    let powerOutput: number | undefined
    let efficiency: number | undefined
    const additionalData: any = {}

    // Extract power density (mW/m², W/m², etc.)
    const powerMatches = text.match(/(\d+\.?\d*)\s*(mw|w|kw)\/m[²2]/g)
    if (powerMatches) {
      const powerStr = powerMatches[0]
      const value = parseFloat(powerStr.match(/(\d+\.?\d*)/)?.[1] || '0')
      if (powerStr.includes('kw')) powerOutput = value * 1000000 // Convert kW/m² to mW/m²
      else if (powerStr.includes('w/m')) powerOutput = value * 1000 // Convert W/m² to mW/m²
      else powerOutput = value // Already in mW/m²
    }

    // Extract efficiency percentages
    const efficiencyMatches = text.match(/(\d+\.?\d*)\s*%?\s*(efficiency|coulombic)/g)
    if (efficiencyMatches) {
      const effStr = efficiencyMatches[0]
      const value = parseFloat(effStr.match(/(\d+\.?\d*)/)?.[1] || '0')
      if (value <= 100) efficiency = value
    }

    // Extract organisms
    const organisms: string[] = []
    const organismPatterns = [
      'geobacter', 'shewanella', 'pseudomonas', 'clostridium', 'bacillus',
      'escherichia coli', 'e. coli', 'mixed culture', 'anaerobic sludge',
      'activated sludge', 'wastewater', 'sediment microbes'
    ]
    
    organismPatterns.forEach(pattern => {
      if (text.includes(pattern)) {
        organisms.push(pattern)
      }
    })

    if (organisms.length > 0) {
      additionalData.organismTypes = JSON.stringify(organisms)
    }

    // Extract materials
    const materials: string[] = []
    const materialPatterns = [
      'graphene', 'carbon cloth', 'carbon felt', 'stainless steel', 'platinum',
      'mxene', 'carbon nanotube', 'cnt', 'graphite', 'activated carbon',
      'carbon paper', 'titanium', 'nickel', 'copper'
    ]
    
    materialPatterns.forEach(pattern => {
      if (text.includes(pattern)) {
        materials.push(pattern)
      }
    })

    if (materials.length > 0) {
      additionalData.anodeMaterials = JSON.stringify(materials)
    }

    return { powerOutput, efficiency, additionalData }
  }

  private extractKeywords(title: string, abstract?: string): string[] {
    const text = `${title} ${abstract || ''}`.toLowerCase()
    const keywords: string[] = []

    const keywordPatterns = [
      'bioelectrochemical', 'microbial fuel cell', 'electron transfer', 'biofilm',
      'wastewater treatment', 'renewable energy', 'sustainable', 'bioenergy',
      'electroactive bacteria', 'anode', 'cathode', 'membrane', 'separator',
      'power density', 'current density', 'coulombic efficiency', 'voltage',
      'substrate', 'acetate', 'glucose', 'organic matter', 'biodegradation',
      'scale-up', 'pilot scale', 'laboratory scale', 'optimization'
    ]

    keywordPatterns.forEach(pattern => {
      if (text.includes(pattern)) {
        keywords.push(pattern)
      }
    })

    return keywords
  }

  async importPapers(papers: any[], userId: string): Promise<{ added: number, skipped: number, errors: number }> {
    let added = 0
    let skipped = 0
    let errors = 0

    console.log(`📥 Importing ${papers.length} real papers...`)

    for (const paper of papers) {
      try {
        // Check if paper already exists
        const existing = await prisma.researchPaper.findFirst({
          where: {
            OR: [
              { doi: paper.doi || undefined },
              { arxivId: paper.arxivId || undefined },
              { title: paper.title }
            ]
          }
        })

        if (existing) {
          skipped++
          continue
        }

        await prisma.researchPaper.create({
          data: {
            ...paper,
            uploadedBy: userId
          }
        })

        added++

        if (added % 10 === 0) {
          console.log(`  Progress: ${added} papers imported...`)
        }

        // Rate limiting
        await this.sleep(this.delay)

      } catch (error) {
        console.error(`❌ Error importing paper "${paper.title}":`, error)
        errors++
      }
    }

    return { added, skipped, errors }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const userId = args[0] || 'cmcqy3pmg0006f5ieutyf0dq0'

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }
  })

  if (!user) {
    console.error(`❌ User with ID ${userId} not found`)
    process.exit(1)
  }

  console.log(`🚀 Fetching real papers for user: ${user.name || user.email}`)

  const fetcher = new RealPaperFetcher()

  // Define search terms for microbial electrochemical systems
  const searchTerms = [
    'microbial fuel cell performance',
    'bioelectrochemical systems optimization',
    'microbial electrolysis cell hydrogen',
    'electroactive biofilm bacteria',
    'microbial desalination cell',
    'sediment microbial fuel cell',
    'plant microbial fuel cell',
    'bioelectrochemical wastewater treatment',
    'exoelectrogenic bacteria',
    'bioelectrochemical carbon capture',
    'microbial electrosynthesis',
    'bioelectrochemical sensor',
    'hybrid bioelectrochemical system',
    'scaled bioelectrochemical reactor'
  ]

  let allPapers: any[] = []

  // Fetch from multiple sources
  for (const term of searchTerms) {
    try {
      console.log(`\n🔍 Searching for: "${term}"`)

      const [crossRefPapers, arxivPapers, pubmedPapers] = await Promise.all([
        fetcher.fetchFromCrossRef(term, 15),
        fetcher.fetchFromArxiv(term, 8),
        fetcher.fetchFromPubMed(term, 12)
      ])

      const standardPapers = await fetcher.convertToStandardFormat(crossRefPapers, arxivPapers, pubmedPapers)
      allPapers.push(...standardPapers)

      console.log(`  📊 Found: ${crossRefPapers.length} CrossRef + ${arxivPapers.length} arXiv + ${pubmedPapers.length} PubMed = ${standardPapers.length} total`)

      // Rate limiting between searches
      await fetcher.sleep(3000)

    } catch (error) {
      console.error(`❌ Search failed for "${term}":`, error)
    }
  }

  // Remove duplicates based on DOI and title
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
  console.log(`  Total processed: ${uniquePapers.length}`)

  // Get updated statistics
  const realCount = await prisma.researchPaper.count({
    where: {
      source: { 
        in: ['crossref_api', 'arxiv_api', 'local_pdf', 'web_search', 'comprehensive_search', 'advanced_electrode_biofacade_search', 'extensive_electrode_biofacade_collection']
      }
    }
  })

  const totalCount = await prisma.researchPaper.count()

  console.log(`\n📈 Updated Database Statistics:`)
  console.log(`  Real papers: ${realCount} (${((realCount / totalCount) * 100).toFixed(1)}%)`)
  console.log(`  Total papers: ${totalCount}`)

  await prisma.$disconnect()
}

if (require.main === module) {
  main().catch(console.error)
}

export { RealPaperFetcher }