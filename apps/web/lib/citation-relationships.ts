// Citation relationship handler for ResearchPaper model
// This provides citation functionality until the database schema is updated

import { PrismaClient } from '@prisma/client'

interface CitationRelation {
  citingPaperId: string
  citedPaperId: string
  citationText?: string
  verified?: boolean
}

// In-memory storage for citation relationships
// In production, this should be stored in the database
const citationStore = new Map<string, CitationRelation[]>()

export class CitationManager {
  private prisma: PrismaClient
  
  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient()
  }
  
  // Add a citation relationship
  async addCitation(citation: CitationRelation) {
    const key = citation.citingPaperId
    const existing = citationStore.get(key) || []
    
    // Check if citation already exists
    const exists = existing.some(c => c.citedPaperId === citation.citedPaperId)
    if (!exists) {
      existing.push(citation)
      citationStore.set(key, existing)
    }
    
    return citation
  }
  
  // Get citations for a paper
  async getCitations(paperId: string): Promise<{ citedPaperId: string }[]> {
    const citations = citationStore.get(paperId) || []
    return citations.map(c => ({ citedPaperId: c.citedPaperId }))
  }
  
  // Get papers that cite this paper
  async getCitedBy(paperId: string): Promise<{ citingPaperId: string }[]> {
    const citedBy: { citingPaperId: string }[] = []
    
    citationStore.forEach((citations, citingId) => {
      if (citations.some(c => c.citedPaperId === paperId)) {
        citedBy.push({ citingPaperId: citingId })
      }
    })
    
    return citedBy
  }
  
  // Build citation network for a paper
  async buildCitationNetwork(paperId: string, depth: number = 1) {
    const visited = new Set<string>()
    const network = new Map<string, any>()
    
    const buildNetwork = async (currentId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(currentId)) return
      visited.add(currentId)
      
      // Get paper details
      const paper = await this.prisma.researchPaper.findUnique({
        where: { id: currentId },
        select: { id: true, title: true }
      })
      
      if (!paper) return
      
      // Get citations and cited by
      const citations = await this.getCitations(currentId)
      const citedBy = await this.getCitedBy(currentId)
      
      network.set(currentId, {
        id: paper.id,
        title: paper.title,
        citations,
        citedBy
      })
      
      // Recursively build network
      if (currentDepth < depth) {
        for (const citation of citations) {
          await buildNetwork(citation.citedPaperId, currentDepth + 1)
        }
        for (const cited of citedBy) {
          await buildNetwork(cited.citingPaperId, currentDepth + 1)
        }
      }
    }
    
    await buildNetwork(paperId, 0)
    
    return {
      papers: Array.from(network.values()),
      totalPapers: network.size,
      depth,
      mainPaperId: paperId
    }
  }
  
  // Initialize with sample data
  async initializeSampleCitations() {
    // Get some papers
    const papers = await this.prisma.researchPaper.findMany({
      take: 20,
      select: { id: true }
    })
    
    if (papers.length < 2) return
    
    // Create some sample citation relationships
    for (let i = 0; i < papers.length - 1; i++) {
      // Each paper cites 1-3 other papers
      const numCitations = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numCitations; j++) {
        const citedIndex = Math.floor(Math.random() * papers.length)
        if (citedIndex !== i) {
          await this.addCitation({
            citingPaperId: papers[i].id,
            citedPaperId: papers[citedIndex].id,
            verified: Math.random() > 0.5
          })
        }
      }
    }
  }
  
  async disconnect() {
    await this.prisma.$disconnect()
  }
}

// Global instance
let citationManager: CitationManager | null = null

export function getCitationManager(prisma?: PrismaClient) {
  if (!citationManager) {
    citationManager = new CitationManager(prisma)
    // Initialize with sample data in development
    if (process.env.NODE_ENV === 'development') {
      citationManager.initializeSampleCitations().catch(console.error)
    }
  }
  return citationManager
}