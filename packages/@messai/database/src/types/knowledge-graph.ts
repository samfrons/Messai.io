export interface KnowledgeNodeType {
  paper: {
    title: string
    authors: string[]
    year: number
    doi?: string
    citations: number
    abstractEmbedding?: number[]
  }
  author: {
    fullName: string
    institution?: string
    orcid?: string
    hIndex?: number
    paperCount: number
    fields: string[]
  }
  topic: {
    label: string
    category: string
    paperCount: number
    trendScore?: number
    relatedTerms: string[]
  }
  institution: {
    name: string
    country: string
    type: 'university' | 'company' | 'research_institute' | 'other'
    ranking?: number
  }
  method: {
    name: string
    category: string
    description?: string
    papers: string[]
  }
  material: {
    name: string
    type: 'anode' | 'cathode' | 'membrane' | 'substrate' | 'other'
    properties?: Record<string, any>
    papers: string[]
  }
}

export type NodeType = keyof KnowledgeNodeType

export interface KnowledgeNode {
  id: string
  type: NodeType
  entityId?: string
  name: string
  properties?: KnowledgeNodeType[NodeType]
  embedding?: number[]
  importance?: number
  createdAt: Date
  updatedAt: Date
}

export type EdgeType = 
  | 'cites' 
  | 'cited_by' 
  | 'co_author' 
  | 'similar_topic' 
  | 'uses_method' 
  | 'same_institution'
  | 'uses_material'
  | 'comparative_study'
  | 'follow_up_work'
  | 'contradicts'
  | 'supports'

export interface KnowledgeEdge {
  id: string
  sourceId: string
  targetId: string
  edgeType: EdgeType
  weight: number
  properties?: Record<string, any>
  confidence?: number
  createdAt: Date
  updatedAt: Date
}

export interface ResearchCluster {
  id: string
  name: string
  description?: string
  centerNodeId?: string
  memberNodes: string[]
  keywords: string[]
  avgImportance?: number
  coherence?: number
  createdAt: Date
  updatedAt: Date
}

export interface ResearchTrend {
  id: string
  topic: string
  timeRange: string
  trendScore: number
  growthRate?: number
  paperCount: number
  keyAuthors: string[]
  keyPapers: string[]
  predictions?: {
    nextYear: number
    fiveYear: number
    emergingTopics: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface GraphMetrics {
  nodeCount: number
  edgeCount: number
  avgDegree: number
  density: number
  components: number
  largestComponentSize: number
  avgClusteringCoefficient: number
}

export interface NodeImportance {
  pageRank: number
  betweenness: number
  closeness: number
  eigenvector: number
  degree: number
  weightedDegree: number
}