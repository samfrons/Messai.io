#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

interface SearchConfig {
  query: string
  category: string
  minYear?: number
  requiredTerms?: string[]
}

const searchConfigs: SearchConfig[] = [
  // Bioelectrochemical Systems Core
  {
    query: 'bioelectrochemical systems performance data power density',
    category: 'BES_CORE',
    minYear: 2018,
    requiredTerms: ['power', 'density', 'mW', 'W/m']
  },
  {
    query: 'microbial fuel cell MFC electrode performance current voltage',
    category: 'MFC_PERFORMANCE',
    minYear: 2018,
    requiredTerms: ['current', 'voltage', 'electrode']
  },
  {
    query: 'microbial fuel cell wastewater treatment COD removal efficiency',
    category: 'MFC_WASTEWATER',
    minYear: 2019,
    requiredTerms: ['COD', 'removal', 'efficiency']
  },
  
  // Algal Fuel Cells
  {
    query: 'algal fuel cell photosynthetic microbial fuel cell power generation',
    category: 'ALGAL_FC',
    minYear: 2019,
    requiredTerms: ['algal', 'photosynthetic', 'power']
  },
  {
    query: 'microalgae bioelectrochemical systems biocathode performance',
    category: 'ALGAL_BES',
    minYear: 2020,
    requiredTerms: ['microalgae', 'bioelectrochemical']
  },
  
  // Advanced Materials - Hydrogels
  {
    query: 'hydrogel microfluidic microbial fuel cell proton exchange',
    category: 'HYDROGEL_MFC',
    minYear: 2019,
    requiredTerms: ['hydrogel', 'microbial', 'fuel cell']
  },
  {
    query: 'conducting hydrogel bioelectrochemical systems ionic conductivity',
    category: 'HYDROGEL_BES',
    minYear: 2020,
    requiredTerms: ['hydrogel', 'conductivity']
  },
  
  // Graphene and Carbon Materials
  {
    query: 'graphene electrode microbial fuel cell power density surface area',
    category: 'GRAPHENE_MFC',
    minYear: 2019,
    requiredTerms: ['graphene', 'electrode', 'power']
  },
  {
    query: 'reduced graphene oxide bioelectrochemical systems anode performance',
    category: 'RGO_BES',
    minYear: 2020,
    requiredTerms: ['graphene', 'oxide', 'anode']
  },
  {
    query: 'graphene quantum dots microbial electrochemical systems',
    category: 'GQD_MES',
    minYear: 2021,
    requiredTerms: ['graphene', 'quantum', 'microbial']
  },
  
  // 2D Materials - MXenes
  {
    query: 'MXene Ti3C2 microbial fuel cell electrode conductivity',
    category: 'MXENE_MFC',
    minYear: 2020,
    requiredTerms: ['MXene', 'microbial', 'electrode']
  },
  {
    query: 'MXene bioelectrochemical systems electron transfer biofilm',
    category: 'MXENE_BES',
    minYear: 2021,
    requiredTerms: ['MXene', 'bioelectrochemical', 'electron']
  },
  
  // 2D Materials - TMDs
  {
    query: 'transition metal dichalcogenide TMD microbial fuel cell catalyst',
    category: 'TMD_MFC',
    minYear: 2020,
    requiredTerms: ['TMD', 'dichalcogenide', 'microbial']
  },
  {
    query: 'MoS2 WS2 bioelectrochemical systems cathode catalyst ORR',
    category: 'TMD_CATALYST',
    minYear: 2021,
    requiredTerms: ['MoS2', 'WS2', 'catalyst']
  },
  
  // Microbial Electrosynthesis
  {
    query: 'microbial electrosynthesis CO2 reduction acetate production rate',
    category: 'MES_CO2',
    minYear: 2019,
    requiredTerms: ['electrosynthesis', 'CO2', 'production']
  },
  {
    query: 'bioelectrochemical CO2 conversion efficiency coulombic efficiency',
    category: 'BES_CO2',
    minYear: 2020,
    requiredTerms: ['CO2', 'coulombic', 'efficiency']
  },
  
  // Integrated Systems
  {
    query: 'microbial desalination cell MDC salt removal power generation',
    category: 'MDC_PERFORMANCE',
    minYear: 2019,
    requiredTerms: ['desalination', 'salt', 'removal']
  },
  {
    query: 'bioelectrochemical wastewater treatment energy recovery pilot scale',
    category: 'BES_PILOT',
    minYear: 2020,
    requiredTerms: ['wastewater', 'energy', 'scale']
  }
]

async function fetchFromCrossRef(config: SearchConfig, offset = 0): Promise<any[]> {
  try {
    const url = 'https://api.crossref.org/works'
    const params = {
      query: config.query,
      filter: config.minYear ? `from-pub-date:${config.minYear}` : undefined,
      rows: 20,
      offset: offset,
      sort: 'relevance',
      order: 'desc'
    }

    const response = await axios.get(url, { params })
    return response.data.message.items || []
  } catch (error) {
    console.error(`CrossRef error for ${config.category}:`, error)
    return []
  }
}

async function fetchFromPubMed(config: SearchConfig): Promise<any[]> {
  try {
    // Search for IDs
    const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
    const searchParams = {
      db: 'pubmed',
      term: config.query,
      retmax: 20,
      retmode: 'json',
      mindate: config.minYear || 2019,
      datetype: 'pdat'
    }

    const searchResponse = await axios.get(searchUrl, { params: searchParams })
    const ids = searchResponse.data.esearchresult?.idlist || []

    if (ids.length === 0) return []

    // Fetch details
    const fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
    const fetchParams = {
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'xml',
      rettype: 'abstract'
    }

    const fetchResponse = await axios.get(fetchUrl, { params: fetchParams })
    // Parse XML response (simplified for this example)
    return parsePubMedXML(fetchResponse.data, ids)
  } catch (error) {
    console.error(`PubMed error for ${config.category}:`, error)
    return []
  }
}

function parsePubMedXML(xmlData: string, ids: string[]): any[] {
  // Simple XML parsing - in production use proper XML parser
  const papers = []
  for (const id of ids) {
    const titleMatch = xmlData.match(new RegExp(`<ArticleTitle>([^<]+)</ArticleTitle>`))
    const abstractMatch = xmlData.match(new RegExp(`<AbstractText>([^<]+)</AbstractText>`))
    
    if (titleMatch) {
      papers.push({
        title: titleMatch[1],
        abstract: abstractMatch?.[1] || '',
        pubmedId: id,
        source: 'pubmed'
      })
    }
  }
  return papers
}

function filterByRequiredTerms(paper: any, requiredTerms: string[] | undefined): boolean {
  if (!requiredTerms) return true
  const searchText = `${paper.title} ${paper.abstract || ''} ${paper.subtitle || ''}`.toLowerCase()
  return requiredTerms.some(term => searchText.includes(term.toLowerCase()))
}

function hasPerformanceData(paper: any): boolean {
  const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase()
  const performanceIndicators = [
    'mw/m', 'w/m', 'ma/cm', 'a/m', 'power density', 'current density',
    'coulombic efficiency', 'removal efficiency', 'production rate',
    'conductivity', 'surface area', 'conversion efficiency'
  ]
  return performanceIndicators.some(indicator => text.includes(indicator))
}

async function main() {
  console.log('🔍 Starting comprehensive BES paper search...')
  
  let totalAdded = 0
  let totalWithData = 0

  for (const config of searchConfigs) {
    console.log(`\n📚 Searching ${config.category}...`)
    
    // Fetch from CrossRef
    const crossRefPapers = await fetchFromCrossRef(config)
    console.log(`  Found ${crossRefPapers.length} papers from CrossRef`)
    
    // Fetch from PubMed
    const pubMedPapers = await fetchFromPubMed(config)
    console.log(`  Found ${pubMedPapers.length} papers from PubMed`)
    
    // Combine and filter
    const allPapers = [...crossRefPapers, ...pubMedPapers]
    const filteredPapers = config.requiredTerms 
      ? allPapers.filter(p => filterByRequiredTerms(p, config.requiredTerms))
      : allPapers
    
    console.log(`  Filtered to ${filteredPapers.length} relevant papers`)
    
    // Process each paper
    for (const paper of filteredPapers) {
      try {
        const hasData = hasPerformanceData(paper)
        
        const paperData = {
          title: paper.title?.[0] || paper.title || 'Untitled',
          authors: JSON.stringify(paper.author?.map((a: any) => 
            `${a.given || ''} ${a.family || ''}`.trim() || a.name || 'Unknown'
          ) || []),
          abstract: paper.abstract || paper.subtitle?.[0] || '',
          publicationDate: paper.published?.['date-parts']?.[0]?.[0] 
            ? new Date(paper.published['date-parts'][0][0], 0, 1)
            : paper.created?.['date-time'] 
            ? new Date(paper.created['date-time'])
            : new Date(),
          journal: paper['container-title']?.[0] || paper.source || '',
          doi: paper.DOI || null,
          pubmedId: paper.pubmedId || null,
          arxivId: null,
          ieeeId: null,
          volume: null,
          issue: null,
          pages: null,
          keywords: JSON.stringify([config.category, hasData ? 'HAS_PERFORMANCE_DATA' : 'NO_DATA']),
          externalUrl: paper.URL || paper.link || (paper.DOI ? `https://doi.org/${paper.DOI}` : ''),
          
          // MES-specific fields
          organismTypes: hasData && config.category.includes('ALGAL') ? JSON.stringify(['algae']) : null,
          anodeMaterials: config.category.includes('GRAPHENE') || config.category.includes('MXENE') ? JSON.stringify([config.category.split('_')[0]]) : null,
          cathodeMaterials: config.category.includes('TMD') ? JSON.stringify(['MoS2', 'WS2']) : null,
          powerOutput: null,
          efficiency: null,
          systemType: config.category.includes('MFC') ? 'MFC' : config.category.includes('MES') ? 'MES' : config.category.includes('MDC') ? 'MDC' : null,
          
          // Metadata
          source: paper.source || 'crossref',
          isPublic: true,
          
          // AI fields (to be processed later)
          aiSummary: null,
          aiKeyFindings: null,
          aiMethodology: null,
          aiImplications: null,
          aiDataExtraction: null,
          aiInsights: null,
          aiProcessingDate: null,
          aiModelVersion: null,
          aiConfidence: hasData ? 0.85 : 0.65
        }

        // Check if paper already exists
        const existing = await prisma.researchPaper.findFirst({
          where: {
            OR: [
              { doi: paperData.doi },
              { pubmedId: paperData.pubmedId },
              { title: paperData.title }
            ]
          }
        })

        if (!existing) {
          await prisma.researchPaper.create({ data: paperData })
          totalAdded++
          if (hasData) totalWithData++
          console.log(`  ✅ Added: ${paperData.title.substring(0, 60)}...${hasData ? ' [HAS DATA]' : ''}`)
        }
      } catch (error) {
        console.error(`  ❌ Error processing paper:`, error)
      }
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n📊 Summary:')
  console.log(`  Total papers added: ${totalAdded}`)
  console.log(`  Papers with performance data: ${totalWithData}`)
  console.log(`  Data coverage: ${totalAdded > 0 ? (totalWithData/totalAdded*100).toFixed(1) : 0}%`)
  
  await prisma.$disconnect()
}

main().catch(console.error)