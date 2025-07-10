import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const prisma = new PrismaClient()

// Initialize OpenRouter-compatible client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    "HTTP-Referer": "https://messai.app", // Optional - helps with OpenRouter analytics
    "X-Title": "MESSAi Platform",         // Optional - appears in OpenRouter logs
  }
})

interface AIProcessingResult {
  summary: string
  keyFindings: string[]
  methodology: string
  implications: string[]
  dataExtraction: {
    materials: string[]
    organisms: string[]
    performanceMetrics: {
      powerOutput?: number
      efficiency?: number
      currentDensity?: number
      voltageDensity?: number
    }
    experimentalConditions: {
      temperature?: number
      pH?: number
      substrate?: string
      duration?: string
    }
    innovations: string[]
  }
  insights: string
  confidence: number
}

export class AIPaperProcessor {
  // Using OpenRouter model naming convention
  private modelVersion = 'openai/gpt-4-turbo' // Or use 'anthropic/claude-3-opus' for Claude
  
  async processPaper(paper: any): Promise<AIProcessingResult | null> {
    try {
      // Prepare the paper content for AI processing
      const paperContent = this.preparePaperContent(paper)
      
      // Generate AI summary and insights
      const result = await this.generateAISummary(paperContent)
      
      // Save to database
      await this.saveToPaper(paper.id, result)
      
      return result
    } catch (error) {
      console.error(`Error processing paper ${paper.id}:`, error)
      return null
    }
  }
  
  private preparePaperContent(paper: any): string {
    const sections = [
      `Title: ${paper.title}`,
      `Authors: ${this.formatAuthors(paper.authors)}`,
      paper.abstract ? `Abstract: ${paper.abstract}` : '',
      paper.journal ? `Journal: ${paper.journal}` : '',
      paper.publicationDate ? `Publication Date: ${paper.publicationDate}` : '',
      paper.systemType ? `System Type: ${paper.systemType}` : '',
      paper.powerOutput ? `Power Output: ${paper.powerOutput} mW/m²` : '',
      paper.efficiency ? `Efficiency: ${paper.efficiency}%` : '',
      paper.organismTypes ? `Organisms: ${paper.organismTypes}` : '',
      paper.anodeMaterials ? `Anode Materials: ${paper.anodeMaterials}` : '',
      paper.cathodeMaterials ? `Cathode Materials: ${paper.cathodeMaterials}` : ''
    ].filter(Boolean).join('\n')
    
    return sections
  }
  
  private formatAuthors(authorsJson: string): string {
    try {
      const authors = JSON.parse(authorsJson)
      return Array.isArray(authors) ? authors.join(', ') : authorsJson
    } catch {
      return authorsJson
    }
  }
  
  private async generateAISummary(content: string): Promise<AIProcessingResult> {
    const systemPrompt = `You are an expert in microbial electrochemical systems (MES), including microbial fuel cells (MFCs), microbial electrolysis cells (MECs), microbial desalination cells (MDCs), and microbial electrosynthesis. Analyze the provided research paper and extract comprehensive information.`
    
    const userPrompt = `Analyze this MES research paper and provide:

1. A concise summary (2-3 sentences) highlighting the main contribution
2. Key findings (3-5 bullet points)
3. Methodology summary (1-2 sentences)
4. Research implications and applications (2-3 points)
5. Extracted data including:
   - Materials used (anode, cathode, membrane)
   - Microorganisms/inoculum
   - Performance metrics (power output, efficiency, current/voltage density)
   - Experimental conditions (temperature, pH, substrate, duration)
   - Key innovations or improvements
6. Insights about how this research advances the field

Paper content:
${content}

Provide the response in JSON format.`

    const completion = await openai.chat.completions.create({
      model: this.modelVersion,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
    
    const response = JSON.parse(completion.choices[0].message.content || '{}')
    
    return {
      summary: response.summary || '',
      keyFindings: response.keyFindings || [],
      methodology: response.methodology || '',
      implications: response.implications || [],
      dataExtraction: {
        materials: response.materials || [],
        organisms: response.organisms || [],
        performanceMetrics: response.performanceMetrics || {},
        experimentalConditions: response.experimentalConditions || {},
        innovations: response.innovations || []
      },
      insights: response.insights || '',
      confidence: this.calculateConfidence(response)
    }
  }
  
  private calculateConfidence(response: any): number {
    // Calculate confidence based on completeness of extraction
    let score = 0
    let total = 0
    
    // Check for key fields
    const checks = [
      response.summary,
      response.keyFindings?.length > 0,
      response.methodology,
      response.implications?.length > 0,
      response.materials?.length > 0,
      response.performanceMetrics?.powerOutput,
      response.insights
    ]
    
    checks.forEach(check => {
      total++
      if (check) score++
    })
    
    return score / total
  }
  
  private async saveToPaper(paperId: string, result: AIProcessingResult) {
    await prisma.researchPaper.update({
      where: { id: paperId },
      data: {
        aiSummary: result.summary,
        aiKeyFindings: JSON.stringify(result.keyFindings),
        aiMethodology: result.methodology,
        aiImplications: JSON.stringify(result.implications),
        aiDataExtraction: JSON.stringify(result.dataExtraction),
        aiInsights: result.insights,
        aiProcessingDate: new Date(),
        aiModelVersion: this.modelVersion,
        aiConfidence: result.confidence
      }
    })
  }
  
  async processBatch(limit: number = 10) {
    console.log('🤖 Starting AI paper processing...')
    
    // Find papers that haven't been AI-processed yet
    const papers = await prisma.researchPaper.findMany({
      where: {
        aiProcessingDate: null,
        // Only process real papers with abstracts
        abstract: { not: null },
        OR: [
          { doi: { not: null } },
          { pubmedId: { not: null } },
          { arxivId: { not: null } }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Found ${papers.length} papers to process`)
    
    let processed = 0
    let failed = 0
    
    for (const paper of papers) {
      console.log(`\nProcessing: ${paper.title}`)
      const result = await this.processPaper(paper)
      
      if (result) {
        processed++
        console.log(`✅ Processed successfully (confidence: ${(result.confidence * 100).toFixed(0)}%)`)
      } else {
        failed++
        console.log(`❌ Failed to process`)
      }
      
      // Rate limiting - wait 1 second between API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log(`\n📊 Processing complete:`)
    console.log(`   Processed: ${processed}`)
    console.log(`   Failed: ${failed}`)
  }
  
  // Process a single paper by ID
  async processSinglePaper(paperId: string) {
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId }
    })
    
    if (!paper) {
      console.error('Paper not found')
      return
    }
    
    console.log(`Processing: ${paper.title}`)
    const result = await this.processPaper(paper)
    
    if (result) {
      console.log('✅ Processed successfully')
      console.log(`Summary: ${result.summary}`)
      console.log(`Key findings: ${result.keyFindings.length}`)
      console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`)
    } else {
      console.log('❌ Failed to process')
    }
  }
  
  // Get statistics about AI processing
  async getStats() {
    const [total, processed, highConfidence] = await Promise.all([
      prisma.researchPaper.count(),
      prisma.researchPaper.count({
        where: { aiProcessingDate: { not: null } }
      }),
      prisma.researchPaper.count({
        where: { 
          aiProcessingDate: { not: null },
          aiConfidence: { gte: 0.8 }
        }
      })
    ])
    
    console.log(`\n📊 AI Processing Statistics:`)
    console.log(`   Total papers: ${total}`)
    console.log(`   AI processed: ${processed} (${((processed/total)*100).toFixed(1)}%)`)
    console.log(`   High confidence: ${highConfidence} (${((highConfidence/processed)*100).toFixed(1)}% of processed)`)
  }
}

// CLI interface
async function main() {
  const processor = new AIPaperProcessor()
  const args = process.argv.slice(2)
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY environment variable is required')
    console.log('\nSet it in your .env file or export it:')
    console.log('export OPENROUTER_API_KEY="your-api-key"')
    console.log('\nGet your API key at: https://openrouter.ai/keys')
    process.exit(1)
  }
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
AI Paper Processor - Generate AI summaries and insights for research papers
Powered by OpenRouter (supports multiple AI providers)

Usage:
  npm run ai:process                    Process 10 papers
  npm run ai:process --batch [limit]    Process specified number of papers
  npm run ai:process --paper [id]       Process a single paper by ID
  npm run ai:process --stats            Show processing statistics

Required: OPENROUTER_API_KEY environment variable
    `)
    return
  }
  
  try {
    switch (args[0]) {
      case '--batch':
        const limit = args[1] ? parseInt(args[1]) : 10
        await processor.processBatch(limit)
        break
        
      case '--paper':
        if (!args[1]) {
          console.error('Paper ID required')
          process.exit(1)
        }
        await processor.processSinglePaper(args[1])
        break
        
      case '--stats':
        await processor.getStats()
        break
        
      default:
        await processor.processBatch(10)
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}