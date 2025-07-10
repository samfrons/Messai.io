#!/usr/bin/env npx tsx

import prisma from '../../lib/db'
import { z } from 'zod'

/**
 * Parameter-Based Quality Scoring System
 * 
 * Scores research papers based on their parameter coverage and data quality
 * as defined in MESS_PARAMETER_LIBRARY.md
 */

// Quality scoring configuration based on parameter library
const QUALITY_SCORING_CONFIG = {
  // Points per parameter category (max 100 points)
  categoryWeights: {
    environmental: 15,        // High importance - affects all biological processes
    cell_level: 12,          // Critical for design and scaling
    reactor_level: 10,       // Important for industrial applications
    biological: 18,          // Core to MES functionality
    materials: 15,           // Critical for performance and cost
    operational: 8,          // Important for practical implementation
    performance: 20,         // Essential outcome metrics
    economic: 2              // Nice to have but rare in literature
  },
  
  // Bonus points for data quality
  qualityBonuses: {
    quantitative_data: 10,   // Papers with numeric values vs qualitative only
    experimental_rigor: 8,   // Multiple replicates, controls, statistics
    reproducibility: 7,      // Detailed methods, standard conditions
    validation: 5            // Cross-validation, external validation
  },
  
  // Parameter importance within categories
  criticalParameters: {
    environmental: ['operating_temperature', 'ph_setpoint', 'substrate_concentration'],
    cell_level: ['cell_volume', 'electrode_spacing', 'current_density'],
    biological: ['organisms', 'biofilm_thickness', 'growth_rate'],
    materials: ['anode_material', 'cathode_material', 'membrane_type'],
    performance: ['power_density', 'coulombic_efficiency', 'cod_removal']
  }
}

interface QualityMetrics {
  overall_score: number           // 0-100
  category_coverage: number       // Number of categories covered (0-8)
  parameter_completeness: number  // Percentage of relevant parameters found
  data_quality: number           // Quality of extracted data (0-1)
  experimental_rigor: number     // Assessment of experimental design (0-1)
  reproducibility_score: number  // How reproducible the work is (0-1)
  
  // Detailed breakdown
  category_scores: {
    environmental: number
    cell_level: number
    reactor_level: number
    biological: number
    materials: number
    operational: number
    performance: number
    economic: number
  }
  
  // Quality flags
  has_quantitative_data: boolean
  has_statistical_analysis: boolean
  has_controls: boolean
  has_replicates: boolean
  
  // Missing critical parameters
  missing_critical: string[]
  data_gaps: string[]
  
  // Scoring breakdown
  base_score: number
  bonus_points: number
  total_parameters: number
  quantitative_parameters: number
}

class ParameterQualityScorer {
  
  /**
   * Score a research paper based on its parameter extraction data
   */
  async scorePaper(paperId: string): Promise<QualityMetrics> {
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      select: {
        id: true,
        title: true,
        abstract: true,
        systemType: true,
        aiDataExtraction: true,
        experimentalConditions: true,
        reactorConfiguration: true,
        electrodeSpecifications: true,
        biologicalParameters: true,
        performanceMetrics: true,
        aiConfidence: true
      }
    })

    if (!paper) {
      throw new Error(`Paper ${paperId} not found`)
    }

    let extractedData: any = {}
    try {
      extractedData = paper.aiDataExtraction ? JSON.parse(paper.aiDataExtraction) : {}
    } catch (e) {
      console.warn(`Invalid JSON in aiDataExtraction for paper ${paperId}`)
    }

    return this.calculateQualityScore(paper, extractedData)
  }

  /**
   * Calculate comprehensive quality score
   */
  private calculateQualityScore(paper: any, extractedData: any): QualityMetrics {
    const categoryScores = this.scoreCategoryPresence(extractedData)
    const dataQuality = this.assessDataQuality(paper, extractedData)
    const experimentalRigor = this.assessExperimentalRigor(paper, extractedData)
    const parameterCounts = this.countParameters(extractedData)
    
    // Calculate base score from category coverage
    const baseScore = Object.values(categoryScores).reduce((sum: number, score: number) => sum + score, 0)
    
    // Calculate bonus points
    let bonusPoints = 0
    if (dataQuality.has_quantitative_data) bonusPoints += QUALITY_SCORING_CONFIG.qualityBonuses.quantitative_data
    if (experimentalRigor.has_controls) bonusPoints += QUALITY_SCORING_CONFIG.qualityBonuses.experimental_rigor
    if (experimentalRigor.reproducible) bonusPoints += QUALITY_SCORING_CONFIG.qualityBonuses.reproducibility
    if (dataQuality.validated) bonusPoints += QUALITY_SCORING_CONFIG.qualityBonuses.validation
    
    const overallScore = Math.min(baseScore + bonusPoints, 100)
    const categoriesCovered = Object.values(categoryScores).filter(score => score > 0).length
    
    return {
      overall_score: overallScore,
      category_coverage: categoriesCovered,
      parameter_completeness: this.calculateCompleteness(extractedData),
      data_quality: dataQuality.score,
      experimental_rigor: experimentalRigor.score,
      reproducibility_score: experimentalRigor.reproducible ? 1 : 0.5,
      
      category_scores: categoryScores,
      
      has_quantitative_data: dataQuality.has_quantitative_data,
      has_statistical_analysis: experimentalRigor.has_statistics,
      has_controls: experimentalRigor.has_controls,
      has_replicates: experimentalRigor.has_replicates,
      
      missing_critical: this.findMissingCriticalParameters(extractedData),
      data_gaps: this.identifyDataGaps(extractedData),
      
      base_score: baseScore,
      bonus_points: bonusPoints,
      total_parameters: parameterCounts.total,
      quantitative_parameters: parameterCounts.quantitative
    }
  }

  /**
   * Score parameter category presence and completeness
   */
  private scoreCategoryPresence(extractedData: any): any {
    const scores: any = {
      environmental: 0,
      cell_level: 0,
      reactor_level: 0,
      biological: 0,
      materials: 0,
      operational: 0,
      performance: 0,
      economic: 0
    }

    // Environmental parameters
    if (extractedData.environmental) {
      let envScore = 0
      if (extractedData.environmental.temperature) envScore += 5
      if (extractedData.environmental.pressure) envScore += 3
      if (extractedData.environmental.humidity) envScore += 2
      if (extractedData.environmental.light) envScore += 3
      if (extractedData.environmental.gas_composition) envScore += 2
      scores.environmental = Math.min(envScore, QUALITY_SCORING_CONFIG.categoryWeights.environmental)
    }

    // Cell-level parameters
    if (extractedData.cell_level) {
      let cellScore = 0
      if (extractedData.cell_level.geometry) cellScore += 6
      if (extractedData.cell_level.electrodes) cellScore += 4
      if (extractedData.cell_level.performance) cellScore += 2
      scores.cell_level = Math.min(cellScore, QUALITY_SCORING_CONFIG.categoryWeights.cell_level)
    }

    // Biological parameters
    if (extractedData.biological) {
      let bioScore = 0
      if (extractedData.biological.organisms) bioScore += 8
      if (extractedData.biological.biofilm) bioScore += 5
      if (extractedData.biological.substrates) bioScore += 5
      scores.biological = Math.min(bioScore, QUALITY_SCORING_CONFIG.categoryWeights.biological)
    }

    // Material parameters
    if (extractedData.materials) {
      let matScore = 0
      if (extractedData.materials.anode) matScore += 6
      if (extractedData.materials.cathode) matScore += 6
      if (extractedData.materials.membrane) matScore += 3
      scores.materials = Math.min(matScore, QUALITY_SCORING_CONFIG.categoryWeights.materials)
    }

    // Performance parameters
    if (extractedData.performance) {
      let perfScore = 0
      if (extractedData.performance.electrical) perfScore += 12
      if (extractedData.performance.treatment) perfScore += 5
      if (extractedData.performance.production) perfScore += 3
      scores.performance = Math.min(perfScore, QUALITY_SCORING_CONFIG.categoryWeights.performance)
    }

    return scores
  }

  /**
   * Assess data quality characteristics
   */
  private assessDataQuality(paper: any, extractedData: any): any {
    const fullText = `${paper.title} ${paper.abstract || ''}`
    
    const hasQuantitativeData = this.hasQuantitativeData(extractedData)
    const hasUnits = fullText.includes('°C') || fullText.includes('mW') || fullText.includes('%')
    const hasRanges = fullText.includes('±') || fullText.includes('±') || fullText.includes('standard deviation')
    const validated = extractedData.validation_results?.cross_parameter_consistency > 0.7
    
    let score = 0.4 // Base score
    if (hasQuantitativeData) score += 0.3
    if (hasUnits) score += 0.1
    if (hasRanges) score += 0.1
    if (validated) score += 0.1
    
    return {
      score: Math.min(score, 1),
      has_quantitative_data: hasQuantitativeData,
      has_units: hasUnits,
      has_error_bars: hasRanges,
      validated: validated
    }
  }

  /**
   * Assess experimental rigor
   */
  private assessExperimentalRigor(paper: any, extractedData: any): any {
    const fullText = `${paper.title} ${paper.abstract || ''}`.toLowerCase()
    
    const hasControls = fullText.includes('control') || fullText.includes('baseline')
    const hasReplicates = fullText.includes('replicate') || fullText.includes('triplicate') || fullText.includes('n =')
    const hasStatistics = fullText.includes('significance') || fullText.includes('p <') || fullText.includes('standard deviation')
    const hasMethodDetails = fullText.length > 500 // Proxy for detailed methods
    
    const reproducible = hasMethodDetails && (hasControls || hasReplicates)
    
    let score = 0.2 // Base score
    if (hasControls) score += 0.25
    if (hasReplicates) score += 0.25
    if (hasStatistics) score += 0.2
    if (hasMethodDetails) score += 0.1
    
    return {
      score: Math.min(score, 1),
      has_controls: hasControls,
      has_replicates: hasReplicates,
      has_statistics: hasStatistics,
      reproducible: reproducible
    }
  }

  /**
   * Check if extracted data contains quantitative values
   */
  private hasQuantitativeData(obj: any): boolean {
    if (typeof obj === 'number') return true
    if (typeof obj !== 'object' || obj === null) return false
    
    for (const value of Object.values(obj)) {
      if (this.hasQuantitativeData(value)) return true
    }
    return false
  }

  /**
   * Count total and quantitative parameters
   */
  private countParameters(obj: any): { total: number, quantitative: number } {
    let total = 0
    let quantitative = 0
    
    const count = (item: any) => {
      if (item === null || item === undefined) return
      
      if (typeof item === 'number') {
        total++
        quantitative++
      } else if (typeof item === 'string' && item.trim() !== '') {
        total++
      } else if (typeof item === 'boolean') {
        total++
      } else if (Array.isArray(item)) {
        item.forEach(count)
      } else if (typeof item === 'object') {
        Object.values(item).forEach(count)
      }
    }
    
    count(obj)
    return { total, quantitative }
  }

  /**
   * Calculate parameter completeness percentage
   */
  private calculateCompleteness(extractedData: any): number {
    const availableCategories = 8 // Total categories in parameter library
    const coveredCategories = [
      'environmental', 'cell_level', 'reactor_level', 'biological',
      'materials', 'operational', 'performance', 'economic'
    ].filter(cat => extractedData[cat] && Object.keys(extractedData[cat]).length > 0).length
    
    return (coveredCategories / availableCategories) * 100
  }

  /**
   * Find missing critical parameters
   */
  private findMissingCriticalParameters(extractedData: any): string[] {
    const missing: string[] = []
    
    Object.entries(QUALITY_SCORING_CONFIG.criticalParameters).forEach(([category, params]) => {
      const categoryData = extractedData[category]
      if (!categoryData) {
        missing.push(...params.map(p => `${category}.${p}`))
        return
      }
      
      params.forEach(param => {
        if (!this.hasParameter(categoryData, param)) {
          missing.push(`${category}.${param}`)
        }
      })
    })
    
    return missing
  }

  /**
   * Identify data gaps for research planning
   */
  private identifyDataGaps(extractedData: any): string[] {
    const gaps: string[] = []
    
    // Environmental gaps
    if (!extractedData.environmental?.temperature) gaps.push('Operating temperature not specified')
    if (!extractedData.environmental?.pressure) gaps.push('Pressure conditions not specified')
    
    // Performance gaps
    if (!extractedData.performance?.electrical?.power_density_volumetric) gaps.push('Power density not quantified')
    if (!extractedData.performance?.electrical?.coulombic_efficiency) gaps.push('Coulombic efficiency not reported')
    
    // Material gaps
    if (!extractedData.materials?.anode) gaps.push('Anode material not characterized')
    if (!extractedData.materials?.cathode) gaps.push('Cathode material not characterized')
    
    // Biological gaps
    if (!extractedData.biological?.organisms) gaps.push('Microbial community not identified')
    
    return gaps
  }

  /**
   * Check if a parameter exists in nested object
   */
  private hasParameter(obj: any, param: string): boolean {
    const parts = param.split('.')
    let current = obj
    
    for (const part of parts) {
      if (!current || typeof current !== 'object') return false
      current = current[part]
    }
    
    return current !== undefined && current !== null
  }

  /**
   * Batch score multiple papers
   */
  async scoreMultiplePapers(paperIds: string[]): Promise<Map<string, QualityMetrics>> {
    const results = new Map<string, QualityMetrics>()
    
    for (const paperId of paperIds) {
      try {
        const score = await this.scorePaper(paperId)
        results.set(paperId, score)
      } catch (error) {
        console.error(`Error scoring paper ${paperId}:`, error.message)
      }
    }
    
    return results
  }

  /**
   * Update paper quality scores in database
   */
  async updatePaperQualityScores(paperIds: string[]): Promise<void> {
    console.log(`Updating quality scores for ${paperIds.length} papers...`)
    
    let updated = 0
    for (const paperId of paperIds) {
      try {
        const qualityMetrics = await this.scorePaper(paperId)
        
        await prisma.researchPaper.update({
          where: { id: paperId },
          data: {
            aiConfidence: qualityMetrics.overall_score / 100,
            aiInsights: JSON.stringify({
              quality_score: qualityMetrics.overall_score,
              category_coverage: qualityMetrics.category_coverage,
              parameter_completeness: qualityMetrics.parameter_completeness,
              missing_critical: qualityMetrics.missing_critical,
              data_gaps: qualityMetrics.data_gaps,
              scoring_date: new Date().toISOString()
            })
          }
        })
        
        updated++
        if (updated % 10 === 0) {
          console.log(`  Updated ${updated} papers...`)
        }
        
      } catch (error) {
        console.error(`Error updating paper ${paperId}:`, error.message)
      }
    }
    
    console.log(`✅ Updated quality scores for ${updated} papers`)
  }
}

/**
 * Generate database quality analytics
 */
async function generateQualityAnalytics(): Promise<void> {
  console.log('📊 Generating Database Quality Analytics...')
  
  const papers = await prisma.researchPaper.findMany({
    where: {
      aiDataExtraction: {
        not: null
      }
    },
    select: {
      id: true,
      title: true,
      systemType: true,
      aiConfidence: true,
      aiInsights: true,
      createdAt: true
    }
  })

  console.log(`\nAnalyzing ${papers.length} papers with AI data extraction...`)

  // Quality distribution
  const qualityDistribution = {
    excellent: 0,  // 85-100
    good: 0,       // 70-84
    fair: 0,       // 50-69
    poor: 0        // <50
  }

  let totalScore = 0
  let papersWithScores = 0

  papers.forEach(paper => {
    if (paper.aiConfidence) {
      const score = paper.aiConfidence * 100
      totalScore += score
      papersWithScores++
      
      if (score >= 85) qualityDistribution.excellent++
      else if (score >= 70) qualityDistribution.good++
      else if (score >= 50) qualityDistribution.fair++
      else qualityDistribution.poor++
    }
  })

  // System type distribution
  const systemTypes: { [key: string]: number } = {}
  papers.forEach(paper => {
    const type = paper.systemType || 'unknown'
    systemTypes[type] = (systemTypes[type] || 0) + 1
  })

  // Monthly growth
  const monthlyData: { [key: string]: number } = {}
  papers.forEach(paper => {
    const month = paper.createdAt.toISOString().substring(0, 7)
    monthlyData[month] = (monthlyData[month] || 0) + 1
  })

  console.log(`\n📈 Quality Distribution:`)
  console.log(`  Excellent (85-100): ${qualityDistribution.excellent} (${(qualityDistribution.excellent/papersWithScores*100).toFixed(1)}%)`)
  console.log(`  Good (70-84): ${qualityDistribution.good} (${(qualityDistribution.good/papersWithScores*100).toFixed(1)}%)`)
  console.log(`  Fair (50-69): ${qualityDistribution.fair} (${(qualityDistribution.fair/papersWithScores*100).toFixed(1)}%)`)
  console.log(`  Poor (<50): ${qualityDistribution.poor} (${(qualityDistribution.poor/papersWithScores*100).toFixed(1)}%)`)
  
  console.log(`\n📊 Overall Metrics:`)
  console.log(`  Average Quality Score: ${(totalScore/papersWithScores).toFixed(1)}%`)
  console.log(`  Papers with Quality Scores: ${papersWithScores}/${papers.length}`)
  
  console.log(`\n🔬 System Type Distribution:`)
  Object.entries(systemTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} (${(count/papers.length*100).toFixed(1)}%)`)
  })

  console.log(`\n📅 Recent Activity:`)
  Object.entries(monthlyData)
    .sort()
    .slice(-6)
    .forEach(([month, count]) => {
      console.log(`  ${month}: ${count} papers`)
    })
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  const scorer = new ParameterQualityScorer()

  if (command === 'score') {
    const limit = parseInt(args[1]) || 50
    
    // Get papers to score
    const papers = await prisma.researchPaper.findMany({
      where: {
        aiDataExtraction: { not: null }
      },
      select: { id: true },
      take: limit
    })

    const paperIds = papers.map(p => p.id)
    await scorer.updatePaperQualityScores(paperIds)
    
  } else if (command === 'analytics') {
    await generateQualityAnalytics()
    
  } else if (command === 'single') {
    const paperId = args[1]
    if (!paperId) {
      console.error('Please provide a paper ID')
      process.exit(1)
    }
    
    const score = await scorer.scorePaper(paperId)
    console.log('Quality Score:', JSON.stringify(score, null, 2))
    
  } else {
    console.log(`
Usage:
  npx tsx parameter-quality-scorer.ts score [limit]     # Score papers (default: 50)
  npx tsx parameter-quality-scorer.ts analytics         # Generate quality analytics
  npx tsx parameter-quality-scorer.ts single <paper-id> # Score single paper
`)
  }
  
  await prisma.$disconnect()
}

if (require.main === module) {
  main().catch(console.error)
}

export { ParameterQualityScorer, QualityMetrics }