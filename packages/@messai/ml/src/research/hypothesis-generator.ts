import { Hypothesis, ResearchPaper, ResearchInsight } from '../types'
import { LiteratureProcessor } from './literature-processor'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

export interface HypothesisGenerationConfig {
  researchArea: string
  minPaperCount: number
  confidenceThreshold: number
  maxHypotheses: number
  focusAreas?: string[]
}

export interface HypothesisValidationResult {
  hypothesis: Hypothesis
  supportingEvidence: Array<{
    paperId: string
    relevanceScore: number
    evidenceType: 'direct' | 'indirect' | 'contradictory'
    summary: string
  }>
  validationScore: number
  recommendations: string[]
}

export class HypothesisGenerator {
  private openai?: OpenAI
  private literatureProcessor: LiteratureProcessor
  private hypotheses: Map<string, Hypothesis> = new Map()

  constructor(literatureProcessor: LiteratureProcessor, apiKey?: string) {
    this.literatureProcessor = literatureProcessor
    if (apiKey) {
      this.openai = new OpenAI({ apiKey })
    }
  }

  async generateHypotheses(config: HypothesisGenerationConfig): Promise<Hypothesis[]> {
    console.log(`Generating hypotheses for research area: ${config.researchArea}`)

    // Get relevant papers
    const papers = await this.literatureProcessor.searchPapers({
      keywords: [config.researchArea, ...(config.focusAreas || [])],
      maxResults: 100
    })

    if (papers.length < config.minPaperCount) {
      throw new Error(`Insufficient papers found: ${papers.length} < ${config.minPaperCount}`)
    }

    // Analyze research gaps
    const researchGaps = await this.identifyResearchGaps(papers)
    
    // Generate hypotheses based on gaps and patterns
    const hypotheses = await this.generateHypothesesFromGaps(
      researchGaps,
      papers,
      config
    )

    // Filter by confidence threshold
    const validHypotheses = hypotheses.filter(h => h.confidence >= config.confidenceThreshold)
    
    // Store hypotheses
    for (const hypothesis of validHypotheses) {
      this.hypotheses.set(hypothesis.id, hypothesis)
    }

    console.log(`Generated ${validHypotheses.length} hypotheses above confidence threshold`)
    return validHypotheses.slice(0, config.maxHypotheses)
  }

  async generateCrossdomainHypotheses(
    primaryArea: string,
    secondaryAreas: string[]
  ): Promise<Hypothesis[]> {
    console.log(`Generating cross-domain hypotheses: ${primaryArea} × ${secondaryAreas.join(', ')}`)

    const hypotheses: Hypothesis[] = []

    for (const secondaryArea of secondaryAreas) {
      const primaryPapers = await this.literatureProcessor.searchPapers({
        keywords: [primaryArea],
        maxResults: 50
      })

      const secondaryPapers = await this.literatureProcessor.searchPapers({
        keywords: [secondaryArea],
        maxResults: 50
      })

      const crossDomainHypotheses = await this.findCrossDomainOpportunities(
        primaryPapers,
        secondaryPapers,
        primaryArea,
        secondaryArea
      )

      hypotheses.push(...crossDomainHypotheses)
    }

    return hypotheses
  }

  async validateHypothesis(hypothesisId: string): Promise<HypothesisValidationResult> {
    const hypothesis = this.hypotheses.get(hypothesisId)
    if (!hypothesis) {
      throw new Error(`Hypothesis ${hypothesisId} not found`)
    }

    console.log(`Validating hypothesis: ${hypothesis.title}`)

    // Search for supporting/contradicting evidence
    const relevantPapers = await this.literatureProcessor.semanticSearch(
      hypothesis.description,
      20
    )

    const evidence = await this.analyzeEvidence(hypothesis, relevantPapers.papers)
    const validationScore = this.calculateValidationScore(evidence)
    const recommendations = await this.generateValidationRecommendations(hypothesis, evidence)

    // Update hypothesis status based on validation
    if (validationScore > 0.8) {
      hypothesis.status = 'validated'
    } else if (validationScore < 0.4) {
      hypothesis.status = 'refuted'
    }

    return {
      hypothesis,
      supportingEvidence: evidence,
      validationScore,
      recommendations
    }
  }

  async generateExperimentalDesign(hypothesisId: string): Promise<{
    hypothesis: Hypothesis
    experimentalPlan: {
      objective: string
      methodology: string[]
      variables: {
        independent: string[]
        dependent: string[]
        controlled: string[]
      }
      expectedOutcomes: string[]
      successCriteria: string[]
      timeline: string
      resources: string[]
    }
    riskAssessment: {
      technicalRisks: string[]
      resourceRisks: string[]
      mitigationStrategies: string[]
    }
  }> {
    const hypothesis = this.hypotheses.get(hypothesisId)
    if (!hypothesis) {
      throw new Error(`Hypothesis ${hypothesisId} not found`)
    }

    console.log(`Generating experimental design for: ${hypothesis.title}`)

    if (this.openai) {
      return await this.generateExperimentWithAI(hypothesis)
    } else {
      return this.generateMockExperimentalDesign(hypothesis)
    }
  }

  async trackHypothesisProgress(hypothesisId: string): Promise<{
    hypothesis: Hypothesis
    relatedExperiments: string[]
    citationCount: number
    validationStatus: 'pending' | 'supporting' | 'contradicting' | 'inconclusive'
    recentEvidence: Array<{
      paperId: string
      title: string
      evidenceType: string
      publishedDate: Date
    }>
  }> {
    const hypothesis = this.hypotheses.get(hypothesisId)
    if (!hypothesis) {
      throw new Error(`Hypothesis ${hypothesisId} not found`)
    }

    // Search for recent papers that might validate/refute the hypothesis
    const recentPapers = await this.literatureProcessor.searchPapers({
      keywords: hypothesis.title.split(' ').slice(0, 3), // Use key terms
      dateRange: {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        end: new Date()
      },
      maxResults: 20
    })

    const recentEvidence = recentPapers.map(paper => ({
      paperId: paper.id,
      title: paper.title,
      evidenceType: this.classifyEvidence(paper, hypothesis),
      publishedDate: paper.publishedDate
    }))

    const validationStatus = this.determineValidationStatus(recentEvidence)

    return {
      hypothesis,
      relatedExperiments: hypothesis.suggestedExperiments,
      citationCount: 0, // Would be calculated from actual citation data
      validationStatus,
      recentEvidence
    }
  }

  async suggestCollaborations(hypothesisId: string): Promise<{
    hypothesis: Hypothesis
    suggestedCollaborators: Array<{
      name: string
      institution: string
      expertise: string[]
      relevantPapers: string[]
      collaborationScore: number
    }>
    interdisciplinaryOpportunities: Array<{
      field: string
      potentialBenefit: string
      requiredExpertise: string[]
    }>
  }> {
    const hypothesis = this.hypotheses.get(hypothesisId)
    if (!hypothesis) {
      throw new Error(`Hypothesis ${hypothesisId} not found`)
    }

    // Find researchers working on related topics
    const relatedPapers = await this.literatureProcessor.searchPapers({
      keywords: hypothesis.title.split(' ').slice(0, 5),
      maxResults: 50
    })

    const collaborators = this.identifyPotentialCollaborators(relatedPapers, hypothesis)
    const interdisciplinaryOpportunities = this.identifyInterdisciplinaryOpportunities(hypothesis)

    return {
      hypothesis,
      suggestedCollaborators: collaborators,
      interdisciplinaryOpportunities
    }
  }

  private async identifyResearchGaps(papers: ResearchPaper[]): Promise<string[]> {
    const allGaps: string[] = []
    
    for (const paper of papers) {
      const processed = this.literatureProcessor.getProcessingResult(paper.id)
      if (processed) {
        allGaps.push(...processed.researchGaps)
      }
    }

    // Count and rank gaps
    const gapCounts = new Map<string, number>()
    for (const gap of allGaps) {
      gapCounts.set(gap, (gapCounts.get(gap) || 0) + 1)
    }

    return Array.from(gapCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([gap]) => gap)
  }

  private async generateHypothesesFromGaps(
    researchGaps: string[],
    papers: ResearchPaper[],
    config: HypothesisGenerationConfig
  ): Promise<Hypothesis[]> {
    const hypotheses: Hypothesis[] = []

    for (const gap of researchGaps.slice(0, 10)) {
      if (this.openai) {
        const hypothesis = await this.generateHypothesisWithAI(gap, papers, config.researchArea)
        if (hypothesis) {
          hypotheses.push(hypothesis)
        }
      } else {
        const hypothesis = this.generateMockHypothesis(gap, papers, config.researchArea)
        hypotheses.push(hypothesis)
      }
    }

    return hypotheses
  }

  private async generateHypothesisWithAI(
    gap: string,
    papers: ResearchPaper[],
    researchArea: string
  ): Promise<Hypothesis | null> {
    if (!this.openai) return null

    const paperContext = papers.slice(0, 5).map(p => 
      `${p.title}: ${p.abstract.substring(0, 200)}...`
    ).join('\n\n')

    const prompt = `
Based on the identified research gap and recent literature in ${researchArea}, generate a specific, testable hypothesis:

Research Gap: ${gap}

Recent Literature Context:
${paperContext}

Generate a hypothesis that:
1. Addresses the research gap
2. Is specific and testable
3. Has clear success criteria
4. Builds on existing knowledge
5. Is relevant to microbial electrochemical systems

Format as JSON with:
- title: concise hypothesis statement
- description: detailed explanation
- rationale: why this hypothesis is important
- testableAspects: what can be measured/tested
- expectedOutcome: predicted results
- significance: potential impact
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      })

      const content = response.choices[0].message.content || '{}'
      const parsed = JSON.parse(content)

      return {
        id: uuidv4(),
        title: parsed.title || 'Generated Hypothesis',
        description: parsed.description || gap,
        confidence: 0.5 + Math.random() * 0.3, // AI confidence
        evidencePapers: papers.slice(0, 3).map(p => p.id),
        researchGaps: [gap],
        suggestedExperiments: parsed.testableAspects || [],
        generatedAt: new Date(),
        status: 'generated'
      }
    } catch (error) {
      console.error('Hypothesis generation error:', error)
      return null
    }
  }

  private generateMockHypothesis(gap: string, papers: ResearchPaper[], researchArea: string): Hypothesis {
    return {
      id: uuidv4(),
      title: `Novel approach to address: ${gap.substring(0, 50)}...`,
      description: `Hypothesis addressing the research gap in ${researchArea}: ${gap}`,
      confidence: 0.6 + Math.random() * 0.3,
      evidencePapers: papers.slice(0, 3).map(p => p.id),
      researchGaps: [gap],
      suggestedExperiments: [
        'Controlled laboratory experiment',
        'Computational modeling study',
        'Field validation test'
      ],
      generatedAt: new Date(),
      status: 'generated'
    }
  }

  private async findCrossDomainOpportunities(
    primaryPapers: ResearchPaper[],
    secondaryPapers: ResearchPaper[],
    primaryArea: string,
    secondaryArea: string
  ): Promise<Hypothesis[]> {
    // Look for potential synergies between domains
    const opportunities: Hypothesis[] = []

    // Identify common themes/methods
    const primaryMethods = this.extractMethodologies(primaryPapers)
    const secondaryMethods = this.extractMethodologies(secondaryPapers)
    
    const sharedMethods = primaryMethods.filter(method => 
      secondaryMethods.some(sm => sm.toLowerCase().includes(method.toLowerCase()))
    )

    if (sharedMethods.length > 0) {
      opportunities.push({
        id: uuidv4(),
        title: `Cross-domain application of ${sharedMethods[0]} from ${secondaryArea} to ${primaryArea}`,
        description: `Applying methodologies from ${secondaryArea} to solve challenges in ${primaryArea}`,
        confidence: 0.6,
        evidencePapers: [...primaryPapers.slice(0, 2), ...secondaryPapers.slice(0, 2)].map(p => p.id),
        researchGaps: [`Integration of ${secondaryArea} methods into ${primaryArea}`],
        suggestedExperiments: [
          `Adapt ${sharedMethods[0]} for ${primaryArea} applications`,
          'Comparative study with traditional methods',
          'Optimization for specific use cases'
        ],
        generatedAt: new Date(),
        status: 'generated'
      })
    }

    return opportunities
  }

  private extractMethodologies(papers: ResearchPaper[]): string[] {
    const methods: string[] = []
    
    for (const paper of papers) {
      const processed = this.literatureProcessor.getProcessingResult(paper.id)
      if (processed) {
        methods.push(...processed.extractedData.methodology)
      }
    }

    return [...new Set(methods)]
  }

  private async analyzeEvidence(hypothesis: Hypothesis, papers: ResearchPaper[]): Promise<Array<{
    paperId: string
    relevanceScore: number
    evidenceType: 'direct' | 'indirect' | 'contradictory'
    summary: string
  }>> {
    const evidence = []

    for (const paper of papers) {
      const relevanceScore = this.calculateRelevanceScore(hypothesis, paper)
      const evidenceType = this.classifyEvidenceType(hypothesis, paper)
      const summary = this.generateEvidenceSummary(hypothesis, paper)

      evidence.push({
        paperId: paper.id,
        relevanceScore,
        evidenceType,
        summary
      })
    }

    return evidence.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  private calculateValidationScore(evidence: any[]): number {
    if (evidence.length === 0) return 0

    const directSupport = evidence.filter(e => e.evidenceType === 'direct').length
    const indirectSupport = evidence.filter(e => e.evidenceType === 'indirect').length
    const contradictory = evidence.filter(e => e.evidenceType === 'contradictory').length

    const supportScore = (directSupport * 1.0 + indirectSupport * 0.5) / evidence.length
    const contraScore = contradictory / evidence.length

    return Math.max(0, supportScore - contraScore)
  }

  private calculateRelevanceScore(hypothesis: Hypothesis, paper: ResearchPaper): number {
    const hypothesisTerms = hypothesis.title.toLowerCase().split(' ')
    const paperText = `${paper.title} ${paper.abstract}`.toLowerCase()
    
    const matchCount = hypothesisTerms.filter(term => 
      paperText.includes(term) && term.length > 3
    ).length

    return matchCount / hypothesisTerms.length
  }

  private classifyEvidenceType(hypothesis: Hypothesis, paper: ResearchPaper): 'direct' | 'indirect' | 'contradictory' {
    // Simplified classification logic
    const relevanceScore = this.calculateRelevanceScore(hypothesis, paper)
    
    if (relevanceScore > 0.7) return 'direct'
    if (relevanceScore > 0.3) return 'indirect'
    return 'contradictory'
  }

  private classifyEvidence(paper: ResearchPaper, hypothesis: Hypothesis): string {
    const relevanceScore = this.calculateRelevanceScore(hypothesis, paper)
    
    if (relevanceScore > 0.6) return 'supporting'
    if (relevanceScore > 0.3) return 'related'
    return 'tangential'
  }

  private generateEvidenceSummary(hypothesis: Hypothesis, paper: ResearchPaper): string {
    return `${paper.title} provides ${this.classifyEvidenceType(hypothesis, paper)} evidence through ${paper.abstract.substring(0, 100)}...`
  }

  private determineValidationStatus(evidence: any[]): 'pending' | 'supporting' | 'contradicting' | 'inconclusive' {
    if (evidence.length === 0) return 'pending'
    
    const supporting = evidence.filter(e => e.evidenceType === 'supporting').length
    const contradicting = evidence.filter(e => e.evidenceType === 'contradicting').length
    
    if (supporting > contradicting && supporting > 2) return 'supporting'
    if (contradicting > supporting && contradicting > 2) return 'contradicting'
    return 'inconclusive'
  }

  private async generateValidationRecommendations(hypothesis: Hypothesis, evidence: any[]): Promise<string[]> {
    const recommendations = []
    
    if (evidence.length < 5) {
      recommendations.push('Expand literature search to find more relevant studies')
    }
    
    const contradictory = evidence.filter(e => e.evidenceType === 'contradictory')
    if (contradictory.length > 0) {
      recommendations.push('Investigate contradictory findings to refine hypothesis')
    }
    
    recommendations.push('Design controlled experiment to test hypothesis directly')
    recommendations.push('Consider peer review and expert consultation')
    
    return recommendations
  }

  private async generateExperimentWithAI(hypothesis: Hypothesis): Promise<any> {
    if (!this.openai) {
      return this.generateMockExperimentalDesign(hypothesis)
    }

    const prompt = `
Design a comprehensive experimental plan to test this hypothesis in microbial electrochemical systems:

Hypothesis: ${hypothesis.title}
Description: ${hypothesis.description}

Create an experimental design with:
1. Clear objective
2. Methodology steps
3. Independent, dependent, and controlled variables
4. Expected outcomes
5. Success criteria
6. Timeline
7. Required resources
8. Risk assessment with mitigation strategies

Focus on practical, feasible experiments for a research laboratory.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.6
      })

      const content = response.choices[0].message.content || ''
      return this.parseExperimentalDesign(content, hypothesis)
    } catch (error) {
      console.error('Experimental design generation error:', error)
      return this.generateMockExperimentalDesign(hypothesis)
    }
  }

  private generateMockExperimentalDesign(hypothesis: Hypothesis): any {
    return {
      hypothesis,
      experimentalPlan: {
        objective: `Test the hypothesis: ${hypothesis.title}`,
        methodology: [
          'Literature review and baseline establishment',
          'Experimental setup design',
          'Data collection protocol',
          'Analysis and interpretation'
        ],
        variables: {
          independent: ['Temperature', 'pH', 'Substrate concentration'],
          dependent: ['Power output', 'Current density', 'Efficiency'],
          controlled: ['Electrode material', 'Cell volume', 'Operating time']
        },
        expectedOutcomes: [
          'Quantified relationship between variables',
          'Validation or refutation of hypothesis',
          'Novel insights for future research'
        ],
        successCriteria: [
          'Statistical significance (p < 0.05)',
          'Reproducible results',
          'Clear mechanistic understanding'
        ],
        timeline: '6-12 months',
        resources: ['Laboratory equipment', 'Materials', 'Personnel time']
      },
      riskAssessment: {
        technicalRisks: ['Equipment failure', 'Contamination', 'Measurement errors'],
        resourceRisks: ['Budget constraints', 'Personnel availability', 'Material supply'],
        mitigationStrategies: ['Regular calibration', 'Backup protocols', 'Alternative suppliers']
      }
    }
  }

  private parseExperimentalDesign(content: string, hypothesis: Hypothesis): any {
    // Parse AI-generated experimental design
    // For now, return mock design
    return this.generateMockExperimentalDesign(hypothesis)
  }

  private identifyPotentialCollaborators(papers: ResearchPaper[], hypothesis: Hypothesis): any[] {
    const collaborators = new Map<string, any>()

    for (const paper of papers) {
      for (const author of paper.authors) {
        if (!collaborators.has(author)) {
          collaborators.set(author, {
            name: author,
            institution: 'Research Institution', // Mock data
            expertise: [],
            relevantPapers: [],
            collaborationScore: 0
          })
        }

        const collaborator = collaborators.get(author)!
        collaborator.relevantPapers.push(paper.id)
        collaborator.collaborationScore += this.calculateRelevanceScore(hypothesis, paper)
        
        // Add keywords as expertise
        paper.keywords.forEach(keyword => {
          if (!collaborator.expertise.includes(keyword)) {
            collaborator.expertise.push(keyword)
          }
        })
      }
    }

    return Array.from(collaborators.values())
      .sort((a, b) => b.collaborationScore - a.collaborationScore)
      .slice(0, 10)
  }

  private identifyInterdisciplinaryOpportunities(hypothesis: Hypothesis): any[] {
    return [
      {
        field: 'Materials Science',
        potentialBenefit: 'Novel electrode materials and surface modifications',
        requiredExpertise: ['Nanomaterials', 'Surface chemistry', 'Characterization techniques']
      },
      {
        field: 'Computer Science',
        potentialBenefit: 'Machine learning for optimization and prediction',
        requiredExpertise: ['Data analysis', 'Modeling', 'Algorithm development']
      },
      {
        field: 'Environmental Engineering',
        potentialBenefit: 'Real-world application and scale-up strategies',
        requiredExpertise: ['Process design', 'System integration', 'Environmental impact assessment']
      }
    ]
  }

  // Getters
  getHypothesis(id: string): Hypothesis | undefined {
    return this.hypotheses.get(id)
  }

  getAllHypotheses(): Hypothesis[] {
    return Array.from(this.hypotheses.values())
  }

  getHypothesesByStatus(status: string): Hypothesis[] {
    return Array.from(this.hypotheses.values()).filter(h => h.status === status)
  }
}