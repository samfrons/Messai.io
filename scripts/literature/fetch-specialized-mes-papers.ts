import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Specialized search terms for high-quality MES papers
const specializedSearchTerms = [
  // Microbial Fuel Cell Performance
  "microbial fuel cell performance optimization",
  "MFC power density enhancement",
  "microbial fuel cell efficiency improvement",
  "high performance microbial fuel cells",
  
  // Bioelectrochemical Reactors
  "bioelectrochemical reactor design",
  "bioelectrochemical systems scale up",
  "electrochemical bioreactor optimization",
  "pilot scale bioelectrochemical reactors",
  
  // Electroanalytical Modeling
  "electroanalytical modeling microbial fuel cells",
  "bioelectrochemical systems modeling simulation",
  "computational modeling MFC performance",
  "electrochemical impedance spectroscopy MFC",
  
  // Metagonomics for MES
  "metagenomics microbial electrochemical systems",
  "microbial community analysis MFC",
  "16S rRNA sequencing electroactive biofilms",
  "metagenomic analysis bioelectrochemical systems",
  
  // Algae & Carbon Capture
  "algae microbial fuel cells",
  "algal bioelectrochemical systems",
  "photosynthetic microbial fuel cells",
  "algae carbon capture bioelectrochemical",
  "microalgae biocathode MFC",
  
  // Graphene Electrodes
  "graphene electrodes microbial fuel cells",
  "graphene oxide bioelectrochemical systems",
  "graphene modified anode MFC",
  "reduced graphene oxide bioanode",
  "graphene nanocomposite electrodes MFC",
  
  // High-Performance Waste Treatment
  "brewery wastewater microbial fuel cell",
  "pharmaceutical wastewater bioelectrochemical treatment",
  "textile wastewater MFC treatment",
  "food processing wastewater bioelectrochemical",
  "industrial wastewater MFC remediation",
  
  // Bioremediation Bacteria
  "Geobacter sulfurreducens electrode performance",
  "Shewanella oneidensis bioelectrochemical",
  "electroactive bacteria bioremediation",
  "exoelectrogenic bacteria heavy metals",
  "electrogenic microorganisms pollutant degradation"
]

class SpecializedPaperFetcher {
  private crossrefBaseUrl = 'https://api.crossref.org/works'
  private pubmedBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
  private arxivBaseUrl = 'http://export.arxiv.org/api/query'
  
  async fetchFromCrossRef(query: string, limit: number = 20): Promise<any[]> {
    try {
      const response = await axios.get(this.crossrefBaseUrl, {
        params: {
          query: query,
          rows: limit,
          filter: 'from-pub-date:2018,type:journal-article',
          select: 'DOI,title,author,published-print,container-title,abstract,subject,URL'
        }
      })
      
      return response.data.message.items || []
    } catch (error) {
      console.error(`CrossRef error for "${query}":`, error.message)
      return []
    }
  }
  
  async fetchFromPubMed(query: string, limit: number = 20): Promise<any[]> {
    try {
      // Search for IDs
      const searchResponse = await axios.get(`${this.pubmedBaseUrl}/esearch.fcgi`, {
        params: {
          db: 'pubmed',
          term: query,
          retmax: limit,
          retmode: 'json',
          datetype: 'pdat',
          mindate: '2018',
          maxdate: '2025'
        }
      })
      
      const ids = searchResponse.data.esearchresult?.idlist || []
      if (ids.length === 0) return []
      
      // Fetch details
      const detailsResponse = await axios.get(`${this.pubmedBaseUrl}/esummary.fcgi`, {
        params: {
          db: 'pubmed',
          id: ids.join(','),
          retmode: 'json'
        }
      })
      
      const results = []
      const uids = detailsResponse.data.result?.uids || []
      
      for (const uid of uids) {
        const article = detailsResponse.data.result[uid]
        if (article && article.title) {
          results.push({
            pmid: uid,
            title: article.title,
            authors: article.authors || [],
            journal: article.source,
            pubdate: article.pubdate,
            doi: article.elocationid?.replace('doi: ', '')
          })
        }
      }
      
      return results
    } catch (error) {
      console.error(`PubMed error for "${query}":`, error.message)
      return []
    }
  }
  
  async convertToStandardFormat(crossrefPapers: any[], pubmedPapers: any[]): Promise<any[]> {
    const standardPapers = []
    
    // Process CrossRef papers
    for (const paper of crossrefPapers) {
      if (!paper.title || !paper.title[0]) continue
      
      const authors = paper.author?.map(a => `${a.given || ''} ${a.family || ''}`.trim()) || []
      const publishedDate = paper['published-print'] || paper['published-online']
      
      standardPapers.push({
        title: paper.title[0],
        authors: JSON.stringify(authors),
        abstract: paper.abstract || null,
        doi: paper.DOI,
        publicationDate: publishedDate ? 
          new Date(`${publishedDate['date-parts'][0].join('-')}`).toISOString() : null,
        journal: paper['container-title']?.[0] || null,
        externalUrl: paper.URL || `https://doi.org/${paper.DOI}`,
        source: 'crossref_api',
        uploadedBy: null,
        isPublic: true,
        keywords: JSON.stringify(paper.subject || [])
      })
    }
    
    // Process PubMed papers
    for (const paper of pubmedPapers) {
      if (!paper.title) continue
      
      const authors = paper.authors?.map(a => a.name) || []
      
      standardPapers.push({
        title: paper.title,
        authors: JSON.stringify(authors),
        pubmedId: paper.pmid,
        doi: paper.doi || null,
        publicationDate: paper.pubdate ? new Date(paper.pubdate).toISOString() : null,
        journal: paper.journal || null,
        externalUrl: paper.doi ? 
          `https://doi.org/${paper.doi}` : 
          `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`,
        source: 'pubmed_api',
        uploadedBy: null,
        isPublic: true
      })
    }
    
    return standardPapers
  }
  
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

async function backupDatabase() {
  const backupDir = path.join(__dirname, '../../backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `papers-backup-${timestamp}.json`)
  
  const papers = await prisma.researchPaper.findMany()
  fs.writeFileSync(backupPath, JSON.stringify(papers, null, 2))
  
  console.log(`📦 Database backed up to: ${backupPath}`)
  console.log(`   Total papers: ${papers.length}`)
}

async function main() {
  console.log('🔬 Fetching specialized MES papers...')
  console.log('📋 Topics: MFC performance, bioreactors, modeling, metagenomics, algae, graphene, bioremediation')
  
  // Backup existing data first
  await backupDatabase()
  
  const fetcher = new SpecializedPaperFetcher()
  let allPapers: any[] = []
  let searchCount = 0
  
  for (const term of specializedSearchTerms) {
    searchCount++
    console.log(`\n🔍 [${searchCount}/${specializedSearchTerms.length}] Searching: "${term}"`)
    
    try {
      const [crossRefPapers, pubmedPapers] = await Promise.all([
        fetcher.fetchFromCrossRef(term, 25),
        fetcher.fetchFromPubMed(term, 25)
      ])
      
      const standardPapers = await fetcher.convertToStandardFormat(crossRefPapers, pubmedPapers)
      allPapers.push(...standardPapers)
      
      console.log(`  ✅ Found: ${crossRefPapers.length} CrossRef + ${pubmedPapers.length} PubMed`)
      
      // Rate limiting
      await fetcher.sleep(2000)
    } catch (error) {
      console.error(`  ❌ Error searching "${term}":`, error.message)
    }
  }
  
  // Remove duplicates based on DOI and title
  const uniquePapers = allPapers.filter((paper, index, self) => {
    return index === self.findIndex(p => 
      (p.doi && paper.doi && p.doi === paper.doi) ||
      (p.title.toLowerCase() === paper.title.toLowerCase())
    )
  })
  
  console.log(`\n📊 Found ${allPapers.length} papers, ${uniquePapers.length} unique`)
  
  // Import papers to database
  console.log('\n📥 Importing papers to database...')
  let imported = 0
  let skipped = 0
  
  for (const paper of uniquePapers) {
    try {
      // Check if paper already exists
      const existing = await prisma.researchPaper.findFirst({
        where: {
          OR: [
            { doi: paper.doi || undefined },
            { pubmedId: paper.pubmedId || undefined },
            { title: paper.title }
          ]
        }
      })
      
      if (existing) {
        skipped++
        continue
      }
      
      await prisma.researchPaper.create({ data: paper })
      imported++
      
      if (imported % 10 === 0) {
        console.log(`  Progress: ${imported} imported, ${skipped} skipped...`)
      }
    } catch (error) {
      console.error(`Failed to import paper: ${paper.title}`, error.message)
    }
  }
  
  console.log(`\n✅ Import complete!`)
  console.log(`   Imported: ${imported} new papers`)
  console.log(`   Skipped: ${skipped} duplicates`)
  
  // Final backup after import
  await backupDatabase()
  
  // Show sample of imported papers
  const samples = await prisma.researchPaper.findMany({
    where: { source: { in: ['crossref_api', 'pubmed_api'] } },
    take: 5,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log('\n📄 Sample of imported papers:')
  samples.forEach(paper => {
    console.log(`\n- ${paper.title}`)
    console.log(`  DOI: ${paper.doi || 'N/A'}`)
    console.log(`  URL: ${paper.externalUrl}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())