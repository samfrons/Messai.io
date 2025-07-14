'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@messai/ui'

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false })

interface GraphNode {
  id: string
  name: string
  type: 'paper' | 'author' | 'material' | 'organism' | 'concept' | 'method'
  value: number
  color: string
  metadata?: any
}

interface GraphLink {
  source: string
  target: string
  type: 'authored' | 'uses_material' | 'studies_organism' | 'related_to' | 'cites'
  strength: number
}

interface KnowledgeGraphProps {
  papers: any[]
  onNodeClick?: (node: GraphNode) => void
  height?: number
}

export function KnowledgeGraph({ papers, onNodeClick, height = 600 }: KnowledgeGraphProps) {
  const fgRef = useRef<any>()
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({
    nodes: [],
    links: []
  })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [viewMode, setViewMode] = useState<'all' | 'materials' | 'organisms' | 'authors'>('all')
  const [showLabels, setShowLabels] = useState(true)

  // Process papers into graph data
  useEffect(() => {
    if (!papers || papers.length === 0) return

    const nodes: Map<string, GraphNode> = new Map()
    const links: GraphLink[] = []

    // Helper to add node
    const addNode = (id: string, name: string, type: GraphNode['type'], value = 1) => {
      if (!nodes.has(id)) {
        nodes.set(id, {
          id,
          name,
          type,
          value,
          color: getNodeColor(type)
        })
      } else {
        // Increase value for existing nodes
        const node = nodes.get(id)!
        node.value += value
      }
    }

    // Process each paper
    papers.forEach(paper => {
      const paperId = `paper_${paper.id}`
      addNode(paperId, paper.title || 'Untitled', 'paper', 5)

      // Add authors
      const authors = extractArrayField(paper.authors)
      authors.forEach(author => {
        if (author && author !== 'not specified') {
          const authorId = `author_${author.toLowerCase().replace(/\s+/g, '_')}`
          addNode(authorId, author, 'author', 2)
          links.push({
            source: authorId,
            target: paperId,
            type: 'authored',
            strength: 1
          })
        }
      })

      // Add materials
      const materials = [
        ...extractArrayField(paper.anodeMaterials),
        ...extractArrayField(paper.cathodeMaterials)
      ]
      materials.forEach(material => {
        if (material) {
          const materialId = `material_${material.toLowerCase().replace(/\s+/g, '_')}`
          addNode(materialId, material, 'material', 3)
          links.push({
            source: paperId,
            target: materialId,
            type: 'uses_material',
            strength: 0.8
          })
        }
      })

      // Add organisms
      const organisms = extractArrayField(paper.organismTypes)
      organisms.forEach(organism => {
        if (organism) {
          const organismId = `organism_${organism.toLowerCase().replace(/\s+/g, '_')}`
          addNode(organismId, organism, 'organism', 3)
          links.push({
            source: paperId,
            target: organismId,
            type: 'studies_organism',
            strength: 0.8
          })
        }
      })

      // Add concepts from keywords
      const keywords = extractArrayField(paper.keywords)
      keywords.slice(0, 3).forEach(keyword => {
        if (keyword && keyword.length > 3) {
          const conceptId = `concept_${keyword.toLowerCase().replace(/\s+/g, '_')}`
          addNode(conceptId, keyword, 'concept', 1)
          links.push({
            source: paperId,
            target: conceptId,
            type: 'related_to',
            strength: 0.5
          })
        }
      })

      // Add system type as method
      if (paper.systemType) {
        const methodId = `method_${paper.systemType.toLowerCase().replace(/\s+/g, '_')}`
        addNode(methodId, paper.systemType, 'method', 2)
        links.push({
          source: paperId,
          target: methodId,
          type: 'related_to',
          strength: 0.7
        })
      }
    })

    // Create inter-material and inter-organism connections
    const materialNodes = Array.from(nodes.values()).filter(n => n.type === 'material')
    const organismNodes = Array.from(nodes.values()).filter(n => n.type === 'organism')

    // Connect materials that appear together
    materialNodes.forEach((mat1, i) => {
      materialNodes.slice(i + 1).forEach(mat2 => {
        const sharedPapers = links.filter(l => 
          l.type === 'uses_material' && 
          ((l.source === mat1.id || l.target === mat1.id) && 
           links.some(l2 => l2.type === 'uses_material' && 
             (l2.source === mat2.id || l2.target === mat2.id) && 
             (l.source === l2.source || l.target === l2.target)))
        ).length

        if (sharedPapers > 1) {
          links.push({
            source: mat1.id,
            target: mat2.id,
            type: 'related_to',
            strength: Math.min(sharedPapers * 0.2, 1)
          })
        }
      })
    })

    // Apply view mode filter
    let filteredNodes = Array.from(nodes.values())
    let filteredLinks = links

    if (viewMode !== 'all') {
      const typeMap = {
        materials: 'material',
        organisms: 'organism',
        authors: 'author'
      }
      const targetType = typeMap[viewMode as keyof typeof typeMap]
      
      // Keep papers and the selected type
      filteredNodes = filteredNodes.filter(n => 
        n.type === 'paper' || n.type === targetType
      )
      
      // Keep only links between filtered nodes
      const nodeIds = new Set(filteredNodes.map(n => n.id))
      filteredLinks = links.filter(l => 
        nodeIds.has(l.source) && nodeIds.has(l.target)
      )
    }

    setGraphData({ nodes: filteredNodes, links: filteredLinks })
  }, [papers, viewMode])

  // Helper functions
  function extractArrayField(field: any): string[] {
    if (!field) return []
    if (Array.isArray(field)) return field
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        return Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        return [field]
      }
    }
    return []
  }

  function getNodeColor(type: GraphNode['type']): string {
    const colors = {
      paper: '#3B82F6', // blue
      author: '#10B981', // green
      material: '#F59E0B', // yellow
      organism: '#EF4444', // red
      concept: '#8B5CF6', // purple
      method: '#EC4899' // pink
    }
    return colors[type] || '#6B7280'
  }

  function getNodeSize(node: GraphNode): number {
    const baseSize = {
      paper: 8,
      author: 6,
      material: 7,
      organism: 7,
      concept: 4,
      method: 5
    }
    return (baseSize[node.type] || 4) + Math.sqrt(node.value) * 2
  }

  // Handle node interactions
  const handleNodeClick = (node: any) => {
    setSelectedNode(node)
    if (onNodeClick) {
      onNodeClick(node)
    }
    
    // Center camera on clicked node
    if (fgRef.current) {
      const distance = 200
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z)
      
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        2000
      )
    }
  }

  const handleNodeHover = (node: any) => {
    setHoveredNode(node)
    document.body.style.cursor = node ? 'pointer' : 'default'
  }

  // Calculate graph statistics
  const stats = {
    totalNodes: graphData.nodes.length,
    papers: graphData.nodes.filter(n => n.type === 'paper').length,
    authors: graphData.nodes.filter(n => n.type === 'author').length,
    materials: graphData.nodes.filter(n => n.type === 'material').length,
    organisms: graphData.nodes.filter(n => n.type === 'organism').length,
    connections: graphData.links.length
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Knowledge Graph</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setViewMode('materials')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'materials' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Materials
              </button>
              <button
                onClick={() => setViewMode('organisms')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'organisms' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Organisms
              </button>
              <button
                onClick={() => setViewMode('authors')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'authors' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Authors
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Labels</span>
            </label>
            
            <button
              onClick={() => fgRef.current?.zoomToFit(400)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
            >
              Reset View
            </button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Nodes:</span>
            <span className="ml-1 font-semibold">{stats.totalNodes}</span>
          </div>
          <div>
            <span className="text-gray-500">Papers:</span>
            <span className="ml-1 font-semibold text-blue-600">{stats.papers}</span>
          </div>
          <div>
            <span className="text-gray-500">Authors:</span>
            <span className="ml-1 font-semibold text-green-600">{stats.authors}</span>
          </div>
          <div>
            <span className="text-gray-500">Materials:</span>
            <span className="ml-1 font-semibold text-yellow-600">{stats.materials}</span>
          </div>
          <div>
            <span className="text-gray-500">Organisms:</span>
            <span className="ml-1 font-semibold text-red-600">{stats.organisms}</span>
          </div>
          <div>
            <span className="text-gray-500">Links:</span>
            <span className="ml-1 font-semibold">{stats.connections}</span>
          </div>
        </div>
      </Card>

      {/* Graph */}
      <Card className="relative overflow-hidden">
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          height={height}
          backgroundColor="#f9fafb"
          nodeLabel={node => node.name}
          nodeAutoColorBy="type"
          nodeVal={node => getNodeSize(node)}
          nodeOpacity={0.9}
          nodeResolution={16}
          linkOpacity={0.3}
          linkWidth={link => link.strength * 2}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          enableNodeDrag={true}
          enableNavigationControls={true}
          showNavInfo={false}
        />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h4 className="text-sm font-semibold mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Papers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Authors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Organisms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Concepts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span>Methods</span>
            </div>
          </div>
        </div>
        
        {/* Node details */}
        {(hoveredNode || selectedNode) && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
            <h4 className="font-semibold text-sm mb-1">
              {(hoveredNode || selectedNode)?.name}
            </h4>
            <p className="text-xs text-gray-600 capitalize">
              Type: {(hoveredNode || selectedNode)?.type}
            </p>
            <p className="text-xs text-gray-600">
              Connections: {(hoveredNode || selectedNode)?.value}
            </p>
            {selectedNode && (
              <p className="text-xs text-blue-600 mt-2">
                Click on another node to explore connections
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}