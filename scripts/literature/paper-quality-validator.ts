#!/usr/bin/env npx tsx

import { z } from 'zod'
import prisma from '../../lib/db'

// Comprehensive quality scoring system
interface QualityScore {
  overall: number // 0-100
  breakdown: {
    verification: number    // Has DOI/PubMed/arXiv ID
    completeness: number    // Has all required fields
    relevance: number       // Relevant to bioelectrochemical systems
    dataRichness: number    // Has performance data, materials, etc.
    recency: number        // How recent the publication is
    impact: number         // Citation count, journal quality
  }
  flags: {
    isVerified: boolean
    hasPerformanceData: boolean
    hasMaterialsData: boolean
    hasOrganismData: boolean
    isHighImpact: boolean
    needsEnhancement: boolean
  }
  recommendations: string[]
}

// Performance data patterns
const PERFORMANCE_PATTERNS = {
  powerDensity: /(\d+(?:\.\d+)?)\s*(?:mW\/m[²2]|mW\s*m-2|milliwatts?\s*per\s*square\s*meter)/gi,
  currentDensity: /(\d+(?:\.\d+)?)\s*(?:mA\/cm[²2]|mA\s*cm-2|A\/m[²2]|milliamps?\s*per\s*square\s*centimeter)/gi,
  voltage: /(\d+(?:\.\d+)?)\s*(?:mV|V|volts?|millivolts?)/gi,
  efficiency: /(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:coulombic|CE|faradaic|energy)\s*efficiency/gi,
  hydrogenProduction: /(\d+(?:\.\d+)?)\s*(?:mL|L|ml|l)\s*(?:H2|hydrogen)\s*(?:\/|per)\s*(?:day|hour|h|d)/gi,
  removalEfficiency: /(\d+(?:\.\d+)?)\s*(?:%|percent)\s*removal/gi
}

// Material patterns
const MATERIAL_PATTERNS = {
  anode: /anode(?:s)?\s*(?:material|electrode|surface)?\s*(?:was|were|is|are|composed|made|modified|coated)?\s*(?:of|with|by|using)?\s*([^,.;]+)/gi,
  cathode: /cathode(?:s)?\s*(?:material|electrode|surface)?\s*(?:was|were|is|are|composed|made|modified|coated)?\s*(?:of|with|by|using)?\s*([^,.;]+)/gi,
  membrane: /(?:membrane|separator)\s*(?:was|were|is|are|made|composed)?\s*(?:of|from)?\s*([^,.;]+)/gi
}

// Organism patterns
const ORGANISM_PATTERNS = {
  species: /(?:Geobacter|Shewanella|Pseudomonas|Escherichia|Desulfovibrio|Rhodobacter|Clostridium)\s+\w+/gi,
  consortium: /(?:mixed|microbial|bacterial|electroactive)\s*(?:culture|consortium|community|population)/gi,
  biofilm: /(?:biofilm|biomass|microbial\s*film|bacterial\s*film)/gi
}

// High-impact journals in the field
const HIGH_IMPACT_JOURNALS = [
  'nature', 'science', 'cell', 'joule', 'energy & environmental science',
  'advanced materials', 'advanced energy materials', 'acs nano',
  'biotechnology and bioengineering', 'bioresource technology',
  'environmental science & technology', 'water research',
  'chemical engineering journal', 'applied energy', 'renewable energy'
]

// Quality validation function
export async function validatePaperQuality(paper: any): Promise<QualityScore> {
  const score: QualityScore = {
    overall: 0,
    breakdown: {
      verification: 0,
      completeness: 0,
      relevance: 0,
      dataRichness: 0,
      recency: 0,
      impact: 0
    },
    flags: {
      isVerified: false,
      hasPerformanceData: false,
      hasMaterialsData: false,
      hasOrganismData: false,
      isHighImpact: false,
      needsEnhancement: false
    },
    recommendations: []
  }
  
  // 1. Verification Score (0-20 points)
  if (paper.doi) {
    score.breakdown.verification += 20
    score.flags.isVerified = true
  } else if (paper.pubmedId || paper.arxivId) {
    score.breakdown.verification += 15
    score.flags.isVerified = true
  } else if (paper.externalUrl && paper.externalUrl.includes('doi.org')) {
    score.breakdown.verification += 10
    score.recommendations.push('Extract DOI from external URL')
  } else {
    score.recommendations.push('No verifiable ID - consider marking as low confidence')
  }
  
  // 2. Completeness Score (0-15 points)
  const requiredFields = ['title', 'authors', 'abstract', 'publicationDate', 'journal']
  const presentFields = requiredFields.filter(field => paper[field] && paper[field].length > 0)
  score.breakdown.completeness = (presentFields.length / requiredFields.length) * 15
  
  if (!paper.abstract) {
    score.recommendations.push('Missing abstract - fetch from source')
  }
  
  // 3. Relevance Score (0-20 points)
  const relevanceScore = calculateRelevance(paper)
  score.breakdown.relevance = relevanceScore * 20
  
  if (relevanceScore < 0.5) {
    score.recommendations.push('Low relevance - review categorization')
  }
  
  // 4. Data Richness Score (0-25 points)
  const fullText = `${paper.title} ${paper.abstract || ''}`
  
  // Check for performance data
  const performanceMatches = Object.values(PERFORMANCE_PATTERNS).some(pattern => 
    pattern.test(fullText)
  )
  if (performanceMatches) {
    score.breakdown.dataRichness += 10
    score.flags.hasPerformanceData = true
  }
  
  // Check for materials data
  const materialMatches = Object.values(MATERIAL_PATTERNS).some(pattern => 
    pattern.test(fullText)
  )
  if (materialMatches || paper.anodeMaterials || paper.cathodeMaterials) {
    score.breakdown.dataRichness += 8
    score.flags.hasMaterialsData = true
  }
  
  // Check for organism data
  const organismMatches = Object.values(ORGANISM_PATTERNS).some(pattern => 
    pattern.test(fullText)
  )
  if (organismMatches || paper.organismTypes) {
    score.breakdown.dataRichness += 7
    score.flags.hasOrganismData = true
  }
  
  if (!score.flags.hasPerformanceData) {
    score.recommendations.push('Extract performance metrics from text')
  }
  if (!score.flags.hasMaterialsData) {
    score.recommendations.push('Extract electrode materials information')
  }
  if (!score.flags.hasOrganismData) {
    score.recommendations.push('Identify microbial species/consortia')
  }
  
  // 5. Recency Score (0-10 points)
  if (paper.publicationDate) {
    const year = new Date(paper.publicationDate).getFullYear()
    const currentYear = new Date().getFullYear()
    const age = currentYear - year
    
    if (age <= 2) score.breakdown.recency = 10
    else if (age <= 5) score.breakdown.recency = 8
    else if (age <= 10) score.breakdown.recency = 6
    else if (age <= 15) score.breakdown.recency = 4
    else if (age <= 25) score.breakdown.recency = 2
    else score.breakdown.recency = 1
  }
  
  // 6. Impact Score (0-10 points)
  if (paper.journal) {
    const journalLower = paper.journal.toLowerCase()
    if (HIGH_IMPACT_JOURNALS.some(hij => journalLower.includes(hij))) {
      score.breakdown.impact = 10
      score.flags.isHighImpact = true
    } else {
      score.breakdown.impact = 5
    }
  }
  
  // Calculate overall score
  score.overall = Object.values(score.breakdown).reduce((sum, val) => sum + val, 0)
  
  // Determine if needs enhancement
  if (score.overall < 70 || score.recommendations.length > 2) {
    score.flags.needsEnhancement = true
  }
  
  return score
}

// Calculate relevance to bioelectrochemical systems
function calculateRelevance(paper: any): number {
  const coreTerms = [
    'microbial fuel cell', 'bioelectrochemical', 'microbial electrolysis',
    'microbial desalination', 'bioelectricity', 'electroactive bacteria'
  ]
  
  const relatedTerms = [
    'electron transfer', 'biofilm', 'biocathode', 'bioanode',
    'electrochemical', 'bioelectrode', 'electrogenic', 'exoelectrogen'
  ]
  
  const text = `${paper.title} ${paper.abstract || ''} ${(paper.keywords || []).join(' ')}`.toLowerCase()
  
  let score = 0
  
  // Core terms worth more
  coreTerms.forEach(term => {
    if (text.includes(term)) score += 0.2
  })
  
  // Related terms worth less
  relatedTerms.forEach(term => {
    if (text.includes(term)) score += 0.1
  })
  
  return Math.min(score, 1) // Cap at 1
}

// Extract performance data from text
export function extractPerformanceData(text: string): Record<string, number[]> {
  const extracted: Record<string, number[]> = {}
  
  Object.entries(PERFORMANCE_PATTERNS).forEach(([key, pattern]) => {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length > 0) {
      extracted[key] = matches.map(m => parseFloat(m[1]))
    }
  })
  
  return extracted
}

// Extract materials from text
export function extractMaterials(text: string): {
  anode: string[],
  cathode: string[],
  membrane: string[]
} {
  const materials = {
    anode: [] as string[],
    cathode: [] as string[],
    membrane: [] as string[]
  }
  
  Object.entries(MATERIAL_PATTERNS).forEach(([key, pattern]) => {
    const matches = Array.from(text.matchAll(pattern))
    materials[key as keyof typeof materials] = matches
      .map(m => m[1]?.trim())
      .filter(m => m && m.length > 3 && m.length < 100)
  })
  
  return materials
}

// Extract organisms from text
export function extractOrganisms(text: string): string[] {
  const organisms = new Set<string>()
  
  Object.values(ORGANISM_PATTERNS).forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern))
    matches.forEach(m => organisms.add(m[0].trim()))
  })
  
  return Array.from(organisms)
}

// Batch quality validation
export async function validateBatch(paperIds: string[]) {
  console.log(`🔍 Validating quality of ${paperIds.length} papers...`)
  
  const results = {
    excellent: [] as string[],    // 85-100
    good: [] as string[],         // 70-84
    fair: [] as string[],         // 50-69
    poor: [] as string[],         // <50
    needsEnhancement: [] as string[]
  }
  
  for (const id of paperIds) {
    const paper = await prisma.researchPaper.findUnique({
      where: { id }
    })
    
    if (!paper) continue
    
    const score = await validatePaperQuality(paper)
    
    if (score.overall >= 85) results.excellent.push(id)
    else if (score.overall >= 70) results.good.push(id)
    else if (score.overall >= 50) results.fair.push(id)
    else results.poor.push(id)
    
    if (score.flags.needsEnhancement) {
      results.needsEnhancement.push(id)
    }
    
    console.log(`📄 ${paper.title.substring(0, 50)}...`)
    console.log(`   Score: ${score.overall}/100`)
    console.log(`   Flags: ${Object.entries(score.flags)
      .filter(([_, v]) => v)
      .map(([k, _]) => k)
      .join(', ')}`)
    
    if (score.recommendations.length > 0) {
      console.log(`   Recommendations:`)
      score.recommendations.forEach(rec => console.log(`     - ${rec}`))
    }
  }
  
  console.log('\n📊 Quality Distribution:')
  console.log(`   Excellent (85-100): ${results.excellent.length}`)
  console.log(`   Good (70-84): ${results.good.length}`)
  console.log(`   Fair (50-69): ${results.fair.length}`)
  console.log(`   Poor (<50): ${results.poor.length}`)
  console.log(`   Needs Enhancement: ${results.needsEnhancement.length}`)
  
  return results
}

// Main validation runner
async function runQualityValidation() {
  console.log('🎯 Paper Quality Validation System')
  console.log('================================\n')
  
  // Get recent papers to validate
  const recentPapers = await prisma.researchPaper.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    },
    select: { id: true }
  })
  
  if (recentPapers.length === 0) {
    console.log('No recent papers to validate')
    return
  }
  
  const results = await validateBatch(recentPapers.map(p => p.id))
  
  console.log('\n✅ Validation complete!')
  console.log('Papers meeting quality standards:', 
    results.excellent.length + results.good.length)
  console.log('Papers needing enhancement:', results.needsEnhancement.length)
}

if (require.main === module) {
  runQualityValidation()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
    .finally(() => prisma.$disconnect())
}