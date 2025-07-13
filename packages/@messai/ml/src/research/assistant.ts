import { ResearchPaper, Hypothesis, ResearchInsight } from '../types'
import { LiteratureProcessor } from './literature-processor'
import { HypothesisGenerator } from './hypothesis-generator'
import { KnowledgeGraph } from './knowledge-graph'
import { InsightEngine } from './insight-engine'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

export interface QueryResult {
  answer: string
  confidence: number
  sources: Array<{
    paperId: string
    title: string
    relevance: number
    excerpt: string
  }>
  relatedQuestions: string[]
  visualizations?: Array<{
    type: 'chart' | 'graph' | 'network'
    data: any
    title: string
  }>
}

export interface ResearchSession {
  id: string
  userId: string
  title: string
  queries: Array<{
    query: string
    result: QueryResult
    timestamp: Date
  }>
  insights: ResearchInsight[]
  hypotheses: Hypothesis[]
  createdAt: Date
  updatedAt: Date
}

export interface AutomatedAnalysisRequest {
  researchArea: string
  analysisType: 'trend_analysis' | 'gap_identification' | 'impact_assessment' | 'comprehensive'
  timeWindow: { start: Date, end: Date }
  depth: 'quick' | 'standard' | 'deep'
  focusAreas?: string[]
}

export interface AutomatedAnalysisResult {
  summary: string
  keyFindings: string[]
  trends: Array<{
    topic: string
    trend: string
    significance: string
  }>
  gaps: Array<{
    area: string
    description: string
    opportunity: string
  }>
  recommendations: Array<{
    type: 'research' | 'collaboration' | 'methodology'
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }>
  visualData: any
  generatedAt: Date
}

export class AIResearchAssistant {
  private openai?: OpenAI
  private literatureProcessor: LiteratureProcessor
  private hypothesisGenerator: HypothesisGenerator
  private knowledgeGraph: KnowledgeGraph
  private insightEngine: InsightEngine
  private sessions: Map<string, ResearchSession> = new Map()

  constructor(
    literatureProcessor: LiteratureProcessor,
    knowledgeGraph: KnowledgeGraph,
    apiKey?: string
  ) {
    this.literatureProcessor = literatureProcessor
    this.knowledgeGraph = knowledgeGraph
    this.hypothesisGenerator = new HypothesisGenerator(literatureProcessor, apiKey)
    this.insightEngine = new InsightEngine(literatureProcessor, knowledgeGraph, apiKey)
    
    if (apiKey) {
      this.openai = new OpenAI({ apiKey })
    }
  }

  async startResearchSession(userId: string, title: string): Promise<ResearchSession> {
    const session: ResearchSession = {
      id: uuidv4(),
      userId,
      title,
      queries: [],
      insights: [],
      hypotheses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.sessions.set(session.id, session)
    console.log(`Started research session: ${title}`)
    
    return session
  }

  async askQuestion(
    sessionId: string,
    query: string,
    context?: {
      previousQueries?: string[]
      focusArea?: string
      preferredSources?: string[]
    }
  ): Promise<QueryResult> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Research session ${sessionId} not found`)
    }

    console.log(`Processing query: "${query}"`)

    // Analyze query intent
    const queryIntent = await this.analyzeQueryIntent(query)
    
    // Search relevant literature
    const relevantPapers = await this.findRelevantPapers(query, context)
    
    // Generate answer based on papers and knowledge graph
    const answer = await this.generateAnswer(query, relevantPapers, queryIntent)
    
    // Extract supporting sources
    const sources = this.extractSources(relevantPapers, query)
    
    // Generate related questions
    const relatedQuestions = await this.generateRelatedQuestions(query, answer, relevantPapers)
    
    // Create visualizations if applicable
    const visualizations = await this.generateVisualizations(query, relevantPapers, queryIntent)

    const result: QueryResult = {
      answer,
      confidence: this.calculateAnswerConfidence(answer, sources),
      sources,
      relatedQuestions,
      visualizations
    }

    // Add to session
    session.queries.push({
      query,
      result,
      timestamp: new Date()
    })
    session.updatedAt = new Date()

    return result
  }

  async generateLiteratureReview(
    topic: string,
    parameters: {
      maxPapers?: number
      timeWindow?: { start: Date, end: Date }
      sections?: string[]
      citationStyle?: 'apa' | 'mla' | 'ieee'
    }
  ): Promise<{
    title: string
    abstract: string
    sections: Array<{
      title: string
      content: string
      references: string[]
    }>
    bibliography: string[]
    wordCount: number
    generatedAt: Date
  }> {
    console.log(`Generating literature review for: ${topic}`)

    // Search for relevant papers
    const papers = await this.literatureProcessor.searchPapers({
      keywords: [topic],
      dateRange: parameters.timeWindow,
      maxResults: parameters.maxPapers || 50
    })

    if (papers.length === 0) {
      throw new Error(`No papers found for topic: ${topic}`)
    }

    // Generate the review
    const review = await this.literatureProcessor.generateLiteratureReview(papers, topic)
    
    // Structure into sections
    const sections = parameters.sections || ['Introduction', 'Main Findings', 'Research Gaps', 'Future Directions']
    const structuredSections = sections.map(sectionTitle => ({
      title: sectionTitle,
      content: this.extractSectionContent(review, sectionTitle),
      references: this.extractSectionReferences(review, sectionTitle, papers)
    }))

    return {
      title: review.title,
      abstract: review.abstract,
      sections: structuredSections,
      bibliography: review.references,
      wordCount: this.calculateWordCount(review),
      generatedAt: new Date()
    }
  }

  async performAutomatedAnalysis(request: AutomatedAnalysisRequest): Promise<AutomatedAnalysisResult> {
    console.log(`Performing automated analysis: ${request.analysisType} for ${request.researchArea}`)

    // Get relevant papers
    const papers = await this.literatureProcessor.searchPapers({
      keywords: [request.researchArea, ...(request.focusAreas || [])],
      dateRange: request.timeWindow,
      maxResults: request.depth === 'deep' ? 200 : request.depth === 'standard' ? 100 : 50
    })

    let summary = ''
    let keyFindings: string[] = []
    let trends: any[] = []
    let gaps: any[] = []
    let recommendations: any[] = []
    let visualData: any = {}

    if (request.analysisType === 'trend_analysis' || request.analysisType === 'comprehensive') {
      const trendAnalysis = await this.insightEngine.analyzeTrends(papers, request.timeWindow)
      trends = trendAnalysis.trends.map(t => ({
        topic: t.topic,
        trend: t.direction,
        significance: t.significance
      }))
      
      summary += `Trend analysis reveals ${trendAnalysis.trends.length} significant patterns. `
      keyFindings.push(`${trendAnalysis.emergingTopics.length} emerging topics identified`)
    }

    if (request.analysisType === 'gap_identification' || request.analysisType === 'comprehensive') {
      const gapInsights = await this.insightEngine.generateInsights({
        analysisDepth: request.depth === 'deep' ? 'deep' : 'medium',
        focusAreas: request.focusAreas || [request.researchArea],
        timeWindow: request.timeWindow,
        minConfidence: 0.6,
        maxInsights: 20
      })
      
      gaps = gapInsights
        .filter(insight => insight.category === 'gap')
        .map(gap => ({
          area: gap.title.replace('Research Gap: ', ''),
          description: gap.insight,
          opportunity: this.generateOpportunityText(gap)
        }))
      
      summary += `${gaps.length} research gaps identified. `
      keyFindings.push(`Key gaps in ${gaps.slice(0, 3).map(g => g.area).join(', ')}`)
    }

    if (request.analysisType === 'impact_assessment' || request.analysisType === 'comprehensive') {
      const impactAnalysis = await this.insightEngine.analyzeImpact(papers)
      
      summary += `Impact analysis of ${papers.length} papers completed. `
      keyFindings.push(`${impactAnalysis.highImpactPapers.length} high-impact papers identified`)
      keyFindings.push(...impactAnalysis.futureImplications.slice(0, 2))
    }

    // Generate recommendations
    recommendations = await this.generateAnalysisRecommendations(papers, trends, gaps)

    // Create visualization data
    visualData = this.createVisualizationData(papers, trends, gaps)

    return {
      summary: summary || `Comprehensive analysis of ${papers.length} papers in ${request.researchArea}`,
      keyFindings,
      trends,
      gaps,
      recommendations,
      visualData,
      generatedAt: new Date()
    }
  }

  async generateHypotheses(
    researchArea: string,
    parameters: {
      minPaperCount?: number
      confidenceThreshold?: number
      maxHypotheses?: number
      focusAreas?: string[]
    }
  ): Promise<{
    hypotheses: Hypothesis[]
    summary: string
    researchGaps: string[]
    experimentalSuggestions: Array<{
      hypothesis: Hypothesis
      experimentalDesign: any
    }>
  }> {
    console.log(`Generating hypotheses for: ${researchArea}`)

    const config = {
      researchArea,
      minPaperCount: parameters.minPaperCount || 10,
      confidenceThreshold: parameters.confidenceThreshold || 0.6,
      maxHypotheses: parameters.maxHypotheses || 10,
      focusAreas: parameters.focusAreas
    }

    const hypotheses = await this.hypothesisGenerator.generateHypotheses(config)
    
    // Generate experimental suggestions for top hypotheses
    const experimentalSuggestions = []
    for (const hypothesis of hypotheses.slice(0, 3)) {
      const experimentalDesign = await this.hypothesisGenerator.generateExperimentalDesign(hypothesis.id)
      experimentalSuggestions.push({
        hypothesis,
        experimentalDesign
      })
    }

    // Extract research gaps from all papers used
    const papers = await this.literatureProcessor.searchPapers({
      keywords: [researchArea],
      maxResults: 50
    })
    
    const researchGaps: string[] = []
    for (const paper of papers) {
      const processed = this.literatureProcessor.getProcessingResult(paper.id)
      if (processed) {
        researchGaps.push(...processed.researchGaps)
      }
    }

    const uniqueGaps = [...new Set(researchGaps)].slice(0, 10)

    return {
      hypotheses,
      summary: `Generated ${hypotheses.length} testable hypotheses based on analysis of ${papers.length} papers`,
      researchGaps: uniqueGaps,
      experimentalSuggestions
    }
  }

  async trackResearchProgress(
    sessionId: string,
    metrics: {
      papersRead: number
      hypothesesGenerated: number
      experimentsPlanned: number
      collaborationsInitiated: number
    }
  ): Promise<{
    progressScore: number
    achievements: string[]
    nextSteps: string[]
    recommendations: string[]
  }> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Research session ${sessionId} not found`)
    }

    const progressScore = this.calculateProgressScore(metrics)
    const achievements = this.identifyAchievements(metrics, session)
    const nextSteps = this.suggestNextSteps(metrics, session)
    const recommendations = this.generateProgressRecommendations(metrics, session)

    return {
      progressScore,
      achievements,
      nextSteps,
      recommendations
    }
  }

  async exportSession(
    sessionId: string,
    format: 'json' | 'markdown' | 'pdf'
  ): Promise<{
    content: string
    metadata: {
      sessionId: string
      title: string
      queryCount: number
      insightCount: number
      hypothesisCount: number
      generatedAt: Date
    }
  }> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Research session ${sessionId} not found`)
    }

    let content = ''
    
    if (format === 'markdown') {
      content = this.generateMarkdownReport(session)
    } else if (format === 'json') {
      content = JSON.stringify(session, null, 2)
    } else {
      // PDF would require additional processing
      content = this.generateMarkdownReport(session)
    }

    return {
      content,
      metadata: {
        sessionId: session.id,
        title: session.title,
        queryCount: session.queries.length,
        insightCount: session.insights.length,
        hypothesisCount: session.hypotheses.length,
        generatedAt: new Date()
      }
    }
  }

  private async analyzeQueryIntent(query: string): Promise<{
    type: 'factual' | 'trend' | 'comparison' | 'recommendation' | 'explanation'
    entities: string[]
    complexity: 'simple' | 'moderate' | 'complex'
  }> {
    // Simple intent analysis - in production would use NLP
    const lowerQuery = query.toLowerCase()
    
    let type: any = 'factual'
    if (lowerQuery.includes('trend') || lowerQuery.includes('over time')) type = 'trend'
    if (lowerQuery.includes('compare') || lowerQuery.includes('versus')) type = 'comparison'
    if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) type = 'recommendation'
    if (lowerQuery.includes('how') || lowerQuery.includes('why')) type = 'explanation'

    const entities = this.extractEntities(query)
    const complexity = query.split(' ').length > 15 ? 'complex' : query.split(' ').length > 8 ? 'moderate' : 'simple'

    return { type, entities, complexity }
  }

  private extractEntities(query: string): string[] {
    // Simple entity extraction
    const scientificTerms = ['electrode', 'microbial', 'fuel cell', 'biofilm', 'current', 'voltage', 'efficiency', 'power']
    return scientificTerms.filter(term => query.toLowerCase().includes(term))
  }

  private async findRelevantPapers(
    query: string,
    context?: any
  ): Promise<ResearchPaper[]> {
    // Use semantic search if available, otherwise keyword search
    if (this.openai) {
      try {
        const results = await this.literatureProcessor.semanticSearch(query, 10)
        return results.papers
      } catch (error) {
        console.warn('Semantic search failed, using keyword search')
      }
    }

    // Fallback to keyword search
    const entities = this.extractEntities(query)
    return await this.literatureProcessor.searchPapers({
      keywords: entities.length > 0 ? entities : [query],
      maxResults: 10
    })
  }

  private async generateAnswer(
    query: string,
    papers: ResearchPaper[],
    intent: any
  ): Promise<string> {
    if (this.openai && papers.length > 0) {
      const paperContext = papers.slice(0, 5).map(paper => 
        `Title: ${paper.title}\nAbstract: ${paper.abstract.substring(0, 300)}...`
      ).join('\n\n')

      const prompt = `
Based on the following research papers, answer this question about microbial electrochemical systems:

Question: ${query}

Research Papers:
${paperContext}

Provide a comprehensive, accurate answer based on the research evidence. Cite specific findings and mention any limitations or uncertainties.
`

      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.3
        })

        return response.choices[0].message.content || 'Unable to generate answer'
      } catch (error) {
        console.error('Answer generation error:', error)
      }
    }

    // Fallback answer generation
    return this.generateFallbackAnswer(query, papers, intent)
  }

  private generateFallbackAnswer(query: string, papers: ResearchPaper[], intent: any): string {
    if (papers.length === 0) {
      return `I couldn't find specific research papers directly addressing "${query}". This might indicate a research gap or the need for broader search terms.`
    }

    const relevantFindings = papers.slice(0, 3).map(paper => 
      `${paper.title} (${paper.publishedDate.getFullYear()}) reports relevant findings in this area.`
    ).join(' ')

    return `Based on ${papers.length} relevant papers, ${relevantFindings} The research suggests this is an active area of investigation with several recent studies providing insights.`
  }

  private extractSources(papers: ResearchPaper[], query: string): Array<{
    paperId: string
    title: string
    relevance: number
    excerpt: string
  }> {
    return papers.slice(0, 5).map(paper => ({
      paperId: paper.id,
      title: paper.title,
      relevance: this.calculateRelevance(paper, query),
      excerpt: paper.abstract.substring(0, 200) + '...'
    }))
  }

  private calculateRelevance(paper: ResearchPaper, query: string): number {
    const queryTerms = query.toLowerCase().split(' ')
    const paperText = `${paper.title} ${paper.abstract}`.toLowerCase()
    
    const matches = queryTerms.filter(term => paperText.includes(term)).length
    return matches / queryTerms.length
  }

  private async generateRelatedQuestions(
    query: string,
    answer: string,
    papers: ResearchPaper[]
  ): Promise<string[]> {
    // Generate follow-up questions based on the query and papers
    const relatedQuestions = [
      `What are the latest developments in ${this.extractMainTopic(query)}?`,
      `How do different methodologies compare for ${this.extractMainTopic(query)}?`,
      `What are the main challenges in ${this.extractMainTopic(query)}?`,
      `What future research directions are suggested for ${this.extractMainTopic(query)}?`
    ]

    return relatedQuestions.slice(0, 3)
  }

  private extractMainTopic(query: string): string {
    const entities = this.extractEntities(query)
    return entities.length > 0 ? entities[0] : 'this research area'
  }

  private async generateVisualizations(
    query: string,
    papers: ResearchPaper[],
    intent: any
  ): Promise<Array<{
    type: 'chart' | 'graph' | 'network'
    data: any
    title: string
  }> | undefined> {
    if (intent.type === 'trend' && papers.length > 5) {
      return [{
        type: 'chart',
        data: this.createTrendData(papers),
        title: 'Publication Trends Over Time'
      }]
    }

    return undefined
  }

  private createTrendData(papers: ResearchPaper[]): any {
    const yearCounts = new Map<number, number>()
    
    for (const paper of papers) {
      const year = paper.publishedDate.getFullYear()
      yearCounts.set(year, (yearCounts.get(year) || 0) + 1)
    }

    return Array.from(yearCounts.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, count]) => ({ year, count }))
  }

  private calculateAnswerConfidence(answer: string, sources: any[]): number {
    let confidence = 0.5 // Base confidence
    
    // More sources increase confidence
    confidence += Math.min(0.3, sources.length * 0.05)
    
    // Longer, more detailed answers suggest higher confidence
    confidence += Math.min(0.2, answer.length / 1000)
    
    return Math.min(0.95, confidence)
  }

  private extractSectionContent(review: any, sectionTitle: string): string {
    // Simple section extraction - in production would be more sophisticated
    return review[sectionTitle.toLowerCase().replace(' ', '')] || `Content for ${sectionTitle} section.`
  }

  private extractSectionReferences(review: any, sectionTitle: string, papers: ResearchPaper[]): string[] {
    // Return relevant paper IDs for the section
    return papers.slice(0, 3).map(p => p.id)
  }

  private calculateWordCount(review: any): number {
    const text = Object.values(review).join(' ')
    return text.split(/\s+/).length
  }

  private generateOpportunityText(gap: ResearchInsight): string {
    return `This gap presents opportunities for ${gap.category === 'gap' ? 'novel research' : 'further investigation'} that could significantly advance the field.`
  }

  private async generateAnalysisRecommendations(papers: ResearchPaper[], trends: any[], gaps: any[]): Promise<any[]> {
    const recommendations = []

    if (trends.length > 0) {
      recommendations.push({
        type: 'research',
        title: 'Focus on Emerging Trends',
        description: `Investigate ${trends[0].topic} which shows ${trends[0].trend} activity`,
        priority: 'high'
      })
    }

    if (gaps.length > 0) {
      recommendations.push({
        type: 'research',
        title: 'Address Key Gaps',
        description: `Priority research needed in ${gaps[0].area}`,
        priority: 'high'
      })
    }

    recommendations.push({
      type: 'collaboration',
      title: 'Interdisciplinary Partnerships',
      description: 'Collaborate across materials science, biology, and engineering disciplines',
      priority: 'medium'
    })

    return recommendations
  }

  private createVisualizationData(papers: ResearchPaper[], trends: any[], gaps: any[]): any {
    return {
      papersByYear: this.createTrendData(papers),
      trendStrengths: trends.map(t => ({ topic: t.topic, strength: Math.random() })),
      gapOpportunities: gaps.map(g => ({ area: g.area, opportunity: Math.random() }))
    }
  }

  private calculateProgressScore(metrics: any): number {
    const weights = {
      papersRead: 0.3,
      hypothesesGenerated: 0.3,
      experimentsPlanned: 0.2,
      collaborationsInitiated: 0.2
    }

    let score = 0
    score += Math.min(1, metrics.papersRead / 50) * weights.papersRead
    score += Math.min(1, metrics.hypothesesGenerated / 10) * weights.hypothesesGenerated
    score += Math.min(1, metrics.experimentsPlanned / 5) * weights.experimentsPlanned
    score += Math.min(1, metrics.collaborationsInitiated / 3) * weights.collaborationsInitiated

    return score
  }

  private identifyAchievements(metrics: any, session: ResearchSession): string[] {
    const achievements = []

    if (metrics.papersRead > 10) achievements.push('Literature Review Milestone')
    if (metrics.hypothesesGenerated > 3) achievements.push('Hypothesis Generation Success')
    if (session.queries.length > 20) achievements.push('Active Research Engagement')
    if (metrics.experimentsPlanned > 2) achievements.push('Experimental Planning Progress')

    return achievements
  }

  private suggestNextSteps(metrics: any, session: ResearchSession): string[] {
    const steps = []

    if (metrics.papersRead < 20) steps.push('Continue literature review')
    if (metrics.hypothesesGenerated === 0) steps.push('Generate testable hypotheses')
    if (metrics.experimentsPlanned < 2) steps.push('Plan experimental validation')
    if (metrics.collaborationsInitiated === 0) steps.push('Identify potential collaborators')

    return steps
  }

  private generateProgressRecommendations(metrics: any, session: ResearchSession): string[] {
    return [
      'Focus on high-impact journals for literature review',
      'Validate hypotheses with preliminary experiments',
      'Document insights for future reference',
      'Consider interdisciplinary approaches'
    ]
  }

  private generateMarkdownReport(session: ResearchSession): string {
    let markdown = `# Research Session: ${session.title}\n\n`
    markdown += `**Created:** ${session.createdAt.toLocaleDateString()}\n`
    markdown += `**Last Updated:** ${session.updatedAt.toLocaleDateString()}\n\n`

    markdown += `## Query History (${session.queries.length})\n\n`
    for (const query of session.queries) {
      markdown += `### ${query.query}\n\n`
      markdown += `**Answer:** ${query.result.answer}\n\n`
      markdown += `**Confidence:** ${(query.result.confidence * 100).toFixed(1)}%\n\n`
      
      if (query.result.sources.length > 0) {
        markdown += `**Sources:**\n`
        for (const source of query.result.sources) {
          markdown += `- ${source.title} (${(source.relevance * 100).toFixed(1)}% relevance)\n`
        }
        markdown += '\n'
      }
    }

    if (session.insights.length > 0) {
      markdown += `## Generated Insights (${session.insights.length})\n\n`
      for (const insight of session.insights) {
        markdown += `### ${insight.title}\n\n`
        markdown += `${insight.insight}\n\n`
        markdown += `**Category:** ${insight.category} | **Confidence:** ${(insight.confidence * 100).toFixed(1)}%\n\n`
      }
    }

    if (session.hypotheses.length > 0) {
      markdown += `## Generated Hypotheses (${session.hypotheses.length})\n\n`
      for (const hypothesis of session.hypotheses) {
        markdown += `### ${hypothesis.title}\n\n`
        markdown += `${hypothesis.description}\n\n`
        markdown += `**Confidence:** ${(hypothesis.confidence * 100).toFixed(1)}%\n`
        markdown += `**Status:** ${hypothesis.status}\n\n`
      }
    }

    return markdown
  }

  // Getters
  getSession(sessionId: string): ResearchSession | undefined {
    return this.sessions.get(sessionId)
  }

  getUserSessions(userId: string): ResearchSession[] {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId)
  }

  getAllSessions(): ResearchSession[] {
    return Array.from(this.sessions.values())
  }
}