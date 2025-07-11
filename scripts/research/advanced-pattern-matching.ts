#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { DataValidator, UnitConverter, type ExtractedData } from '../../lib/research/data-validation'

const prisma = new PrismaClient()

interface PerformancePattern {
  name: string
  patterns: RegExp[]
  unit: string
  extractor: (match: RegExpMatchArray) => number | null
}

class AdvancedPatternMatcher {
  // Comprehensive patterns for bioelectrochemical systems
  private readonly performancePatterns: PerformancePattern[] = [
    // Power density patterns
    {
      name: 'power_density',
      patterns: [
        /(\d+(?:\.\d+)?)\s*(?:mW|milliwatt|milliwatts?)\/m[²2]/gi,
        /(\d+(?:\.\d+)?)\s*(?:W|watt|watts?)\/m[²2]/gi,
        /(\d+(?:\.\d+)?)\s*(?:μW|microwatt|microwatts?)\/cm[²2]/gi,
        /(\d+(?:\.\d+)?)\s*(?:mW|milliwatt|milliwatts?)\/cm[²2]/gi,
        /power\s+density\s+of\s+(\d+(?:\.\d+)?)\s*(?:mW|W)\/m[²2]/gi,
        /maximum\s+power\s+density\s+(\d+(?:\.\d+)?)\s*(?:mW|W)\/m[²2]/gi,
        /peak\s+power\s+density\s+(\d+(?:\.\d+)?)\s*(?:mW|W)\/m[²2]/gi,
        /(\d+(?:\.\d+)?)\s*(?:mW|W)\/m[²2]\s+power\s+density/gi
      ],
      unit: 'mW/m²',
      extractor: (match) => {
        const value = parseFloat(match[1])
        const unit = match[0].toLowerCase()
        if (unit.includes('w/m²') || unit.includes('w/m2')) {
          return unit.includes('mw') ? value : value * 1000
        } else if (unit.includes('μw/cm²') || unit.includes('μw/cm2')) {
          return value * 10
        } else if (unit.includes('mw/cm²') || unit.includes('mw/cm2')) {
          return value * 10000
        }
        return value
      }
    },

    // Current density patterns
    {
      name: 'current_density',
      patterns: [
        /(\d+(?:\.\d+)?)\s*(?:mA|milliamp|milliamps?)\/cm[²2]/gi,
        /(\d+(?:\.\d+)?)\s*(?:A|amp|amps?)\/m[²2]/gi,
        /(\d+(?:\.\d+)?)\s*(?:μA|microamp|microamps?)\/cm[²2]/gi,
        /(\d+(?:\.\d+)?)\s*(?:A|amp|amps?)\/cm[²2]/gi,
        /current\s+density\s+of\s+(\d+(?:\.\d+)?)\s*(?:mA|A)\/cm[²2]/gi,
        /maximum\s+current\s+density\s+(\d+(?:\.\d+)?)\s*(?:mA|A)\/cm[²2]/gi,
        /peak\s+current\s+density\s+(\d+(?:\.\d+)?)\s*(?:mA|A)\/cm[²2]/gi
      ],
      unit: 'mA/cm²',
      extractor: (match) => {
        const value = parseFloat(match[1])
        const unit = match[0].toLowerCase()
        if (unit.includes('ma/cm²') || unit.includes('ma/cm2')) {
          return value
        } else if (unit.includes('a/m²') || unit.includes('a/m2')) {
          return value * 0.1
        } else if (unit.includes('μa/cm²') || unit.includes('μa/cm2')) {
          return value * 0.001
        } else if (unit.includes('a/cm²') || unit.includes('a/cm2')) {
          return value * 1000
        }
        return value
      }
    },

    // Voltage patterns
    {
      name: 'voltage',
      patterns: [
        /(\d+(?:\.\d+)?)\s*(?:V|volt|volts?)/gi,
        /(\d+(?:\.\d+)?)\s*(?:mV|millivolt|millivolts?)/gi,
        /voltage\s+of\s+(\d+(?:\.\d+)?)\s*(?:V|mV)/gi,
        /cell\s+voltage\s+(\d+(?:\.\d+)?)\s*(?:V|mV)/gi,
        /open\s+circuit\s+voltage\s+(\d+(?:\.\d+)?)\s*(?:V|mV)/gi,
        /maximum\s+voltage\s+(\d+(?:\.\d+)?)\s*(?:V|mV)/gi
      ],
      unit: 'V',
      extractor: (match) => {
        const value = parseFloat(match[1])
        const unit = match[0].toLowerCase()
        return unit.includes('mv') ? value / 1000 : value
      }
    },

    // Efficiency patterns
    {
      name: 'coulombic_efficiency',
      patterns: [
        /coulombic\s+efficiency\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi,
        /CE\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi,
        /(\d+(?:\.\d+)?)\s*%\s+coulombic\s+efficiency/gi,
        /efficiency\s+(?:was\s+)?(\d+(?:\.\d+)?)\s*%/gi
      ],
      unit: '%',
      extractor: (match) => parseFloat(match[1])
    },

    // COD removal efficiency
    {
      name: 'cod_removal_efficiency',
      patterns: [
        /COD\s+removal\s+(?:efficiency\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi,
        /(\d+(?:\.\d+)?)\s*%\s+COD\s+removal/gi,
        /chemical\s+oxygen\s+demand\s+removal\s+(\d+(?:\.\d+)?)\s*%/gi,
        /COD\s+reduction\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi
      ],
      unit: '%',
      extractor: (match) => parseFloat(match[1])
    },

    // BOD removal efficiency
    {
      name: 'bod_removal_efficiency',
      patterns: [
        /BOD\s+removal\s+(?:efficiency\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi,
        /(\d+(?:\.\d+)?)\s*%\s+BOD\s+removal/gi,
        /biological\s+oxygen\s+demand\s+removal\s+(\d+(?:\.\d+)?)\s*%/gi,
        /BOD\s+reduction\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi
      ],
      unit: '%',
      extractor: (match) => parseFloat(match[1])
    },

    // Hydrogen production
    {
      name: 'hydrogen_production',
      patterns: [
        /(\d+(?:\.\d+)?)\s*(?:mL|ml)\/L\/d\s+hydrogen/gi,
        /hydrogen\s+production\s+(?:rate\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:mL|ml)\/L\/d/gi,
        /H2\s+production\s+(\d+(?:\.\d+)?)\s*(?:mL|ml)\/L\/d/gi,
        /(\d+(?:\.\d+)?)\s*(?:L|l)\/L\/d\s+H2/gi
      ],
      unit: 'mL/L/d',
      extractor: (match) => {
        const value = parseFloat(match[1])
        const unit = match[0].toLowerCase()
        return unit.includes('l/l/d') && !unit.includes('ml') ? value * 1000 : value
      }
    },

    // Conductivity
    {
      name: 'conductivity',
      patterns: [
        /(\d+(?:\.\d+)?)\s*(?:S|siemens?)\/cm/gi,
        /(\d+(?:\.\d+)?)\s*(?:mS|millisiemens?)\/cm/gi,
        /(\d+(?:\.\d+)?)\s*(?:μS|microsiemens?)\/cm/gi,
        /conductivity\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:S|mS|μS)\/cm/gi
      ],
      unit: 'S/cm',
      extractor: (match) => {
        const value = parseFloat(match[1])
        const unit = match[0].toLowerCase()
        if (unit.includes('ms/cm')) {
          return value / 1000
        } else if (unit.includes('μs/cm')) {
          return value / 1000000
        }
        return value
      }
    },

    // Surface area
    {
      name: 'surface_area',
      patterns: [
        /(\d+(?:\.\d+)?)\s*m[²2]\/g\s+surface\s+area/gi,
        /surface\s+area\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*m[²2]\/g/gi,
        /BET\s+surface\s+area\s+(\d+(?:\.\d+)?)\s*m[²2]\/g/gi,
        /specific\s+surface\s+area\s+(\d+(?:\.\d+)?)\s*m[²2]\/g/gi
      ],
      unit: 'm²/g',
      extractor: (match) => parseFloat(match[1])
    }
  ]

  // Material patterns
  private readonly materialPatterns = {
    anode: [
      /anode\s+(?:made\s+of\s+|material\s+)?([^.,;]+)/gi,
      /([^.,;]+)\s+anode/gi,
      /anodic\s+electrode\s+(?:made\s+of\s+)?([^.,;]+)/gi
    ],
    cathode: [
      /cathode\s+(?:made\s+of\s+|material\s+)?([^.,;]+)/gi,
      /([^.,;]+)\s+cathode/gi,
      /cathodic\s+electrode\s+(?:made\s+of\s+)?([^.,;]+)/gi
    ]
  }

  // Organism patterns
  private readonly organismPatterns = [
    /(?:using\s+|with\s+|inoculated\s+with\s+)([A-Z][a-z]+\s+[a-z]+)/g,
    /microorganism(?:s)?\s+([A-Z][a-z]+(?:\s+[a-z]+)*)/g,
    /bacteria(?:l)?\s+strain\s+([A-Z][a-z]+(?:\s+[a-z]+)*)/g,
    /([A-Z]\.\s+[a-z]+)/g, // E. coli style
    /mixed\s+culture/gi,
    /activated\s+sludge/gi,
    /wastewater\s+(?:inoculum|microorganisms)/gi
  ]

  async extractFromText(text: string, paperId: string): Promise<Partial<ExtractedData> | null> {
    const extracted: any = {
      has_performance_data: false
    }

    // Extract performance metrics
    for (const pattern of this.performancePatterns) {
      for (const regex of pattern.patterns) {
        const matches = [...text.matchAll(regex)]
        if (matches.length > 0) {
          const value = pattern.extractor(matches[0])
          if (value !== null && !isNaN(value) && value > 0) {
            extracted[pattern.name] = {
              value: value,
              unit: pattern.unit
            }
            extracted.has_performance_data = true
            
            console.log(`    📊 Found ${pattern.name}: ${value} ${pattern.unit}`)
            break // Take first valid match
          }
        }
      }
    }

    // Extract materials
    for (const [electrodeType, patterns] of Object.entries(this.materialPatterns)) {
      const materials: string[] = []
      for (const pattern of patterns) {
        const matches = [...text.matchAll(pattern)]
        for (const match of matches) {
          const material = match[1]?.trim().toLowerCase()
          if (material && material.length > 2 && material.length < 50) {
            // Clean up material name
            const cleanMaterial = material
              .replace(/electrodes?/gi, '')
              .replace(/materials?/gi, '')
              .replace(/based/gi, '')
              .trim()
            
            if (cleanMaterial.length > 2) {
              materials.push(cleanMaterial)
            }
          }
        }
      }
      
      if (materials.length > 0) {
        const uniqueMaterials = [...new Set(materials)].slice(0, 5) // Limit to 5
        extracted[`${electrodeType}_materials`] = uniqueMaterials.map(m => ({
          name: m,
          type: electrodeType
        }))
        console.log(`    🔬 Found ${electrodeType} materials: ${uniqueMaterials.join(', ')}`)
      }
    }

    // Extract organisms
    const organisms: string[] = []
    for (const pattern of this.organismPatterns) {
      const matches = [...text.matchAll(pattern)]
      for (const match of matches) {
        const organism = match[1]?.trim() || match[0]?.trim()
        if (organism && organism.length > 2 && organism.length < 50) {
          organisms.push(organism)
        }
      }
    }
    
    if (organisms.length > 0) {
      const uniqueOrganisms = [...new Set(organisms)].slice(0, 5)
      extracted.microorganisms = uniqueOrganisms.map(o => ({
        name: o,
        type: this.classifyOrganism(o)
      }))
      console.log(`    🦠 Found microorganisms: ${uniqueOrganisms.join(', ')}`)
    }

    // Determine system type
    const systemTypePatterns = {
      'MFC': /microbial\s+fuel\s+cell/gi,
      'MEC': /microbial\s+electrolysis\s+cell/gi,
      'MDC': /microbial\s+desalination\s+cell/gi,
      'MES': /microbial\s+electrosynthesis/gi,
      'BES': /bioelectrochemical\s+system/gi
    }

    for (const [type, pattern] of Object.entries(systemTypePatterns)) {
      if (pattern.test(text)) {
        extracted.system_type = type
        console.log(`    ⚡ System type: ${type}`)
        break
      }
    }

    // Return null if no useful data found
    if (!extracted.has_performance_data && 
        !extracted.anode_materials && 
        !extracted.cathode_materials && 
        !extracted.microorganisms) {
      return null
    }

    return extracted
  }

  private classifyOrganism(organism: string): string {
    const lower = organism.toLowerCase()
    if (lower.includes('coli') || lower.includes('bacteria') || lower.includes('bacillus')) {
      return 'bacteria'
    } else if (lower.includes('archaea')) {
      return 'archaea'
    } else if (lower.includes('yeast')) {
      return 'yeast'
    } else if (lower.includes('algae') || lower.includes('chlorella')) {
      return 'algae'
    } else if (lower.includes('mixed') || lower.includes('sludge')) {
      return 'mixed_culture'
    }
    return 'bacteria' // Default
  }

  async processAllPapers() {
    console.log('🔍 Starting advanced pattern matching extraction...')
    
    // Get papers that haven't been processed with pattern matching
    const unprocessedPapers = await prisma.researchPaper.findMany({
      where: {
        OR: [
          { aiProcessingDate: null },
          { aiModelVersion: { not: { in: ['pattern-matching-v2', 'ollama-enhanced-v2'] } } }
        ],
        abstract: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, abstract: true }
    })

    console.log(`📄 Found ${unprocessedPapers.length} papers for pattern matching`)

    let processed = 0
    let withData = 0
    let errors = 0

    for (let i = 0; i < unprocessedPapers.length; i++) {
      const paper = unprocessedPapers[i]
      const progress = `[${i + 1}/${unprocessedPapers.length}]`
      
      console.log(`\n${progress} Processing: ${paper.title.substring(0, 60)}...`)
      
      try {
        const fullText = `${paper.title} ${paper.abstract}`
        const extracted = await this.extractFromText(fullText, paper.id)
        
        if (extracted) {
          // Validate extracted data
          const validation = DataValidator.validateExtractedData(extracted)
          
          if (validation.isValid) {
            // Standardize units
            const standardized = DataValidator.standardizeExtractedData(validation.data!)
            
            // Prepare update data
            const updateData: any = {
              aiProcessingDate: new Date(),
              aiModelVersion: 'pattern-matching-v2',
              aiDataExtraction: JSON.stringify(standardized),
              aiConfidence: standardized.has_performance_data ? 0.7 : 0.5
            }

            // Map to database fields
            if (standardized.power_density?.value) {
              updateData.powerOutput = standardized.power_density.value
            }
            if (standardized.coulombic_efficiency) {
              updateData.efficiency = standardized.coulombic_efficiency
            }
            if (standardized.anode_materials?.length) {
              updateData.anodeMaterials = JSON.stringify(standardized.anode_materials.map(m => m.name))
            }
            if (standardized.cathode_materials?.length) {
              updateData.cathodeMaterials = JSON.stringify(standardized.cathode_materials.map(m => m.name))
            }
            if (standardized.microorganisms?.length) {
              updateData.organismTypes = JSON.stringify(standardized.microorganisms.map(o => o.name))
            }
            if (standardized.system_type) {
              updateData.systemType = standardized.system_type
            }

            // Add tags
            const tags = ['PATTERN_EXTRACTED']
            if (standardized.has_performance_data) tags.push('HAS_PERFORMANCE_DATA')
            if (standardized.power_density) tags.push('HAS_POWER_DENSITY')
            if (standardized.current_density) tags.push('HAS_CURRENT_DENSITY')
            
            updateData.keywords = JSON.stringify(tags)

            await prisma.researchPaper.update({
              where: { id: paper.id },
              data: updateData
            })

            processed++
            if (standardized.has_performance_data) {
              withData++
            }
            
            console.log(`    ✅ Extracted and validated`)
          } else {
            console.log(`    ⚠️ Validation failed: ${validation.errors.join(', ')}`)
          }
        } else {
          console.log(`    📭 No extractable data found`)
        }

        processed++
        
      } catch (error) {
        errors++
        console.error(`    ❌ Error: ${error.message}`)
      }
    }

    // Final summary
    console.log('\n✅ Pattern matching complete!')
    console.log(`\n📊 Final Summary:`)
    console.log(`  Papers processed: ${processed}`)
    console.log(`  With performance data: ${withData}`)
    console.log(`  Success rate: ${processed > 0 ? ((processed/(processed + errors))*100).toFixed(1) : 0}%`)
    
    return { processed, withData, errors }
  }
}

async function main() {
  const matcher = new AdvancedPatternMatcher()
  
  try {
    await matcher.processAllPapers()
  } catch (error) {
    console.error('Error during pattern matching:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()