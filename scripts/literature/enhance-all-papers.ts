#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Fix DATABASE_URL protocol if needed
if (process.env.DATABASE_URL?.startsWith('postgres://')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('postgres://', 'postgresql://')
}

const prisma = new PrismaClient()

// Validation schema for extracted data
const ExtractedDataSchema = z.object({
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
    type: z.enum(['OCV', 'operating', 'max']).optional()
  }).optional(),
  efficiency: z.object({
    value: z.number(),
    type: z.enum(['coulombic', 'energy', 'removal']).optional()
  }).optional(),
  materials: z.object({
    anode: z.array(z.string()).optional(),
    cathode: z.array(z.string()).optional(),
    membrane: z.string().optional()
  }).optional(),
  organisms: z.array(z.string()).optional(),
  operatingConditions: z.object({
    temperature: z.number().optional(),
    pH: z.number().optional(),
    substrate: z.string().optional()
  }).optional()
})

// Comprehensive extraction patterns
const EXTRACTION_PATTERNS = {
  // Power density patterns
  powerDensity: [
    /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mW\/m[²2]|W\/m[²2]|mW\s*m-2|W\s*m-2)(?:\s*at\s+([^,.;]+))?/gi,
    /power\s+density\s+(?:of|was|reached|achieved)?\s*(\d+(?:\.\d+)?)\s*(mW\/m[²2]|W\/m[²2])/gi,
    /maximum\s+power\s+density\s+(?:of|was)?\s*(\d+(?:\.\d+)?)\s*(mW\/m[²2]|W\/m[²2])/gi
  ],
  
  // Current density patterns
  currentDensity: [
    /(\d+(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?)?\s*(mA\/cm[²2]|A\/m[²2]|mA\s*cm-2|A\s*m-2)(?:\s*at\s+([^,.;]+))?/gi,
    /current\s+density\s+(?:of|was|reached)?\s*(\d+(?:\.\d+)?)\s*(mA\/cm[²2]|A\/m[²2])/gi
  ],
  
  // Voltage patterns
  voltage: [
    /(?:OCV|open[\s-]circuit[\s-]voltage)\s*(?:of|was|is)?\s*(\d+(?:\.\d+)?)\s*(mV|V)/gi,
    /operating\s+voltage\s*(?:of|was)?\s*(\d+(?:\.\d+)?)\s*(mV|V)/gi,
    /maximum\s+voltage\s*(?:of|was)?\s*(\d+(?:\.\d+)?)\s*(mV|V)/gi
  ],
  
  // Efficiency patterns
  efficiency: [
    /(\d+(?:\.\d+)?)\s*%?\s*(?:coulombic\s+efficiency|CE)/gi,
    /coulombic\s+efficiency\s+(?:of|was)?\s*(\d+(?:\.\d+)?)\s*%/gi,
    /(\d+(?:\.\d+)?)\s*%?\s*(?:energy\s+efficiency|EE)/gi,
    /(\d+(?:\.\d+)?)\s*%?\s*(?:removal\s+efficiency|RE)/gi
  ],
  
  // Temperature patterns
  temperature: [
    /(?:at|temperature\s+of)\s*(\d+(?:\.\d+)?)\s*°C/gi,
    /(\d+(?:\.\d+)?)\s*°C/gi
  ],
  
  // pH patterns
  pH: [
    /pH\s*(?:of|was|=)?\s*(\d+(?:\.\d+)?)/gi,
    /pH\s*(\d+(?:\.\d+)?)/gi
  ]
}

// Material keywords
const MATERIAL_KEYWORDS = {
  anode: [
    'carbon cloth', 'carbon felt', 'carbon paper', 'carbon brush', 'graphite',
    'graphene', 'graphene oxide', 'GO', 'reduced graphene oxide', 'rGO',
    'carbon nanotube', 'CNT', 'SWCNT', 'MWCNT',
    'MXene', 'Ti3C2', 'Ti3C2Tx', 'V2CTx',
    'stainless steel', 'titanium', 'nickel',
    'PEDOT', 'polyaniline', 'polypyrrole',
    'activated carbon', 'carbon fiber', 'carbon veil'
  ],
  cathode: [
    'platinum', 'Pt', 'Pt/C', 'carbon', 'air cathode', 'gas diffusion',
    'copper', 'Cu', 'iron', 'Fe', 'nickel', 'Ni',
    'manganese dioxide', 'MnO2', 'ferricyanide',
    'biocathode', 'biofilm cathode'
  ]
}

// Organism keywords
const ORGANISM_KEYWORDS = [
  'Geobacter', 'Geobacter sulfurreducens', 'G. sulfurreducens',
  'Shewanella', 'Shewanella oneidensis', 'S. oneidensis',
  'Pseudomonas', 'Pseudomonas aeruginosa', 'P. aeruginosa',
  'Escherichia coli', 'E. coli',
  'mixed culture', 'mixed consortium', 'anaerobic sludge',
  'activated sludge', 'wastewater inoculum', 'sediment',
  'Clostridium', 'Bacillus', 'Desulfovibrio',
  'Rhodoferax', 'Ochrobactrum', 'Enterobacter'
]

// Extract data from text
function extractData(text: string): any {
  const extracted: any = {}
  
  // Extract power density
  for (const pattern of EXTRACTION_PATTERNS.powerDensity) {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length > 0) {
      const bestMatch = matches[0]
      let value = parseFloat(bestMatch[1])
      const unit = bestMatch[2]
      
      // Convert to mW/m²
      if (unit.toLowerCase().includes('w/m')) {
        value *= 1000
      }
      
      extracted.powerDensity = {
        value,
        unit: 'mW/m²',
        conditions: bestMatch[3]?.trim()
      }
      break
    }
  }
  
  // Extract current density
  for (const pattern of EXTRACTION_PATTERNS.currentDensity) {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length > 0) {
      const bestMatch = matches[0]
      extracted.currentDensity = {
        value: parseFloat(bestMatch[1]),
        unit: bestMatch[2],
        conditions: bestMatch[3]?.trim()
      }
      break
    }
  }
  
  // Extract voltage
  for (const pattern of EXTRACTION_PATTERNS.voltage) {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length > 0) {
      const bestMatch = matches[0]
      let value = parseFloat(bestMatch[1])
      const unit = bestMatch[2]
      
      // Convert to mV
      if (unit === 'V') {
        value *= 1000
      }
      
      let type: 'OCV' | 'operating' | 'max' = 'operating'
      if (pattern.source?.includes('OCV') || pattern.source?.includes('open')) {
        type = 'OCV'
      } else if (pattern.source?.includes('maximum')) {
        type = 'max'
      }
      
      extracted.voltage = { value, type }
      break
    }
  }
  
  // Extract efficiency
  for (const pattern of EXTRACTION_PATTERNS.efficiency) {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length > 0) {
      const bestMatch = matches[0]
      let type: 'coulombic' | 'energy' | 'removal' = 'coulombic'
      
      if (pattern.source?.includes('energy')) {
        type = 'energy'
      } else if (pattern.source?.includes('removal')) {
        type = 'removal'
      }
      
      extracted.efficiency = {
        value: parseFloat(bestMatch[1]),
        type
      }
      break
    }
  }
  
  // Extract materials
  const materials: any = { anode: [], cathode: [] }
  const lowerText = text.toLowerCase()
  
  for (const anodeMaterial of MATERIAL_KEYWORDS.anode) {
    if (lowerText.includes(anodeMaterial.toLowerCase())) {
      materials.anode.push(anodeMaterial)
    }
  }
  
  for (const cathodeMaterial of MATERIAL_KEYWORDS.cathode) {
    if (lowerText.includes(cathodeMaterial.toLowerCase())) {
      materials.cathode.push(cathodeMaterial)
    }
  }
  
  if (materials.anode.length > 0 || materials.cathode.length > 0) {
    extracted.materials = materials
  }
  
  // Extract organisms
  const organisms: string[] = []
  for (const organism of ORGANISM_KEYWORDS) {
    if (lowerText.includes(organism.toLowerCase())) {
      organisms.push(organism)
    }
  }
  
  if (organisms.length > 0) {
    extracted.organisms = organisms
  }
  
  // Extract operating conditions
  const conditions: any = {}
  
  // Temperature
  for (const pattern of EXTRACTION_PATTERNS.temperature) {
    const match = text.match(pattern)
    if (match) {
      conditions.temperature = parseFloat(match[1])
      break
    }
  }
  
  // pH
  for (const pattern of EXTRACTION_PATTERNS.pH) {
    const match = text.match(pattern)
    if (match) {
      conditions.pH = parseFloat(match[1])
      break
    }
  }
  
  if (Object.keys(conditions).length > 0) {
    extracted.operatingConditions = conditions
  }
  
  return extracted
}

// Generate AI-like summary from abstract
function generateSummary(paper: any): string {
  if (!paper.abstract) return ''
  
  const abstract = paper.abstract
  const sentences = abstract.match(/[^.!?]+[.!?]+/g) || []
  
  // Take first 2-3 sentences as summary
  const summary = sentences.slice(0, 2).join(' ').trim()
  
  // Add system type if identified
  if (paper.systemType) {
    return `This ${paper.systemType} study ${summary.charAt(0).toLowerCase()}${summary.slice(1)}`
  }
  
  return summary
}

// Extract key findings from abstract
function extractKeyFindings(abstract: string): string[] {
  if (!abstract) return []
  
  const findings: string[] = []
  const sentences = abstract.match(/[^.!?]+[.!?]+/g) || []
  
  for (const sentence of sentences) {
    // Look for sentences with performance metrics or conclusions
    if (sentence.match(/(\d+(?:\.\d+)?)\s*(mW|W|mA|A|%|°C)/i) ||
        sentence.match(/\b(achieved|reached|demonstrated|showed|improved|enhanced|increased)\b/i)) {
      findings.push(sentence.trim())
    }
  }
  
  return findings.slice(0, 5) // Maximum 5 key findings
}

async function main() {
  console.log('🔧 Starting comprehensive paper enhancement')
  console.log('==========================================')
  
  const startTime = Date.now()
  
  // Get papers that need enhancement
  const papersToEnhance = await prisma.researchPaper.findMany({
    where: {
      OR: [
        { aiProcessingDate: null },
        { aiSummary: null },
        { aiDataExtraction: null }
      ]
    },
    orderBy: { publicationDate: 'desc' }
  })
  
  console.log(`\n📊 Found ${papersToEnhance.length} papers to enhance`)
  
  let processed = 0
  let enhanced = 0
  let errors = 0
  
  for (const paper of papersToEnhance) {
    try {
      const text = `${paper.title} ${paper.abstract || ''}`
      
      // Extract structured data
      const extractedData = extractData(text)
      
      // Prepare update data
      const updateData: any = {
        aiProcessingDate: new Date(),
        aiModelVersion: 'pattern-matching-v2',
        aiConfidence: 0.7 // Base confidence for pattern matching
      }
      
      // Add extracted performance metrics
      if (extractedData.powerDensity) {
        updateData.powerOutput = extractedData.powerDensity.value
        updateData.aiConfidence = 0.8
      }
      
      if (extractedData.efficiency) {
        updateData.efficiency = extractedData.efficiency.value
        updateData.aiConfidence = 0.8
      }
      
      // Add materials
      if (extractedData.materials) {
        if (extractedData.materials.anode.length > 0) {
          updateData.anodeMaterials = JSON.stringify(extractedData.materials.anode)
        }
        if (extractedData.materials.cathode.length > 0) {
          updateData.cathodeMaterials = JSON.stringify(extractedData.materials.cathode)
        }
      }
      
      // Add organisms
      if (extractedData.organisms && extractedData.organisms.length > 0) {
        updateData.organismTypes = JSON.stringify(extractedData.organisms)
      }
      
      // Generate summary and findings
      if (paper.abstract) {
        updateData.aiSummary = generateSummary(paper)
        const findings = extractKeyFindings(paper.abstract)
        if (findings.length > 0) {
          updateData.aiKeyFindings = JSON.stringify(findings)
        }
      }
      
      // Store all extracted data
      updateData.aiDataExtraction = JSON.stringify(extractedData)
      
      // Update the paper
      await prisma.researchPaper.update({
        where: { id: paper.id },
        data: updateData
      })
      
      enhanced++
      processed++
      
      if (processed % 50 === 0) {
        console.log(`   Progress: ${processed}/${papersToEnhance.length} papers processed`)
      }
      
    } catch (error: any) {
      console.error(`   Error enhancing paper ${paper.id}: ${error.message}`)
      errors++
      processed++
    }
  }
  
  // Get final statistics
  const stats = await prisma.researchPaper.aggregate({
    _count: {
      _all: true,
      powerOutput: true,
      efficiency: true,
      aiSummary: true,
      aiDataExtraction: true
    }
  })
  
  const duration = Math.round((Date.now() - startTime) / 1000)
  
  console.log('\n==========================================')
  console.log('📊 Enhancement Complete:')
  console.log(`   Total papers: ${stats._count._all}`)
  console.log(`   Papers enhanced: ${enhanced}`)
  console.log(`   Errors: ${errors}`)
  console.log(`   Papers with power data: ${stats._count.powerOutput}`)
  console.log(`   Papers with efficiency: ${stats._count.efficiency}`)
  console.log(`   Papers with AI summary: ${stats._count.aiSummary}`)
  console.log(`   Papers with extracted data: ${stats._count.aiDataExtraction}`)
  console.log(`   Time taken: ${duration} seconds`)
  
  // Show sample enhanced papers
  const samples = await prisma.researchPaper.findMany({
    where: {
      AND: [
        { aiProcessingDate: { not: null } },
        { powerOutput: { not: null } }
      ]
    },
    take: 5,
    orderBy: { powerOutput: 'desc' }
  })
  
  console.log('\n🌟 Top 5 papers by power output:')
  for (const sample of samples) {
    console.log(`   ${sample.powerOutput} mW/m² - ${sample.title.substring(0, 60)}...`)
  }
  
  await prisma.$disconnect()
  console.log('\n✅ Enhancement complete!')
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export { main }