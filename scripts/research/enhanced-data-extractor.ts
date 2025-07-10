#!/usr/bin/env npx tsx

import prisma from '../../lib/db'
import { z } from 'zod'
import { 
  extractPerformanceData, 
  extractMaterials, 
  extractOrganisms 
} from './paper-quality-validator'

// Enhanced data extraction schema
const ExtractedDataSchema = z.object({
  // Performance metrics
  powerDensity: z.object({
    value: z.number(),
    unit: z.string(),
    conditions: z.string().optional()
  }).optional(),
  currentDensity: z.object({
    value: z.number(),
    unit: z.string(),
    conditions: z.string().optional()
  }).optional(),
  voltage: z.object({
    value: z.number(),
    unit: z.string(),
    type: z.enum(['OCV', 'operating', 'max']).optional()
  }).optional(),
  coulombicEfficiency: z.number().min(0).max(100).optional(),
  
  // Materials
  anodeMaterials: z.array(z.object({
    material: z.string(),
    modification: z.string().optional(),
    surfaceArea: z.number().optional()
  })).optional(),
  cathodeMaterials: z.array(z.object({
    material: z.string(),
    catalyst: z.string().optional(),
    loading: z.string().optional()
  })).optional(),
  
  // Microorganisms
  organisms: z.array(z.object({
    species: z.string(),
    type: z.enum(['pure', 'consortium', 'biofilm']),
    source: z.string().optional()
  })).optional(),
  
  // System configuration
  systemConfig: z.object({
    type: z.enum(['MFC', 'MEC', 'MDC', 'MES', 'BES']),
    chamberConfig: z.enum(['single', 'dual', 'multi']).optional(),
    volume: z.number().optional(),
    volumeUnit: z.string().optional()
  }).optional(),
  
  // Operating conditions
  operatingConditions: z.object({
    temperature: z.number().optional(),
    pH: z.number().optional(),
    substrate: z.string().optional(),
    concentrationCOD: z.number().optional(),
    hydraulicRetentionTime: z.number().optional()
  }).optional(),
  
  // Experimental duration
  duration: z.object({
    value: z.number(),
    unit: z.enum(['hours', 'days', 'weeks', 'months'])
  }).optional(),
  
  // Key findings
  keyFindings: z.array(z.string()).optional(),
  
  // Extraction metadata
  extractionMetadata: z.object({
    method: z.string(),
    confidence: z.number().min(0).max(1),
    timestamp: z.string()
  })
})

// Enhanced extraction patterns
const ENHANCED_PATTERNS = {
  // Power density with units and conditions
  powerDensityDetailed: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mW\/m[²2]|W\/m[³3]|mW\s*m-2)\s*(?:at\s+([^,.;]+))?/gi,
  
  // Current density with conditions
  currentDensityDetailed: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mA\/cm[²2]|A\/m[²2]|mA\s*cm-2)\s*(?:at\s+([^,.;]+))?/gi,
  
  // Voltage types
  ocv: /(?:OCV|open\s*circuit\s*voltage)\s*(?:of|was|is)?\s*(\d+(?:\.\d+)?)\s*(mV|V)/gi,
  operatingVoltage: /(?:operating|working)\s*voltage\s*(?:of|was|is)?\s*(\d+(?:\.\d+)?)\s*(mV|V)/gi,
  
  // Efficiency with type
  coulombicEfficiency: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*%\s*(?:CE|coulombic\s*efficiency)/gi,
  
  // System volume
  systemVolume: /(?:volume|capacity)\s*(?:of|was|is)?\s*(\d+(?:\.\d+)?)\s*(mL|L|ml|l)/gi,
  
  // Temperature
  temperature: /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*°?C/gi,
  
  // pH
  pH: /pH\s*(?:of|was|is)?\s*(\d+(?:\.\d+)?)/gi,
  
  // COD
  cod: /(\d+(?:\.\d+)?)\s*mg\s*(?:COD)?\s*L-1|(\d+(?:\.\d+)?)\s*mg\/L\s*COD/gi,
  
  // HRT
  hrt: /(?:HRT|hydraulic\s*retention\s*time)\s*(?:of|was|is)?\s*(\d+(?:\.\d+)?)\s*(h|hours?|days?|d)/gi,
  
  // Duration
  duration: /(?:operated|run|tested)\s*(?:for|during)\s*(\d+)\s*(hours?|days?|weeks?|months?)/gi
}

// Material classification
const MATERIAL_CLASSES = {
  carbon: ['graphite', 'carbon cloth', 'carbon felt', 'carbon paper', 'carbon brush', 'activated carbon'],
  graphene: ['graphene', 'graphene oxide', 'reduced graphene oxide', 'rGO', 'GO'],
  nanotube: ['carbon nanotube', 'CNT', 'SWCNT', 'MWCNT', 'nanotube'],
  mxene: ['MXene', 'Ti3C2', 'Ti2C', 'V2C', 'Mo2C'],
  metal: ['stainless steel', 'titanium', 'platinum', 'copper', 'nickel', 'iron'],
  polymer: ['PEDOT', 'polyaniline', 'polypyrrole', 'PANI', 'PPy'],
  composite: ['composite', 'nanocomposite', 'hybrid']
}

// Organism classification
const ORGANISM_TYPES = {
  electroactive: ['Geobacter', 'Shewanella', 'Desulfovibrio', 'Rhodobacter'],
  fermentative: ['Clostridium', 'Enterobacter', 'Escherichia'],
  mixed: ['consortium', 'community', 'mixed culture', 'activated sludge', 'wastewater']
}

// Enhanced data extraction function
async function extractEnhancedData(paper: any): Promise<any> {
  const fullText = `${paper.title} ${paper.abstract || ''}`
  const extractedData: any = {
    extractionMetadata: {
      method: 'pattern-matching-enhanced',
      confidence: 0,
      timestamp: new Date().toISOString()
    }
  }
  
  let confidencePoints = 0
  let maxPoints = 0
  
  // Extract performance data
  const perfData = extractPerformanceData(fullText)
  
  // Power density
  const powerMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.powerDensityDetailed))
  if (powerMatches.length > 0) {
    const best = powerMatches.reduce((max, curr) => 
      parseFloat(curr[1]) > parseFloat(max[1]) ? curr : max
    )
    extractedData.powerDensity = {
      value: parseFloat(best[1]),
      unit: best[2].replace(/\s+/g, '/'),
      conditions: best[3]?.trim()
    }
    confidencePoints += 2
  }
  maxPoints += 2
  
  // Current density
  const currentMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.currentDensityDetailed))
  if (currentMatches.length > 0) {
    const best = currentMatches.reduce((max, curr) => 
      parseFloat(curr[1]) > parseFloat(max[1]) ? curr : max
    )
    extractedData.currentDensity = {
      value: parseFloat(best[1]),
      unit: best[2].replace(/\s+/g, '/'),
      conditions: best[3]?.trim()
    }
    confidencePoints += 2
  }
  maxPoints += 2
  
  // Voltage
  const ocvMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.ocv))
  if (ocvMatches.length > 0) {
    extractedData.voltage = {
      value: parseFloat(ocvMatches[0][1]),
      unit: ocvMatches[0][2],
      type: 'OCV'
    }
    confidencePoints += 1
  }
  maxPoints += 1
  
  // Coulombic efficiency
  const ceMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.coulombicEfficiency))
  if (ceMatches.length > 0) {
    extractedData.coulombicEfficiency = parseFloat(ceMatches[0][1])
    confidencePoints += 1
  }
  maxPoints += 1
  
  // Materials extraction
  const materials = extractMaterials(fullText)
  
  // Classify anode materials
  if (materials.anode.length > 0) {
    extractedData.anodeMaterials = materials.anode.map(mat => {
      const classification = Object.entries(MATERIAL_CLASSES).find(([_, mats]) => 
        mats.some(m => mat.toLowerCase().includes(m))
      )
      return {
        material: mat,
        modification: classification ? classification[0] : undefined
      }
    })
    confidencePoints += 2
  }
  maxPoints += 2
  
  // Classify cathode materials
  if (materials.cathode.length > 0) {
    extractedData.cathodeMaterials = materials.cathode.map(mat => ({
      material: mat,
      catalyst: mat.includes('Pt') || mat.includes('platinum') ? 'Pt' : undefined
    }))
    confidencePoints += 2
  }
  maxPoints += 2
  
  // Organisms extraction
  const organisms = extractOrganisms(fullText)
  if (organisms.length > 0) {
    extractedData.organisms = organisms.map(org => {
      const type = org.toLowerCase().includes('consortium') || 
                   org.toLowerCase().includes('mixed') ? 'consortium' :
                   org.toLowerCase().includes('biofilm') ? 'biofilm' : 'pure'
      
      const classification = Object.entries(ORGANISM_TYPES).find(([_, orgs]) => 
        orgs.some(o => org.includes(o))
      )
      
      return {
        species: org,
        type: type,
        source: classification ? classification[0] : undefined
      }
    })
    confidencePoints += 2
  }
  maxPoints += 2
  
  // System configuration
  const systemType = paper.systemType || 
    (fullText.includes('microbial fuel cell') || fullText.includes('MFC') ? 'MFC' :
     fullText.includes('microbial electrolysis') || fullText.includes('MEC') ? 'MEC' :
     fullText.includes('microbial desalination') || fullText.includes('MDC') ? 'MDC' : 'BES')
  
  const chamberConfig = fullText.includes('single chamber') || fullText.includes('single-chamber') ? 'single' :
                       fullText.includes('dual chamber') || fullText.includes('two-chamber') ? 'dual' : undefined
  
  const volumeMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.systemVolume))
  
  extractedData.systemConfig = {
    type: systemType,
    chamberConfig: chamberConfig,
    volume: volumeMatches.length > 0 ? parseFloat(volumeMatches[0][1]) : undefined,
    volumeUnit: volumeMatches.length > 0 ? volumeMatches[0][2] : undefined
  }
  if (chamberConfig) confidencePoints += 1
  maxPoints += 1
  
  // Operating conditions
  const tempMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.temperature))
  const phMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.pH))
  const codMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.cod))
  const hrtMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.hrt))
  
  extractedData.operatingConditions = {
    temperature: tempMatches.length > 0 ? parseFloat(tempMatches[0][1]) : undefined,
    pH: phMatches.length > 0 ? parseFloat(phMatches[0][1]) : undefined,
    concentrationCOD: codMatches.length > 0 ? parseFloat(codMatches[0][1] || codMatches[0][2]) : undefined,
    hydraulicRetentionTime: hrtMatches.length > 0 ? parseFloat(hrtMatches[0][1]) : undefined
  }
  
  if (tempMatches.length > 0) confidencePoints += 0.5
  if (phMatches.length > 0) confidencePoints += 0.5
  if (codMatches.length > 0) confidencePoints += 1
  maxPoints += 2
  
  // Duration
  const durationMatches = Array.from(fullText.matchAll(ENHANCED_PATTERNS.duration))
  if (durationMatches.length > 0) {
    extractedData.duration = {
      value: parseInt(durationMatches[0][1]),
      unit: durationMatches[0][2].replace(/s$/, '') as any
    }
    confidencePoints += 1
  }
  maxPoints += 1
  
  // Calculate confidence
  extractedData.extractionMetadata.confidence = maxPoints > 0 ? 
    Math.min(confidencePoints / maxPoints, 1) : 0
  
  return extractedData
}

// Process papers for enhanced extraction
async function processForEnhancedExtraction(limit: number = 50) {
  console.log('🚀 Enhanced Data Extraction System')
  console.log('=================================\n')
  
  // Get papers that need extraction
  const papers = await prisma.researchPaper.findMany({
    where: {
      AND: [
        { isPublic: true },
        { 
          OR: [
            { aiDataExtraction: null },
            { aiConfidence: { lt: 0.7 } }
          ]
        }
      ]
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`📚 Found ${papers.length} papers for enhanced extraction\n`)
  
  const stats = {
    processed: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    failed: 0
  }
  
  for (const paper of papers) {
    try {
      console.log(`\n📄 Processing: "${paper.title.substring(0, 60)}..."`)
      
      const extractedData = await extractEnhancedData(paper)
      const confidence = extractedData.extractionMetadata.confidence
      
      // Update paper with extracted data
      await prisma.researchPaper.update({
        where: { id: paper.id },
        data: {
          aiDataExtraction: JSON.stringify(extractedData),
          aiConfidence: confidence,
          aiProcessingDate: new Date(),
          aiModelVersion: 'enhanced-pattern-matching-v3',
          // Update specific fields if extracted
          powerOutput: extractedData.powerDensity?.value || paper.powerOutput,
          efficiency: extractedData.coulombicEfficiency || paper.efficiency,
          anodeMaterials: extractedData.anodeMaterials ? 
            JSON.stringify(extractedData.anodeMaterials.map((m: any) => m.material)) : 
            paper.anodeMaterials,
          cathodeMaterials: extractedData.cathodeMaterials ? 
            JSON.stringify(extractedData.cathodeMaterials.map((m: any) => m.material)) : 
            paper.cathodeMaterials,
          organismTypes: extractedData.organisms ? 
            JSON.stringify(extractedData.organisms.map((o: any) => o.species)) : 
            paper.organismTypes
        }
      })
      
      stats.processed++
      
      if (confidence >= 0.8) {
        stats.highConfidence++
        console.log(`   ✅ High confidence extraction (${(confidence * 100).toFixed(0)}%)`)
      } else if (confidence >= 0.5) {
        stats.mediumConfidence++
        console.log(`   🔶 Medium confidence extraction (${(confidence * 100).toFixed(0)}%)`)
      } else {
        stats.lowConfidence++
        console.log(`   ⚠️ Low confidence extraction (${(confidence * 100).toFixed(0)}%)`)
      }
      
      // Show extracted data summary
      if (extractedData.powerDensity) {
        console.log(`   ⚡ Power: ${extractedData.powerDensity.value} ${extractedData.powerDensity.unit}`)
      }
      if (extractedData.anodeMaterials?.length > 0) {
        console.log(`   🔋 Anode: ${extractedData.anodeMaterials.map((m: any) => m.material).join(', ')}`)
      }
      if (extractedData.organisms?.length > 0) {
        console.log(`   🦠 Organisms: ${extractedData.organisms.map((o: any) => o.species).join(', ')}`)
      }
      
    } catch (error) {
      console.error(`   ❌ Extraction failed:`, error)
      stats.failed++
    }
  }
  
  console.log('\n\n📊 Extraction Summary:')
  console.log('='.repeat(30))
  console.log(`Total processed: ${stats.processed}`)
  console.log(`High confidence: ${stats.highConfidence} (${(stats.highConfidence/stats.processed*100).toFixed(1)}%)`)
  console.log(`Medium confidence: ${stats.mediumConfidence} (${(stats.mediumConfidence/stats.processed*100).toFixed(1)}%)`)
  console.log(`Low confidence: ${stats.lowConfidence} (${(stats.lowConfidence/stats.processed*100).toFixed(1)}%)`)
  console.log(`Failed: ${stats.failed}`)
  
  return stats
}

if (require.main === module) {
  const limit = parseInt(process.argv[2]) || 50
  processForEnhancedExtraction(limit)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
    .finally(() => prisma.$disconnect())
}