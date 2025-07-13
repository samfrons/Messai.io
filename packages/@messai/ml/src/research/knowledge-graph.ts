import { ResearchPaper, ResearchInsight } from '../types'
import { v4 as uuidv4 } from 'uuid'

export interface KnowledgeNode {
  id: string
  type: 'paper' | 'concept' | 'method' | 'material' | 'organism' | 'application'
  label: string
  properties: Record<string, any>
  weight: number
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeEdge {
  id: string
  sourceId: string
  targetId: string
  relationshipType: 'cites' | 'uses' | 'extends' | 'contradicts' | 'relates_to' | 'applies_to'
  weight: number
  properties: Record<string, any>
  createdAt: Date
}

export interface PathResult {
  path: KnowledgeNode[]
  edges: KnowledgeEdge[]
  totalWeight: number
  pathType: 'direct' | 'indirect' | 'multihop'
}

export interface CommunityResult {
  communities: Array<{
    id: string
    nodes: KnowledgeNode[]
    centralNodes: KnowledgeNode[]
    theme: string
    coherenceScore: number
  }>
  bridgingNodes: KnowledgeNode[]
}

export class KnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map()
  private edges: Map<string, KnowledgeEdge> = new Map()
  private adjacencyList: Map<string, Set<string>> = new Map()

  async addPaper(paper: ResearchPaper): Promise<KnowledgeNode> {
    // Create paper node
    const paperNode: KnowledgeNode = {
      id: paper.id,
      type: 'paper',
      label: paper.title,
      properties: {
        authors: paper.authors,
        abstract: paper.abstract,
        publishedDate: paper.publishedDate,
        journal: paper.journal,
        doi: paper.doi,
        keywords: paper.keywords
      },
      weight: this.calculatePaperWeight(paper),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.nodes.set(paperNode.id, paperNode)
    this.initializeAdjacencyList(paperNode.id)

    // Extract and add concept nodes
    await this.extractAndAddConcepts(paper)
    
    // Add citation relationships
    await this.addCitationRelationships(paper)

    return paperNode
  }

  async addConcept(
    label: string,
    type: 'concept' | 'method' | 'material' | 'organism' | 'application',
    properties: Record<string, any> = {}
  ): Promise<KnowledgeNode> {
    const conceptNode: KnowledgeNode = {
      id: uuidv4(),
      type,
      label,
      properties,
      weight: 1.0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.nodes.set(conceptNode.id, conceptNode)
    this.initializeAdjacencyList(conceptNode.id)

    return conceptNode
  }

  async addRelationship(
    sourceId: string,
    targetId: string,
    relationshipType: 'cites' | 'uses' | 'extends' | 'contradicts' | 'relates_to' | 'applies_to',
    weight: number = 1.0,
    properties: Record<string, any> = {}
  ): Promise<KnowledgeEdge> {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      throw new Error('Source or target node not found')
    }

    const edge: KnowledgeEdge = {
      id: uuidv4(),
      sourceId,
      targetId,
      relationshipType,
      weight,
      properties,
      createdAt: new Date()
    }

    this.edges.set(edge.id, edge)
    this.adjacencyList.get(sourceId)!.add(targetId)
    
    // Update node weights based on connections
    this.updateNodeWeights(sourceId, targetId)

    return edge
  }

  async findShortestPath(sourceId: string, targetId: string): Promise<PathResult | null> {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return null
    }

    const distances = new Map<string, number>()
    const previous = new Map<string, string>()
    const visited = new Set<string>()
    const queue = [sourceId]

    distances.set(sourceId, 0)

    while (queue.length > 0) {
      const current = queue.shift()!
      
      if (current === targetId) {
        break
      }

      if (visited.has(current)) continue
      visited.add(current)

      const neighbors = this.adjacencyList.get(current) || new Set()
      
      for (const neighbor of neighbors) {
        const edge = this.findEdge(current, neighbor)
        const newDistance = (distances.get(current) || Infinity) + (edge ? 1 / edge.weight : 1)
        
        if (newDistance < (distances.get(neighbor) || Infinity)) {
          distances.set(neighbor, newDistance)
          previous.set(neighbor, current)
          queue.push(neighbor)
        }
      }
    }

    if (!previous.has(targetId)) {
      return null
    }

    // Reconstruct path
    const path: KnowledgeNode[] = []
    const edges: KnowledgeEdge[] = []
    let current = targetId

    while (current) {
      const node = this.nodes.get(current)!
      path.unshift(node)
      
      if (previous.has(current)) {
        const prev = previous.get(current)!
        const edge = this.findEdge(prev, current)
        if (edge) {
          edges.unshift(edge)
        }
        current = prev
      } else {
        break
      }
    }

    return {
      path,
      edges,
      totalWeight: distances.get(targetId) || 0,
      pathType: path.length === 2 ? 'direct' : path.length <= 4 ? 'indirect' : 'multihop'
    }
  }

  async findRelatedConcepts(nodeId: string, maxDistance: number = 2): Promise<Array<{
    node: KnowledgeNode
    distance: number
    relationshipPath: string[]
  }>> {
    const startNode = this.nodes.get(nodeId)
    if (!startNode) {
      throw new Error(`Node ${nodeId} not found`)
    }

    const visited = new Set<string>()
    const queue = [{ nodeId, distance: 0, path: [] as string[] }]
    const results: Array<{ node: KnowledgeNode, distance: number, relationshipPath: string[] }> = []

    while (queue.length > 0) {
      const { nodeId: currentId, distance, path } = queue.shift()!
      
      if (visited.has(currentId) || distance > maxDistance) continue
      visited.add(currentId)

      if (distance > 0) {
        const node = this.nodes.get(currentId)!
        results.push({ node, distance, relationshipPath: path })
      }

      const neighbors = this.adjacencyList.get(currentId) || new Set()
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          const edge = this.findEdge(currentId, neighborId)
          const newPath = [...path, edge?.relationshipType || 'relates_to']
          queue.push({ nodeId: neighborId, distance: distance + 1, path: newPath })
        }
      }
    }

    return results.sort((a, b) => a.distance - b.distance)
  }

  async identifyCommunitiesClusters(): Promise<CommunityResult> {
    // Simplified community detection using label propagation
    const communities = new Map<string, Set<string>>()
    const nodeLabels = new Map<string, string>()
    
    // Initialize each node with its own label
    for (const nodeId of this.nodes.keys()) {
      nodeLabels.set(nodeId, nodeId)
      communities.set(nodeId, new Set([nodeId]))
    }

    // Iterate label propagation
    for (let iteration = 0; iteration < 10; iteration++) {
      let changed = false
      
      for (const nodeId of this.nodes.keys()) {
        const neighbors = this.adjacencyList.get(nodeId) || new Set()
        const labelCounts = new Map<string, number>()
        
        // Count neighbor labels
        for (const neighborId of neighbors) {
          const label = nodeLabels.get(neighborId)!
          labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
        }
        
        // Find most common label
        let maxCount = 0
        let newLabel = nodeLabels.get(nodeId)!
        
        for (const [label, count] of labelCounts) {
          if (count > maxCount) {
            maxCount = count
            newLabel = label
          }
        }
        
        if (newLabel !== nodeLabels.get(nodeId)) {
          // Update label
          const oldLabel = nodeLabels.get(nodeId)!
          communities.get(oldLabel)!.delete(nodeId)
          
          if (!communities.has(newLabel)) {
            communities.set(newLabel, new Set())
          }
          communities.get(newLabel)!.add(nodeId)
          
          nodeLabels.set(nodeId, newLabel)
          changed = true
        }
      }
      
      if (!changed) break
    }

    // Convert to result format
    const communityResults = Array.from(communities.entries())
      .filter(([_, nodes]) => nodes.size > 1)
      .map(([communityId, nodeIds]) => {
        const nodes = Array.from(nodeIds).map(id => this.nodes.get(id)!).filter(Boolean)
        const centralNodes = this.findCentralNodes(nodes)
        const theme = this.generateCommunityTheme(nodes)
        const coherenceScore = this.calculateCoherenceScore(nodes)
        
        return {
          id: communityId,
          nodes,
          centralNodes,
          theme,
          coherenceScore
        }
      })

    const bridgingNodes = this.identifyBridgingNodes(communityResults)

    return {
      communities: communityResults,
      bridgingNodes
    }
  }

  async generateInsights(): Promise<ResearchInsight[]> {
    const insights: ResearchInsight[] = []

    // Identify highly connected nodes (potential important concepts)
    const highlyConnected = this.findHighlyConnectedNodes()
    for (const node of highlyConnected) {
      insights.push({
        id: uuidv4(),
        title: `Key Concept: ${node.label}`,
        insight: `${node.label} is a central concept with ${this.getNodeDegree(node.id)} connections, indicating its importance in the research domain.`,
        category: 'trend',
        confidence: Math.min(0.9, this.getNodeDegree(node.id) / 20),
        supportingEvidence: this.getConnectedPapers(node.id),
        relatedPapers: this.getConnectedPapers(node.id),
        generatedAt: new Date()
      })
    }

    // Identify emerging connections
    const emergingConnections = this.findEmergingConnections()
    for (const connection of emergingConnections) {
      insights.push({
        id: uuidv4(),
        title: `Emerging Connection: ${connection.source.label} ↔ ${connection.target.label}`,
        insight: `New research is exploring connections between ${connection.source.label} and ${connection.target.label}, representing a potential research opportunity.`,
        category: 'opportunity',
        confidence: 0.7,
        supportingEvidence: [connection.evidencePaper],
        relatedPapers: [connection.evidencePaper],
        generatedAt: new Date()
      })
    }

    // Identify research gaps (disconnected but potentially related concepts)
    const gaps = this.identifyResearchGaps()
    for (const gap of gaps) {
      insights.push({
        id: uuidv4(),
        title: `Research Gap: ${gap.concept1.label} and ${gap.concept2.label}`,
        insight: `Limited research connecting ${gap.concept1.label} and ${gap.concept2.label}, despite their potential relevance.`,
        category: 'gap',
        confidence: 0.6,
        supportingEvidence: [],
        relatedPapers: [],
        generatedAt: new Date()
      })
    }

    return insights
  }

  async getNodeNeighborhood(nodeId: string, radius: number = 1): Promise<{
    centerNode: KnowledgeNode
    neighbors: KnowledgeNode[]
    edges: KnowledgeEdge[]
    insights: string[]
  }> {
    const centerNode = this.nodes.get(nodeId)
    if (!centerNode) {
      throw new Error(`Node ${nodeId} not found`)
    }

    const visited = new Set<string>()
    const queue = [{ nodeId, distance: 0 }]
    const neighborNodes: KnowledgeNode[] = []
    const neighborEdges: KnowledgeEdge[] = []

    while (queue.length > 0) {
      const { nodeId: currentId, distance } = queue.shift()!
      
      if (visited.has(currentId) || distance > radius) continue
      visited.add(currentId)

      if (distance > 0) {
        const node = this.nodes.get(currentId)!
        neighborNodes.push(node)
      }

      if (distance < radius) {
        const neighbors = this.adjacencyList.get(currentId) || new Set()
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            const edge = this.findEdge(currentId, neighborId)
            if (edge) {
              neighborEdges.push(edge)
            }
            queue.push({ nodeId: neighborId, distance: distance + 1 })
          }
        }
      }
    }

    const insights = this.generateNeighborhoodInsights(centerNode, neighborNodes, neighborEdges)

    return {
      centerNode,
      neighbors: neighborNodes,
      edges: neighborEdges,
      insights
    }
  }

  private calculatePaperWeight(paper: ResearchPaper): number {
    let weight = 1.0
    
    // Factor in citation count (if available)
    weight += paper.citations.length * 0.1
    
    // Factor in journal impact (simplified)
    if (paper.journal) {
      weight += 0.2
    }
    
    // Factor in recency
    const years = (new Date().getTime() - paper.publishedDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    weight += Math.max(0, 2 - years * 0.1)
    
    return weight
  }

  private async extractAndAddConcepts(paper: ResearchPaper): Promise<void> {
    // Extract concepts from keywords and abstract
    const concepts = [...paper.keywords]
    
    // Simple concept extraction from abstract (in real implementation, use NLP)
    const abstractWords = paper.abstract.toLowerCase().split(/\s+/)
    const commonConcepts = ['electrode', 'microbial', 'fuel cell', 'biofilm', 'current', 'voltage', 'efficiency']
    
    for (const concept of commonConcepts) {
      if (abstractWords.some(word => word.includes(concept.toLowerCase()))) {
        concepts.push(concept)
      }
    }

    // Add concept nodes and relationships
    for (const conceptLabel of [...new Set(concepts)]) {
      let conceptNode = this.findNodeByLabel(conceptLabel, 'concept')
      
      if (!conceptNode) {
        conceptNode = await this.addConcept(conceptLabel, 'concept', {
          frequency: 1,
          firstSeen: paper.publishedDate
        })
      } else {
        // Update concept frequency
        conceptNode.properties.frequency = (conceptNode.properties.frequency || 0) + 1
        conceptNode.updatedAt = new Date()
      }

      // Add relationship between paper and concept
      await this.addRelationship(paper.id, conceptNode.id, 'uses')
    }
  }

  private async addCitationRelationships(paper: ResearchPaper): Promise<void> {
    // In a real implementation, this would parse actual citations
    // For now, we'll create mock citation relationships
    for (const citationId of paper.citations) {
      if (this.nodes.has(citationId)) {
        await this.addRelationship(paper.id, citationId, 'cites', 1.0)
      }
    }
  }

  private initializeAdjacencyList(nodeId: string): void {
    if (!this.adjacencyList.has(nodeId)) {
      this.adjacencyList.set(nodeId, new Set())
    }
  }

  private updateNodeWeights(sourceId: string, targetId: string): void {
    const sourceNode = this.nodes.get(sourceId)!
    const targetNode = this.nodes.get(targetId)!
    
    // Increase weight based on connections
    sourceNode.weight += 0.1
    targetNode.weight += 0.1
    
    sourceNode.updatedAt = new Date()
    targetNode.updatedAt = new Date()
  }

  private findEdge(sourceId: string, targetId: string): KnowledgeEdge | undefined {
    for (const edge of this.edges.values()) {
      if (edge.sourceId === sourceId && edge.targetId === targetId) {
        return edge
      }
    }
    return undefined
  }

  private findNodeByLabel(label: string, type?: string): KnowledgeNode | undefined {
    for (const node of this.nodes.values()) {
      if (node.label === label && (!type || node.type === type)) {
        return node
      }
    }
    return undefined
  }

  private findCentralNodes(nodes: KnowledgeNode[]): KnowledgeNode[] {
    return nodes
      .sort((a, b) => b.weight - a.weight)
      .slice(0, Math.max(1, Math.floor(nodes.length * 0.2)))
  }

  private generateCommunityTheme(nodes: KnowledgeNode[]): string {
    const conceptNodes = nodes.filter(n => n.type === 'concept')
    if (conceptNodes.length > 0) {
      return conceptNodes[0].label
    }
    
    const paperNodes = nodes.filter(n => n.type === 'paper')
    if (paperNodes.length > 0) {
      const keywords = paperNodes.flatMap(n => n.properties.keywords || [])
      const commonKeyword = this.findMostCommon(keywords)
      return commonKeyword || 'Research Cluster'
    }
    
    return 'Unknown Theme'
  }

  private calculateCoherenceScore(nodes: KnowledgeNode[]): number {
    if (nodes.length < 2) return 1.0
    
    let connections = 0
    const nodeIds = new Set(nodes.map(n => n.id))
    
    for (const node of nodes) {
      const neighbors = this.adjacencyList.get(node.id) || new Set()
      connections += Array.from(neighbors).filter(id => nodeIds.has(id)).length
    }
    
    const maxConnections = nodes.length * (nodes.length - 1)
    return connections / maxConnections
  }

  private identifyBridgingNodes(communities: any[]): KnowledgeNode[] {
    const bridgingNodes: KnowledgeNode[] = []
    
    for (const node of this.nodes.values()) {
      const neighbors = this.adjacencyList.get(node.id) || new Set()
      const neighborCommunities = new Set<string>()
      
      for (const neighborId of neighbors) {
        for (const community of communities) {
          if (community.nodes.some((n: KnowledgeNode) => n.id === neighborId)) {
            neighborCommunities.add(community.id)
          }
        }
      }
      
      if (neighborCommunities.size > 1) {
        bridgingNodes.push(node)
      }
    }
    
    return bridgingNodes
  }

  private findHighlyConnectedNodes(): KnowledgeNode[] {
    const degrees = new Map<string, number>()
    
    for (const nodeId of this.nodes.keys()) {
      degrees.set(nodeId, this.getNodeDegree(nodeId))
    }
    
    const sortedNodes = Array.from(this.nodes.values())
      .sort((a, b) => (degrees.get(b.id) || 0) - (degrees.get(a.id) || 0))
    
    return sortedNodes.slice(0, 10)
  }

  private getNodeDegree(nodeId: string): number {
    const outDegree = (this.adjacencyList.get(nodeId) || new Set()).size
    let inDegree = 0
    
    for (const neighbors of this.adjacencyList.values()) {
      if (neighbors.has(nodeId)) {
        inDegree++
      }
    }
    
    return outDegree + inDegree
  }

  private getConnectedPapers(nodeId: string): string[] {
    const papers = []
    const neighbors = this.adjacencyList.get(nodeId) || new Set()
    
    for (const neighborId of neighbors) {
      const neighbor = this.nodes.get(neighborId)
      if (neighbor && neighbor.type === 'paper') {
        papers.push(neighbor.id)
      }
    }
    
    return papers
  }

  private findEmergingConnections(): Array<{
    source: KnowledgeNode
    target: KnowledgeNode
    evidencePaper: string
  }> {
    // Find recently added connections
    const recentDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
    const recentEdges = Array.from(this.edges.values())
      .filter(edge => edge.createdAt > recentDate)
    
    return recentEdges.slice(0, 5).map(edge => ({
      source: this.nodes.get(edge.sourceId)!,
      target: this.nodes.get(edge.targetId)!,
      evidencePaper: edge.sourceId // Simplified
    }))
  }

  private identifyResearchGaps(): Array<{
    concept1: KnowledgeNode
    concept2: KnowledgeNode
    potentialRelevance: number
  }> {
    const concepts = Array.from(this.nodes.values()).filter(n => n.type === 'concept')
    const gaps = []
    
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const concept1 = concepts[i]
        const concept2 = concepts[j]
        
        // Check if they're not directly connected
        const path = this.findShortestPath(concept1.id, concept2.id)
        if (!path || path.path.length > 3) {
          gaps.push({
            concept1,
            concept2,
            potentialRelevance: Math.random() // Simplified relevance calculation
          })
        }
      }
    }
    
    return gaps.slice(0, 5)
  }

  private generateNeighborhoodInsights(
    center: KnowledgeNode,
    neighbors: KnowledgeNode[],
    edges: KnowledgeEdge[]
  ): string[] {
    const insights = []
    
    insights.push(`${center.label} is connected to ${neighbors.length} related concepts`)
    
    const relationshipTypes = edges.map(e => e.relationshipType)
    const commonRelation = this.findMostCommon(relationshipTypes)
    if (commonRelation) {
      insights.push(`Most common relationship: ${commonRelation}`)
    }
    
    const conceptNeighbors = neighbors.filter(n => n.type === 'concept')
    if (conceptNeighbors.length > 0) {
      insights.push(`Related concepts: ${conceptNeighbors.slice(0, 3).map(n => n.label).join(', ')}`)
    }
    
    return insights
  }

  private findMostCommon(items: string[]): string | undefined {
    if (items.length === 0) return undefined
    
    const counts = new Map<string, number>()
    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1)
    }
    
    let maxCount = 0
    let mostCommon = items[0]
    
    for (const [item, count] of counts) {
      if (count > maxCount) {
        maxCount = count
        mostCommon = item
      }
    }
    
    return mostCommon
  }

  // Public getters
  getNode(nodeId: string): KnowledgeNode | undefined {
    return this.nodes.get(nodeId)
  }

  getAllNodes(): KnowledgeNode[] {
    return Array.from(this.nodes.values())
  }

  getNodesByType(type: string): KnowledgeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type)
  }

  getAllEdges(): KnowledgeEdge[] {
    return Array.from(this.edges.values())
  }

  getStats(): {
    nodeCount: number
    edgeCount: number
    nodeTypes: Record<string, number>
    relationshipTypes: Record<string, number>
  } {
    const nodeTypes: Record<string, number> = {}
    const relationshipTypes: Record<string, number> = {}
    
    for (const node of this.nodes.values()) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1
    }
    
    for (const edge of this.edges.values()) {
      relationshipTypes[edge.relationshipType] = (relationshipTypes[edge.relationshipType] || 0) + 1
    }
    
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      nodeTypes,
      relationshipTypes
    }
  }
}