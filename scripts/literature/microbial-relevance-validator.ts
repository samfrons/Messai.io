#!/usr/bin/env npx tsx

import prisma from '../../lib/db'

interface RelevanceScore {
  overall: number // 0-100
  breakdown: {
    microbialRelevance: number
    algaeRelevance: number
    systemRelevance: number
    keywordDensity: number
  }
  categories: {
    isMicrobial: boolean
    isAlgae: boolean
    isBioelectrochemical: boolean
    isPurelyNonBiological: boolean
  }
  matchedKeywords: string[]
  excludedKeywords: string[]
  recommendation: 'keep' | 'remove' | 'review'
}

// Keyword patterns for microbial/biological relevance
const MICROBIAL_KEYWORDS = [
  // General microbial terms
  'microb', 'bacteria', 'microorganism', 'microbial', 'bacterial',
  'biofilm', 'biomass', 'microbe', 'microbiology', 'prokaryote',
  
  // Specific organisms
  'geobacter', 'shewanella', 'pseudomonas', 'escherichia', 'e. coli',
  'desulfovibrio', 'rhodobacter', 'clostridium', 'bacillus',
  'lactobacillus', 'saccharomyces', 'methanogen', 'archaea',
  
  // Bioelectrochemical terms
  'bioelectrochemical', 'bioelectricity', 'bioelectrogenic',
  'electroactive', 'electrogenic', 'exoelectrogen', 'electrochemically active',
  'biocathode', 'bioanode', 'bioelectrode', 'microbial electrode',
  
  // System types
  'microbial fuel cell', 'mfc', 'microbial electrolysis', 'mec',
  'microbial desalination', 'mdc', 'microbial electrosynthesis', 'mes',
  'bioelectrochemical system', 'bes', 'microbial electrochemical',
  
  // Biological processes
  'fermentation', 'anaerobic', 'aerobic', 'metabolism', 'respiration',
  'electron transfer', 'bioconversion', 'biodegradation', 'bioremediation',
  'syntrophic', 'consortium', 'mixed culture', 'pure culture',
  
  // Biological materials
  'enzyme', 'protein', 'cytochrome', 'mediator', 'biochar',
  'biological catalyst', 'biocatalyst', 'living organism'
]

// Algae-specific keywords
const ALGAE_KEYWORDS = [
  // General algae terms
  'algae', 'algal', 'microalgae', 'microalgal', 'macroalgae',
  'phytoplankton', 'seaweed', 'cyanobacteria', 'blue-green algae',
  
  // Specific algae species
  'chlorella', 'spirulina', 'chlamydomonas', 'scenedesmus',
  'nannochloropsis', 'dunaliella', 'haematococcus', 'botryococcus',
  'arthrospira', 'anabaena', 'nostoc', 'synechocystis',
  
  // Algae-related processes
  'photosynthesis', 'photosynthetic', 'photoautotrophic',
  'photobiological', 'phototrophic', 'photomicrobial',
  'algal biomass', 'algal cultivation', 'algal growth',
  
  // Algae fuel cells
  'algae fuel cell', 'photosynthetic fuel cell', 'photo-mfc',
  'algae microbial fuel cell', 'algal mfc', 'phototrophic mfc',
  'biophotovoltaic', 'photobioelectrochemical'
]

// Exclusion keywords (non-biological systems)
const EXCLUSION_KEYWORDS = [
  // Pure chemical/physical systems
  'purely chemical', 'abiotic', 'non-biological', 'inorganic only',
  'metal-air battery', 'lithium battery', 'chemical fuel cell',
  
  // Solar/PV without bio component
  'photovoltaic cell', 'solar panel', 'silicon solar',
  'dye-sensitized solar', 'perovskite solar', 'quantum dot solar',
  
  // Traditional fuel cells without bio
  'proton exchange membrane fuel cell', 'pemfc', 'solid oxide fuel cell',
  'sofc', 'alkaline fuel cell', 'afc', 'phosphoric acid fuel cell',
  'molten carbonate fuel cell', 'direct methanol fuel cell',
  
  // Other non-bio energy systems
  'supercapacitor', 'battery', 'capacitor', 'electrolyzer',
  'gas turbine', 'wind turbine', 'hydroelectric', 'nuclear'
]

// Context modifiers that indicate biological relevance even with exclusion keywords
const CONTEXT_MODIFIERS = [
  'bio-inspired', 'biomimetic', 'biological', 'microbial',
  'with bacteria', 'using microorganisms', 'biofilm-based',
  'enzyme-catalyzed', 'biologically catalyzed'
]

export function calculateRelevanceScore(
  title: string,
  abstract: string | null,
  keywords: string | null,
  organismTypes: string | null,
  systemType: string | null
): RelevanceScore {
  const fullText = [
    title,
    abstract,
    keywords,
    organismTypes,
    systemType
  ].filter(Boolean).join(' ').toLowerCase()

  // Find matched keywords
  const matchedMicrobial = MICROBIAL_KEYWORDS.filter(kw => 
    new RegExp(`\\b${kw}\\b`, 'i').test(fullText)
  )
  
  const matchedAlgae = ALGAE_KEYWORDS.filter(kw => 
    new RegExp(`\\b${kw}\\b`, 'i').test(fullText)
  )
  
  const matchedExclusion = EXCLUSION_KEYWORDS.filter(kw => 
    new RegExp(`\\b${kw}\\b`, 'i').test(fullText)
  )
  
  const hasContextModifier = CONTEXT_MODIFIERS.some(mod => 
    new RegExp(`\\b${mod}\\b`, 'i').test(fullText)
  )

  // Calculate scores
  const microbialScore = Math.min(100, matchedMicrobial.length * 15)
  const algaeScore = Math.min(100, matchedAlgae.length * 20)
  const exclusionPenalty = hasContextModifier ? 0 : Math.min(50, matchedExclusion.length * 25)
  
  // System relevance (MFC, MEC, etc.)
  const systemScore = /\b(mfc|mec|mdc|mes|bes|bioelectrochemical)\b/i.test(fullText) ? 50 : 0
  
  // Keyword density
  const totalWords = fullText.split(/\s+/).length
  const relevantKeywords = matchedMicrobial.length + matchedAlgae.length
  const keywordDensity = Math.min(100, (relevantKeywords / totalWords) * 1000)

  // Overall score calculation
  const overall = Math.max(0, Math.min(100, 
    (microbialScore * 0.4) + 
    (algaeScore * 0.3) + 
    (systemScore * 0.2) + 
    (keywordDensity * 0.1) - 
    exclusionPenalty
  ))

  // Categories
  const isMicrobial = matchedMicrobial.length > 0
  const isAlgae = matchedAlgae.length > 0
  const isBioelectrochemical = systemScore > 0 || 
    /bioelectrochemical|bioelectricity|electroactive/i.test(fullText)
  const isPurelyNonBiological = matchedExclusion.length > 0 && 
    !hasContextModifier && 
    matchedMicrobial.length === 0 && 
    matchedAlgae.length === 0

  // Recommendation
  let recommendation: 'keep' | 'remove' | 'review'
  if (overall >= 30 || (isMicrobial || isAlgae)) {
    recommendation = 'keep'
  } else if (overall < 10 || isPurelyNonBiological) {
    recommendation = 'remove'
  } else {
    recommendation = 'review'
  }

  return {
    overall,
    breakdown: {
      microbialRelevance: microbialScore,
      algaeRelevance: algaeScore,
      systemRelevance: systemScore,
      keywordDensity
    },
    categories: {
      isMicrobial,
      isAlgae,
      isBioelectrochemical,
      isPurelyNonBiological
    },
    matchedKeywords: [...new Set([...matchedMicrobial, ...matchedAlgae])],
    excludedKeywords: matchedExclusion,
    recommendation
  }
}

// Main function to validate all papers
export async function validateAllPapers() {
  console.log('Starting microbial relevance validation...')
  
  const papers = await prisma.researchPaper.findMany({
    select: {
      id: true,
      title: true,
      abstract: true,
      keywords: true,
      organismTypes: true,
      systemType: true,
      source: true
    }
  })

  console.log(`Analyzing ${papers.length} papers...`)

  const results = {
    total: papers.length,
    keep: 0,
    remove: 0,
    review: 0,
    microbial: 0,
    algae: 0,
    bioelectrochemical: 0,
    nonBiological: 0
  }

  const toRemove: string[] = []
  const toReview: string[] = []

  for (const paper of papers) {
    const score = calculateRelevanceScore(
      paper.title,
      paper.abstract,
      paper.keywords,
      paper.organismTypes,
      paper.systemType
    )

    if (score.recommendation === 'keep') {
      results.keep++
    } else if (score.recommendation === 'remove') {
      results.remove++
      toRemove.push(paper.id)
    } else {
      results.review++
      toReview.push(paper.id)
    }

    if (score.categories.isMicrobial) results.microbial++
    if (score.categories.isAlgae) results.algae++
    if (score.categories.isBioelectrochemical) results.bioelectrochemical++
    if (score.categories.isPurelyNonBiological) results.nonBiological++
  }

  console.log('\nValidation Results:')
  console.log(`Total papers: ${results.total}`)
  console.log(`Papers to keep: ${results.keep} (${(results.keep/results.total*100).toFixed(1)}%)`)
  console.log(`Papers to remove: ${results.remove} (${(results.remove/results.total*100).toFixed(1)}%)`)
  console.log(`Papers to review: ${results.review} (${(results.review/results.total*100).toFixed(1)}%)`)
  console.log('\nCategories:')
  console.log(`Microbial papers: ${results.microbial}`)
  console.log(`Algae papers: ${results.algae}`)
  console.log(`Bioelectrochemical papers: ${results.bioelectrochemical}`)
  console.log(`Non-biological papers: ${results.nonBiological}`)

  return { results, toRemove, toReview }
}

// Run if called directly
if (require.main === module) {
  validateAllPapers()
    .then(() => process.exit(0))
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}