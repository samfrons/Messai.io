export interface KnowledgeNode {
  id: string
  type: 'material' | 'organism' | 'system' | 'concept' | 'researcher' | 'institution'
  name: string
  properties: Record<string, any>
  embedding?: number[]
  importance: number
  papers: string[]
}

export interface KnowledgeEdge {
  source: string
  target: string
  relationship: string
  strength: number
  evidence: string[]
  confidence: number
}

export interface SemanticQuery {
  text: string
  intent: 'performance_search' | 'material_discovery' | 'organism_analysis' | 'system_comparison' | 'trend_analysis'
  entities: string[]
  context?: Record<string, any>
}

export interface SemanticResult {
  relevanceScore: number
  paper: any
  explanation: string
  relatedConcepts: string[]
  suggestedQueries: string[]
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
  metadata?: {
    createdAt: string
    totalPapers: number
    version: string
  }
}

export interface CitationNode {
  id: string
  title: string
  x?: number
  y?: number
  citations: string[]
  citedBy: string[]
}

export interface CitationNetworkData {
  papers: Array<{
    id: string
    title: string
    citations: Array<{ citedPaperId: string }>
    citedBy: Array<{ citingPaperId: string }>
  }>
}

export interface CitationVerificationResult {
  verifiedCount: number
  unverifiedCount: number
  citedByCount: number
  citationNetworkSize: number
  verifiedCitations: Array<{
    id: string
    title: string
    authors: string[]
    doi?: string
    year?: number
  }>
}