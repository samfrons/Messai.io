import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

interface KnowledgeNode {
  id: string
  type: 'material' | 'organism' | 'system' | 'concept' | 'researcher' | 'institution'
  name: string
  properties: Record<string, any>
  embedding?: number[]
  importance: number
  papers: string[]
}

interface KnowledgeEdge {
  source: string
  target: string
  relationship: string
  strength: number
  evidence: string[]
  confidence: number
}

interface SemanticQuery {
  text: string
  intent: 'performance_search' | 'material_discovery' | 'organism_analysis' | 'system_comparison' | 'trend_analysis'
  entities: string[]
  context?: Record<string, any>
}

interface SemanticResult {
  relevanceScore: number
  paper: any
  explanation: string
  relatedConcepts: string[]
  suggestedQueries: string[]
}

class SemanticKnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map()
  private edges: KnowledgeEdge[] = []
  private conceptEmbeddings: Map<string, number[]> = new Map()
  private papers: any[] = []

  constructor() {
    this.initializeConceptEmbeddings()
  }

  private initializeConceptEmbeddings() {
    // Simplified concept embeddings (in practice, would use actual ML embeddings)
    const concepts = [
      'graphene', 'MXene', 'carbon_nanotube', 'quantum_dot', 'biofilm',
      'electron_transfer', 'power_density', 'efficiency', 'scalability',
      'Geobacter', 'Shewanella', 'synthetic_biology', 'CRISPR', 'extremophile',
      'wastewater', 'biofacade', 'building_integration', 'space_application'
    ]

    concepts.forEach((concept, i) => {
      // Generate pseudo-embeddings based on concept properties
      const embedding = Array.from({ length: 128 }, (_, j) => 
        Math.sin(i * 0.1 + j * 0.05) + Math.cos(i * 0.07 + j * 0.03)
      )
      this.conceptEmbeddings.set(concept, embedding)
    })
  }

  private async loadPapersAndBuildGraph() {
    console.log('🔗 Building semantic knowledge graph...')
    
    this.papers = await prisma.researchPaper.findMany({
      select: {
        id: true,
        title: true,
        authors: true,
        systemType: true,
        powerOutput: true,
        efficiency: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        keywords: true,
        source: true,
        journal: true,
        abstract: true
      }
    })

    // Build nodes for materials
    const materialMap = new Map<string, { papers: string[], powers: number[], efficiencies: number[] }>()
    
    this.papers.forEach(paper => {
      if (paper.anodeMaterials) {
        try {
          const materials = JSON.parse(paper.anodeMaterials)
          materials.forEach((material: string) => {
            if (!materialMap.has(material)) {
              materialMap.set(material, { papers: [], powers: [], efficiencies: [] })
            }
            const data = materialMap.get(material)!
            data.papers.push(paper.id)
            if (paper.powerOutput) data.powers.push(paper.powerOutput)
            if (paper.efficiency) data.efficiencies.push(paper.efficiency)
          })
        } catch (e) {
          if (paper.anodeMaterials) {
            if (!materialMap.has(paper.anodeMaterials)) {
              materialMap.set(paper.anodeMaterials, { papers: [], powers: [], efficiencies: [] })
            }
            const data = materialMap.get(paper.anodeMaterials)!
            data.papers.push(paper.id)
            if (paper.powerOutput) data.powers.push(paper.powerOutput)
            if (paper.efficiency) data.efficiencies.push(paper.efficiency)
          }
        }
      }
    })

    // Create material nodes
    materialMap.forEach((data, material) => {
      const avgPower = data.powers.length > 0 ? data.powers.reduce((sum, val) => sum + val, 0) / data.powers.length : 0
      const avgEfficiency = data.efficiencies.length > 0 ? data.efficiencies.reduce((sum, val) => sum + val, 0) / data.efficiencies.length : 0
      
      this.nodes.set(`material_${material}`, {
        id: `material_${material}`,
        type: 'material',
        name: material,
        properties: {
          averagePower: avgPower,
          averageEfficiency: avgEfficiency,
          paperCount: data.papers.length,
          performanceClass: avgPower > 20000 ? 'high' : avgPower > 5000 ? 'medium' : 'low'
        },
        importance: Math.log(data.papers.length + 1) * (avgPower / 10000),
        papers: data.papers
      })
    })

    // Build organism nodes
    const organismMap = new Map<string, { papers: string[], powers: number[], complexity: number }>()
    
    this.papers.forEach(paper => {
      if (paper.organismTypes) {
        try {
          const organisms = JSON.parse(paper.organismTypes)
          organisms.forEach((organism: string) => {
            if (!organismMap.has(organism)) {
              organismMap.set(organism, { papers: [], powers: [], complexity: 1 })
            }
            const data = organismMap.get(organism)!
            data.papers.push(paper.id)
            if (paper.powerOutput) data.powers.push(paper.powerOutput)
            
            // Estimate complexity
            if (organism.includes('engineered') || organism.includes('synthetic')) data.complexity = 4
            else if (organism.includes('consortium') || organism.includes('community')) data.complexity = 3
            else if (organism.includes('mixed')) data.complexity = 2
          })
        } catch (e) {
          // Handle non-JSON
        }
      }
    })

    // Create organism nodes
    organismMap.forEach((data, organism) => {
      const avgPower = data.powers.length > 0 ? data.powers.reduce((sum, val) => sum + val, 0) / data.powers.length : 0
      
      this.nodes.set(`organism_${organism}`, {
        id: `organism_${organism}`,
        type: 'organism',
        name: organism,
        properties: {
          averagePower: avgPower,
          complexity: data.complexity,
          paperCount: data.papers.length,
          engineered: organism.includes('engineered') || organism.includes('synthetic') || organism.includes('CRISPR')
        },
        importance: Math.log(data.papers.length + 1) * (avgPower / 10000) * data.complexity,
        papers: data.papers
      })
    })

    // Build concept nodes from keywords
    const conceptMap = new Map<string, Set<string>>()
    
    this.papers.forEach(paper => {
      if (paper.keywords) {
        try {
          const keywords = JSON.parse(paper.keywords)
          keywords.forEach((keyword: string) => {
            if (!conceptMap.has(keyword)) {
              conceptMap.set(keyword, new Set())
            }
            conceptMap.get(keyword)!.add(paper.id)
          })
        } catch (e) {
          // Handle non-JSON
        }
      }
    })

    // Create concept nodes
    conceptMap.forEach((paperIds, concept) => {
      if (paperIds.size >= 3) { // Only concepts with sufficient evidence
        this.nodes.set(`concept_${concept}`, {
          id: `concept_${concept}`,
          type: 'concept',
          name: concept,
          properties: {
            paperCount: paperIds.size,
            domain: this.classifyConcept(concept)
          },
          importance: Math.log(paperIds.size + 1),
          papers: Array.from(paperIds)
        })
      }
    })

    // Build edges based on co-occurrence
    this.buildCooccurrenceEdges()
    
    console.log(`✅ Built knowledge graph: ${this.nodes.size} nodes, ${this.edges.length} edges`)
  }

  private classifyConcept(concept: string): string {
    const domains = {
      'materials': ['graphene', 'MXene', 'carbon', 'electrode', 'anode', 'cathode'],
      'biology': ['bacteria', 'biofilm', 'organism', 'microbial', 'synthetic'],
      'performance': ['power', 'efficiency', 'density', 'output', 'voltage'],
      'applications': ['wastewater', 'treatment', 'energy', 'building', 'facade'],
      'methods': ['optimization', 'engineering', 'design', 'fabrication']
    }

    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => concept.toLowerCase().includes(keyword))) {
        return domain
      }
    }
    return 'general'
  }

  private buildCooccurrenceEdges() {
    // Build edges between nodes that appear in the same papers
    const nodesByPaper = new Map<string, string[]>()
    
    this.nodes.forEach(node => {
      node.papers.forEach(paperId => {
        if (!nodesByPaper.has(paperId)) {
          nodesByPaper.set(paperId, [])
        }
        nodesByPaper.get(paperId)!.push(node.id)
      })
    })

    // Create edges for co-occurring nodes
    nodesByPaper.forEach(nodeIds => {
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const sourceId = nodeIds[i]
          const targetId = nodeIds[j]
          
          // Check if edge already exists
          const existingEdge = this.edges.find(e => 
            (e.source === sourceId && e.target === targetId) ||
            (e.source === targetId && e.target === sourceId)
          )
          
          if (existingEdge) {
            existingEdge.strength += 1
          } else {
            const sourceNode = this.nodes.get(sourceId)!
            const targetNode = this.nodes.get(targetId)!
            
            let relationship = 'co_occurs'
            if (sourceNode.type === 'material' && targetNode.type === 'organism') {
              relationship = 'used_with'
            } else if (sourceNode.type === 'concept' && targetNode.type === 'material') {
              relationship = 'describes'
            }
            
            this.edges.push({
              source: sourceId,
              target: targetId,
              relationship,
              strength: 1,
              evidence: [nodesByPaper.get(sourceId) || ''],
              confidence: 0.7
            })
          }
        }
      }
    })

    // Normalize edge strengths
    const maxStrength = Math.max(...this.edges.map(e => e.strength))
    this.edges.forEach(edge => {
      edge.strength = edge.strength / maxStrength
      edge.confidence = Math.min(0.95, edge.confidence + edge.strength * 0.2)
    })
  }

  private calculateSemanticSimilarity(query: string, paper: any): number {
    // Simplified semantic similarity calculation
    const queryWords = query.toLowerCase().split(/\\s+/)
    const paperText = [
      paper.title || '',
      paper.abstract || '',
      paper.keywords || ''
    ].join(' ').toLowerCase()

    let similarity = 0
    let matches = 0

    queryWords.forEach(word => {
      if (paperText.includes(word)) {
        matches++
        // Boost score for exact matches
        if (paper.title?.toLowerCase().includes(word)) similarity += 2
        else similarity += 1
      }
      
      // Check for semantic relationships
      this.conceptEmbeddings.forEach((embedding, concept) => {
        if (concept.includes(word) || word.includes(concept)) {
          similarity += 0.5
        }
      })
    })

    return matches / queryWords.length + similarity * 0.1
  }

  private detectQueryIntent(query: string): SemanticQuery['intent'] {
    const performanceWords = ['power', 'performance', 'efficiency', 'output', 'density']
    const materialWords = ['material', 'electrode', 'anode', 'cathode', 'graphene', 'MXene']
    const organismWords = ['bacteria', 'organism', 'biofilm', 'microbial', 'synthetic']
    const systemWords = ['system', 'design', 'configuration', 'architecture']
    const trendWords = ['trend', 'future', 'prediction', 'development', 'evolution']

    const lowerQuery = query.toLowerCase()
    
    if (performanceWords.some(word => lowerQuery.includes(word))) return 'performance_search'
    if (materialWords.some(word => lowerQuery.includes(word))) return 'material_discovery'
    if (organismWords.some(word => lowerQuery.includes(word))) return 'organism_analysis'
    if (systemWords.some(word => lowerQuery.includes(word))) return 'system_comparison'
    if (trendWords.some(word => lowerQuery.includes(word))) return 'trend_analysis'
    
    return 'performance_search' // default
  }

  private extractEntities(query: string): string[] {
    const entities: string[] = []
    const lowerQuery = query.toLowerCase()
    
    // Extract known materials
    this.nodes.forEach(node => {
      if (node.type === 'material' && lowerQuery.includes(node.name.toLowerCase())) {
        entities.push(node.name)
      }
    })
    
    // Extract known organisms
    this.nodes.forEach(node => {
      if (node.type === 'organism' && lowerQuery.includes(node.name.toLowerCase())) {
        entities.push(node.name)
      }
    })
    
    return entities
  }

  public async semanticSearch(query: string, limit: number = 10): Promise<SemanticResult[]> {
    await this.loadPapersAndBuildGraph()
    
    console.log(`🔍 Performing semantic search for: "${query}"`)
    
    const semanticQuery: SemanticQuery = {
      text: query,
      intent: this.detectQueryIntent(query),
      entities: this.extractEntities(query)
    }
    
    const results: SemanticResult[] = []
    
    this.papers.forEach(paper => {
      const relevanceScore = this.calculateSemanticSimilarity(query, paper)
      
      if (relevanceScore > 0.1) { // Minimum relevance threshold
        // Generate explanation
        let explanation = `Found relevance through `
        const reasons = []
        
        if (paper.title?.toLowerCase().includes(query.toLowerCase())) {
          reasons.push('title match')
        }
        if (semanticQuery.entities.some(entity => paper.title?.toLowerCase().includes(entity.toLowerCase()))) {
          reasons.push('entity match')
        }
        if (paper.keywords && semanticQuery.entities.some(entity => paper.keywords.includes(entity))) {
          reasons.push('keyword match')
        }
        
        explanation += reasons.join(', ') || 'semantic similarity'
        
        // Find related concepts
        const relatedConcepts: string[] = []
        this.nodes.forEach(node => {
          if (node.papers.includes(paper.id) && node.type === 'concept') {
            relatedConcepts.push(node.name)
          }
        })
        
        // Generate suggested queries
        const suggestedQueries = [
          `${semanticQuery.entities[0]} performance optimization`,
          `${paper.systemType} efficiency trends`,
          `materials similar to ${semanticQuery.entities[0]}`
        ].filter(Boolean)
        
        results.push({
          relevanceScore,
          paper,
          explanation,
          relatedConcepts: relatedConcepts.slice(0, 5),
          suggestedQueries: suggestedQueries.slice(0, 3)
        })
      }
    })
    
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
  }

  public getKnowledgeGraphSummary() {
    const nodeTypes = new Map<string, number>()
    this.nodes.forEach(node => {
      nodeTypes.set(node.type, (nodeTypes.get(node.type) || 0) + 1)
    })
    
    const edgeTypes = new Map<string, number>()
    this.edges.forEach(edge => {
      edgeTypes.set(edge.relationship, (edgeTypes.get(edge.relationship) || 0) + 1)
    })
    
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length,
      nodeTypes: Object.fromEntries(nodeTypes),
      edgeTypes: Object.fromEntries(edgeTypes),
      topNodes: Array.from(this.nodes.values())
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10)
        .map(node => ({ name: node.name, type: node.type, importance: node.importance }))
    }
  }

  public async exportKnowledgeGraph() {
    const graphData = {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      metadata: {
        createdAt: new Date().toISOString(),
        totalPapers: this.papers.length,
        version: "1.0"
      }
    }
    
    fs.writeFileSync('/Users/samfrons/Desktop/Messai/messai-mvp/knowledge-graph.json', JSON.stringify(graphData, null, 2))
    return graphData
  }
}

async function runSemanticKnowledgeSystem() {
  try {
    const kg = new SemanticKnowledgeGraph()
    
    console.log('🧠 Initializing Semantic Knowledge Graph System...')
    
    // Test semantic searches
    const testQueries = [
      "high performance MXene materials",
      "engineered bacteria for bioelectrochemical systems",
      "building integrated microbial fuel cells",
      "quantum enhanced bioelectrochemistry"
    ]
    
    console.log('\n🔍 SEMANTIC SEARCH DEMONSTRATIONS')
    console.log('='*50)
    
    for (const query of testQueries) {
      console.log(`\n🔎 Query: "${query}"`)
      const results = await kg.semanticSearch(query, 3)
      
      results.forEach((result, i) => {
        console.log(`${i + 1}. ${result.paper.title?.substring(0, 60)}...`)
        console.log(`   Relevance: ${(result.relevanceScore * 100).toFixed(1)}%`)
        console.log(`   Explanation: ${result.explanation}`)
        console.log(`   Related: ${result.relatedConcepts.slice(0, 3).join(', ')}`)
      })
    }
    
    // Generate knowledge graph summary
    console.log('\n📊 KNOWLEDGE GRAPH SUMMARY')
    console.log('='*40)
    
    const summary = kg.getKnowledgeGraphSummary()
    console.log(`Total Nodes: ${summary.totalNodes}`)
    console.log(`Total Edges: ${summary.totalEdges}`)
    console.log(`Node Types:`, summary.nodeTypes)
    console.log(`\nTop Important Nodes:`)
    summary.topNodes.slice(0, 5).forEach((node, i) => {
      console.log(`${i + 1}. ${node.name} (${node.type}) - Importance: ${node.importance.toFixed(2)}`)
    })
    
    // Export knowledge graph
    await kg.exportKnowledgeGraph()
    console.log('\n💾 Knowledge graph exported to: knowledge-graph.json')
    
    return kg
    
  } catch (error) {
    console.error('Error running Semantic Knowledge System:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
if (require.main === module) {
  runSemanticKnowledgeSystem()
}

export { SemanticKnowledgeGraph, runSemanticKnowledgeSystem }