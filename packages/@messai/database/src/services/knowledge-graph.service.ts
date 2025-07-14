import { PrismaClient } from '@prisma/client'
import type { 
  KnowledgeNode, 
  KnowledgeEdge, 
  NodeType, 
  EdgeType,
  ResearchCluster,
  ResearchTrend,
  GraphMetrics,
  NodeImportance
} from '../types/knowledge-graph'

export class KnowledgeGraphService {
  constructor(private prisma: PrismaClient) {}

  // Node Operations
  async createNode(data: {
    type: NodeType
    entityId?: string
    name: string
    properties?: any
    embedding?: number[]
  }) {
    return this.prisma.knowledgeNode.create({
      data: {
        ...data,
        properties: data.properties ? JSON.stringify(data.properties) : null
      }
    })
  }

  async findNode(type: NodeType, entityId: string) {
    return this.prisma.knowledgeNode.findUnique({
      where: {
        type_entityId: { type, entityId }
      }
    })
  }

  async updateNodeImportance(nodeId: string, importance: number) {
    return this.prisma.knowledgeNode.update({
      where: { id: nodeId },
      data: { importance }
    })
  }

  // Edge Operations
  async createEdge(data: {
    sourceId: string
    targetId: string
    edgeType: EdgeType
    weight?: number
    properties?: any
    confidence?: number
  }) {
    return this.prisma.knowledgeEdge.create({
      data: {
        ...data,
        weight: data.weight ?? 1.0,
        properties: data.properties ? JSON.stringify(data.properties) : null
      }
    })
  }

  async findEdge(sourceId: string, targetId: string, edgeType: EdgeType) {
    return this.prisma.knowledgeEdge.findUnique({
      where: {
        sourceId_targetId_edgeType: { sourceId, targetId, edgeType }
      }
    })
  }

  // Graph Construction from Research Papers
  async buildGraphFromPapers(paperIds?: string[]) {
    const papers = await this.prisma.researchPaper.findMany({
      where: paperIds ? { id: { in: paperIds } } : undefined,
      select: {
        id: true,
        title: true,
        authors: true,
        keywords: true,
        doi: true,
        publicationDate: true,
        systemType: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        powerOutput: true
      }
    })

    const nodes: Map<string, any> = new Map()
    const edges: Array<any> = []

    for (const paper of papers) {
      // Create paper node
      const paperNode = await this.createNode({
        type: 'paper',
        entityId: paper.id,
        name: paper.title,
        properties: {
          title: paper.title,
          authors: JSON.parse(paper.authors || '[]'),
          year: paper.publicationDate?.getFullYear(),
          doi: paper.doi,
          citations: 0, // To be updated from citation data
          abstractEmbedding: [] // To be populated by embedding service
        }
      })

      // Process authors
      const authors = JSON.parse(paper.authors || '[]')
      for (let i = 0; i < authors.length; i++) {
        const authorName = authors[i]
        let authorNode = nodes.get(`author:${authorName}`)
        
        if (!authorNode) {
          authorNode = await this.createNode({
            type: 'author',
            name: authorName,
            properties: {
              fullName: authorName,
              paperCount: 1,
              fields: []
            }
          })
          nodes.set(`author:${authorName}`, authorNode)
        }

        // Create author-paper edge
        await this.createEdge({
          sourceId: authorNode.id,
          targetId: paperNode.id,
          edgeType: 'co_author',
          weight: 1.0 / (i + 1) // First author gets higher weight
        })

        // Create co-author edges
        for (let j = i + 1; j < authors.length; j++) {
          const coAuthorName = authors[j]
          let coAuthorNode = nodes.get(`author:${coAuthorName}`)
          
          if (!coAuthorNode) {
            coAuthorNode = await this.createNode({
              type: 'author',
              name: coAuthorName,
              properties: {
                fullName: coAuthorName,
                paperCount: 1,
                fields: []
              }
            })
            nodes.set(`author:${coAuthorName}`, coAuthorNode)
          }

          const edgeKey = `${authorNode.id}-${coAuthorNode.id}`
          if (!edges.includes(edgeKey)) {
            await this.createEdge({
              sourceId: authorNode.id,
              targetId: coAuthorNode.id,
              edgeType: 'co_author',
              weight: 0.5
            })
            edges.push(edgeKey)
          }
        }
      }

      // Process keywords/topics
      const keywords = JSON.parse(paper.keywords || '[]')
      for (const keyword of keywords) {
        let topicNode = nodes.get(`topic:${keyword}`)
        
        if (!topicNode) {
          topicNode = await this.createNode({
            type: 'topic',
            name: keyword,
            properties: {
              label: keyword,
              category: this.categorizeKeyword(keyword),
              paperCount: 1,
              relatedTerms: []
            }
          })
          nodes.set(`topic:${keyword}`, topicNode)
        }

        await this.createEdge({
          sourceId: paperNode.id,
          targetId: topicNode.id,
          edgeType: 'similar_topic',
          weight: 0.8
        })
      }

      // Process materials
      const materials = [
        ...(paper.anodeMaterials ? JSON.parse(paper.anodeMaterials) : []),
        ...(paper.cathodeMaterials ? JSON.parse(paper.cathodeMaterials) : [])
      ]
      
      for (const material of materials) {
        let materialNode = nodes.get(`material:${material}`)
        
        if (!materialNode) {
          materialNode = await this.createNode({
            type: 'material',
            name: material,
            properties: {
              name: material,
              type: paper.anodeMaterials?.includes(material) ? 'anode' : 'cathode',
              papers: [paper.id]
            }
          })
          nodes.set(`material:${material}`, materialNode)
        }

        await this.createEdge({
          sourceId: paperNode.id,
          targetId: materialNode.id,
          edgeType: 'uses_material',
          weight: 0.9
        })
      }
    }

    return { nodesCreated: nodes.size + papers.length, edgesCreated: edges.length }
  }

  // Graph Analysis Algorithms
  async calculateNodeImportance(nodeId: string): Promise<NodeImportance> {
    // Get node and its connections
    const node = await this.prisma.knowledgeNode.findUnique({
      where: { id: nodeId },
      include: {
        outgoingEdges: true,
        incomingEdges: true
      }
    })

    if (!node) throw new Error('Node not found')

    const degree = node.outgoingEdges.length + node.incomingEdges.length
    const weightedDegree = 
      node.outgoingEdges.reduce((sum, edge) => sum + edge.weight, 0) +
      node.incomingEdges.reduce((sum, edge) => sum + edge.weight, 0)

    // Simplified importance scores (full implementation would use graph algorithms)
    return {
      degree,
      weightedDegree,
      pageRank: weightedDegree / 10, // Simplified
      betweenness: degree / 20, // Simplified
      closeness: 1 / (degree + 1), // Simplified
      eigenvector: Math.sqrt(weightedDegree) / 10 // Simplified
    }
  }

  async findCommunities(): Promise<ResearchCluster[]> {
    // Simplified community detection - in production, use Louvain or similar
    const nodes = await this.prisma.knowledgeNode.findMany({
      where: { type: 'topic' },
      include: {
        incomingEdges: {
          include: { source: true }
        }
      }
    })

    const clusters: ResearchCluster[] = []
    const processed = new Set<string>()

    for (const node of nodes) {
      if (processed.has(node.id)) continue

      const cluster: string[] = [node.id]
      const keywords = [node.name]
      
      // Find connected topics
      for (const edge of node.incomingEdges) {
        if (edge.source.type === 'topic' && !processed.has(edge.source.id)) {
          cluster.push(edge.source.id)
          keywords.push(edge.source.name)
          processed.add(edge.source.id)
        }
      }

      if (cluster.length > 2) {
        const createdCluster = await this.prisma.researchCluster.create({
          data: {
            name: `${node.name} Research Area`,
            description: `Research cluster focused on ${keywords.slice(0, 3).join(', ')}`,
            centerNodeId: node.id,
            memberNodes: JSON.stringify(cluster),
            keywords: JSON.stringify(keywords),
            avgImportance: node.importance || 0.5,
            coherence: 0.7 // Simplified
          }
        })
        clusters.push(createdCluster as any)
      }
      processed.add(node.id)
    }

    return clusters
  }

  async detectTrends(timeWindow: string = '2020-2024'): Promise<ResearchTrend[]> {
    const papers = await this.prisma.researchPaper.findMany({
      where: {
        publicationDate: {
          gte: new Date('2020-01-01'),
          lte: new Date('2024-12-31')
        }
      },
      select: {
        id: true,
        keywords: true,
        publicationDate: true,
        authors: true
      }
    })

    const topicCounts: Map<string, { count: number; papers: string[]; authors: Set<string> }> = new Map()

    for (const paper of papers) {
      const keywords = JSON.parse(paper.keywords || '[]')
      const authors = JSON.parse(paper.authors || '[]')
      
      for (const keyword of keywords) {
        const existing = topicCounts.get(keyword) || { count: 0, papers: [], authors: new Set() }
        existing.count++
        existing.papers.push(paper.id)
        authors.forEach((a: string) => existing.authors.add(a))
        topicCounts.set(keyword, existing)
      }
    }

    const trends: ResearchTrend[] = []
    
    for (const [topic, data] of topicCounts.entries()) {
      if (data.count > 5) { // Minimum threshold
        const trend = await this.prisma.researchTrend.create({
          data: {
            topic,
            timeRange: timeWindow,
            trendScore: Math.min(data.count / 100, 1), // Normalized
            growthRate: 0.1, // Would calculate from time series
            paperCount: data.count,
            keyAuthors: JSON.stringify(Array.from(data.authors).slice(0, 10)),
            keyPapers: JSON.stringify(data.papers.slice(0, 10)),
            predictions: JSON.stringify({
              nextYear: data.count * 1.1,
              fiveYear: data.count * 1.5,
              emergingTopics: []
            })
          }
        })
        trends.push(trend as any)
      }
    }

    return trends.sort((a, b) => b.trendScore - a.trendScore)
  }

  async getGraphMetrics(): Promise<GraphMetrics> {
    const nodeCount = await this.prisma.knowledgeNode.count()
    const edgeCount = await this.prisma.knowledgeEdge.count()
    
    const avgDegree = nodeCount > 0 ? (edgeCount * 2) / nodeCount : 0
    const maxPossibleEdges = (nodeCount * (nodeCount - 1)) / 2
    const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0

    // Simplified metrics - full implementation would use graph algorithms
    return {
      nodeCount,
      edgeCount,
      avgDegree,
      density,
      components: Math.max(1, Math.floor(nodeCount / 100)), // Simplified
      largestComponentSize: Math.floor(nodeCount * 0.8), // Simplified
      avgClusteringCoefficient: 0.3 // Simplified
    }
  }

  // Helper methods
  private categorizeKeyword(keyword: string): string {
    const categories: Record<string, string[]> = {
      'materials': ['electrode', 'anode', 'cathode', 'carbon', 'graphite', 'metal'],
      'biological': ['bacteria', 'microbe', 'biofilm', 'consortium', 'species'],
      'performance': ['power', 'efficiency', 'voltage', 'current', 'density'],
      'application': ['wastewater', 'treatment', 'energy', 'recovery', 'remediation'],
      'method': ['optimization', 'modeling', 'characterization', 'analysis']
    }

    for (const [category, terms] of Object.entries(categories)) {
      if (terms.some(term => keyword.toLowerCase().includes(term))) {
        return category
      }
    }
    
    return 'general'
  }
}