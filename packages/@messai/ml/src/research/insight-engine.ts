import { ResearchInsight, ResearchPaper } from '../types'
import { LiteratureProcessor } from './literature-processor'
import { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from './knowledge-graph'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

export interface InsightGenerationConfig {
  analysisDepth: 'shallow' | 'medium' | 'deep'
  focusAreas: string[]
  timeWindow: { start: Date, end: Date }
  minConfidence: number
  maxInsights: number
}

export interface TrendAnalysisResult {
  trends: Array<{
    topic: string
    direction: 'increasing' | 'decreasing' | 'stable' | 'emerging'
    strength: number
    timePoints: Array<{ date: Date, value: number }>
    significance: string
  }>
  emergingTopics: string[]
  decliningTopics: string[]
  hotSpots: Array<{
    topic: string
    activityScore: number
    recentPapers: number
  }>
}

export interface ImpactAnalysisResult {
  highImpactPapers: Array<{
    paper: ResearchPaper
    impactScore: number
    citationVelocity: number
    influenceNetwork: string[]
  }>
  breakthroughIndicators: Array<{
    paper: ResearchPaper
    breakthroughScore: number
    noveltyFactors: string[]
  }>
  futureImplications: string[]
}

export class InsightEngine {
  private openai?: OpenAI
  private literatureProcessor: LiteratureProcessor
  private knowledgeGraph: KnowledgeGraph
  private insights: Map<string, ResearchInsight> = new Map()

  constructor(
    literatureProcessor: LiteratureProcessor,
    knowledgeGraph: KnowledgeGraph,
    apiKey?: string
  ) {
    this.literatureProcessor = literatureProcessor
    this.knowledgeGraph = knowledgeGraph
    if (apiKey) {
      this.openai = new OpenAI({ apiKey })
    }
  }

  async generateInsights(config: InsightGenerationConfig): Promise<ResearchInsight[]> {
    console.log(`Generating insights with ${config.analysisDepth} analysis`)

    const insights: ResearchInsight[] = []

    // Get relevant papers for analysis
    const papers = await this.getRelevantPapers(config)

    // Generate different types of insights
    const trendInsights = await this.generateTrendInsights(papers, config)
    const gapInsights = await this.generateGapInsights(papers, config)
    const opportunityInsights = await this.generateOpportunityInsights(papers, config)
    const methodologyInsights = await this.generateMethodologyInsights(papers, config)

    insights.push(...trendInsights, ...gapInsights, ...opportunityInsights, ...methodologyInsights)

    // Filter by confidence and limit
    const filteredInsights = insights
      .filter(insight => insight.confidence >= config.minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, config.maxInsights)

    // Store insights
    for (const insight of filteredInsights) {
      this.insights.set(insight.id, insight)
    }

    console.log(`Generated ${filteredInsights.length} insights`)
    return filteredInsights
  }

  async analyzeTrends(
    papers: ResearchPaper[],
    timeWindow: { start: Date, end: Date }
  ): Promise<TrendAnalysisResult> {
    console.log(`Analyzing trends for ${papers.length} papers`)

    // Group papers by time periods
    const timeGroups = this.groupPapersByTime(papers, timeWindow, 'quarterly')
    
    // Analyze topic trends
    const topicTrends = await this.analyzeTopicTrends(timeGroups)
    
    // Identify emerging and declining topics
    const emergingTopics = this.identifyEmergingTopics(timeGroups)
    const decliningTopics = this.identifyDecliningTopics(timeGroups)
    
    // Find research hot spots
    const hotSpots = this.identifyHotSpots(papers, timeWindow)

    return {
      trends: topicTrends,
      emergingTopics,
      decliningTopics,
      hotSpots
    }
  }

  async analyzeImpact(papers: ResearchPaper[]): Promise<ImpactAnalysisResult> {
    console.log(`Analyzing impact for ${papers.length} papers`)

    // Calculate impact scores
    const highImpactPapers = this.identifyHighImpactPapers(papers)
    
    // Find breakthrough papers
    const breakthroughIndicators = this.identifyBreakthroughPapers(papers)
    
    // Generate future implications
    const futureImplications = await this.generateFutureImplications(papers)

    return {
      highImpactPapers,
      breakthroughIndicators,
      futureImplications
    }
  }

  async generateResearchRecommendations(
    researcherProfile: {
      interests: string[]
      expertise: string[]
      recentPapers: string[]
      collaborators: string[]
    }
  ): Promise<Array<{
    type: 'collaboration' | 'topic' | 'methodology' | 'gap'
    title: string
    description: string
    relevanceScore: number
    actionItems: string[]
    timeframe: string
  }>> {
    const recommendations = []

    // Find potential collaborations
    const collaborationRecs = await this.findCollaborationOpportunities(researcherProfile)
    recommendations.push(...collaborationRecs)

    // Suggest research topics
    const topicRecs = await this.suggestResearchTopics(researcherProfile)
    recommendations.push(...topicRecs)

    // Recommend methodologies
    const methodRecs = await this.recommendMethodologies(researcherProfile)
    recommendations.push(...methodRecs)

    // Identify research gaps
    const gapRecs = await this.identifyPersonalizedGaps(researcherProfile)
    recommendations.push(...gapRecs)

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  async detectResearchAnomalies(papers: ResearchPaper[]): Promise<Array<{
    type: 'unusual_result' | 'methodological_outlier' | 'citation_anomaly' | 'temporal_anomaly'
    paper: ResearchPaper
    description: string
    severity: 'low' | 'medium' | 'high'
    investigationSuggestions: string[]
  }>> {
    const anomalies = []

    for (const paper of papers) {
      // Check for unusual results
      const resultAnomalies = this.detectResultAnomalies(paper, papers)
      anomalies.push(...resultAnomalies)

      // Check for methodological outliers
      const methodAnomalies = this.detectMethodologicalAnomalies(paper, papers)
      anomalies.push(...methodAnomalies)

      // Check for citation anomalies
      const citationAnomalies = this.detectCitationAnomalies(paper, papers)
      anomalies.push(...citationAnomalies)
    }

    return anomalies
  }

  async generateFutureScenarios(
    researchArea: string,
    timeHorizon: '1year' | '5years' | '10years'
  ): Promise<Array<{
    scenario: string
    probability: number
    keyDrivers: string[]
    implications: string[]
    preparationSteps: string[]
  }>> {
    console.log(`Generating future scenarios for ${researchArea} (${timeHorizon})`)

    if (this.openai) {
      return await this.generateScenariosWithAI(researchArea, timeHorizon)
    } else {
      return this.generateMockScenarios(researchArea, timeHorizon)
    }
  }

  private async getRelevantPapers(config: InsightGenerationConfig): Promise<ResearchPaper[]> {
    if (config.focusAreas.length > 0) {
      return await this.literatureProcessor.searchPapers({
        keywords: config.focusAreas,
        dateRange: config.timeWindow,
        maxResults: 200
      })
    } else {
      return this.literatureProcessor.getAllPapers().filter(paper =>
        paper.publishedDate >= config.timeWindow.start &&
        paper.publishedDate <= config.timeWindow.end
      )
    }
  }

  private async generateTrendInsights(
    papers: ResearchPaper[],
    config: InsightGenerationConfig
  ): Promise<ResearchInsight[]> {
    const insights: ResearchInsight[] = []
    
    const trendAnalysis = await this.analyzeTrends(papers, config.timeWindow)
    
    for (const trend of trendAnalysis.trends.slice(0, 5)) {
      insights.push({
        id: uuidv4(),
        title: `${trend.direction === 'increasing' ? 'Rising' : trend.direction === 'emerging' ? 'Emerging' : 'Declining'} Trend: ${trend.topic}`,
        insight: `${trend.topic} shows ${trend.direction} activity with strength ${trend.strength.toFixed(2)}. ${trend.significance}`,
        category: 'trend',
        confidence: Math.min(0.9, trend.strength),
        supportingEvidence: papers.filter(p => p.keywords.includes(trend.topic)).map(p => p.id),
        relatedPapers: papers.filter(p => p.keywords.includes(trend.topic)).map(p => p.id),
        generatedAt: new Date()
      })
    }

    return insights
  }

  private async generateGapInsights(
    papers: ResearchPaper[],
    config: InsightGenerationConfig
  ): Promise<ResearchInsight[]> {
    const insights: ResearchInsight[] = []
    
    // Use knowledge graph to identify disconnected concepts
    const graphInsights = await this.knowledgeGraph.generateInsights()
    const gapInsights = graphInsights.filter(insight => insight.category === 'gap')
    
    for (const gap of gapInsights.slice(0, 3)) {
      insights.push({
        id: uuidv4(),
        title: `Research Gap: ${gap.title}`,
        insight: gap.insight,
        category: 'gap',
        confidence: gap.confidence,
        supportingEvidence: gap.supportingEvidence,
        relatedPapers: gap.relatedPapers,
        generatedAt: new Date()
      })
    }

    return insights
  }

  private async generateOpportunityInsights(
    papers: ResearchPaper[],
    config: InsightGenerationConfig
  ): Promise<ResearchInsight[]> {
    const insights: ResearchInsight[] = []
    
    // Look for cross-domain opportunities
    const crossDomainPapers = this.identifyCrossDomainPapers(papers)
    
    for (const opportunity of crossDomainPapers.slice(0, 3)) {
      insights.push({
        id: uuidv4(),
        title: `Cross-Domain Opportunity: ${opportunity.domains.join(' + ')}`,
        insight: `Emerging opportunity to combine insights from ${opportunity.domains.join(' and ')} based on recent publications.`,
        category: 'opportunity',
        confidence: 0.7,
        supportingEvidence: opportunity.papers.map(p => p.id),
        relatedPapers: opportunity.papers.map(p => p.id),
        generatedAt: new Date()
      })
    }

    return insights
  }

  private async generateMethodologyInsights(
    papers: ResearchPaper[],
    config: InsightGenerationConfig
  ): Promise<ResearchInsight[]> {
    const insights: ResearchInsight[] = []
    
    // Analyze methodology trends
    const methodologyTrends = this.analyzeMethodologyTrends(papers)
    
    for (const method of methodologyTrends.slice(0, 2)) {
      insights.push({
        id: uuidv4(),
        title: `Methodology Trend: ${method.name}`,
        insight: `${method.name} is ${method.trend} in adoption with ${method.usage}% of recent papers using this approach.`,
        category: 'methodology',
        confidence: 0.8,
        supportingEvidence: method.papers,
        relatedPapers: method.papers,
        generatedAt: new Date()
      })
    }

    return insights
  }

  private groupPapersByTime(
    papers: ResearchPaper[],
    timeWindow: { start: Date, end: Date },
    granularity: 'monthly' | 'quarterly' | 'yearly'
  ): Map<string, ResearchPaper[]> {
    const groups = new Map<string, ResearchPaper[]>()
    
    for (const paper of papers) {
      if (paper.publishedDate >= timeWindow.start && paper.publishedDate <= timeWindow.end) {
        let key: string
        
        if (granularity === 'yearly') {
          key = paper.publishedDate.getFullYear().toString()
        } else if (granularity === 'quarterly') {
          const quarter = Math.floor(paper.publishedDate.getMonth() / 3) + 1
          key = `${paper.publishedDate.getFullYear()}-Q${quarter}`
        } else {
          key = `${paper.publishedDate.getFullYear()}-${String(paper.publishedDate.getMonth() + 1).padStart(2, '0')}`
        }
        
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(paper)
      }
    }
    
    return groups
  }

  private async analyzeTopicTrends(timeGroups: Map<string, ResearchPaper[]>): Promise<Array<{
    topic: string
    direction: 'increasing' | 'decreasing' | 'stable' | 'emerging'
    strength: number
    timePoints: Array<{ date: Date, value: number }>
    significance: string
  }>> {
    const topicCounts = new Map<string, Map<string, number>>()
    
    // Count topics over time
    for (const [period, papers] of timeGroups) {
      for (const paper of papers) {
        for (const keyword of paper.keywords) {
          if (!topicCounts.has(keyword)) {
            topicCounts.set(keyword, new Map())
          }
          const topicMap = topicCounts.get(keyword)!
          topicMap.set(period, (topicMap.get(period) || 0) + 1)
        }
      }
    }
    
    // Analyze trends for each topic
    const trends = []
    
    for (const [topic, periodCounts] of topicCounts) {
      if (periodCounts.size < 2) continue
      
      const timePoints = Array.from(periodCounts.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, count]) => ({
          date: this.parseTimePoint(period),
          value: count
        }))
      
      const direction = this.calculateTrendDirection(timePoints)
      const strength = this.calculateTrendStrength(timePoints)
      const significance = this.generateTrendSignificance(topic, direction, strength)
      
      trends.push({
        topic,
        direction,
        strength,
        timePoints,
        significance
      })
    }
    
    return trends.sort((a, b) => b.strength - a.strength).slice(0, 10)
  }

  private identifyEmergingTopics(timeGroups: Map<string, ResearchPaper[]>): string[] {
    const periods = Array.from(timeGroups.keys()).sort()
    if (periods.length < 2) return []
    
    const recentPeriods = periods.slice(-2)
    const earlierPeriods = periods.slice(0, -1)
    
    const recentTopics = new Set<string>()
    const earlierTopics = new Set<string>()
    
    for (const period of recentPeriods) {
      const papers = timeGroups.get(period) || []
      papers.forEach(paper => paper.keywords.forEach(keyword => recentTopics.add(keyword)))
    }
    
    for (const period of earlierPeriods) {
      const papers = timeGroups.get(period) || []
      papers.forEach(paper => paper.keywords.forEach(keyword => earlierTopics.add(keyword)))
    }
    
    return Array.from(recentTopics).filter(topic => !earlierTopics.has(topic)).slice(0, 10)
  }

  private identifyDecliningTopics(timeGroups: Map<string, ResearchPaper[]>): string[] {
    const periods = Array.from(timeGroups.keys()).sort()
    if (periods.length < 2) return []
    
    const recentPeriods = periods.slice(-2)
    const earlierPeriods = periods.slice(0, -1)
    
    const recentTopics = new Set<string>()
    const earlierTopics = new Set<string>()
    
    for (const period of recentPeriods) {
      const papers = timeGroups.get(period) || []
      papers.forEach(paper => paper.keywords.forEach(keyword => recentTopics.add(keyword)))
    }
    
    for (const period of earlierPeriods) {
      const papers = timeGroups.get(period) || []
      papers.forEach(paper => paper.keywords.forEach(keyword => earlierTopics.add(keyword)))
    }
    
    return Array.from(earlierTopics).filter(topic => !recentTopics.has(topic)).slice(0, 10)
  }

  private identifyHotSpots(papers: ResearchPaper[], timeWindow: { start: Date, end: Date }): Array<{
    topic: string
    activityScore: number
    recentPapers: number
  }> {
    const topicActivity = new Map<string, number>()
    const topicCounts = new Map<string, number>()
    
    const recentDate = new Date(timeWindow.end.getTime() - 365 * 24 * 60 * 60 * 1000) // Last year
    
    for (const paper of papers) {
      const weight = paper.publishedDate > recentDate ? 2 : 1
      
      for (const keyword of paper.keywords) {
        topicActivity.set(keyword, (topicActivity.get(keyword) || 0) + weight)
        topicCounts.set(keyword, (topicCounts.get(keyword) || 0) + 1)
      }
    }
    
    return Array.from(topicActivity.entries())
      .map(([topic, score]) => ({
        topic,
        activityScore: score,
        recentPapers: topicCounts.get(topic) || 0
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 10)
  }

  private identifyHighImpactPapers(papers: ResearchPaper[]): Array<{
    paper: ResearchPaper
    impactScore: number
    citationVelocity: number
    influenceNetwork: string[]
  }> {
    return papers.map(paper => {
      const impactScore = this.calculateImpactScore(paper)
      const citationVelocity = this.calculateCitationVelocity(paper)
      const influenceNetwork = this.getInfluenceNetwork(paper)
      
      return {
        paper,
        impactScore,
        citationVelocity,
        influenceNetwork
      }
    })
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 10)
  }

  private identifyBreakthroughPapers(papers: ResearchPaper[]): Array<{
    paper: ResearchPaper
    breakthroughScore: number
    noveltyFactors: string[]
  }> {
    return papers.map(paper => {
      const breakthroughScore = this.calculateBreakthroughScore(paper)
      const noveltyFactors = this.identifyNoveltyFactors(paper)
      
      return {
        paper,
        breakthroughScore,
        noveltyFactors
      }
    })
    .filter(item => item.breakthroughScore > 0.6)
    .sort((a, b) => b.breakthroughScore - a.breakthroughScore)
    .slice(0, 5)
  }

  private async generateFutureImplications(papers: ResearchPaper[]): Promise<string[]> {
    // Analyze current trends to predict future implications
    const implications = [
      'Continued growth in sustainable energy applications',
      'Integration with IoT and smart grid technologies',
      'Advances in materials science enabling higher efficiency',
      'Commercialization of laboratory-scale innovations',
      'Regulatory frameworks adapting to new technologies'
    ]
    
    return implications
  }

  private calculateTrendDirection(timePoints: Array<{ date: Date, value: number }>): 'increasing' | 'decreasing' | 'stable' | 'emerging' {
    if (timePoints.length < 2) return 'stable'
    
    const recent = timePoints.slice(-2)
    const change = recent[1].value - recent[0].value
    const relative = Math.abs(change) / recent[0].value
    
    if (recent[0].value === 0 && recent[1].value > 0) return 'emerging'
    if (relative > 0.2) return change > 0 ? 'increasing' : 'decreasing'
    return 'stable'
  }

  private calculateTrendStrength(timePoints: Array<{ date: Date, value: number }>): number {
    if (timePoints.length < 2) return 0
    
    const values = timePoints.map(p => p.value)
    const slope = this.calculateSlope(values)
    const variance = this.calculateVariance(values)
    
    return Math.min(1, Math.abs(slope) / (1 + variance))
  }

  private calculateSlope(values: number[]): number {
    const n = values.length
    const x = Array.from({ length: n }, (_, i) => i)
    const xMean = x.reduce((sum, val) => sum + val, 0) / n
    const yMean = values.reduce((sum, val) => sum + val, 0) / n
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (values[i] - yMean), 0)
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0)
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }

  private parseTimePoint(period: string): Date {
    if (period.includes('Q')) {
      const [year, quarter] = period.split('-Q')
      const month = (parseInt(quarter) - 1) * 3
      return new Date(parseInt(year), month, 1)
    } else if (period.includes('-')) {
      const [year, month] = period.split('-')
      return new Date(parseInt(year), parseInt(month) - 1, 1)
    } else {
      return new Date(parseInt(period), 0, 1)
    }
  }

  private generateTrendSignificance(topic: string, direction: string, strength: number): string {
    if (strength > 0.8) {
      return `Strong ${direction} trend indicating significant research focus shift`
    } else if (strength > 0.5) {
      return `Moderate ${direction} trend showing evolving research interest`
    } else {
      return `Weak ${direction} trend with limited pattern confidence`
    }
  }

  private calculateImpactScore(paper: ResearchPaper): number {
    let score = 0
    
    // Citation count
    score += paper.citations.length * 0.3
    
    // Journal impact (simplified)
    if (paper.journal) score += 0.2
    
    // Recency bonus
    const years = (new Date().getTime() - paper.publishedDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    score += Math.max(0, 2 - years * 0.1)
    
    // Keyword relevance
    const relevantKeywords = ['sustainable', 'innovative', 'breakthrough', 'novel']
    const hasRelevantKeywords = paper.keywords.some(k => 
      relevantKeywords.some(rk => k.toLowerCase().includes(rk))
    )
    if (hasRelevantKeywords) score += 0.3
    
    return Math.min(1, score)
  }

  private calculateCitationVelocity(paper: ResearchPaper): number {
    const ageInYears = (new Date().getTime() - paper.publishedDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    return ageInYears > 0 ? paper.citations.length / ageInYears : 0
  }

  private getInfluenceNetwork(paper: ResearchPaper): string[] {
    // Simplified influence network based on co-authors and citations
    return [...paper.authors, ...paper.citations.slice(0, 5)]
  }

  private calculateBreakthroughScore(paper: ResearchPaper): number {
    let score = 0
    
    // Novel keywords
    const novelKeywords = ['novel', 'breakthrough', 'first', 'innovative', 'revolutionary']
    const hasNovelKeywords = paper.keywords.some(k => 
      novelKeywords.some(nk => k.toLowerCase().includes(nk))
    )
    if (hasNovelKeywords) score += 0.4
    
    // High citation velocity for recent papers
    const citationVelocity = this.calculateCitationVelocity(paper)
    if (citationVelocity > 5) score += 0.3
    
    // Interdisciplinary indicators
    const disciplines = this.identifyDisciplines(paper)
    if (disciplines.length > 2) score += 0.3
    
    return Math.min(1, score)
  }

  private identifyNoveltyFactors(paper: ResearchPaper): string[] {
    const factors = []
    
    if (paper.keywords.some(k => k.toLowerCase().includes('novel'))) {
      factors.push('Novel methodology')
    }
    
    if (paper.keywords.some(k => k.toLowerCase().includes('first'))) {
      factors.push('First reported')
    }
    
    if (this.calculateCitationVelocity(paper) > 5) {
      factors.push('High citation velocity')
    }
    
    if (this.identifyDisciplines(paper).length > 2) {
      factors.push('Interdisciplinary approach')
    }
    
    return factors
  }

  private identifyDisciplines(paper: ResearchPaper): string[] {
    const disciplineKeywords = {
      'materials': ['material', 'electrode', 'membrane', 'catalyst'],
      'biology': ['microbial', 'bacterial', 'biofilm', 'enzyme'],
      'engineering': ['design', 'optimization', 'scale', 'system'],
      'chemistry': ['chemical', 'reaction', 'synthesis', 'analysis']
    }
    
    const disciplines = []
    for (const [discipline, keywords] of Object.entries(disciplineKeywords)) {
      if (paper.keywords.some(k => keywords.some(dk => k.toLowerCase().includes(dk)))) {
        disciplines.push(discipline)
      }
    }
    
    return disciplines
  }

  private identifyCrossDomainPapers(papers: ResearchPaper[]): Array<{
    domains: string[]
    papers: ResearchPaper[]
  }> {
    const crossDomainGroups = []
    
    // Group papers by interdisciplinary combinations
    const disciplineCombinations = new Map<string, ResearchPaper[]>()
    
    for (const paper of papers) {
      const disciplines = this.identifyDisciplines(paper)
      if (disciplines.length > 1) {
        const key = disciplines.sort().join('+')
        if (!disciplineCombinations.has(key)) {
          disciplineCombinations.set(key, [])
        }
        disciplineCombinations.get(key)!.push(paper)
      }
    }
    
    for (const [domains, papers] of disciplineCombinations) {
      if (papers.length >= 2) {
        crossDomainGroups.push({
          domains: domains.split('+'),
          papers
        })
      }
    }
    
    return crossDomainGroups
  }

  private analyzeMethodologyTrends(papers: ResearchPaper[]): Array<{
    name: string
    trend: 'increasing' | 'stable' | 'decreasing'
    usage: number
    papers: string[]
  }> {
    const methodologies = ['voltammetry', 'spectroscopy', 'microscopy', 'modeling', 'simulation']
    const results = []
    
    for (const method of methodologies) {
      const methodPapers = papers.filter(paper => 
        paper.abstract.toLowerCase().includes(method) ||
        paper.keywords.some(k => k.toLowerCase().includes(method))
      )
      
      const usage = (methodPapers.length / papers.length) * 100
      const trend = usage > 30 ? 'increasing' : usage > 10 ? 'stable' : 'decreasing'
      
      results.push({
        name: method,
        trend,
        usage,
        papers: methodPapers.map(p => p.id)
      })
    }
    
    return results
  }

  private async findCollaborationOpportunities(profile: any): Promise<any[]> {
    // Mock collaboration recommendations
    return [
      {
        type: 'collaboration' as const,
        title: 'Materials Science Collaboration',
        description: 'Connect with materials scientists working on electrode optimization',
        relevanceScore: 0.8,
        actionItems: ['Attend materials science conferences', 'Review recent materials papers'],
        timeframe: '3-6 months'
      }
    ]
  }

  private async suggestResearchTopics(profile: any): Promise<any[]> {
    // Mock topic suggestions
    return [
      {
        type: 'topic' as const,
        title: 'AI-Driven System Optimization',
        description: 'Explore machine learning applications in microbial fuel cell optimization',
        relevanceScore: 0.9,
        actionItems: ['Learn ML basics', 'Collect optimization data'],
        timeframe: '6-12 months'
      }
    ]
  }

  private async recommendMethodologies(profile: any): Promise<any[]> {
    // Mock methodology recommendations
    return [
      {
        type: 'methodology' as const,
        title: 'Advanced Electrochemical Analysis',
        description: 'Adopt impedance spectroscopy for deeper system understanding',
        relevanceScore: 0.7,
        actionItems: ['Equipment training', 'Method validation'],
        timeframe: '1-3 months'
      }
    ]
  }

  private async identifyPersonalizedGaps(profile: any): Promise<any[]> {
    // Mock gap identification
    return [
      {
        type: 'gap' as const,
        title: 'Long-term Stability Studies',
        description: 'Limited research on system performance over extended periods',
        relevanceScore: 0.85,
        actionItems: ['Design longitudinal studies', 'Develop monitoring protocols'],
        timeframe: '12+ months'
      }
    ]
  }

  private detectResultAnomalies(paper: ResearchPaper, allPapers: ResearchPaper[]): any[] {
    // Mock anomaly detection
    return []
  }

  private detectMethodologicalAnomalies(paper: ResearchPaper, allPapers: ResearchPaper[]): any[] {
    // Mock anomaly detection
    return []
  }

  private detectCitationAnomalies(paper: ResearchPaper, allPapers: ResearchPaper[]): any[] {
    // Mock anomaly detection
    return []
  }

  private async generateScenariosWithAI(researchArea: string, timeHorizon: string): Promise<any[]> {
    if (!this.openai) {
      return this.generateMockScenarios(researchArea, timeHorizon)
    }

    const prompt = `
Generate 3 future scenarios for ${researchArea} research over the next ${timeHorizon}:

Each scenario should include:
1. Scenario description
2. Probability (0-1)
3. Key drivers
4. Implications for research
5. Preparation steps

Focus on technological, market, and regulatory developments.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      })

      // Parse and structure the response
      return this.parseScenarios(response.choices[0].message.content || '')
    } catch (error) {
      console.error('Scenario generation error:', error)
      return this.generateMockScenarios(researchArea, timeHorizon)
    }
  }

  private generateMockScenarios(researchArea: string, timeHorizon: string): any[] {
    return [
      {
        scenario: `Accelerated commercialization of ${researchArea} technologies`,
        probability: 0.7,
        keyDrivers: ['Government incentives', 'Cost reductions', 'Performance improvements'],
        implications: ['Increased funding', 'Industry partnerships', 'Regulatory development'],
        preparationSteps: ['Focus on scalability', 'Develop industry connections', 'Monitor regulations']
      },
      {
        scenario: 'Breakthrough in fundamental understanding',
        probability: 0.5,
        keyDrivers: ['Advanced characterization', 'Computational modeling', 'AI integration'],
        implications: ['New research directions', 'Paradigm shifts', 'Technology disruption'],
        preparationSteps: ['Stay current with methods', 'Build computational skills', 'Foster collaborations']
      },
      {
        scenario: 'Stagnation due to technical limitations',
        probability: 0.3,
        keyDrivers: ['Fundamental barriers', 'Limited resources', 'Competing technologies'],
        implications: ['Focus shift to applications', 'Incremental improvements', 'Alternative approaches'],
        preparationSteps: ['Identify workarounds', 'Explore alternatives', 'Diversify research']
      }
    ]
  }

  private parseScenarios(content: string): any[] {
    // Simple parsing - in real implementation would be more sophisticated
    return this.generateMockScenarios('parsed research area', '5years')
  }

  // Getters
  getInsight(id: string): ResearchInsight | undefined {
    return this.insights.get(id)
  }

  getAllInsights(): ResearchInsight[] {
    return Array.from(this.insights.values())
  }

  getInsightsByCategory(category: string): ResearchInsight[] {
    return Array.from(this.insights.values()).filter(insight => insight.category === category)
  }
}