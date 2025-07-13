import { ResearchPaper } from '../types'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

export interface ProcessingResult {
  paper: ResearchPaper
  extractedData: {
    methodology: string[]
    results: Record<string, any>
    materials: string[]
    conditions: Record<string, any>
    performance: Record<string, number>
  }
  keyInsights: string[]
  researchGaps: string[]
  futureDirections: string[]
}

export interface LiteratureQuery {
  keywords: string[]
  dateRange?: { start: Date, end: Date }
  authors?: string[]
  journals?: string[]
  minCitations?: number
  maxResults?: number
}

export class LiteratureProcessor {
  private openai: OpenAI
  private papers: Map<string, ResearchPaper> = new Map()
  private processedResults: Map<string, ProcessingResult> = new Map()

  constructor(apiKey?: string) {
    if (apiKey) {
      this.openai = new OpenAI({ apiKey })
    } else {
      console.warn('OpenAI API key not provided, using mock responses')
    }
  }

  async processPaper(paper: ResearchPaper): Promise<ProcessingResult> {
    console.log(`Processing paper: ${paper.title}`)

    paper.processingStatus = 'processing'
    this.papers.set(paper.id, paper)

    try {
      const result = await this.extractPaperData(paper)
      
      // Generate embeddings for semantic search
      if (this.openai) {
        const embedding = await this.generateEmbedding(paper.abstract)
        paper.embedding = embedding
      }

      paper.processingStatus = 'completed'
      this.papers.set(paper.id, paper)
      this.processedResults.set(paper.id, result)

      console.log(`Successfully processed paper: ${paper.title}`)
      return result
    } catch (error) {
      paper.processingStatus = 'failed'
      this.papers.set(paper.id, paper)
      console.error(`Failed to process paper ${paper.title}:`, error)
      throw error
    }
  }

  async batchProcessPapers(papers: ResearchPaper[]): Promise<ProcessingResult[]> {
    console.log(`Starting batch processing of ${papers.length} papers`)
    
    const results: ProcessingResult[] = []
    const batchSize = 5 // Process in batches to avoid rate limits
    
    for (let i = 0; i < papers.length; i += batchSize) {
      const batch = papers.slice(i, i + batchSize)
      const batchPromises = batch.map(paper => this.processPaper(paper))
      
      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
        
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(papers.length / batchSize)}`)
        
        // Add delay between batches
        if (i + batchSize < papers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Batch processing failed at batch ${Math.floor(i / batchSize) + 1}:`, error)
        // Continue with next batch
      }
    }

    console.log(`Batch processing completed: ${results.length}/${papers.length} papers processed`)
    return results
  }

  async searchPapers(query: LiteratureQuery): Promise<ResearchPaper[]> {
    const papers = Array.from(this.papers.values())
    
    return papers.filter(paper => {
      // Filter by keywords
      if (query.keywords.length > 0) {
        const paperText = `${paper.title} ${paper.abstract} ${paper.keywords.join(' ')}`.toLowerCase()
        const hasKeywords = query.keywords.some(keyword => 
          paperText.includes(keyword.toLowerCase())
        )
        if (!hasKeywords) return false
      }

      // Filter by date range
      if (query.dateRange) {
        if (paper.publishedDate < query.dateRange.start || paper.publishedDate > query.dateRange.end) {
          return false
        }
      }

      // Filter by authors
      if (query.authors && query.authors.length > 0) {
        const hasAuthor = query.authors.some(author => 
          paper.authors.some(paperAuthor => 
            paperAuthor.toLowerCase().includes(author.toLowerCase())
          )
        )
        if (!hasAuthor) return false
      }

      // Filter by journals
      if (query.journals && query.journals.length > 0 && paper.journal) {
        const inJournal = query.journals.some(journal => 
          paper.journal!.toLowerCase().includes(journal.toLowerCase())
        )
        if (!inJournal) return false
      }

      return true
    }).slice(0, query.maxResults || 100)
  }

  async semanticSearch(queryText: string, topK: number = 10): Promise<{
    papers: ResearchPaper[]
    similarities: number[]
  }> {
    if (!this.openai) {
      throw new Error('OpenAI API required for semantic search')
    }

    const queryEmbedding = await this.generateEmbedding(queryText)
    const papersWithEmbeddings = Array.from(this.papers.values()).filter(p => p.embedding)

    const similarities = papersWithEmbeddings.map(paper => 
      this.cosineSimilarity(queryEmbedding, paper.embedding!)
    )

    // Sort by similarity
    const sortedIndices = similarities
      .map((sim, idx) => ({ sim, idx }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, topK)

    const resultPapers = sortedIndices.map(item => papersWithEmbeddings[item.idx])
    const resultSimilarities = sortedIndices.map(item => item.sim)

    return {
      papers: resultPapers,
      similarities: resultSimilarities
    }
  }

  async extractResearchTrends(papers: ResearchPaper[], timeWindow: 'yearly' | 'monthly' = 'yearly'): Promise<{
    trends: Array<{
      period: string
      keywords: string[]
      paperCount: number
      avgPerformance: Record<string, number>
    }>
    emergingTopics: string[]
    decliningTopics: string[]
  }> {
    const periodData = new Map<string, {
      papers: ResearchPaper[]
      keywords: Map<string, number>
      performance: Record<string, number[]>
    }>()

    // Group papers by time period
    for (const paper of papers) {
      const period = timeWindow === 'yearly' 
        ? paper.publishedDate.getFullYear().toString()
        : `${paper.publishedDate.getFullYear()}-${String(paper.publishedDate.getMonth() + 1).padStart(2, '0')}`

      if (!periodData.has(period)) {
        periodData.set(period, {
          papers: [],
          keywords: new Map(),
          performance: {}
        })
      }

      const data = periodData.get(period)!
      data.papers.push(paper)

      // Count keywords
      for (const keyword of paper.keywords) {
        data.keywords.set(keyword, (data.keywords.get(keyword) || 0) + 1)
      }

      // Extract performance data from processed results
      const processed = this.processedResults.get(paper.id)
      if (processed) {
        for (const [metric, value] of Object.entries(processed.extractedData.performance)) {
          if (!data.performance[metric]) {
            data.performance[metric] = []
          }
          data.performance[metric].push(value)
        }
      }
    }

    // Calculate trends
    const trends = Array.from(periodData.entries()).map(([period, data]) => {
      const topKeywords = Array.from(data.keywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword]) => keyword)

      const avgPerformance: Record<string, number> = {}
      for (const [metric, values] of Object.entries(data.performance)) {
        if (values.length > 0) {
          avgPerformance[metric] = values.reduce((sum, val) => sum + val, 0) / values.length
        }
      }

      return {
        period,
        keywords: topKeywords,
        paperCount: data.papers.length,
        avgPerformance
      }
    }).sort((a, b) => a.period.localeCompare(b.period))

    // Identify emerging and declining topics
    const emergingTopics = this.identifyEmergingTopics(trends)
    const decliningTopics = this.identifyDecliningTopics(trends)

    return {
      trends,
      emergingTopics,
      decliningTopics
    }
  }

  async generateLiteratureReview(papers: ResearchPaper[], topic: string): Promise<{
    title: string
    abstract: string
    introduction: string
    mainFindings: string
    researchGaps: string
    futureDirections: string
    references: string[]
  }> {
    if (!this.openai) {
      return this.generateMockLiteratureReview(papers, topic)
    }

    const paperSummaries = papers.map(paper => {
      const processed = this.processedResults.get(paper.id)
      return `${paper.title} (${paper.publishedDate.getFullYear()}): ${paper.abstract}${
        processed ? `\nKey insights: ${processed.keyInsights.join('; ')}` : ''
      }`
    }).join('\n\n')

    const prompt = `
Write a comprehensive literature review on "${topic}" based on the following research papers:

${paperSummaries}

Structure the review with:
1. Title
2. Abstract (200 words)
3. Introduction (explaining the importance of the topic)
4. Main Findings (synthesizing key results across papers)
5. Research Gaps (identifying areas needing more research)
6. Future Directions (suggesting next steps)

Focus on microbial electrochemical systems, bioelectrochemistry, and sustainable energy applications.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.7
      })

      const content = response.choices[0].message.content || ''
      return this.parseLiteratureReview(content, papers)
    } catch (error) {
      console.error('OpenAI API error:', error)
      return this.generateMockLiteratureReview(papers, topic)
    }
  }

  private async extractPaperData(paper: ResearchPaper): Promise<ProcessingResult> {
    if (!this.openai) {
      return this.generateMockProcessingResult(paper)
    }

    const prompt = `
Analyze this research paper on microbial electrochemical systems and extract structured data:

Title: ${paper.title}
Abstract: ${paper.abstract}
${paper.content ? `Content: ${paper.content.substring(0, 2000)}...` : ''}

Extract:
1. Methodology (experimental methods used)
2. Results (key numerical results and performance metrics)
3. Materials (electrodes, microorganisms, substrates)
4. Operating conditions (temperature, pH, voltage, etc.)
5. Performance metrics (power density, coulombic efficiency, etc.)
6. Key insights and novel findings
7. Research gaps identified
8. Future research directions suggested

Format as JSON with clear categories.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3
      })

      const content = response.choices[0].message.content || '{}'
      return this.parseProcessingResult(content, paper)
    } catch (error) {
      console.error('OpenAI API error:', error)
      return this.generateMockProcessingResult(paper)
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      // Return mock embedding
      return Array(1536).fill(0).map(() => Math.random() - 0.5)
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Embedding generation error:', error)
      return Array(1536).fill(0).map(() => Math.random() - 0.5)
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  private identifyEmergingTopics(trends: any[]): string[] {
    if (trends.length < 2) return []

    const recent = trends.slice(-2)
    const earlier = trends.slice(0, -1)

    const recentKeywords = new Set(recent.flatMap(t => t.keywords))
    const earlierKeywords = new Set(earlier.flatMap(t => t.keywords))

    return Array.from(recentKeywords).filter(keyword => !earlierKeywords.has(keyword))
  }

  private identifyDecliningTopics(trends: any[]): string[] {
    if (trends.length < 2) return []

    const recent = trends.slice(-2)
    const earlier = trends.slice(0, -1)

    const recentKeywords = new Set(recent.flatMap(t => t.keywords))
    const earlierKeywords = new Set(earlier.flatMap(t => t.keywords))

    return Array.from(earlierKeywords).filter(keyword => !recentKeywords.has(keyword))
  }

  private parseProcessingResult(content: string, paper: ResearchPaper): ProcessingResult {
    try {
      const parsed = JSON.parse(content)
      return {
        paper,
        extractedData: {
          methodology: parsed.methodology || [],
          results: parsed.results || {},
          materials: parsed.materials || [],
          conditions: parsed.conditions || {},
          performance: parsed.performance || {}
        },
        keyInsights: parsed.keyInsights || [],
        researchGaps: parsed.researchGaps || [],
        futureDirections: parsed.futureDirections || []
      }
    } catch {
      return this.generateMockProcessingResult(paper)
    }
  }

  private parseLiteratureReview(content: string, papers: ResearchPaper[]): any {
    // Parse the structured review content
    const sections = content.split('\n\n')
    return {
      title: `Literature Review: ${papers[0]?.keywords[0] || 'Microbial Electrochemical Systems'}`,
      abstract: sections[1] || 'Literature review abstract',
      introduction: sections[2] || 'Introduction section',
      mainFindings: sections[3] || 'Main findings section',
      researchGaps: sections[4] || 'Research gaps section',
      futureDirections: sections[5] || 'Future directions section',
      references: papers.map(p => `${p.authors.join(', ')} (${p.publishedDate.getFullYear()}). ${p.title}. ${p.journal || 'Journal'}.`)
    }
  }

  private generateMockProcessingResult(paper: ResearchPaper): ProcessingResult {
    return {
      paper,
      extractedData: {
        methodology: ['Cyclic voltammetry', 'Microscopy', 'Performance monitoring'],
        results: {
          powerDensity: Math.random() * 1000,
          coulombicEfficiency: 0.3 + Math.random() * 0.5
        },
        materials: ['Carbon electrodes', 'E. coli', 'Acetate substrate'],
        conditions: {
          temperature: 25 + Math.random() * 10,
          pH: 6.5 + Math.random() * 1.5,
          voltage: Math.random() * 2
        },
        performance: {
          powerDensity: Math.random() * 1000,
          coulombicEfficiency: 0.3 + Math.random() * 0.5,
          currentDensity: Math.random() * 500
        }
      },
      keyInsights: [
        'Novel electrode material improved performance',
        'pH optimization critical for efficiency',
        'Temperature affects microbial activity'
      ],
      researchGaps: [
        'Long-term stability needs investigation',
        'Scale-up challenges not addressed',
        'Cost analysis missing'
      ],
      futureDirections: [
        'Investigate new electrode materials',
        'Develop scale-up strategies',
        'Conduct economic feasibility studies'
      ]
    }
  }

  private generateMockLiteratureReview(papers: ResearchPaper[], topic: string): any {
    return {
      title: `Literature Review: ${topic}`,
      abstract: 'This review synthesizes recent advances in microbial electrochemical systems, highlighting key findings and identifying future research directions.',
      introduction: 'Microbial electrochemical systems represent a promising technology for sustainable energy generation and waste treatment.',
      mainFindings: 'Recent studies have demonstrated improved performance through electrode optimization and microbial community engineering.',
      researchGaps: 'Key gaps include long-term stability, scale-up challenges, and economic viability.',
      futureDirections: 'Future research should focus on material innovation, system integration, and commercial applications.',
      references: papers.map(p => `${p.authors.join(', ')} (${p.publishedDate.getFullYear()}). ${p.title}. ${p.journal || 'Journal'}.`)
    }
  }

  // Getters for accessing data
  getPaper(paperId: string): ResearchPaper | undefined {
    return this.papers.get(paperId)
  }

  getProcessingResult(paperId: string): ProcessingResult | undefined {
    return this.processedResults.get(paperId)
  }

  getAllPapers(): ResearchPaper[] {
    return Array.from(this.papers.values())
  }

  getProcessedPapers(): ResearchPaper[] {
    return Array.from(this.papers.values()).filter(p => p.processingStatus === 'completed')
  }
}