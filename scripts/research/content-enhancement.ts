import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface EnhancedContent {
  // Full text analysis
  fullTextAvailable: boolean
  wordCount?: number
  sections: {
    abstract?: string
    introduction?: string
    methods?: string
    results?: string
    discussion?: string
    conclusion?: string
  }
  
  // Detailed technical data
  experimentalConditions: {
    reactorType?: string
    reactorVolume?: string
    electrodeConfiguration?: string
    operatingTemperature?: number[]
    pHRange?: number[]
    loadResistance?: number[]
    hydraulicRetentionTime?: number[]
  }
  
  // Performance data
  performanceMetrics: {
    maxPowerDensity?: { value: number, unit: string, conditions?: string }
    maxCurrentDensity?: { value: number, unit: string, conditions?: string }
    maxVoltage?: { value: number, unit: string, conditions?: string }
    coulombicEfficiency?: { value: number, conditions?: string }
    energyRecovery?: { value: number, conditions?: string }
    organicRemoval?: { value: number, conditions?: string }
  }
  
  // Materials characterization
  materialsData: {
    anodeDetails: Array<{
      material: string
      preparation?: string
      surfaceArea?: string
      conductivity?: string
      modifications?: string[]
    }>
    cathodeDetails: Array<{
      material: string
      catalyst?: string
      preparation?: string
      oxgenReduction?: string
    }>
    membraneDetails?: {
      type: string
      thickness?: string
      ionExchangeCapacity?: string
    }
  }
  
  // Microbial community analysis
  microbialData: {
    inoculumSource?: string
    dominantSpecies?: string[]
    diversityIndex?: number
    communityAnalysis?: string
    enrichmentStrategy?: string
  }
  
  // Economic analysis
  economicData: {
    materialCosts?: string
    operatingCosts?: string
    energyBalance?: string
    costPerKwh?: string
    scalingFactors?: string[]
  }
  
  // Innovation aspects
  innovations: {
    novelMaterials?: string[]
    newConfigurations?: string[]
    processImprovements?: string[]
    scalingAdvances?: string[]
  }
  
  // Comparative data
  comparativeAnalysis: {
    benchmarkStudies?: string[]
    performanceComparison?: string
    advantagesOverPrevious?: string[]
    limitations?: string[]
  }
  
  // Future directions
  futureWork: {
    recommendedResearch?: string[]
    scalingChallenges?: string[]
    commercializationBarriers?: string[]
    technicalImprovements?: string[]
  }
  
  // Quality metrics
  enhancementMetrics: {
    completenessScore: number // 0-100
    technicalDepth: number // 0-100
    innovationScore: number // 0-100
    practicalRelevance: number // 0-100
  }
}

interface ContentSource {
  name: string
  canAccess: (paper: any) => boolean
  extractContent: (paper: any) => Promise<string | null>
}

class ContentEnhancementService {
  private readonly sources: ContentSource[]

  constructor() {
    this.sources = [
      {
        name: 'DOI_FullText',
        canAccess: (paper) => Boolean(paper.doi),
        extractContent: this.fetchFromDOI.bind(this)
      },
      {
        name: 'PubMed_FullText', 
        canAccess: (paper) => Boolean(paper.pubmedId),
        extractContent: this.fetchFromPubMed.bind(this)
      },
      {
        name: 'ArXiv_FullText',
        canAccess: (paper) => Boolean(paper.arxivId),
        extractContent: this.fetchFromArXiv.bind(this)
      },
      {
        name: 'Semantic_Scholar',
        canAccess: (paper) => Boolean(paper.title),
        extractContent: this.fetchFromSemanticScholar.bind(this)
      }
    ]
  }

  async enhancePaper(paper: any): Promise<EnhancedContent> {
    console.log(`Enhancing: ${paper.title.substring(0, 50)}...`)
    
    // Try to get full text from available sources
    let fullText = ''
    let fullTextSource = ''
    
    for (const source of this.sources) {
      if (source.canAccess(paper)) {
        try {
          const content = await source.extractContent(paper)
          if (content && content.length > 1000) { // Minimum meaningful content
            fullText = content
            fullTextSource = source.name
            break
          }
        } catch (error) {
          console.warn(`Failed to get content from ${source.name}:`, error)
        }
      }
    }

    // If no full text, use available abstract and metadata
    if (!fullText) {
      fullText = [
        paper.title || '',
        paper.abstract || '',
        this.parseJsonField(paper.keywords || '[]').join(' ')
      ].join('\n\n')
    }

    // Perform comprehensive analysis
    const enhanced = await this.analyzeContent(fullText, paper)
    
    // Calculate quality metrics
    this.calculateEnhancementMetrics(enhanced, fullText.length, Boolean(fullTextSource))
    
    console.log(`  Enhanced with ${fullTextSource || 'metadata'} - Quality: ${enhanced.enhancementMetrics.completenessScore}/100`)
    
    return enhanced
  }

  private async fetchFromDOI(paper: any): Promise<string | null> {
    if (!paper.doi) return null
    
    try {
      // Try to get full text via Crossref
      const response = await fetch(`https://api.crossref.org/works/${paper.doi}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MESSAi Research Platform (mailto:research@messai.io)'
        }
      })
      
      if (response.ok) {
        const data = await response.json() as any
        
        // Extract available text content
        const textParts = []
        if (data.message.title) textParts.push(data.message.title.join(' '))
        if (data.message.abstract) textParts.push(data.message.abstract)
        
        return textParts.length > 0 ? textParts.join('\n\n') : null
      }
    } catch (error) {
      console.warn('DOI fetch error:', error)
    }
    
    return null
  }

  private async fetchFromPubMed(paper: any): Promise<string | null> {
    if (!paper.pubmedId) return null
    
    try {
      // Fetch detailed paper info from PubMed
      const response = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${paper.pubmedId}&retmode=xml`
      )
      
      if (response.ok) {
        const xmlText = await response.text()
        return this.parsePubMedXML(xmlText)
      }
    } catch (error) {
      console.warn('PubMed fetch error:', error)
    }
    
    return null
  }

  private async fetchFromArXiv(paper: any): Promise<string | null> {
    if (!paper.arxivId) return null
    
    try {
      // Fetch from arXiv API
      const response = await fetch(
        `http://export.arxiv.org/api/query?id_list=${paper.arxivId}`
      )
      
      if (response.ok) {
        const xmlText = await response.text()
        
        // Parse arXiv XML response
        const summaryMatch = xmlText.match(/<summary>(.*?)<\/summary>/s)
        const titleMatch = xmlText.match(/<title>(.*?)<\/title>/)
        
        const parts = []
        if (titleMatch) parts.push(titleMatch[1])
        if (summaryMatch) parts.push(summaryMatch[1])
        
        return parts.length > 0 ? parts.join('\n\n') : null
      }
    } catch (error) {
      console.warn('arXiv fetch error:', error)
    }
    
    return null
  }

  private async fetchFromSemanticScholar(paper: any): Promise<string | null> {
    try {
      // Search Semantic Scholar by title
      const searchResponse = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(paper.title)}&limit=1&fields=title,abstract,authors,year,citationCount`,
        {
          headers: {
            'User-Agent': 'MESSAi Research Platform (mailto:research@messai.io)'
          }
        }
      )
      
      if (searchResponse.ok) {
        const data = await searchResponse.json() as any
        
        if (data.data && data.data.length > 0) {
          const paperData = data.data[0]
          
          const parts = []
          if (paperData.title) parts.push(paperData.title)
          if (paperData.abstract) parts.push(paperData.abstract)
          
          return parts.length > 0 ? parts.join('\n\n') : null
        }
      }
    } catch (error) {
      console.warn('Semantic Scholar fetch error:', error)
    }
    
    return null
  }

  private parsePubMedXML(xmlText: string): string | null {
    const parts = []
    
    // Extract title
    const titleMatch = xmlText.match(/<ArticleTitle>(.*?)<\/ArticleTitle>/s)
    if (titleMatch) parts.push(titleMatch[1].replace(/<[^>]*>/g, ''))
    
    // Extract abstract
    const abstractMatch = xmlText.match(/<AbstractText.*?>(.*?)<\/AbstractText>/s)
    if (abstractMatch) parts.push(abstractMatch[1].replace(/<[^>]*>/g, ''))
    
    // Extract keywords
    const keywordMatches = xmlText.match(/<Keyword.*?>(.*?)<\/Keyword>/gs)
    if (keywordMatches) {
      const keywords = keywordMatches.map(match => 
        match.replace(/<[^>]*>/g, '')
      ).join(', ')
      parts.push(`Keywords: ${keywords}`)
    }
    
    return parts.length > 0 ? parts.join('\n\n') : null
  }

  private async analyzeContent(fullText: string, paper: any): Promise<EnhancedContent> {
    const text = fullText.toLowerCase()
    
    const enhanced: EnhancedContent = {
      fullTextAvailable: fullText.length > (paper.abstract?.length || 0) + 100,
      wordCount: fullText.split(/\s+/).length,
      sections: this.extractSections(fullText),
      experimentalConditions: this.extractExperimentalConditions(text),
      performanceMetrics: this.extractPerformanceMetrics(text),
      materialsData: this.extractMaterialsData(text),
      microbialData: this.extractMicrobialData(text),
      economicData: this.extractEconomicData(text),
      innovations: this.extractInnovations(text),
      comparativeAnalysis: this.extractComparativeAnalysis(text),
      futureWork: this.extractFutureWork(text),
      enhancementMetrics: {
        completenessScore: 0,
        technicalDepth: 0,
        innovationScore: 0,
        practicalRelevance: 0
      }
    }

    return enhanced
  }

  private extractSections(fullText: string): EnhancedContent['sections'] {
    const sections: EnhancedContent['sections'] = {}
    
    // Try to identify standard paper sections
    const sectionPatterns = {
      abstract: /abstract[:\s]*\n(.*?)(?=\n\s*(?:introduction|keywords|1\.|methods))/si,
      introduction: /(?:introduction|1\..*introduction)[:\s]*\n(.*?)(?=\n\s*(?:materials|methods|2\.))/si,
      methods: /(?:materials?\s+and\s+methods?|methods?|methodology|2\.)[:\s]*\n(.*?)(?=\n\s*(?:results|3\.))/si,
      results: /(?:results?|3\.)[:\s]*\n(.*?)(?=\n\s*(?:discussion|conclusion|4\.))/si,
      discussion: /(?:discussion|4\.)[:\s]*\n(.*?)(?=\n\s*(?:conclusion|5\.))/si,
      conclusion: /(?:conclusion|conclusions?|5\.)[:\s]*\n(.*?)(?=\n\s*(?:references|acknowledgment))/si
    }

    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      const match = fullText.match(pattern)
      if (match && match[1]) {
        sections[section as keyof EnhancedContent['sections']] = match[1].trim().substring(0, 1000)
      }
    }

    return sections
  }

  private extractExperimentalConditions(text: string): EnhancedContent['experimentalConditions'] {
    const conditions: EnhancedContent['experimentalConditions'] = {}

    // Reactor type
    const reactorTypes = ['single-chamber', 'dual-chamber', 'stacked', 'tubular', 'flat-plate', 'membrane-less']
    for (const type of reactorTypes) {
      if (text.includes(type)) {
        conditions.reactorType = type
        break
      }
    }

    // Reactor volume
    const volumeMatch = text.match(/([\d.]+)\s*(ml|l|liter)/gi)
    if (volumeMatch) {
      conditions.reactorVolume = volumeMatch[0]
    }

    // Temperature range
    const tempMatches = Array.from(text.matchAll(/([\d.]+)°?c/gi))
    if (tempMatches.length > 0) {
      conditions.operatingTemperature = tempMatches.map(m => parseFloat(m[1])).filter(t => t > 0 && t < 100)
    }

    // pH range  
    const pHMatches = Array.from(text.matchAll(/ph[:\s]+([\d.]+)/gi))
    if (pHMatches.length > 0) {
      conditions.pHRange = pHMatches.map(m => parseFloat(m[1])).filter(ph => ph >= 0 && ph <= 14)
    }

    // Load resistance
    const resistanceMatches = Array.from(text.matchAll(/([\d.]+)\s*(ω|ohm|kω)/gi))
    if (resistanceMatches.length > 0) {
      conditions.loadResistance = resistanceMatches.map(m => {
        const value = parseFloat(m[1])
        return m[2].toLowerCase().startsWith('k') ? value * 1000 : value
      })
    }

    return conditions
  }

  private extractPerformanceMetrics(text: string): EnhancedContent['performanceMetrics'] {
    const metrics: EnhancedContent['performanceMetrics'] = {}

    // Power density with context
    const powerMatches = Array.from(text.matchAll(/(maximum|max|peak|highest)?\s*power\s+density[:\s]*([\d.]+)\s*(mw|w|kw)\/m[²2]\s*(.*?)(?:\.|,|\n)/gi))
    if (powerMatches.length > 0) {
      const match = powerMatches[0]
      metrics.maxPowerDensity = {
        value: parseFloat(match[2]),
        unit: `${match[3]}/m²`,
        conditions: match[4]?.trim()
      }
    }

    // Current density
    const currentMatches = Array.from(text.matchAll(/(maximum|max|peak|highest)?\s*current\s+density[:\s]*([\d.]+)\s*(ma|a)\/m[²2]\s*(.*?)(?:\.|,|\n)/gi))
    if (currentMatches.length > 0) {
      const match = currentMatches[0]
      metrics.maxCurrentDensity = {
        value: parseFloat(match[2]),
        unit: `${match[3]}/m²`,
        conditions: match[4]?.trim()
      }
    }

    // Coulombic efficiency
    const ceMatches = Array.from(text.matchAll(/coulombic\s+efficiency[:\s]*([\d.]+)%?\s*(.*?)(?:\.|,|\n)/gi))
    if (ceMatches.length > 0) {
      metrics.coulombicEfficiency = {
        value: parseFloat(ceMatches[0][1]),
        conditions: ceMatches[0][2]?.trim()
      }
    }

    return metrics
  }

  private extractMaterialsData(text: string): EnhancedContent['materialsData'] {
    const materials: EnhancedContent['materialsData'] = {
      anodeDetails: [],
      cathodeDetails: []
    }

    // Anode materials with details
    const anodeMaterials = [
      'carbon cloth', 'carbon felt', 'graphite', 'graphene', 'carbon nanotubes',
      'stainless steel', 'titanium', 'mxene'
    ]

    for (const material of anodeMaterials) {
      if (text.includes(material)) {
        // Look for preparation details
        const prepPattern = new RegExp(`${material}[^.]*(?:prepared|treated|modified|coated)[^.]*`, 'gi')
        const prepMatch = text.match(prepPattern)
        
        materials.anodeDetails.push({
          material,
          preparation: prepMatch?.[0]?.substring(0, 200)
        })
      }
    }

    // Cathode materials
    const cathodeMaterials = ['platinum', 'air cathode', 'carbon cathode', 'stainless steel cathode']
    
    for (const material of cathodeMaterials) {
      if (text.includes(material)) {
        materials.cathodeDetails.push({
          material,
          catalyst: text.includes('catalyst') ? 'yes' : undefined
        })
      }
    }

    return materials
  }

  private extractMicrobialData(text: string): EnhancedContent['microbialData'] {
    const microbial: EnhancedContent['microbialData'] = {}

    // Inoculum source
    const inoculumSources = ['wastewater sludge', 'anaerobic sludge', 'marine sediment', 'soil', 'compost']
    for (const source of inoculumSources) {
      if (text.includes(source)) {
        microbial.inoculumSource = source
        break
      }
    }

    // Dominant species
    const species = ['geobacter', 'shewanella', 'pseudomonas', 'clostridium']
    microbial.dominantSpecies = species.filter(s => text.includes(s))

    // Community analysis methods
    if (text.includes('16s') || text.includes('sequencing') || text.includes('phylogenetic')) {
      microbial.communityAnalysis = 'molecular analysis performed'
    }

    return microbial
  }

  private extractEconomicData(text: string): EnhancedContent['economicData'] {
    const economic: EnhancedContent['economicData'] = {}

    // Look for cost-related information
    if (text.includes('cost') || text.includes('economic')) {
      const costMatches = text.match(/cost[^.]*\$[\d.,]+[^.]*/gi)
      if (costMatches) {
        economic.materialCosts = costMatches[0]
      }
    }

    // Energy balance
    if (text.includes('energy balance') || text.includes('net energy')) {
      const energyMatch = text.match(/(?:energy balance|net energy)[^.]*[.]*/gi)
      if (energyMatch) {
        economic.energyBalance = energyMatch[0]
      }
    }

    return economic
  }

  private extractInnovations(text: string): EnhancedContent['innovations'] {
    const innovations: EnhancedContent['innovations'] = {
      novelMaterials: [],
      newConfigurations: [],
      processImprovements: [],
      scalingAdvances: []
    }

    // Novel materials
    const novelPatterns = [
      /(?:novel|new|innovative)[^.]*(?:material|electrode|catalyst)[^.]*/gi,
      /(?:first time|first report)[^.]*(?:material|electrode)[^.]*/gi
    ]

    for (const pattern of novelPatterns) {
      const matches = text.match(pattern)
      if (matches) {
        innovations.novelMaterials.push(...matches.slice(0, 3))
      }
    }

    // Process improvements
    const improvementPatterns = [
      /(?:improved|enhanced|optimized)[^.]*(?:performance|efficiency|output)[^.]*/gi,
      /(?:increased|higher|better)[^.]*(?:power|current|efficiency)[^.]*/gi
    ]

    for (const pattern of improvementPatterns) {
      const matches = text.match(pattern)
      if (matches) {
        innovations.processImprovements.push(...matches.slice(0, 3))
      }
    }

    return innovations
  }

  private extractComparativeAnalysis(text: string): EnhancedContent['comparativeAnalysis'] {
    const analysis: EnhancedContent['comparativeAnalysis'] = {
      advantagesOverPrevious: [],
      limitations: []
    }

    // Advantages
    const advantagePatterns = [
      /(?:advantage|benefit|improvement)[^.]*over[^.]*/gi,
      /(?:higher|better|superior)[^.]*(?:than|compared to)[^.]*/gi
    ]

    for (const pattern of advantagePatterns) {
      const matches = text.match(pattern)
      if (matches) {
        analysis.advantagesOverPrevious.push(...matches.slice(0, 3))
      }
    }

    // Limitations
    const limitationPatterns = [
      /(?:limitation|disadvantage|challenge|problem)[^.]*/gi,
      /(?:however|but|although)[^.]*(?:low|poor|limited)[^.]*/gi
    ]

    for (const pattern of limitationPatterns) {
      const matches = text.match(pattern)
      if (matches) {
        analysis.limitations.push(...matches.slice(0, 3))
      }
    }

    return analysis
  }

  private extractFutureWork(text: string): EnhancedContent['futureWork'] {
    const future: EnhancedContent['futureWork'] = {
      recommendedResearch: [],
      scalingChallenges: [],
      technicalImprovements: []
    }

    // Future research
    const futurePatterns = [
      /(?:future work|future research|further study)[^.]*/gi,
      /(?:recommend|suggest|propose)[^.]*(?:research|study|investigation)[^.]*/gi
    ]

    for (const pattern of futurePatterns) {
      const matches = text.match(pattern)
      if (matches) {
        future.recommendedResearch.push(...matches.slice(0, 3))
      }
    }

    // Scaling challenges
    if (text.includes('scale') || text.includes('commercial')) {
      const scalingMatches = text.match(/(?:scale|scaling|commercial)[^.]*(?:challenge|barrier|issue)[^.]*/gi)
      if (scalingMatches) {
        future.scalingChallenges.push(...scalingMatches.slice(0, 3))
      }
    }

    return future
  }

  private calculateEnhancementMetrics(enhanced: EnhancedContent, textLength: number, hasFullText: boolean): void {
    // Completeness score
    let completeness = 0
    if (enhanced.sections.methods) completeness += 20
    if (enhanced.sections.results) completeness += 20
    if (enhanced.performanceMetrics.maxPowerDensity) completeness += 15
    if (enhanced.materialsData.anodeDetails.length > 0) completeness += 15
    if (enhanced.microbialData.dominantSpecies && enhanced.microbialData.dominantSpecies.length > 0) completeness += 10
    if (enhanced.experimentalConditions.reactorType) completeness += 10
    if (hasFullText) completeness += 10

    // Technical depth
    let depth = 0
    if (enhanced.experimentalConditions.operatingTemperature) depth += 25
    if (enhanced.performanceMetrics.maxCurrentDensity) depth += 25
    if (enhanced.materialsData.anodeDetails.some(a => a.preparation)) depth += 25
    if (enhanced.microbialData.communityAnalysis) depth += 25

    // Innovation score  
    let innovation = 0
    if (enhanced.innovations.novelMaterials && enhanced.innovations.novelMaterials.length > 0) innovation += 40
    if (enhanced.innovations.processImprovements && enhanced.innovations.processImprovements.length > 0) innovation += 30
    if (enhanced.innovations.newConfigurations && enhanced.innovations.newConfigurations.length > 0) innovation += 30

    // Practical relevance
    let relevance = 0
    if (enhanced.economicData.materialCosts) relevance += 30
    if (enhanced.futureWork.scalingChallenges && enhanced.futureWork.scalingChallenges.length > 0) relevance += 30
    if (enhanced.comparativeAnalysis.advantagesOverPrevious && enhanced.comparativeAnalysis.advantagesOverPrevious.length > 0) relevance += 40

    enhanced.enhancementMetrics = {
      completenessScore: Math.min(completeness, 100),
      technicalDepth: Math.min(depth, 100),
      innovationScore: Math.min(innovation, 100),
      practicalRelevance: Math.min(relevance, 100)
    }
  }

  private parseJsonField(jsonString: string): any[] {
    try {
      const parsed = JSON.parse(jsonString)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  async enhanceAllPapers(limit?: number): Promise<void> {
    console.log('🚀 Starting comprehensive content enhancement...')

    const papers = await prisma.researchPaper.findMany({
      where: {
        OR: [
          { source: { in: ['crossref_api', 'arxiv_api', 'pubmed_api', 'local_pdf'] } },
          { doi: { not: null } },
          { arxivId: { not: null } },
          { pubmedId: { not: null } }
        ]
      },
      select: {
        id: true,
        title: true,
        abstract: true,
        keywords: true,
        doi: true,
        arxivId: true,
        pubmedId: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Enhancing ${papers.length} papers with comprehensive data extraction...`)

    let processed = 0
    const enhancements = []

    for (const paper of papers) {
      processed++
      console.log(`\nProcessing ${processed}/${papers.length}`)

      try {
        const enhanced = await this.enhancePaper(paper)
        enhancements.push({ paperId: paper.id, enhanced })

        // Update database with enhanced data
        await this.updatePaperWithEnhancement(paper.id, enhanced)

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error enhancing paper ${paper.id}:`, error)
      }
    }

    // Generate summary report
    const avgCompleteness = enhancements.reduce((sum, e) => sum + e.enhanced.enhancementMetrics.completenessScore, 0) / enhancements.length
    const avgDepth = enhancements.reduce((sum, e) => sum + e.enhanced.enhancementMetrics.technicalDepth, 0) / enhancements.length

    console.log(`\n✅ Enhancement completed!`)
    console.log(`  Papers enhanced: ${processed}`)
    console.log(`  Average completeness: ${avgCompleteness.toFixed(1)}/100`)
    console.log(`  Average technical depth: ${avgDepth.toFixed(1)}/100`)
  }

  private async updatePaperWithEnhancement(paperId: string, enhanced: EnhancedContent): Promise<void> {
    try {
      const existing = await prisma.researchPaper.findUnique({
        where: { id: paperId },
        select: { keywords: true }
      })

      const existingKeywords = this.parseJsonField(existing?.keywords || '[]')

      await prisma.researchPaper.update({
        where: { id: paperId },
        data: {
          keywords: JSON.stringify({
            ...existingKeywords,
            _enhancement: {
              ...enhanced.enhancementMetrics,
              fullTextAvailable: enhanced.fullTextAvailable,
              lastEnhanced: new Date().toISOString(),
              experimentalConditions: enhanced.experimentalConditions,
              innovations: enhanced.innovations
            }
          })
        }
      })
    } catch (error) {
      console.warn(`Failed to update enhancement for paper ${paperId}:`, error)
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const limit = args[0] ? parseInt(args[0]) : 25 // Default to 25 papers

  try {
    const enhancer = new ContentEnhancementService()
    await enhancer.enhanceAllPapers(limit)

    console.log('\n🎉 Content enhancement pipeline completed!')
    console.log('\nNext steps:')
    console.log('1. Review enhanced data in database')
    console.log('2. Run quality scoring: npm run db:quality-score')
    console.log('3. Update literature page to display enhanced data')

  } catch (error) {
    console.error('❌ Content enhancement failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { ContentEnhancementService, type EnhancedContent }