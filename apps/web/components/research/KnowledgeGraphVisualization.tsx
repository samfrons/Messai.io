'use client'

import { useState, useEffect, useRef } from 'react'
import type { KnowledgeNode, KnowledgeEdge } from '@messai/ai'

interface KnowledgeGraphProps {
  onNodeClick?: (node: KnowledgeNode) => void
  width?: number
  height?: number
}

export function KnowledgeGraphVisualization({ 
  onNodeClick,
  width = 1200,
  height = 800 
}: KnowledgeGraphProps) {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([])
  const [edges, setEdges] = useState<KnowledgeEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    fetchKnowledgeGraph()
  }, [])

  const fetchKnowledgeGraph = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/knowledge-graph?action=full')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch knowledge graph')
      }

      setNodes(data.nodes || [])
      setEdges(data.edges || [])
      
      // Layout nodes using force-directed algorithm simulation
      layoutNodes(data.nodes || [], data.edges || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge graph')
    } finally {
      setLoading(false)
    }
  }

  const layoutNodes = (nodeList: KnowledgeNode[], edgeList: KnowledgeEdge[]) => {
    // Simple force-directed layout
    const nodeMap = new Map<string, any>()
    
    nodeList.forEach((node, i) => {
      const angle = (i / nodeList.length) * 2 * Math.PI
      const radius = 300 + (node.importance || 0) * 100
      nodeMap.set(node.id, {
        ...node,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        vx: 0,
        vy: 0
      })
    })

    // Apply forces for better layout
    for (let iteration = 0; iteration < 50; iteration++) {
      // Repulsion between all nodes
      nodeList.forEach((n1) => {
        nodeList.forEach((n2) => {
          if (n1.id !== n2.id) {
            const node1 = nodeMap.get(n1.id)
            const node2 = nodeMap.get(n2.id)
            const dx = node2.x - node1.x
            const dy = node2.y - node1.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance > 0 && distance < 200) {
              const force = 50 / distance
              node1.vx -= (dx / distance) * force
              node1.vy -= (dy / distance) * force
            }
          }
        })
      })

      // Attraction along edges
      edgeList.forEach((edge) => {
        const source = nodeMap.get(edge.source)
        const target = nodeMap.get(edge.target)
        if (source && target) {
          const dx = target.x - source.x
          const dy = target.y - source.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > 0) {
            const force = distance * 0.01 * edge.strength
            source.vx += (dx / distance) * force
            source.vy += (dy / distance) * force
            target.vx -= (dx / distance) * force
            target.vy -= (dy / distance) * force
          }
        }
      })

      // Update positions
      nodeList.forEach((node) => {
        const n = nodeMap.get(node.id)
        n.x += n.vx * 0.1
        n.y += n.vy * 0.1
        // Keep within bounds
        n.x = Math.max(50, Math.min(width - 50, n.x))
        n.y = Math.max(50, Math.min(height - 50, n.y))
        // Damping
        n.vx *= 0.8
        n.vy *= 0.8
      })
    }

    // Update nodes with positions
    setNodes(nodeList.map(node => ({
      ...node,
      ...nodeMap.get(node.id)
    })))
  }

  const getNodeColor = (node: KnowledgeNode) => {
    switch (node.type) {
      case 'material': return '#3b82f6' // blue
      case 'organism': return '#10b981' // green
      case 'system': return '#f59e0b' // amber
      case 'concept': return '#8b5cf6' // purple
      case 'researcher': return '#ef4444' // red
      case 'institution': return '#6366f1' // indigo
      default: return '#6b7280' // gray
    }
  }

  const getNodeSize = (node: KnowledgeNode) => {
    return Math.min(20, 5 + (node.importance || 0) * 15)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading knowledge graph...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Knowledge Graph</h3>
        <p className="text-sm text-gray-600">
          {nodes.length} nodes • {edges.length} edges
        </p>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border rounded"
        style={{ cursor: 'grab' }}
      >
        {/* Draw edges */}
        {edges.map((edge, index) => {
          const source = nodes.find(n => n.id === edge.source)
          const target = nodes.find(n => n.id === edge.target)
          if (!source || !target || !(source as any).x || !(target as any).x) return null

          return (
            <line
              key={index}
              x1={(source as any).x}
              y1={(source as any).y}
              x2={(target as any).x}
              y2={(target as any).y}
              stroke="#e5e7eb"
              strokeWidth={Math.max(1, edge.strength * 3)}
              opacity={edge.confidence}
            />
          )
        })}

        {/* Draw nodes */}
        {nodes.map((node) => {
          if (!(node as any).x || !(node as any).y) return null
          
          const isSelected = selectedNode?.id === node.id
          
          return (
            <g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedNode(node)
                onNodeClick?.(node)
              }}
            >
              <circle
                cx={(node as any).x}
                cy={(node as any).y}
                r={getNodeSize(node)}
                fill={getNodeColor(node)}
                stroke={isSelected ? '#000' : '#fff'}
                strokeWidth={isSelected ? 3 : 2}
              />
              <text
                x={(node as any).x}
                y={(node as any).y - getNodeSize(node) - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#374151"
              >
                {node.name.length > 20 
                  ? node.name.substring(0, 20) + '...'
                  : node.name}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Material</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Organism</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <span>System</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span>Concept</span>
        </div>
      </div>

      {/* Selected node info */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">{selectedNode.name}</h4>
          <p className="text-sm text-gray-600">Type: {selectedNode.type}</p>
          <p className="text-sm text-gray-600">Papers: {selectedNode.papers.length}</p>
          <p className="text-sm text-gray-600">Importance: {selectedNode.importance.toFixed(2)}</p>
          {selectedNode.properties && Object.entries(selectedNode.properties).map(([key, value]) => (
            <p key={key} className="text-sm text-gray-600">
              {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}