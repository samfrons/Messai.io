import type { KnowledgeNode, KnowledgeEdge } from '@messai/database'

export interface GraphData {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

export interface CitationPattern {
  paperId: string
  citations: string[]
  citedBy: string[]
  cocitationStrength: Map<string, number>
}

export class KnowledgeGraphAlgorithms {
  // Find citation patterns between papers
  static analyzeCitationPatterns(
    papers: any[],
    edges: KnowledgeEdge[]
  ): Map<string, CitationPattern> {
    const patterns = new Map<string, CitationPattern>()
    
    // Initialize patterns for each paper
    papers.forEach(paper => {
      patterns.set(paper.id, {
        paperId: paper.id,
        citations: [],
        citedBy: [],
        cocitationStrength: new Map()
      })
    })
    
    // Build citation relationships
    edges.forEach(edge => {
      if (edge.edgeType === 'cites') {
        const sourcePattern = patterns.get(edge.sourceId)
        const targetPattern = patterns.get(edge.targetId)
        
        if (sourcePattern) {
          sourcePattern.citations.push(edge.targetId)
        }
        if (targetPattern) {
          targetPattern.citedBy.push(edge.sourceId)
        }
      }
    })
    
    // Calculate co-citation strength
    patterns.forEach((pattern, paperId) => {
      pattern.citedBy.forEach(citer1 => {
        pattern.citedBy.forEach(citer2 => {
          if (citer1 !== citer2) {
            const key = [citer1, citer2].sort().join('-')
            const current = pattern.cocitationStrength.get(key) || 0
            pattern.cocitationStrength.set(key, current + 1)
          }
        })
      })
    })
    
    return patterns
  }

  // Identify research communities using label propagation
  static findResearchCommunities(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[]
  ): Map<string, string[]> {
    const communities = new Map<string, string[]>()
    const labels = new Map<string, string>()
    
    // Initialize each node with its own label
    nodes.forEach(node => {
      labels.set(node.id, node.id)
    })
    
    // Build adjacency list
    const adjacency = new Map<string, Set<string>>()
    edges.forEach(edge => {
      if (!adjacency.has(edge.sourceId)) {
        adjacency.set(edge.sourceId, new Set())
      }
      if (!adjacency.has(edge.targetId)) {
        adjacency.set(edge.targetId, new Set())
      }
      adjacency.get(edge.sourceId)!.add(edge.targetId)
      adjacency.get(edge.targetId)!.add(edge.sourceId)
    })
    
    // Label propagation iterations
    let changed = true
    let iterations = 0
    const maxIterations = 30
    
    while (changed && iterations < maxIterations) {
      changed = false
      iterations++
      
      // Shuffle nodes for asynchronous updates
      const shuffledNodes = [...nodes].sort(() => Math.random() - 0.5)
      
      shuffledNodes.forEach(node => {
        const neighbors = adjacency.get(node.id) || new Set()
        if (neighbors.size === 0) return
        
        // Count label frequencies among neighbors
        const labelCounts = new Map<string, number>()
        neighbors.forEach(neighborId => {
          const neighborLabel = labels.get(neighborId)
          if (neighborLabel) {
            labelCounts.set(
              neighborLabel,
              (labelCounts.get(neighborLabel) || 0) + 1
            )
          }
        })
        
        // Find most frequent label
        let maxCount = 0
        let maxLabel = labels.get(node.id)!
        labelCounts.forEach((count, label) => {
          if (count > maxCount || (count === maxCount && label < maxLabel)) {
            maxCount = count
            maxLabel = label
          }
        })
        
        // Update label if changed
        if (labels.get(node.id) !== maxLabel) {
          labels.set(node.id, maxLabel)
          changed = true
        }
      })
    }
    
    // Group nodes by community label
    labels.forEach((label, nodeId) => {
      if (!communities.has(label)) {
        communities.set(label, [])
      }
      communities.get(label)!.push(nodeId)
    })
    
    return communities
  }

  // Calculate impact scores for materials and methods
  static calculateImpactScores(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    papers: any[]
  ): Map<string, number> {
    const scores = new Map<string, number>()
    
    // Create paper performance lookup
    const paperPerformance = new Map<string, number>()
    papers.forEach(paper => {
      const performance = (paper.powerOutput || 0) * (paper.efficiency || 1)
      paperPerformance.set(paper.id, performance)
    })
    
    // Calculate scores for materials and methods
    nodes.forEach(node => {
      if (node.type === 'material' || node.type === 'method') {
        let totalScore = 0
        let paperCount = 0
        
        edges.forEach(edge => {
          if (edge.targetId === node.id && edge.edgeType === 'uses_material') {
            const performance = paperPerformance.get(edge.sourceId) || 0
            totalScore += performance * edge.weight
            paperCount++
          }
        })
        
        const avgScore = paperCount > 0 ? totalScore / paperCount : 0
        scores.set(node.id, avgScore)
      }
    })
    
    return scores
  }

  // Find research gaps and opportunities
  static identifyResearchGaps(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[]
  ): {
    underexploredCombinations: Array<{ material1: string; material2: string; score: number }>
    emergingTopics: Array<{ topic: string; growthRate: number }>
    isolatedNodes: string[]
  } {
    // Find materials that haven't been combined
    const materialNodes = nodes.filter(n => n.type === 'material')
    const materialCombinations = new Map<string, Set<string>>()
    
    // Build existing combinations
    edges.forEach(edge => {
      if (edge.edgeType === 'uses_material') {
        const paperId = edge.sourceId
        if (!materialCombinations.has(paperId)) {
          materialCombinations.set(paperId, new Set())
        }
        materialCombinations.get(paperId)!.add(edge.targetId)
      }
    })
    
    // Find underexplored combinations
    const underexploredCombinations: Array<{ material1: string; material2: string; score: number }> = []
    materialNodes.forEach((mat1, i) => {
      materialNodes.slice(i + 1).forEach(mat2 => {
        let combinationCount = 0
        materialCombinations.forEach(materials => {
          if (materials.has(mat1.id) && materials.has(mat2.id)) {
            combinationCount++
          }
        })
        
        if (combinationCount < 3) { // Threshold for "underexplored"
          underexploredCombinations.push({
            material1: mat1.name,
            material2: mat2.name,
            score: 1 - (combinationCount / 3)
          })
        }
      })
    })
    
    // Find emerging topics (simplified - would use time series in production)
    const topicNodes = nodes.filter(n => n.type === 'topic')
    const emergingTopics = topicNodes
      .map(topic => {
        const connections = edges.filter(
          e => e.sourceId === topic.id || e.targetId === topic.id
        ).length
        
        return {
          topic: topic.name,
          growthRate: connections * (topic.importance || 0.5)
        }
      })
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 10)
    
    // Find isolated nodes
    const connectedNodes = new Set<string>()
    edges.forEach(edge => {
      connectedNodes.add(edge.sourceId)
      connectedNodes.add(edge.targetId)
    })
    
    const isolatedNodes = nodes
      .filter(node => !connectedNodes.has(node.id))
      .map(node => node.id)
    
    return {
      underexploredCombinations: underexploredCombinations.slice(0, 20),
      emergingTopics,
      isolatedNodes
    }
  }

  // Predict future collaborations
  static predictCollaborations(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[]
  ): Array<{ author1: string; author2: string; probability: number }> {
    const authorNodes = nodes.filter(n => n.type === 'author')
    const collaborations = new Map<string, Set<string>>()
    
    // Build existing collaborations
    edges.forEach(edge => {
      if (edge.edgeType === 'co_author') {
        if (!collaborations.has(edge.sourceId)) {
          collaborations.set(edge.sourceId, new Set())
        }
        if (!collaborations.has(edge.targetId)) {
          collaborations.set(edge.targetId, new Set())
        }
        collaborations.get(edge.sourceId)!.add(edge.targetId)
        collaborations.get(edge.targetId)!.add(edge.sourceId)
      }
    })
    
    // Predict new collaborations based on common collaborators
    const predictions: Array<{ author1: string; author2: string; probability: number }> = []
    
    authorNodes.forEach((author1, i) => {
      authorNodes.slice(i + 1).forEach(author2 => {
        const collab1 = collaborations.get(author1.id) || new Set()
        const collab2 = collaborations.get(author2.id) || new Set()
        
        // Skip if already collaborating
        if (collab1.has(author2.id)) return
        
        // Find common collaborators
        const common = Array.from(collab1).filter(c => collab2.has(c))
        
        if (common.length > 0) {
          const probability = Math.min(common.length * 0.2, 0.9)
          predictions.push({
            author1: author1.name,
            author2: author2.name,
            probability
          })
        }
      })
    })
    
    return predictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 20)
  }
}