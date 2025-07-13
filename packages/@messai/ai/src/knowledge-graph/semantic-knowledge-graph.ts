import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

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

export class SemanticKnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map()
  private edges: KnowledgeEdge[] = []
  private conceptEmbeddings: Map<string, number[]> = new Map()
  private papers: any[] = []
  private prisma: PrismaClient

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient()
    this.initializeConceptEmbeddings()
  }

  private initializeConceptEmbeddings() {
    // Simplified concept embeddings (in production, would use actual ML embeddings)
    const concepts = [
      'graphene', 'MXene', 'carbon_nanotube', 'quantum_dot', 'biofilm',
      'electron_transfer', 'power_density', 'efficiency', 'scalability',
      'Geobacter', 'Shewanella', 'synthetic_biology', 'CRISPR', 'extremophile',
      'wastewater', 'biofacade', 'building_integration', 'space_application',
      'bioelectrochemical', 'microbial_fuel_cell', 'electrode', 'membrane',
      'substrate', 'biofilm_formation', 'electron_shuttling', 'mediator'
    ]

    concepts.forEach((concept, i) => {
      // Generate pseudo-embeddings based on concept properties
      const embedding = Array.from({ length: 128 }, (_, j) => 
        Math.sin(i * 0.1 + j * 0.05) + Math.cos(i * 0.07 + j * 0.03)
      )
      this.conceptEmbeddings.set(concept, embedding)
    })
  }

  async loadPapersAndBuildGraph() {
    console.log('🔗 Building semantic knowledge graph...')
    
    try {
      this.papers = await this.prisma.researchPaper.findMany({
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
          abstract: true,
          citations: {
            select: {
              citedPaper: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          citedBy: {
            select: {
              citingPaper: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      })

      // Build nodes for materials
      this.buildMaterialNodes()
      
      // Build organism nodes
      this.buildOrganismNodes()
      
      // Build concept nodes from keywords
      this.buildConceptNodes()
      
      // Build system type nodes
      this.buildSystemNodes()
      
      // Build edges based on co-occurrence and citations
      this.buildCooccurrenceEdges()
      this.buildCitationEdges()
      
      console.log(`✅ Built knowledge graph: ${this.nodes.size} nodes, ${this.edges.length} edges`)
    } catch (error) {
      console.error('Error building knowledge graph:', error)
      throw error
    }
  }

  private buildMaterialNodes() {
    const materialMap = new Map<string, { papers: string[], powers: number[], efficiencies: number[] }>()
    
    this.papers.forEach(paper => {
      // Process anode materials
      if (paper.anodeMaterials) {
        try {
          const materials = JSON.parse(paper.anodeMaterials)
          materials.forEach((material: string) => {
            this.addMaterialData(materialMap, material, paper)
          })
        } catch (e) {
          if (typeof paper.anodeMaterials === 'string') {
            this.addMaterialData(materialMap, paper.anodeMaterials, paper)
          }
        }
      }
      
      // Process cathode materials
      if (paper.cathodeMaterials) {
        try {
          const materials = JSON.parse(paper.cathodeMaterials)
          materials.forEach((material: string) => {
            this.addMaterialData(materialMap, material, paper)
          })
        } catch (e) {
          if (typeof paper.cathodeMaterials === 'string') {
            this.addMaterialData(materialMap, paper.cathodeMaterials, paper)
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
  }

  private addMaterialData(
    materialMap: Map<string, { papers: string[], powers: number[], efficiencies: number[] }>,
    material: string,
    paper: any
  ) {
    if (!materialMap.has(material)) {
      materialMap.set(material, { papers: [], powers: [], efficiencies: [] })
    }
    const data = materialMap.get(material)!
    data.papers.push(paper.id)
    if (paper.powerOutput) data.powers.push(paper.powerOutput)
    if (paper.efficiency) data.efficiencies.push(paper.efficiency)
  }

  private buildOrganismNodes() {
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
  }

  private buildConceptNodes() {
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
  }

  private buildSystemNodes() {
    const systemMap = new Map<string, { papers: string[], powers: number[] }>()
    
    this.papers.forEach(paper => {
      if (paper.systemType) {
        if (!systemMap.has(paper.systemType)) {
          systemMap.set(paper.systemType, { papers: [], powers: [] })
        }
        const data = systemMap.get(paper.systemType)!
        data.papers.push(paper.id)
        if (paper.powerOutput) data.powers.push(paper.powerOutput)
      }
    })

    // Create system nodes
    systemMap.forEach((data, system) => {
      const avgPower = data.powers.length > 0 ? data.powers.reduce((sum, val) => sum + val, 0) / data.powers.length : 0
      
      this.nodes.set(`system_${system}`, {
        id: `system_${system}`,
        type: 'system',
        name: system,
        properties: {
          averagePower: avgPower,
          paperCount: data.papers.length
        },
        importance: Math.log(data.papers.length + 1) * (avgPower / 10000),
        papers: data.papers
      })
    })
  }

  private classifyConcept(concept: string): string {
    const domains = {
      'materials': ['graphene', 'MXene', 'carbon', 'electrode', 'anode', 'cathode', 'membrane'],
      'biology': ['bacteria', 'biofilm', 'organism', 'microbial', 'synthetic', 'Geobacter', 'Shewanella'],
      'performance': ['power', 'efficiency', 'density', 'output', 'voltage', 'current'],
      'applications': ['wastewater', 'treatment', 'energy', 'building', 'facade', 'desalination'],
      'methods': ['optimization', 'engineering', 'design', 'fabrication', 'synthesis']
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
            } else if (sourceNode.type === 'system' && targetNode.type === 'material') {
              relationship = 'contains'
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
    if (maxStrength > 0) {
      this.edges.forEach(edge => {
        edge.strength = edge.strength / maxStrength
        edge.confidence = Math.min(0.95, edge.confidence + edge.strength * 0.2)
      })
    }
  }

  private buildCitationEdges() {
    // Build edges based on citation relationships
    this.papers.forEach(paper => {
      if (paper.citations && paper.citations.length > 0) {
        paper.citations.forEach((citation: any) => {
          const citedPaperId = citation.citedPaper.id
          
          // Find nodes that contain these papers
          const sourceNodes: string[] = []
          const targetNodes: string[] = []
          
          this.nodes.forEach(node => {
            if (node.papers.includes(paper.id)) sourceNodes.push(node.id)
            if (node.papers.includes(citedPaperId)) targetNodes.push(node.id)
          })
          
          // Create citation edges between related nodes
          sourceNodes.forEach(sourceId => {
            targetNodes.forEach(targetId => {
              if (sourceId !== targetId) {
                const existingEdge = this.edges.find(e => 
                  e.source === sourceId && e.target === targetId && e.relationship === 'cites'
                )
                
                if (!existingEdge) {
                  this.edges.push({
                    source: sourceId,
                    target: targetId,
                    relationship: 'cites',
                    strength: 0.8,
                    evidence: [paper.id, citedPaperId],
                    confidence: 0.9
                  })
                }
              }
            })
          })
        })
      }
    })
  }

  private calculateSemanticSimilarity(query: string, paper: any): number {
    // Enhanced semantic similarity calculation
    const queryWords = query.toLowerCase().split(/\s+/)
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
        else if (paper.abstract?.toLowerCase().includes(word)) similarity += 1.5
        else similarity += 1
      }
      
      // Check for semantic relationships
      this.conceptEmbeddings.forEach((embedding, concept) => {
        if (concept.includes(word) || word.includes(concept)) {
          similarity += 0.5
        }
      })
    })

    // Consider system type relevance
    if (paper.systemType && query.toLowerCase().includes(paper.systemType.toLowerCase())) {
      similarity += 1.5
    }

    // Consider material relevance
    const materials = [...(paper.anodeMaterials || []), ...(paper.cathodeMaterials || [])]
    materials.forEach(material => {
      if (query.toLowerCase().includes(material.toLowerCase())) {
        similarity += 1.5
      }
    })

    return matches / queryWords.length + similarity * 0.1
  }

  detectQueryIntent(query: string): SemanticQuery['intent'] {
    const performanceWords = ['power', 'performance', 'efficiency', 'output', 'density', 'voltage', 'current']
    const materialWords = ['material', 'electrode', 'anode', 'cathode', 'graphene', 'MXene', 'carbon']
    const organismWords = ['bacteria', 'organism', 'biofilm', 'microbial', 'synthetic', 'Geobacter', 'Shewanella']
    const systemWords = ['system', 'design', 'configuration', 'architecture', 'MFC', 'MEC', 'MDC']
    const trendWords = ['trend', 'future', 'prediction', 'development', 'evolution', 'progress']

    const lowerQuery = query.toLowerCase()
    
    if (performanceWords.some(word => lowerQuery.includes(word))) return 'performance_search'
    if (materialWords.some(word => lowerQuery.includes(word))) return 'material_discovery'
    if (organismWords.some(word => lowerQuery.includes(word))) return 'organism_analysis'
    if (systemWords.some(word => lowerQuery.includes(word))) return 'system_comparison'
    if (trendWords.some(word => lowerQuery.includes(word))) return 'trend_analysis'
    
    return 'performance_search' // default
  }

  extractEntities(query: string): string[] {
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
    
    // Extract known systems
    this.nodes.forEach(node => {
      if (node.type === 'system' && lowerQuery.includes(node.name.toLowerCase())) {
        entities.push(node.name)
      }
    })
    
    return [...new Set(entities)] // Remove duplicates
  }

  async semanticSearch(query: string, limit: number = 10): Promise<SemanticResult[]> {
    if (this.nodes.size === 0) {
      await this.loadPapersAndBuildGraph()
    }
    
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
        if (paper.abstract && paper.abstract.toLowerCase().includes(query.toLowerCase())) {
          reasons.push('abstract match')
        }
        
        explanation += reasons.join(', ') || 'semantic similarity'
        
        // Find related concepts
        const relatedConcepts: string[] = []
        this.nodes.forEach(node => {
          if (node.papers.includes(paper.id) && node.type === 'concept') {
            relatedConcepts.push(node.name)
          }
        })
        
        // Generate suggested queries based on intent
        const suggestedQueries = this.generateSuggestedQueries(semanticQuery, paper)
        
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

  private generateSuggestedQueries(semanticQuery: SemanticQuery, paper: any): string[] {
    const queries: string[] = []
    
    switch (semanticQuery.intent) {
      case 'performance_search':
        if (paper.systemType) queries.push(`${paper.systemType} optimization techniques`)
        if (semanticQuery.entities[0]) queries.push(`${semanticQuery.entities[0]} performance comparison`)
        queries.push(`high efficiency ${paper.systemType || 'bioelectrochemical'} systems`)
        break
        
      case 'material_discovery':
        if (semanticQuery.entities[0]) queries.push(`materials similar to ${semanticQuery.entities[0]}`)
        queries.push(`novel electrode materials for ${paper.systemType || 'MFC'}`)
        queries.push(`${semanticQuery.entities[0] || 'electrode'} synthesis methods`)
        break
        
      case 'organism_analysis':
        if (semanticQuery.entities[0]) queries.push(`${semanticQuery.entities[0]} genetic engineering`)
        queries.push(`microbial consortia with ${semanticQuery.entities[0] || paper.organismTypes?.[0]}`)
        queries.push(`electron transfer mechanisms in ${paper.organismTypes?.[0] || 'biofilms'}`)
        break
        
      case 'system_comparison':
        queries.push(`${paper.systemType} vs other bioelectrochemical systems`)
        queries.push(`scalability of ${paper.systemType} designs`)
        queries.push(`cost analysis of ${paper.systemType} implementations`)
        break
        
      case 'trend_analysis':
        queries.push(`future of ${paper.systemType || 'bioelectrochemical'} systems`)
        queries.push(`emerging materials in ${paper.systemType || 'MFC'} research`)
        queries.push(`${new Date().getFullYear()} advances in bioelectrochemistry`)
        break
    }
    
    return queries.filter(Boolean)
  }

  getKnowledgeGraphSummary() {
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
        .map(node => ({ 
          id: node.id,
          name: node.name, 
          type: node.type, 
          importance: node.importance,
          paperCount: node.papers.length
        }))
    }
  }

  getGraphData() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    }
  }

  async exportKnowledgeGraph(outputPath?: string) {
    const graphData = {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      metadata: {
        createdAt: new Date().toISOString(),
        totalPapers: this.papers.length,
        version: "2.0"
      }
    }
    
    const filePath = outputPath || path.join(process.cwd(), 'knowledge-graph.json')
    fs.writeFileSync(filePath, JSON.stringify(graphData, null, 2))
    return graphData
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}

// Export utility function for standalone execution
export async function runSemanticKnowledgeSystem() {
  const kg = new SemanticKnowledgeGraph()
  
  try {
    console.log('🧠 Initializing Semantic Knowledge Graph System...')
    
    await kg.loadPapersAndBuildGraph()
    
    // Test semantic searches
    const testQueries = [
      "high performance MXene materials",
      "engineered bacteria for bioelectrochemical systems",
      "building integrated microbial fuel cells",
      "quantum enhanced bioelectrochemistry"
    ]
    
    console.log('\n🔍 SEMANTIC SEARCH DEMONSTRATIONS')
    console.log('='.repeat(50))
    
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
    console.log('='.repeat(40))
    
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
    await kg.disconnect()
  }
}