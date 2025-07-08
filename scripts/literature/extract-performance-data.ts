#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ExtractedData {
  powerDensity?: { value: number; unit: string }
  currentDensity?: { value: number; unit: string }
  voltage?: { value: number; unit: string }
  coulombicEfficiency?: number
  removalEfficiency?: { value: number; type: string }
  hydrogenProduction?: { value: number; unit: string }
  conductivity?: { value: number; unit: string }
  surfaceArea?: { value: number; unit: string }
}

class PerformanceDataExtractor {
  // Regex patterns for common performance metrics
  private patterns = {
    powerDensity: [
      /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mW\/m²|W\/m²|mW\/m2|W\/m2|mW\s*m⁻²|W\s*m⁻²)/gi,
      /power\s+density\s+of\s+(\d+(?:\.\d+)?)\s*(mW\/m²|W\/m²|mW\/m2|W\/m2)/gi,
      /maximum\s+power\s+density\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(mW\/m²|W\/m²|mW\/m2|W\/m2)/gi
    ],
    currentDensity: [
      /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mA\/cm²|A\/m²|mA\/cm2|A\/m2|mA\s*cm⁻²|A\s*m⁻²)/gi,
      /current\s+density\s+of\s+(\d+(?:\.\d+)?)\s*(mA\/cm²|A\/m²|mA\/cm2|A\/m2)/gi
    ],
    voltage: [
      /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(V|mV)\s+(?:open[\s-]?circuit|OCV)/gi,
      /open[\s-]?circuit\s+voltage\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(V|mV)/gi,
      /maximum\s+voltage\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(V|mV)/gi
    ],
    coulombicEfficiency: [
      /coulombic\s+efficiency\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi,
      /CE\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi,
      /(\d+(?:\.\d+)?)\s*%\s+coulombic\s+efficiency/gi
    ],
    removalEfficiency: [
      /COD\s+removal\s+(?:efficiency\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi,
      /(\d+(?:\.\d+)?)\s*%\s+COD\s+removal/gi,
      /BOD\s+removal\s+(?:efficiency\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi,
      /nitrogen\s+removal\s+(?:efficiency\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi,
      /phosphorus\s+removal\s+(?:efficiency\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*%/gi
    ],
    hydrogenProduction: [
      /hydrogen\s+production\s+(?:rate\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*(L\/L\/d|mL\/L\/h|m³\/m³\/d)/gi,
      /(\d+(?:\.\d+)?)\s*(L\/L\/d|mL\/L\/h|m³\/m³\/d)\s+hydrogen/gi
    ],
    conductivity: [
      /conductivity\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(S\/cm|mS\/cm|S\/m)/gi,
      /(\d+(?:\.\d+)?)\s*(S\/cm|mS\/cm|S\/m)\s+conductivity/gi
    ],
    surfaceArea: [
      /surface\s+area\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(m²\/g|cm²\/g|m2\/g|cm2\/g)/gi,
      /BET\s+surface\s+area\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(m²\/g|cm²\/g|m2\/g|cm2\/g)/gi
    ]
  }

  extractFromText(text: string): ExtractedData {
    const extracted: ExtractedData = {}

    // Extract power density
    for (const pattern of this.patterns.powerDensity) {
      const matches = [...text.matchAll(pattern)]
      if (matches.length > 0) {
        const values = matches.map(m => ({
          value: parseFloat(m[1]),
          unit: m[2].replace(/\s+/g, '/')
        }))
        // Take the highest value
        extracted.powerDensity = values.reduce((max, current) => 
          current.value > max.value ? current : max
        )
        break
      }
    }

    // Extract current density
    for (const pattern of this.patterns.currentDensity) {
      const matches = [...text.matchAll(pattern)]
      if (matches.length > 0) {
        const values = matches.map(m => ({
          value: parseFloat(m[1]),
          unit: m[2].replace(/\s+/g, '/')
        }))
        extracted.currentDensity = values.reduce((max, current) => 
          current.value > max.value ? current : max
        )
        break
      }
    }

    // Extract voltage
    for (const pattern of this.patterns.voltage) {
      const matches = [...text.matchAll(pattern)]
      if (matches.length > 0) {
        const values = matches.map(m => ({
          value: parseFloat(m[1]),
          unit: m[2]
        }))
        extracted.voltage = values.reduce((max, current) => 
          current.value > max.value ? current : max
        )
        break
      }
    }

    // Extract coulombic efficiency
    for (const pattern of this.patterns.coulombicEfficiency) {
      const match = text.match(pattern)
      if (match) {
        extracted.coulombicEfficiency = parseFloat(match[1])
        break
      }
    }

    // Extract removal efficiency
    for (const pattern of this.patterns.removalEfficiency) {
      const match = text.match(pattern)
      if (match) {
        const type = pattern.source.includes('COD') ? 'COD' : 
                     pattern.source.includes('BOD') ? 'BOD' :
                     pattern.source.includes('nitrogen') ? 'nitrogen' :
                     pattern.source.includes('phosphorus') ? 'phosphorus' : 'unknown'
        extracted.removalEfficiency = {
          value: parseFloat(match[1]),
          type
        }
        break
      }
    }

    // Extract hydrogen production
    for (const pattern of this.patterns.hydrogenProduction) {
      const match = text.match(pattern)
      if (match) {
        extracted.hydrogenProduction = {
          value: parseFloat(match[1]),
          unit: match[2]
        }
        break
      }
    }

    // Extract conductivity
    for (const pattern of this.patterns.conductivity) {
      const match = text.match(pattern)
      if (match) {
        extracted.conductivity = {
          value: parseFloat(match[1]),
          unit: match[2]
        }
        break
      }
    }

    // Extract surface area
    for (const pattern of this.patterns.surfaceArea) {
      const match = text.match(pattern)
      if (match) {
        extracted.surfaceArea = {
          value: parseFloat(match[1]),
          unit: match[2].replace(/\s+/g, '/')
        }
        break
      }
    }

    return extracted
  }

  normalizeUnits(data: ExtractedData): any {
    const normalized: any = {}

    // Normalize power density to mW/m²
    if (data.powerDensity) {
      let value = data.powerDensity.value
      if (data.powerDensity.unit.toLowerCase().includes('w/m')) {
        value *= 1000 // W to mW
      }
      normalized.powerOutput = value
    }

    // Normalize current density to mA/cm²
    if (data.currentDensity) {
      let value = data.currentDensity.value
      if (data.currentDensity.unit.toLowerCase().includes('a/m')) {
        value /= 10 // A/m² to mA/cm²
      }
      normalized.currentDensity = value
    }

    // Voltage in mV
    if (data.voltage) {
      let value = data.voltage.value
      if (data.voltage.unit.toLowerCase() === 'v') {
        value *= 1000 // V to mV
      }
      normalized.voltage = value
    }

    // Efficiencies as percentages
    if (data.coulombicEfficiency) {
      normalized.coulombicEfficiency = data.coulombicEfficiency
    }

    if (data.removalEfficiency) {
      normalized[`${data.removalEfficiency.type}RemovalEfficiency`] = data.removalEfficiency.value
    }

    return normalized
  }
}

async function main() {
  console.log('🔬 Extracting performance data from research papers...')
  
  const extractor = new PerformanceDataExtractor()
  
  // Get papers that haven't been processed
  const papers = await prisma.researchPaper.findMany({
    where: {
      aiProcessingDate: null,
      abstract: { not: null }
    },
    take: 100 // Process in batches
  })

  console.log(`Found ${papers.length} papers to process`)

  let processedCount = 0
  let dataFoundCount = 0

  for (const paper of papers) {
    try {
      // Combine title and abstract for extraction
      const text = `${paper.title} ${paper.abstract}`
      
      // Extract data
      const extractedData = extractor.extractFromText(text)
      
      if (Object.keys(extractedData).length > 0) {
        dataFoundCount++
        
        // Normalize units
        const normalizedData = extractor.normalizeUnits(extractedData)
        
        // Create AI data extraction object
        const aiDataExtraction = {
          extractedData,
          normalizedData,
          extractionMethod: 'pattern_matching',
          extractionDate: new Date().toISOString()
        }

        // Update paper
        await prisma.researchPaper.update({
          where: { id: paper.id },
          data: {
            powerOutput: normalizedData.powerOutput || null,
            efficiency: normalizedData.coulombicEfficiency || null,
            aiDataExtraction: JSON.stringify(aiDataExtraction),
            aiProcessingDate: new Date(),
            aiModelVersion: 'pattern_extractor_v1',
            aiConfidence: Object.keys(extractedData).length > 2 ? 0.8 : 0.6,
            aiSummary: `Extracted ${Object.keys(extractedData).length} performance metrics using pattern matching.`,
            keywords: paper.keywords ? 
              JSON.stringify([...JSON.parse(paper.keywords), 'DATA_EXTRACTED']) :
              JSON.stringify(['DATA_EXTRACTED'])
          }
        })

        console.log(`✅ ${paper.title.substring(0, 60)}...`)
        console.log(`   Found: ${Object.keys(extractedData).join(', ')}`)
      }

      processedCount++
    } catch (error) {
      console.error(`❌ Error processing paper ${paper.id}:`, error)
    }
  }

  console.log('\n📊 Summary:')
  console.log(`  Papers processed: ${processedCount}`)
  console.log(`  Papers with data: ${dataFoundCount}`)
  console.log(`  Data extraction rate: ${processedCount > 0 ? (dataFoundCount/processedCount*100).toFixed(1) : 0}%`)

  await prisma.$disconnect()
}

main().catch(console.error)