import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface ExtractedData {
  // Performance Metrics
  powerDensity?: number // mW/m²
  currentDensity?: number // mA/m²
  voltage?: number // V
  coulombicEfficiency?: number // %
  energyEfficiency?: number // %
  internalResistance?: number // Ω
  
  // Operational Conditions
  temperature?: number // °C
  pH?: number
  conductivity?: number // mS/cm
  oxygenConcentration?: number // mg/L
  substrateCOD?: number // mg/L
  hydraulicRetentionTime?: number // hours
  
  // Materials & Design
  anodeMaterials: string[]
  cathodeMaterials: string[]
  electrolyteMaterials: string[]
  membraneType?: string
  reactorVolume?: number // mL or L
  electrodeArea?: number // cm²
  electrodeSpacing?: number // cm
  
  // Biological Components
  microorganisms: string[]
  substrates: string[]
  inoculumSource?: string
  biofilmThickness?: number // μm
  
  // System Configuration
  systemType: string // MFC, MEC, MDC, MES, etc.
  configuration: string // single-chamber, dual-chamber, etc.
  scale: string // lab, pilot, industrial
  
  // Extracted Insights
  keyFindings: string[]
  challenges: string[]
  innovations: string[]
  applications: string[]
  
  // Quality Metrics
  extractionConfidence: number // 0-1
  dataCompleteness: number // 0-1
  relevanceScore: number // 0-1
}

interface ExtractionReport {
  paperId: string
  title: string
  extractedData: ExtractedData
  processingTime: number
  errors: string[]
  warnings: string[]
}

class AdvancedDataExtractor {
  private readonly materialPatterns = {
    anodeMaterials: [
      // Carbon-based
      'carbon cloth', 'carbon felt', 'carbon paper', 'carbon brush', 'carbon fiber',
      'graphite', 'graphite felt', 'graphite plate', 'graphite rod',
      'carbon black', 'activated carbon', 'carbon nanotubes', 'cnt', 'mwcnt', 'swcnt',
      
      // Graphene
      'graphene', 'graphene oxide', 'reduced graphene oxide', 'rgo', 'go',
      'graphene aerogel', 'graphene foam', 'nitrogen-doped graphene',
      
      // MXenes (2D materials)
      'mxene', 'ti3c2tx', 'ti3c2', 'v2ctx', 'nb2ctx', 'titanium carbide',
      
      // Metals
      'stainless steel', 'titanium', 'nickel', 'copper', 'gold', 'silver',
      'stainless steel mesh', 'titanium mesh', 'nickel foam',
      
      // Coated materials
      'platinum-coated', 'gold-coated', 'conductive polymer',
      'polyaniline', 'polypyrrole', 'pedot'
    ],
    
    cathodeMaterials: [
      'platinum', 'platinum catalyst', 'pt catalyst', 'pt/c',
      'stainless steel', 'carbon cloth', 'carbon felt',
      'air cathode', 'oxygen cathode', 'biocathode',
      'manganese oxide', 'iron oxide', 'cobalt oxide',
      'activated carbon cathode'
    ],
    
    microorganisms: [
      // Electroactive bacteria
      'geobacter sulfurreducens', 'geobacter', 'shewanella oneidensis', 'shewanella',
      'pseudomonas aeruginosa', 'pseudomonas', 'clostridium',
      'bacillus', 'escherichia coli', 'e. coli',
      
      // Mixed cultures
      'mixed culture', 'anaerobic sludge', 'activated sludge',
      'wastewater sludge', 'sediment microbes', 'marine sediment',
      'soil microbes', 'compost microbes',
      
      // Specific strains
      'desulfovibrio', 'rhodoferax', 'aeromonas', 'citrobacter'
    ],
    
    substrates: [
      'glucose', 'acetate', 'lactate', 'pyruvate', 'butyrate', 'propionate',
      'ethanol', 'methanol', 'glycerol', 'sucrose', 'starch',
      'wastewater', 'domestic wastewater', 'municipal wastewater',
      'synthetic wastewater', 'brewery wastewater', 'dairy wastewater',
      'food waste', 'organic waste', 'biomass'
    ]
  }

  private readonly performancePatterns = {
    powerDensity: [
      /([\d.]+)\s*(mw|milliwatts?)\s*\/?\s*m[²2]/gi,
      /([\d.]+)\s*(w|watts?)\s*\/?\s*m[²2]/gi,
      /([\d.]+)\s*(kw|kilowatts?)\s*\/?\s*m[²2]/gi,
      /power\s+density[:\s]+([\d.]+)\s*(mw|w|kw)/gi,
      /maximum\s+power[:\s]+([\d.]+)\s*(mw|w)\s*\/?\s*m[²2]/gi
    ],
    
    currentDensity: [
      /([\d.]+)\s*(ma|milliamps?)\s*\/?\s*m[²2]/gi,
      /([\d.]+)\s*(a|amps?)\s*\/?\s*m[²2]/gi,
      /current\s+density[:\s]+([\d.]+)\s*(ma|a)/gi
    ],
    
    voltage: [
      /([\d.]+)\s*v(?:olts?)?/gi,
      /voltage[:\s]+([\d.]+)\s*v/gi,
      /open\s+circuit\s+voltage[:\s]+([\d.]+)/gi,
      /ocv[:\s]+([\d.]+)/gi
    ],
    
    efficiency: [
      /([\d.]+)%?\s*coulombic\s+efficiency/gi,
      /coulombic\s+efficiency[:\s]+([\d.]+)%?/gi,
      /ce[:\s]+([\d.]+)%?/gi,
      /([\d.]+)%?\s*energy\s+efficiency/gi,
      /energy\s+efficiency[:\s]+([\d.]+)%?/gi
    ],
    
    temperature: [
      /([\d.]+)°?c/gi,
      /temperature[:\s]+([\d.]+)°?c/gi,
      /operated\s+at[:\s]+([\d.]+)°?c/gi
    ],
    
    pH: [
      /ph[:\s]+([\d.]+)/gi,
      /ph\s+of[:\s]+([\d.]+)/gi,
      /ph\s+value[:\s]+([\d.]+)/gi
    ]
  }

  async extractFromPaper(paper: any): Promise<ExtractionReport> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const text = this.prepareTextForExtraction(paper)
      const extractedData = await this.performExtraction(text, paper)
      
      const processingTime = Date.now() - startTime

      return {
        paperId: paper.id,
        title: paper.title,
        extractedData,
        processingTime,
        errors,
        warnings
      }
    } catch (error) {
      errors.push(`Extraction failed: ${error}`)
      
      return {
        paperId: paper.id,
        title: paper.title,
        extractedData: this.createEmptyExtractedData(),
        processingTime: Date.now() - startTime,
        errors,
        warnings
      }
    }
  }

  private prepareTextForExtraction(paper: any): string {
    // Combine all available text fields
    const textParts = [
      paper.title || '',
      paper.abstract || '',
      paper.keywords ? this.parseJsonField(paper.keywords).join(' ') : '',
    ].filter(Boolean)

    return textParts.join('\n\n').toLowerCase()
  }

  private async performExtraction(text: string, paper: any): Promise<ExtractedData> {
    const data: ExtractedData = this.createEmptyExtractedData()

    // Extract performance metrics
    this.extractPerformanceMetrics(text, data)
    
    // Extract materials
    this.extractMaterials(text, data)
    
    // Extract microorganisms
    this.extractMicroorganisms(text, data)
    
    // Extract substrates
    this.extractSubstrates(text, data)
    
    // Extract operational conditions
    this.extractOperationalConditions(text, data)
    
    // Determine system type and configuration
    this.determineSystemType(text, data)
    
    // Extract key insights
    this.extractKeyInsights(text, data)
    
    // Calculate quality metrics
    this.calculateQualityMetrics(data)

    return data
  }

  private extractPerformanceMetrics(text: string, data: ExtractedData): void {
    // Power density extraction
    for (const pattern of this.performancePatterns.powerDensity) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const value = parseFloat(match[1])
        const unit = match[2].toLowerCase()
        
        let powerInMW = value
        if (unit.startsWith('w') && !unit.startsWith('mw')) powerInMW = value * 1000
        if (unit.startsWith('kw')) powerInMW = value * 1000000
        
        if (powerInMW > 0 && powerInMW < 1000000) { // Reasonable range
          data.powerDensity = Math.max(data.powerDensity || 0, powerInMW)
        }
      }
    }

    // Current density extraction
    for (const pattern of this.performancePatterns.currentDensity) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const value = parseFloat(match[1])
        const unit = match[2].toLowerCase()
        
        let currentInMA = value
        if (unit.startsWith('a') && !unit.startsWith('ma')) currentInMA = value * 1000
        
        if (currentInMA > 0 && currentInMA < 100000) { // Reasonable range
          data.currentDensity = Math.max(data.currentDensity || 0, currentInMA)
        }
      }
    }

    // Voltage extraction
    for (const pattern of this.performancePatterns.voltage) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const value = parseFloat(match[1])
        if (value > 0 && value < 10) { // Reasonable voltage range for MFCs
          data.voltage = Math.max(data.voltage || 0, value)
        }
      }
    }

    // Efficiency extraction
    for (const pattern of this.performancePatterns.efficiency) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const value = parseFloat(match[1])
        if (value > 0 && value <= 100) {
          if (match[0].toLowerCase().includes('coulombic')) {
            data.coulombicEfficiency = Math.max(data.coulombicEfficiency || 0, value)
          } else if (match[0].toLowerCase().includes('energy')) {
            data.energyEfficiency = Math.max(data.energyEfficiency || 0, value)
          }
        }
      }
    }
  }

  private extractMaterials(text: string, data: ExtractedData): void {
    // Extract anode materials
    for (const material of this.materialPatterns.anodeMaterials) {
      if (text.includes(material)) {
        if (!data.anodeMaterials.includes(material)) {
          data.anodeMaterials.push(material)
        }
      }
    }

    // Extract cathode materials
    for (const material of this.materialPatterns.cathodeMaterials) {
      if (text.includes(material)) {
        if (!data.cathodeMaterials.includes(material)) {
          data.cathodeMaterials.push(material)
        }
      }
    }

    // Extract membrane/separator information
    const membranePatterns = [
      'nafion', 'cation exchange membrane', 'anion exchange membrane',
      'proton exchange membrane', 'pem', 'cem', 'aem',
      'salt bridge', 'agar bridge', 'ceramic membrane'
    ]

    for (const membrane of membranePatterns) {
      if (text.includes(membrane)) {
        data.membraneType = membrane
        break
      }
    }
  }

  private extractMicroorganisms(text: string, data: ExtractedData): void {
    for (const organism of this.materialPatterns.microorganisms) {
      if (text.includes(organism)) {
        if (!data.microorganisms.includes(organism)) {
          data.microorganisms.push(organism)
        }
      }
    }
  }

  private extractSubstrates(text: string, data: ExtractedData): void {
    for (const substrate of this.materialPatterns.substrates) {
      if (text.includes(substrate)) {
        if (!data.substrates.includes(substrate)) {
          data.substrates.push(substrate)
        }
      }
    }
  }

  private extractOperationalConditions(text: string, data: ExtractedData): void {
    // Temperature
    for (const pattern of this.performancePatterns.temperature) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const temp = parseFloat(match[1])
        if (temp > 0 && temp < 100) { // Reasonable temperature range
          data.temperature = temp
          break
        }
      }
    }

    // pH
    for (const pattern of this.performancePatterns.pH) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const ph = parseFloat(match[1])
        if (ph >= 0 && ph <= 14) {
          data.pH = ph
          break
        }
      }
    }

    // COD (Chemical Oxygen Demand)
    const codPattern = /([\d.]+)\s*mg\/l\s*cod/gi
    const codMatches = Array.from(text.matchAll(codPattern))
    if (codMatches.length > 0) {
      data.substrateCOD = parseFloat(codMatches[0][1])
    }

    // Hydraulic retention time
    const hrtPattern = /([\d.]+)\s*(hours?|h|days?|d)\s*(?:hrt|retention\s+time)/gi
    const hrtMatches = Array.from(text.matchAll(hrtPattern))
    if (hrtMatches.length > 0) {
      const value = parseFloat(hrtMatches[0][1])
      const unit = hrtMatches[0][2].toLowerCase()
      data.hydraulicRetentionTime = unit.startsWith('d') ? value * 24 : value
    }
  }

  private determineSystemType(text: string, data: ExtractedData): void {
    // System type determination
    if (text.includes('microbial fuel cell') || text.includes('mfc')) {
      data.systemType = 'MFC'
    } else if (text.includes('microbial electrolysis cell') || text.includes('mec')) {
      data.systemType = 'MEC'
    } else if (text.includes('microbial desalination') || text.includes('mdc')) {
      data.systemType = 'MDC'
    } else if (text.includes('microbial electrosynthesis') || text.includes('mes')) {
      data.systemType = 'MES'
    } else if (text.includes('bioelectrochemical')) {
      data.systemType = 'BES'
    } else {
      data.systemType = 'BES' // Default
    }

    // Configuration determination
    if (text.includes('single chamber') || text.includes('single-chamber')) {
      data.configuration = 'single-chamber'
    } else if (text.includes('dual chamber') || text.includes('two chamber') || text.includes('double chamber')) {
      data.configuration = 'dual-chamber'
    } else if (text.includes('stacked') || text.includes('stack')) {
      data.configuration = 'stacked'
    } else {
      data.configuration = 'unknown'
    }

    // Scale determination
    if (text.includes('pilot scale') || text.includes('pilot-scale')) {
      data.scale = 'pilot'
    } else if (text.includes('industrial') || text.includes('full scale') || text.includes('commercial')) {
      data.scale = 'industrial'
    } else {
      data.scale = 'laboratory'
    }
  }

  private extractKeyInsights(text: string, data: ExtractedData): void {
    // Extract key findings
    const findingPatterns = [
      /(?:results? showed?|demonstrated|achieved|obtained|found that|showed that)\s+([^.]{20,100})/gi,
      /(?:maximum|highest|peak|optimal)\s+([^.]{10,80})/gi
    ]

    for (const pattern of findingPatterns) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const finding = match[1].trim()
        if (finding.length > 10 && !data.keyFindings.includes(finding)) {
          data.keyFindings.push(finding)
        }
        if (data.keyFindings.length >= 5) break // Limit to top 5
      }
    }

    // Extract challenges
    const challengePatterns = [
      /(?:challenge|problem|limitation|issue|difficulty)\s+([^.]{10,80})/gi,
      /(?:however|but|although|despite)\s+([^.]{10,80})/gi
    ]

    for (const pattern of challengePatterns) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const challenge = match[1].trim()
        if (challenge.length > 10 && !data.challenges.includes(challenge)) {
          data.challenges.push(challenge)
        }
        if (data.challenges.length >= 3) break
      }
    }

    // Extract innovations
    const innovationPatterns = [
      /(?:novel|new|innovative|improved|enhanced|modified)\s+([^.]{10,80})/gi,
      /(?:first time|breakthrough|advancement)\s+([^.]{10,80})/gi
    ]

    for (const pattern of innovationPatterns) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const innovation = match[1].trim()
        if (innovation.length > 10 && !data.innovations.includes(innovation)) {
          data.innovations.push(innovation)
        }
        if (data.innovations.length >= 3) break
      }
    }

    // Extract applications
    const applicationPatterns = [
      /(?:application|use|utiliz|employ)(?:ed|ing)?\s+(?:for|in|as)\s+([^.]{10,60})/gi,
      /(?:wastewater treatment|water treatment|energy generation|hydrogen production)/gi
    ]

    for (const pattern of applicationPatterns) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const application = match[1] ? match[1].trim() : match[0]
        if (application.length > 5 && !data.applications.includes(application)) {
          data.applications.push(application)
        }
        if (data.applications.length >= 3) break
      }
    }
  }

  private calculateQualityMetrics(data: ExtractedData): void {
    let totalFields = 0
    let filledFields = 0

    // Count performance metrics
    const performanceFields = ['powerDensity', 'currentDensity', 'voltage', 'coulombicEfficiency', 'energyEfficiency']
    totalFields += performanceFields.length
    filledFields += performanceFields.filter(field => data[field as keyof ExtractedData] != null).length

    // Count materials
    totalFields += 3
    if (data.anodeMaterials.length > 0) filledFields++
    if (data.cathodeMaterials.length > 0) filledFields++
    if (data.microorganisms.length > 0) filledFields++

    // Count conditions
    const conditionFields = ['temperature', 'pH', 'substrateCOD']
    totalFields += conditionFields.length
    filledFields += conditionFields.filter(field => data[field as keyof ExtractedData] != null).length

    // Count insights
    totalFields += 3
    if (data.keyFindings.length > 0) filledFields++
    if (data.innovations.length > 0) filledFields++
    if (data.applications.length > 0) filledFields++

    data.dataCompleteness = totalFields > 0 ? filledFields / totalFields : 0

    // Calculate extraction confidence based on data quality
    let confidence = 0.5 // Base confidence

    if (data.powerDensity && data.powerDensity > 0) confidence += 0.2
    if (data.anodeMaterials.length > 0) confidence += 0.1
    if (data.microorganisms.length > 0) confidence += 0.1
    if (data.keyFindings.length > 0) confidence += 0.1

    data.extractionConfidence = Math.min(confidence, 1.0)

    // Calculate relevance score
    let relevance = 0.6 // Base relevance for MES papers

    const mesKeywords = ['microbial', 'bioelectrochemical', 'fuel cell', 'electrolysis', 'electroactive']
    const hasRelevantKeywords = mesKeywords.some(keyword => 
      data.keyFindings.some(finding => finding.includes(keyword)) ||
      data.applications.some(app => app.includes(keyword))
    )

    if (hasRelevantKeywords) relevance += 0.2
    if (data.powerDensity && data.powerDensity > 1000) relevance += 0.1 // Good performance
    if (data.systemType !== 'BES') relevance += 0.1 // Specific system type

    data.relevanceScore = Math.min(relevance, 1.0)
  }

  private createEmptyExtractedData(): ExtractedData {
    return {
      anodeMaterials: [],
      cathodeMaterials: [],
      electrolyteMaterials: [],
      microorganisms: [],
      substrates: [],
      keyFindings: [],
      challenges: [],
      innovations: [],
      applications: [],
      systemType: 'BES',
      configuration: 'unknown',
      scale: 'laboratory',
      extractionConfidence: 0,
      dataCompleteness: 0,
      relevanceScore: 0
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

  async enhanceAllPapers(limit?: number): Promise<ExtractionReport[]> {
    console.log('🔬 Starting advanced data extraction for real papers...')

    // Get real papers that need enhancement
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
        authors: true,
        doi: true,
        source: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${papers.length} real papers to enhance`)

    const reports: ExtractionReport[] = []
    let processed = 0

    for (const paper of papers) {
      processed++
      console.log(`Processing ${processed}/${papers.length}: ${paper.title.substring(0, 50)}...`)

      const report = await this.extractFromPaper(paper)
      reports.push(report)

      // Update paper with extracted data
      await this.updatePaperWithExtractedData(paper.id, report.extractedData)

      // Progress logging
      if (processed % 10 === 0) {
        const avgConfidence = reports.reduce((sum, r) => sum + r.extractedData.extractionConfidence, 0) / reports.length
        const avgCompleteness = reports.reduce((sum, r) => sum + r.extractedData.dataCompleteness, 0) / reports.length
        console.log(`  Progress: ${processed}/${papers.length} - Avg confidence: ${(avgConfidence * 100).toFixed(1)}% - Avg completeness: ${(avgCompleteness * 100).toFixed(1)}%`)
      }
    }

    return reports
  }

  private async updatePaperWithExtractedData(paperId: string, data: ExtractedData): Promise<void> {
    try {
      await prisma.researchPaper.update({
        where: { id: paperId },
        data: {
          systemType: data.systemType,
          powerOutput: data.powerDensity,
          efficiency: data.coulombicEfficiency,
          anodeMaterials: data.anodeMaterials.length > 0 ? JSON.stringify(data.anodeMaterials) : null,
          cathodeMaterials: data.cathodeMaterials.length > 0 ? JSON.stringify(data.cathodeMaterials) : null,
          organismTypes: data.microorganisms.length > 0 ? JSON.stringify(data.microorganisms) : null,
          // Store additional extracted data in keywords field for now
          keywords: JSON.stringify({
            ...this.parseJsonField((await prisma.researchPaper.findUnique({ where: { id: paperId }, select: { keywords: true } }))?.keywords || '[]'),
            _extractedData: {
              substrates: data.substrates,
              temperature: data.temperature,
              pH: data.pH,
              configuration: data.configuration,
              scale: data.scale,
              keyFindings: data.keyFindings,
              applications: data.applications,
              extractionConfidence: data.extractionConfidence,
              dataCompleteness: data.dataCompleteness,
              relevanceScore: data.relevanceScore
            }
          })
        }
      })
    } catch (error) {
      console.warn(`Failed to update paper ${paperId}:`, error)
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const limit = args[0] ? parseInt(args[0]) : undefined

  try {
    const extractor = new AdvancedDataExtractor()
    const reports = await extractor.enhanceAllPapers(limit)

    // Generate summary report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(process.cwd(), 'reports', `data-extraction-${timestamp}.json`)
    
    await fs.mkdir(path.dirname(reportPath), { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(reports, null, 2))

    console.log(`\n📄 Extraction report saved to: ${reportPath}`)

    // Summary statistics
    const avgConfidence = reports.reduce((sum, r) => sum + r.extractedData.extractionConfidence, 0) / reports.length
    const avgCompleteness = reports.reduce((sum, r) => sum + r.extractedData.dataCompleteness, 0) / reports.length
    const avgRelevance = reports.reduce((sum, r) => sum + r.extractedData.relevanceScore, 0) / reports.length

    console.log(`\n📊 Extraction Summary:`)
    console.log(`  Papers processed: ${reports.length}`)
    console.log(`  Average confidence: ${(avgConfidence * 100).toFixed(1)}%`)
    console.log(`  Average completeness: ${(avgCompleteness * 100).toFixed(1)}%`)
    console.log(`  Average relevance: ${(avgRelevance * 100).toFixed(1)}%`)

    const highQualityPapers = reports.filter(r => 
      r.extractedData.extractionConfidence > 0.7 && 
      r.extractedData.dataCompleteness > 0.5
    )
    console.log(`  High-quality extractions: ${highQualityPapers.length} (${((highQualityPapers.length / reports.length) * 100).toFixed(1)}%)`)

  } catch (error) {
    console.error('❌ Data extraction failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { AdvancedDataExtractor, type ExtractedData, type ExtractionReport }