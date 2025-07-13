import { PrismaClient } from '@prisma/client'

interface EmbeddingConfig {
  model?: string
  dimensions?: number
  apiKey?: string
}

interface VectorDocument {
  id: string
  content: string
  embedding?: number[]
  metadata?: Record<string, any>
}

export class EmbeddingService {
  private prisma: PrismaClient
  private config: EmbeddingConfig
  
  constructor(prismaClient?: PrismaClient, config?: EmbeddingConfig) {
    this.prisma = prismaClient || new PrismaClient()
    this.config = {
      model: config?.model || 'text-embedding-ada-002',
      dimensions: config?.dimensions || 1536,
      apiKey: config?.apiKey || process.env.OPENAI_API_KEY
    }
  }

  /**
   * Generate embeddings for text using OpenAI API
   * In production, this would call the actual OpenAI API
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // For now, return a mock embedding based on text features
    // In production, this would call OpenAI's API
    return this.mockEmbedding(text)
  }

  /**
   * Generate mock embeddings based on text features
   * This provides a functional implementation without requiring API keys
   */
  private mockEmbedding(text: string): number[] {
    const dimensions = this.config.dimensions || 1536
    const embedding = new Array(dimensions).fill(0)
    
    // Simple feature extraction
    const words = text.toLowerCase().split(/\s+/)
    const features = {
      length: text.length,
      wordCount: words.length,
      avgWordLength: text.length / words.length,
      hasNumbers: /\d/.test(text),
      hasMaterial: /graphene|mxene|carbon|electrode/.test(text.toLowerCase()),
      hasOrganism: /bacteria|geobacter|shewanella|biofilm/.test(text.toLowerCase()),
      hasPerformance: /power|efficiency|output|density/.test(text.toLowerCase()),
      hasSystem: /mfc|mec|mdc|fuel cell/.test(text.toLowerCase())
    }
    
    // Encode features into embedding
    let index = 0
    for (const [key, value] of Object.entries(features)) {
      if (typeof value === 'number') {
        embedding[index % dimensions] = value / 100
      } else if (typeof value === 'boolean') {
        embedding[index % dimensions] = value ? 1 : 0
      }
      index++
    }
    
    // Add some deterministic noise based on text hash
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    
    for (let i = 0; i < dimensions; i++) {
      embedding[i] += Math.sin(hash * i * 0.001) * 0.1
      // Normalize to [-1, 1]
      embedding[i] = Math.max(-1, Math.min(1, embedding[i]))
    }
    
    return embedding
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimensions')
    }
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)
    
    if (normA === 0 || normB === 0) {
      return 0
    }
    
    return dotProduct / (normA * normB)
  }

  /**
   * Find similar documents based on embeddings
   */
  async findSimilar(
    queryEmbedding: number[],
    documents: VectorDocument[],
    topK: number = 10
  ): Promise<Array<VectorDocument & { similarity: number }>> {
    const results = documents
      .filter(doc => doc.embedding && doc.embedding.length > 0)
      .map(doc => ({
        ...doc,
        similarity: this.cosineSimilarity(queryEmbedding, doc.embedding!)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
    
    return results
  }

  /**
   * Generate embeddings for research papers
   */
  async generatePaperEmbeddings(limit?: number) {
    console.log('📊 Generating embeddings for research papers...')
    
    try {
      const papers = await this.prisma.researchPaper.findMany({
        take: limit,
        select: {
          id: true,
          title: true,
          abstract: true,
          keywords: true,
          systemType: true,
          anodeMaterials: true,
          cathodeMaterials: true,
          organismTypes: true
        }
      })
      
      const embeddings: Array<{ paperId: string; embedding: number[] }> = []
      
      for (const paper of papers) {
        // Combine relevant text fields
        const textContent = [
          paper.title || '',
          paper.abstract || '',
          paper.keywords || '',
          paper.systemType || '',
          paper.anodeMaterials || '',
          paper.cathodeMaterials || '',
          paper.organismTypes || ''
        ].join(' ')
        
        const embedding = await this.generateEmbedding(textContent)
        embeddings.push({
          paperId: paper.id,
          embedding
        })
      }
      
      console.log(`✅ Generated embeddings for ${embeddings.length} papers`)
      return embeddings
      
    } catch (error) {
      console.error('Error generating paper embeddings:', error)
      throw error
    }
  }

  /**
   * Semantic search using embeddings
   */
  async semanticSearch(query: string, limit: number = 10) {
    console.log(`🔍 Performing semantic search: "${query}"`)
    
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query)
      
      // Get all papers with their content
      const papers = await this.prisma.researchPaper.findMany({
        select: {
          id: true,
          title: true,
          abstract: true,
          keywords: true,
          systemType: true,
          powerOutput: true,
          efficiency: true,
          anodeMaterials: true,
          cathodeMaterials: true,
          organismTypes: true,
          journal: true,
          year: true,
          doi: true
        }
      })
      
      // Convert papers to vector documents
      const documents: VectorDocument[] = await Promise.all(
        papers.map(async paper => {
          const content = [
            paper.title || '',
            paper.abstract || '',
            paper.keywords || '',
            paper.systemType || ''
          ].join(' ')
          
          const embedding = await this.generateEmbedding(content)
          
          return {
            id: paper.id,
            content,
            embedding,
            metadata: paper
          }
        })
      )
      
      // Find similar documents
      const results = await this.findSimilar(queryEmbedding, documents, limit)
      
      return results.map(result => ({
        paper: result.metadata,
        similarity: result.similarity,
        explanation: this.generateExplanation(query, result.metadata as any)
      }))
      
    } catch (error) {
      console.error('Error in semantic search:', error)
      throw error
    }
  }

  /**
   * Generate explanation for why a paper was matched
   */
  private generateExplanation(query: string, paper: any): string {
    const reasons = []
    const queryLower = query.toLowerCase()
    
    if (paper.title && paper.title.toLowerCase().includes(queryLower)) {
      reasons.push('title match')
    }
    
    if (paper.abstract && paper.abstract.toLowerCase().includes(queryLower)) {
      reasons.push('abstract match')
    }
    
    if (paper.keywords) {
      const keywords = typeof paper.keywords === 'string' 
        ? paper.keywords.split(',').map((k: string) => k.trim())
        : paper.keywords
      
      if (keywords.some((k: string) => queryLower.includes(k.toLowerCase()))) {
        reasons.push('keyword match')
      }
    }
    
    if (paper.systemType && queryLower.includes(paper.systemType.toLowerCase())) {
      reasons.push('system type match')
    }
    
    if (reasons.length === 0) {
      reasons.push('semantic similarity')
    }
    
    return `Matched based on ${reasons.join(', ')}`
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}

/**
 * Utility function to batch process embeddings
 */
export async function batchGenerateEmbeddings(
  texts: string[],
  batchSize: number = 100
): Promise<number[][]> {
  const service = new EmbeddingService()
  const embeddings: number[][] = []
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const batchEmbeddings = await Promise.all(
      batch.map(text => service.generateEmbedding(text))
    )
    embeddings.push(...batchEmbeddings)
    
    // Log progress
    console.log(`Processed ${Math.min(i + batchSize, texts.length)} / ${texts.length} texts`)
  }
  
  await service.disconnect()
  return embeddings
}