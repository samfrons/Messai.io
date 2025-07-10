import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

interface QualityScore {
  overall: number // 0-100
  authenticity: number // 0-100 - Is this a real research paper?
  relevance: number // 0-100 - How relevant to MES research?
  completeness: number // 0-100 - How much useful data is available?
  impact: number // 0-100 - Research impact and citations
  methodology: number // 0-100 - Research methodology quality
  breakdown: {
    hasVerificationId: boolean
    hasExternalUrl: boolean
    hasAbstract: boolean
    hasPerformanceData: boolean
    hasMaterialsData: boolean
    hasRecentPublication: boolean
    isFromReputableSource: boolean
    hasDetailedMethodology: boolean
    citationCount?: number
    journalImpactFactor?: number
  }
  recommendations: string[]
}

interface ScoringReport {
  paperId: string
  title: string
  score: QualityScore
  previousScore?: number
  improvement: number
  issues: string[]
}

class PaperQualityScorer {
  private readonly reputableSources = [
    'crossref_api',
    'pubmed_api', 
    'arxiv_api',
    'local_pdf'
  ]

  private readonly highImpactJournals = [
    'nature',
    'science',
    'nature energy',
    'energy & environmental science',
    'acs energy letters',
    'advanced energy materials',
    'joule',
    'environmental science & technology',
    'water research',
    'bioresource technology',
    'applied energy',
    'renewable and sustainable energy reviews'
  ]

  private readonly mesRelevantKeywords = [
    'microbial fuel cell',
    'mfc',
    'microbial electrolysis cell',
    'mec',
    'microbial desalination cell',
    'mdc',
    'microbial electrosynthesis',
    'mes',
    'bioelectrochemical',
    'electroactive bacteria',
    'geobacter',
    'shewanella',
    'biofilm',
    'electron transfer',
    'bioenergy',
    'wastewater treatment',
    'hydrogen production',
    'current density',
    'power density',
    'coulombic efficiency'
  ]

  async scorePaper(paper: any): Promise<QualityScore> {
    const breakdown = await this.analyzeAuthenticity(paper)
    
    const scores = {
      authenticity: this.calculateAuthenticityScore(paper, breakdown),
      relevance: this.calculateRelevanceScore(paper),
      completeness: this.calculateCompletenessScore(paper, breakdown),
      impact: await this.calculateImpactScore(paper, breakdown),
      methodology: this.calculateMethodologyScore(paper)
    }

    const overall = this.calculateOverallScore(scores)
    const recommendations = this.generateRecommendations(paper, breakdown, scores)

    return {
      overall,
      ...scores,
      breakdown,
      recommendations
    }
  }

  private async analyzeAuthenticity(paper: any): Promise<QualityScore['breakdown']> {
    const breakdown: QualityScore['breakdown'] = {
      hasVerificationId: Boolean(paper.doi || paper.arxivId || paper.pubmedId || paper.ieeeId),
      hasExternalUrl: Boolean(paper.externalUrl),
      hasAbstract: Boolean(paper.abstract && paper.abstract.length > 50),
      hasPerformanceData: Boolean(paper.powerOutput || paper.efficiency),
      hasMaterialsData: Boolean(paper.anodeMaterials || paper.cathodeMaterials || paper.organismTypes),
      hasRecentPublication: this.isRecentPublication(paper.publicationDate),
      isFromReputableSource: this.reputableSources.includes(paper.source),
      hasDetailedMethodology: this.hasMethodologyIndicators(paper)
    }

    // Try to get citation count if DOI available
    if (paper.doi) {
      breakdown.citationCount = await this.getCitationCount(paper.doi)
    }

    // Determine journal impact factor
    if (paper.journal) {
      breakdown.journalImpactFactor = this.getJournalImpactFactor(paper.journal)
    }

    return breakdown
  }

  private calculateAuthenticityScore(paper: any, breakdown: QualityScore['breakdown']): number {
    let score = 0

    // Verification IDs are strongest authenticity indicator
    if (breakdown.hasVerificationId) score += 40
    
    // External URL to actual paper
    if (breakdown.hasExternalUrl) score += 20
    
    // Reputable source
    if (breakdown.isFromReputableSource) score += 20
    
    // Detailed abstract
    if (breakdown.hasAbstract) score += 10
    
    // Real author names (not AI patterns)
    if (this.hasRealAuthors(paper)) score += 10

    return Math.min(score, 100)
  }

  private calculateRelevanceScore(paper: any): number {
    let score = 0
    const text = this.getSearchableText(paper).toLowerCase()

    // Check for MES-specific keywords
    let keywordMatches = 0
    for (const keyword of this.mesRelevantKeywords) {
      if (text.includes(keyword)) {
        keywordMatches++
      }
    }

    // Score based on keyword density
    const keywordDensity = keywordMatches / this.mesRelevantKeywords.length
    score += keywordDensity * 60

    // System type specificity
    if (paper.systemType && paper.systemType !== 'BES') {
      score += 20
    }

    // Performance data indicates practical relevance
    if (paper.powerOutput || paper.efficiency) {
      score += 15
    }

    // Materials data indicates technical depth
    if (paper.anodeMaterials || paper.cathodeMaterials) {
      score += 5
    }

    return Math.min(score, 100)
  }

  private calculateCompletenessScore(paper: any, breakdown: QualityScore['breakdown']): number {
    let score = 0
    const maxScore = 100

    // Essential fields
    if (breakdown.hasAbstract) score += 20
    if (breakdown.hasExternalUrl) score += 15
    if (paper.authors && paper.authors !== '[]') score += 10
    if (paper.publicationDate) score += 10

    // Technical data
    if (breakdown.hasPerformanceData) score += 20
    if (breakdown.hasMaterialsData) score += 15

    // Publication details
    if (paper.journal) score += 5
    if (paper.volume && paper.issue) score += 3
    if (paper.pages) score += 2

    return Math.min(score, maxScore)
  }

  private async calculateImpactScore(paper: any, breakdown: QualityScore['breakdown']): Promise<number> {
    let score = 30 // Base score

    // Citation count
    if (breakdown.citationCount !== undefined) {
      if (breakdown.citationCount > 100) score += 30
      else if (breakdown.citationCount > 50) score += 20
      else if (breakdown.citationCount > 10) score += 10
      else if (breakdown.citationCount > 0) score += 5
    }

    // Journal impact factor
    if (breakdown.journalImpactFactor !== undefined) {
      if (breakdown.journalImpactFactor > 10) score += 25
      else if (breakdown.journalImpactFactor > 5) score += 15
      else if (breakdown.journalImpactFactor > 2) score += 10
      else if (breakdown.journalImpactFactor > 1) score += 5
    }

    // High-impact journal
    if (paper.journal && this.isHighImpactJournal(paper.journal)) {
      score += 15
    }

    return Math.min(score, 100)
  }

  private calculateMethodologyScore(paper: any): number {
    let score = 40 // Base score for having methodology info

    const text = this.getSearchableText(paper).toLowerCase()

    // Experimental methodology indicators
    const methodologyKeywords = [
      'experimental setup',
      'materials and methods',
      'reactor configuration',
      'electrode preparation',
      'inoculum',
      'operating conditions',
      'analytical methods',
      'characterization',
      'measurements',
      'statistical analysis'
    ]

    let methodologyMatches = 0
    for (const keyword of methodologyKeywords) {
      if (text.includes(keyword)) {
        methodologyMatches++
      }
    }

    score += (methodologyMatches / methodologyKeywords.length) * 40

    // Quantitative data
    if (this.hasQuantitativeData(text)) score += 10

    // Statistical analysis mentioned
    if (text.includes('statistical') || text.includes('significance') || text.includes('p-value')) {
      score += 10
    }

    return Math.min(score, 100)
  }

  private calculateOverallScore(scores: {
    authenticity: number
    relevance: number
    completeness: number
    impact: number
    methodology: number
  }): number {
    // Weighted average
    const weights = {
      authenticity: 0.3,   // Most important - is it real?
      relevance: 0.25,     // Is it relevant to MES?
      completeness: 0.2,   // How much useful data?
      impact: 0.15,        // Research impact
      methodology: 0.1     // Methodology quality
    }

    return Math.round(
      scores.authenticity * weights.authenticity +
      scores.relevance * weights.relevance +
      scores.completeness * weights.completeness +
      scores.impact * weights.impact +
      scores.methodology * weights.methodology
    )
  }

  private generateRecommendations(
    paper: any, 
    breakdown: QualityScore['breakdown'], 
    scores: any
  ): string[] {
    const recommendations: string[] = []

    // Authenticity improvements
    if (scores.authenticity < 70) {
      if (!breakdown.hasVerificationId) {
        recommendations.push('Add DOI, PubMed ID, or arXiv ID for verification')
      }
      if (!breakdown.hasExternalUrl) {
        recommendations.push('Add external URL linking to the actual paper')
      }
    }

    // Relevance improvements
    if (scores.relevance < 60) {
      recommendations.push('Ensure paper is directly related to microbial electrochemical systems')
      recommendations.push('Add more specific MES-related keywords and data')
    }

    // Completeness improvements
    if (scores.completeness < 70) {
      if (!breakdown.hasAbstract) {
        recommendations.push('Add detailed abstract')
      }
      if (!breakdown.hasPerformanceData) {
        recommendations.push('Extract performance metrics (power density, current density, efficiency)')
      }
      if (!breakdown.hasMaterialsData) {
        recommendations.push('Extract materials information (electrodes, microorganisms)')
      }
    }

    // Impact improvements
    if (scores.impact < 50) {
      recommendations.push('Verify publication in peer-reviewed journal')
      recommendations.push('Check for citation count and journal impact factor')
    }

    return recommendations
  }

  // Helper methods
  private isRecentPublication(dateString?: string): boolean {
    if (!dateString) return false
    const pubDate = new Date(dateString)
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    return pubDate > fiveYearsAgo
  }

  private hasMethodologyIndicators(paper: any): boolean {
    const text = this.getSearchableText(paper).toLowerCase()
    const indicators = ['method', 'experimental', 'procedure', 'protocol', 'setup']
    return indicators.some(indicator => text.includes(indicator))
  }

  private hasRealAuthors(paper: any): boolean {
    if (!paper.authors) return false
    
    try {
      const authors = JSON.parse(paper.authors)
      if (!Array.isArray(authors)) return false
      
      const fakePatterns = [
        'ai research assistant',
        'automated content generator',
        'ai assistant',
        'content generator',
        'synthetic author'
      ]
      
      return !authors.some(author => 
        fakePatterns.some(pattern => 
          author.toLowerCase().includes(pattern)
        )
      )
    } catch {
      return false
    }
  }

  private getSearchableText(paper: any): string {
    return [
      paper.title || '',
      paper.abstract || '',
      paper.keywords ? this.parseJsonField(paper.keywords).join(' ') : ''
    ].join(' ')
  }

  private async getCitationCount(doi: string): Promise<number | undefined> {
    try {
      // Using CrossRef API to get citation count
      const response = await fetch(`https://api.crossref.org/works/${doi}`)
      if (response.ok) {
        const data = await response.json() as any
        return data.message['is-referenced-by-count'] || 0
      }
    } catch (error) {
      // Silently fail - citation count is optional
    }
    return undefined
  }

  private getJournalImpactFactor(journal: string): number | undefined {
    // Simplified impact factor mapping
    // In a real system, this would query a journal database
    const journalLower = journal.toLowerCase()
    
    if (journalLower.includes('nature energy')) return 60.9
    if (journalLower.includes('nature')) return 49.9
    if (journalLower.includes('science')) return 47.7
    if (journalLower.includes('energy & environmental science')) return 38.5
    if (journalLower.includes('joule')) return 41.2
    if (journalLower.includes('advanced energy materials')) return 29.4
    if (journalLower.includes('environmental science & technology')) return 11.4
    if (journalLower.includes('water research')) return 12.8
    if (journalLower.includes('bioresource technology')) return 11.4
    
    return undefined
  }

  private isHighImpactJournal(journal: string): boolean {
    const journalLower = journal.toLowerCase()
    return this.highImpactJournals.some(highImpact => 
      journalLower.includes(highImpact)
    )
  }

  private hasQuantitativeData(text: string): boolean {
    // Look for numerical data patterns
    const patterns = [
      /\d+\.?\d*\s*(mw|ma|v|%|°c|mg\/l)/gi,
      /\d+\.?\d*\s*(hours?|days?|minutes?)/gi,
      /\d+\.?\d*\s*(cm|mm|μm|ml|l)/gi
    ]
    
    return patterns.some(pattern => pattern.test(text))
  }

  private parseJsonField(jsonString: string): any[] {
    try {
      const parsed = JSON.parse(jsonString)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  async scoreAllPapers(limit?: number): Promise<ScoringReport[]> {
    console.log('📊 Starting paper quality scoring...')

    const papers = await prisma.researchPaper.findMany({
      select: {
        id: true,
        title: true,
        abstract: true,
        authors: true,
        doi: true,
        arxivId: true,
        pubmedId: true,
        ieeeId: true,
        externalUrl: true,
        keywords: true,
        powerOutput: true,
        efficiency: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        systemType: true,
        source: true,
        journal: true,
        volume: true,
        issue: true,
        pages: true,
        publicationDate: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Scoring ${papers.length} papers...`)

    const reports: ScoringReport[] = []
    let processed = 0

    for (const paper of papers) {
      processed++
      console.log(`Scoring ${processed}/${papers.length}: ${paper.title.substring(0, 50)}...`)

      try {
        const score = await this.scorePaper(paper)
        
        const report: ScoringReport = {
          paperId: paper.id,
          title: paper.title,
          score,
          improvement: 0, // Could track changes over time
          issues: score.overall < 50 ? ['Low quality score - consider review or removal'] : []
        }

        reports.push(report)

        // Update paper with quality score in database
        await this.updatePaperScore(paper.id, score)

        if (processed % 25 === 0) {
          const avgScore = reports.reduce((sum, r) => sum + r.score.overall, 0) / reports.length
          console.log(`  Progress: ${processed}/${papers.length} - Average quality score: ${avgScore.toFixed(1)}`)
        }

      } catch (error) {
        console.error(`Error scoring paper ${paper.id}:`, error)
        reports.push({
          paperId: paper.id,
          title: paper.title,
          score: {
            overall: 0,
            authenticity: 0,
            relevance: 0,
            completeness: 0,
            impact: 0,
            methodology: 0,
            breakdown: {
              hasVerificationId: false,
              hasExternalUrl: false,
              hasAbstract: false,
              hasPerformanceData: false,
              hasMaterialsData: false,
              hasRecentPublication: false,
              isFromReputableSource: false,
              hasDetailedMethodology: false
            },
            recommendations: ['Error occurred during scoring']
          },
          improvement: 0,
          issues: ['Scoring failed']
        })
      }

      // Rate limiting for external API calls
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return reports
  }

  private async updatePaperScore(paperId: string, score: QualityScore): Promise<void> {
    try {
      // Store quality score in keywords field for now
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
            _qualityScore: {
              overall: score.overall,
              authenticity: score.authenticity,
              relevance: score.relevance,
              completeness: score.completeness,
              impact: score.impact,
              methodology: score.methodology,
              lastScored: new Date().toISOString()
            }
          })
        }
      })
    } catch (error) {
      console.warn(`Failed to update quality score for paper ${paperId}:`, error)
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const limit = args[0] ? parseInt(args[0]) : undefined

  try {
    const scorer = new PaperQualityScorer()
    const reports = await scorer.scoreAllPapers(limit)

    // Generate summary statistics
    const avgScore = reports.reduce((sum, r) => sum + r.score.overall, 0) / reports.length
    const highQualityCount = reports.filter(r => r.score.overall >= 80).length
    const mediumQualityCount = reports.filter(r => r.score.overall >= 60 && r.score.overall < 80).length
    const lowQualityCount = reports.filter(r => r.score.overall < 60).length

    console.log(`\n📊 Quality Scoring Summary:`)
    console.log(`  Papers scored: ${reports.length}`)
    console.log(`  Average quality score: ${avgScore.toFixed(1)}/100`)
    console.log(`  High quality (80+): ${highQualityCount} (${((highQualityCount/reports.length)*100).toFixed(1)}%)`)
    console.log(`  Medium quality (60-79): ${mediumQualityCount} (${((mediumQualityCount/reports.length)*100).toFixed(1)}%)`)
    console.log(`  Low quality (<60): ${lowQualityCount} (${((lowQualityCount/reports.length)*100).toFixed(1)}%)`)

    // Save detailed report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const reportPath = path.join(process.cwd(), 'reports', `quality-scoring-${timestamp}.json`)
    await fs.mkdir(path.dirname(reportPath), { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(reports, null, 2))

    console.log(`\n📄 Detailed report saved to: ${reportPath}`)

    // Identify papers that need attention
    const problematicPapers = reports.filter(r => r.score.overall < 50)
    if (problematicPapers.length > 0) {
      console.log(`\n⚠️  ${problematicPapers.length} papers have very low quality scores and may need review`)
    }

  } catch (error) {
    console.error('❌ Quality scoring failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { PaperQualityScorer, type QualityScore, type ScoringReport }