#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

interface MicrobialCommunity {
  dominant: string[]
  consortium: string[]
  pureculture: boolean
}

interface MicrobialClassification {
  phylum: string[]
  class: string[]
  genus: string[]
  species: string[]
}

interface SystemConfiguration {
  type: 'MFC' | 'MEC' | 'MDC' | 'MES' | 'BES' | 'OTHER'
  subtype: string
  scale: 'lab' | 'pilot' | 'industrial'
  architecture: string
}

interface PerformanceBenchmarks {
  powerDensity: {
    max: number
    operating: number
    normalized: number
    unit: string
  }
  currentDensity?: {
    max: number
    operating: number
    unit: string
  }
  coulombicEfficiency?: number
  energyEfficiency?: number
  comparativeRank?: number
}

class EnhancedCategoryExtractor {
  // Common microbe genera and their classifications
  private microbeDatabase = {
    'Geobacter': { phylum: 'Proteobacteria', class: 'Deltaproteobacteria' },
    'Shewanella': { phylum: 'Proteobacteria', class: 'Gammaproteobacteria' },
    'Pseudomonas': { phylum: 'Proteobacteria', class: 'Gammaproteobacteria' },
    'Escherichia': { phylum: 'Proteobacteria', class: 'Gammaproteobacteria' },
    'E. coli': { phylum: 'Proteobacteria', class: 'Gammaproteobacteria', genus: 'Escherichia', species: 'coli' },
    'Desulfovibrio': { phylum: 'Proteobacteria', class: 'Deltaproteobacteria' },
    'Rhodopseudomonas': { phylum: 'Proteobacteria', class: 'Alphaproteobacteria' },
    'Bacillus': { phylum: 'Firmicutes', class: 'Bacilli' },
    'Clostridium': { phylum: 'Firmicutes', class: 'Clostridia' },
    'Klebsiella': { phylum: 'Proteobacteria', class: 'Gammaproteobacteria' },
    'Enterobacter': { phylum: 'Proteobacteria', class: 'Gammaproteobacteria' },
    'Aeromonas': { phylum: 'Proteobacteria', class: 'Gammaproteobacteria' }
  }

  // System configuration patterns
  private systemPatterns = {
    type: {
      'microbial fuel cell': 'MFC',
      'microbial electrolysis cell': 'MEC',
      'microbial desalination cell': 'MDC',
      'microbial electrosynthesis': 'MES',
      'bioelectrochemical system': 'BES',
      'mfc': 'MFC',
      'mec': 'MEC',
      'mdc': 'MDC',
      'mes': 'MES',
      'bes': 'BES'
    },
    subtype: [
      'single chamber', 'single-chamber', 'dual chamber', 'dual-chamber', 'two-chamber',
      'air cathode', 'air-cathode', 'stacked', 'tubular', 'flat plate', 'flat-plate',
      'upflow', 'continuous flow', 'batch', 'fed-batch', 'membrane-less', 'membraneless'
    ],
    scale: {
      'laboratory': 'lab',
      'lab scale': 'lab',
      'bench scale': 'lab',
      'pilot scale': 'pilot',
      'pilot plant': 'pilot',
      'industrial scale': 'industrial',
      'field scale': 'industrial',
      'full scale': 'industrial'
    }
  }

  extractMicrobialCommunity(text: string): MicrobialCommunity | null {
    const lowerText = text.toLowerCase()
    const community: MicrobialCommunity = {
      dominant: [],
      consortium: [],
      pureculture: false
    }

    // Check for pure culture indicators
    if (lowerText.includes('pure culture') || lowerText.includes('pure strain') || 
        lowerText.includes('single species') || lowerText.includes('monoculture')) {
      community.pureculture = true
    }

    // Extract dominant species
    const dominantPatterns = [
      /dominant\s+(?:species|strain|microbe|organism)[^.]*?(\w+\s+\w+)/gi,
      /(\w+\s+\w+)\s+(?:was|were)\s+(?:the\s+)?dominant/gi,
      /enriched\s+with\s+(\w+\s+\w+)/gi
    ]

    for (const pattern of dominantPatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        const species = match[1].trim()
        if (this.isValidMicrobe(species)) {
          community.dominant.push(species)
        }
      }
    }

    // Extract consortium members
    if (lowerText.includes('mixed culture') || lowerText.includes('consortium') || 
        lowerText.includes('community') || lowerText.includes('co-culture')) {
      // Extract all mentioned microbes
      for (const microbe of Object.keys(this.microbeDatabase)) {
        const regex = new RegExp(`\\b${microbe}\\b`, 'gi')
        if (regex.test(text)) {
          community.consortium.push(microbe)
        }
      }
    }

    // Return null if no data extracted
    if (community.dominant.length === 0 && community.consortium.length === 0 && !community.pureculture) {
      return null
    }

    return community
  }

  extractMicrobialClassification(text: string, organisms?: string): MicrobialClassification | null {
    const classification: MicrobialClassification = {
      phylum: [],
      class: [],
      genus: [],
      species: []
    }

    const searchText = `${text} ${organisms || ''}`
    const foundMicrobes = new Set<string>()

    // Extract known microbes and their classifications
    for (const [microbe, taxonomy] of Object.entries(this.microbeDatabase)) {
      const regex = new RegExp(`\\b${microbe}\\b`, 'gi')
      if (regex.test(searchText)) {
        foundMicrobes.add(microbe)
        
        if (taxonomy.phylum && !classification.phylum.includes(taxonomy.phylum)) {
          classification.phylum.push(taxonomy.phylum)
        }
        if (taxonomy.class && !classification.class.includes(taxonomy.class)) {
          classification.class.push(taxonomy.class)
        }
        
        // Extract genus from microbe name or taxonomy
        const genus = (taxonomy as any).genus || microbe.split(' ')[0]
        if (genus && !classification.genus.includes(genus)) {
          classification.genus.push(genus)
        }
        
        // Extract species if available
        const species = (taxonomy as any).species || (microbe.includes(' ') ? microbe : null)
        if (species && !classification.species.includes(species)) {
          classification.species.push(species)
        }
      }
    }

    // Look for explicit taxonomy mentions
    const phylumPattern = /(?:phylum|phyla)\s+(\w+)/gi
    const classPattern = /class\s+(\w+)/gi
    
    let match
    while ((match = phylumPattern.exec(searchText)) !== null) {
      if (!classification.phylum.includes(match[1])) {
        classification.phylum.push(match[1])
      }
    }
    
    while ((match = classPattern.exec(searchText)) !== null) {
      if (!classification.class.includes(match[1])) {
        classification.class.push(match[1])
      }
    }

    // Return null if no classification data found
    if (classification.phylum.length === 0 && classification.genus.length === 0) {
      return null
    }

    return classification
  }

  extractSystemConfiguration(text: string, existingType?: string): SystemConfiguration | null {
    const lowerText = text.toLowerCase()
    const config: SystemConfiguration = {
      type: 'BES',
      subtype: '',
      scale: 'lab',
      architecture: ''
    }

    // Extract system type
    if (existingType && ['MFC', 'MEC', 'MDC', 'MES', 'BES'].includes(existingType)) {
      config.type = existingType as any
    } else {
      for (const [pattern, type] of Object.entries(this.systemPatterns.type)) {
        if (lowerText.includes(pattern)) {
          config.type = type as any
          break
        }
      }
    }

    // Extract subtype
    for (const subtype of this.systemPatterns.subtype) {
      if (lowerText.includes(subtype)) {
        config.subtype = subtype.replace('-', ' ')
        break
      }
    }

    // Extract scale
    for (const [pattern, scale] of Object.entries(this.systemPatterns.scale)) {
      if (lowerText.includes(pattern)) {
        config.scale = scale as any
        break
      }
    }

    // Extract architecture
    const architecturePatterns = [
      /(\w+)\s+(?:shaped|shape|design|configuration|architecture)/gi,
      /(?:cylindrical|rectangular|tubular|cubic|spherical|planar)\s+(?:reactor|cell|design)/gi
    ]

    for (const pattern of architecturePatterns) {
      const match = pattern.exec(text)
      if (match) {
        config.architecture = match[0].toLowerCase()
        break
      }
    }

    return config
  }

  extractPerformanceBenchmarks(text: string, existingPower?: number, existingEfficiency?: number): PerformanceBenchmarks | null {
    const benchmarks: PerformanceBenchmarks = {
      powerDensity: {
        max: 0,
        operating: 0,
        normalized: 0,
        unit: 'mW/m²'
      }
    }

    // Extract power density values
    const powerPatterns = [
      /maximum\s+power\s+density[^0-9]*?(\d+(?:\.\d+)?)\s*(mW\/m[²2]|W\/m[²2])/gi,
      /peak\s+power[^0-9]*?(\d+(?:\.\d+)?)\s*(mW\/m[²2]|W\/m[²2])/gi,
      /power\s+density[^0-9]*?(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mW\/m[²2]|W\/m[²2])/gi
    ]

    let maxPower = existingPower || 0
    let operatingPower = 0

    for (const pattern of powerPatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        let value = parseFloat(match[1])
        const unit = match[2]
        
        // Convert to mW/m² if needed
        if (unit.toLowerCase().includes('w/m')) {
          value *= 1000
        }
        
        if (pattern.source.includes('maximum') || pattern.source.includes('peak')) {
          maxPower = Math.max(maxPower, value)
        } else {
          operatingPower = value
        }
      }
    }

    benchmarks.powerDensity.max = maxPower
    benchmarks.powerDensity.operating = operatingPower || maxPower * 0.7 // Estimate operating as 70% of max
    
    // Extract current density
    const currentPatterns = [
      /current\s+density[^0-9]*?(\d+(?:\.\d+)?)\s*(mA\/m[²2]|A\/m[²2])/gi,
      /(\d+(?:\.\d+)?)\s*(mA\/m[²2]|A\/m[²2])\s+current/gi
    ]

    let maxCurrent = 0
    for (const pattern of currentPatterns) {
      const match = pattern.exec(text)
      if (match) {
        let value = parseFloat(match[1])
        const unit = match[2]
        
        // Convert to mA/m² if needed
        if (unit.toLowerCase().includes('a/m') && !unit.toLowerCase().includes('ma')) {
          value *= 1000
        }
        
        maxCurrent = Math.max(maxCurrent, value)
      }
    }

    if (maxCurrent > 0) {
      benchmarks.currentDensity = {
        max: maxCurrent,
        operating: maxCurrent * 0.7,
        unit: 'mA/m²'
      }
    }

    // Extract efficiencies
    const cePattern = /coulombic\s+efficiency[^0-9]*?(\d+(?:\.\d+)?)\s*%/gi
    const eePattern = /energy\s+efficiency[^0-9]*?(\d+(?:\.\d+)?)\s*%/gi

    const ceMatch = cePattern.exec(text)
    if (ceMatch) {
      benchmarks.coulombicEfficiency = parseFloat(ceMatch[1])
    } else if (existingEfficiency) {
      benchmarks.coulombicEfficiency = existingEfficiency
    }

    const eeMatch = eePattern.exec(text)
    if (eeMatch) {
      benchmarks.energyEfficiency = parseFloat(eeMatch[1])
    }

    // Calculate normalized power density (normalized to 1L reactor at 30°C)
    // This is a simplified normalization - in reality would need reactor volume and temperature
    benchmarks.powerDensity.normalized = benchmarks.powerDensity.max

    // Return null if no meaningful data extracted
    if (benchmarks.powerDensity.max === 0 && !benchmarks.coulombicEfficiency) {
      return null
    }

    return benchmarks
  }

  private isValidMicrobe(name: string): boolean {
    // Basic validation for microbe names
    const words = name.split(' ')
    if (words.length < 1 || words.length > 3) return false
    
    // Check if first word is capitalized (genus)
    if (!/^[A-Z]/.test(words[0])) return false
    
    // Avoid common false positives
    const falsePositives = ['The', 'This', 'These', 'That', 'From', 'With', 'Using']
    if (falsePositives.includes(words[0])) return false
    
    return true
  }

  async processPaper(paper: any): Promise<boolean> {
    try {
      const text = `${paper.title} ${paper.abstract || ''}`
      const updateData: any = {}

      // Extract microbial community
      const community = this.extractMicrobialCommunity(text)
      if (community) {
        updateData.microbialCommunity = JSON.stringify(community)
      }

      // Extract microbial classification
      const classification = this.extractMicrobialClassification(text, paper.organismTypes)
      if (classification) {
        updateData.microbialClassification = JSON.stringify(classification)
      }

      // Extract system configuration
      const configuration = this.extractSystemConfiguration(text, paper.systemType)
      if (configuration) {
        updateData.systemConfiguration = JSON.stringify(configuration)
      }

      // Extract performance benchmarks
      const benchmarks = this.extractPerformanceBenchmarks(text, paper.powerOutput, paper.efficiency)
      if (benchmarks) {
        updateData.performanceBenchmarks = JSON.stringify(benchmarks)
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.researchPaper.update({
          where: { id: paper.id },
          data: updateData
        })
        
        console.log(`✅ Updated ${paper.title.substring(0, 60)}...`)
        console.log(`   Extracted: ${Object.keys(updateData).join(', ')}`)
        
        return true
      }

      return false
    } catch (error: any) {
      console.error(`❌ Error processing paper ${paper.id}:`, error.message)
      return false
    }
  }

  async calculateComparativeRanks() {
    console.log('\n📊 Calculating comparative rankings...')
    
    // Get all papers with performance benchmarks
    const papers = await prisma.researchPaper.findMany({
      where: {
        performanceBenchmarks: { not: null }
      },
      select: {
        id: true,
        performanceBenchmarks: true
      }
    })

    // Extract max power densities
    const powerDensities: { id: string, power: number }[] = []
    
    for (const paper of papers) {
      try {
        const benchmarks = JSON.parse(paper.performanceBenchmarks!)
        if (benchmarks.powerDensity?.max) {
          powerDensities.push({
            id: paper.id,
            power: benchmarks.powerDensity.max
          })
        }
      } catch {}
    }

    // Sort by power density
    powerDensities.sort((a, b) => b.power - a.power)

    // Calculate percentile ranks
    const totalPapers = powerDensities.length
    for (let i = 0; i < powerDensities.length; i++) {
      const percentile = ((totalPapers - i) / totalPapers) * 100
      
      // Update the paper with its comparative rank
      const paper = papers.find(p => p.id === powerDensities[i].id)
      if (paper) {
        try {
          const benchmarks = JSON.parse(paper.performanceBenchmarks!)
          benchmarks.comparativeRank = Math.round(percentile)
          
          await prisma.researchPaper.update({
            where: { id: paper.id },
            data: {
              performanceBenchmarks: JSON.stringify(benchmarks)
            }
          })
        } catch {}
      }
    }

    console.log(`   ✅ Updated rankings for ${powerDensities.length} papers`)
  }

  async processBatch(limit: number = 100) {
    console.log('🚀 Starting enhanced category extraction...\n')

    // Find papers that need processing
    const papers = await prisma.researchPaper.findMany({
      where: {
        AND: [
          { abstract: { not: null } },
          {
            OR: [
              { doi: { not: null } },
              { pubmedId: { not: null } },
              { arxivId: { not: null } }
            ]
          },
          // Papers without enhanced categorization
          {
            OR: [
              { microbialCommunity: null },
              { systemConfiguration: null },
              { performanceBenchmarks: null }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        abstract: true,
        systemType: true,
        powerOutput: true,
        efficiency: true,
        organismTypes: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${papers.length} papers to process\n`)

    let processed = 0
    let successful = 0

    for (const paper of papers) {
      const success = await this.processPaper(paper)
      processed++
      if (success) successful++

      if (processed % 10 === 0) {
        console.log(`\n📊 Progress: ${processed}/${papers.length} papers (${successful} successful)`)
      }
    }

    // Calculate comparative rankings
    await this.calculateComparativeRanks()

    console.log('\n✅ Enhanced extraction complete!')
    console.log(`   Total processed: ${processed}`)
    console.log(`   Successfully enhanced: ${successful}`)
    console.log(`   Success rate: ${((successful / processed) * 100).toFixed(1)}%`)

    // Show statistics
    const stats = await prisma.researchPaper.aggregate({
      _count: {
        microbialCommunity: true,
        microbialClassification: true,
        systemConfiguration: true,
        performanceBenchmarks: true
      }
    })

    console.log('\n📈 Database Statistics:')
    console.log(`   Papers with microbial community data: ${stats._count.microbialCommunity}`)
    console.log(`   Papers with taxonomic classification: ${stats._count.microbialClassification}`)
    console.log(`   Papers with system configuration: ${stats._count.systemConfiguration}`)
    console.log(`   Papers with performance benchmarks: ${stats._count.performanceBenchmarks}`)
  }
}

async function main() {
  const extractor = new EnhancedCategoryExtractor()
  const limit = process.argv[2] ? parseInt(process.argv[2]) : 100

  try {
    await extractor.processBatch(limit)
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

export { EnhancedCategoryExtractor }