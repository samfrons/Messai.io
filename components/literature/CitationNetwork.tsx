'use client'

import { useState, useEffect } from 'react'
import { getDemoConfig } from '@/lib/demo-mode'

interface CitationNode {
  id: string
  title: string
  x?: number
  y?: number
  citations: string[]
  citedBy: string[]
}

interface CitationNetworkProps {
  paperId: string
  depth?: number
}

export function CitationNetwork({ paperId, depth = 1 }: CitationNetworkProps) {
  const [nodes, setNodes] = useState<Map<string, CitationNode>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const demoConfig = getDemoConfig()

  useEffect(() => {
    if (demoConfig.isDemo) {
      setLoading(false)
      return
    }

    fetchCitationNetwork()
  }, [paperId, depth])

  const fetchCitationNetwork = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/papers/${paperId}/citations/network?depth=${depth}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch citation network')
      }

      // Convert to nodes map
      const nodesMap = new Map<string, CitationNode>()
      
      data.papers.forEach((paper: any) => {
        nodesMap.set(paper.id, {
          id: paper.id,
          title: paper.title,
          citations: paper.citations.map((c: any) => c.citedPaperId),
          citedBy: paper.citedBy.map((c: any) => c.citingPaperId)
        })
      })

      // Simple force-directed layout
      layoutNodes(nodesMap, paperId)
      setNodes(nodesMap)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load network')
    } finally {
      setLoading(false)
    }
  }

  const layoutNodes = (nodesMap: Map<string, CitationNode>, centerId: string) => {
    const centerNode = nodesMap.get(centerId)
    if (!centerNode) return

    // Place center node
    centerNode.x = 400
    centerNode.y = 300

    // Place connected nodes in a circle
    const connected = [
      ...centerNode.citations,
      ...centerNode.citedBy
    ].filter(id => nodesMap.has(id))

    const angleStep = (2 * Math.PI) / connected.length
    const radius = 200

    connected.forEach((nodeId, index) => {
      const node = nodesMap.get(nodeId)
      if (node) {
        node.x = 400 + radius * Math.cos(index * angleStep)
        node.y = 300 + radius * Math.sin(index * angleStep)
      }
    })
  }

  if (demoConfig.isDemo) {
    return (
      <div className="bg-amber-50 p-4 rounded-lg text-amber-700">
        Citation network visualization is not available in demo mode
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading citation network...</div>
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

  const edges: Array<{ from: string; to: string }> = []
  nodes.forEach(node => {
    node.citations.forEach(citedId => {
      if (nodes.has(citedId)) {
        edges.push({ from: node.id, to: citedId })
      }
    })
  })

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold text-gray-900 mb-4">
        Citation Network (Depth: {depth})
      </h3>
      
      <svg width="800" height="600" className="border rounded">
        {/* Draw edges */}
        {edges.map((edge, index) => {
          const fromNode = nodes.get(edge.from)
          const toNode = nodes.get(edge.to)
          if (!fromNode?.x || !fromNode?.y || !toNode?.x || !toNode?.y) return null

          return (
            <line
              key={index}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#94a3b8"
              strokeWidth="1"
              markerEnd="url(#arrowhead)"
            />
          )
        })}

        {/* Draw nodes */}
        {Array.from(nodes.values()).map(node => {
          if (!node.x || !node.y) return null
          
          const isCenter = node.id === paperId
          
          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isCenter ? 12 : 8}
                fill={isCenter ? '#3b82f6' : '#60a5fa'}
                stroke="#1e40af"
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y - 15}
                textAnchor="middle"
                fontSize="12"
                fill="#1f2937"
              >
                {node.title.length > 30 
                  ? node.title.substring(0, 30) + '...'
                  : node.title}
              </text>
            </g>
          )
        })}

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#94a3b8"
            />
          </marker>
        </defs>
      </svg>

      <div className="mt-4 text-sm text-gray-600">
        <p>• Center node (blue): Current paper</p>
        <p>• Arrows point from citing paper to cited paper</p>
        <p>• Showing {nodes.size} papers and {edges.length} citations</p>
      </div>
    </div>
  )
}

interface CitationVerificationProps {
  paperId: string
  onVerified?: (result: any) => void
}

export function CitationVerification({ paperId, onVerified }: CitationVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const demoConfig = getDemoConfig()

  const verifyCitations = async () => {
    if (demoConfig.isDemo) {
      setError('Citation verification not available in demo mode')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch(`/api/papers/${paperId}/citations/verify`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setResult(data)
      onVerified?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify citations')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Citation Verification</h3>
        <button
          onClick={verifyCitations}
          disabled={isVerifying || demoConfig.isDemo}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isVerifying || demoConfig.isDemo
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isVerifying ? 'Verifying...' : 'Verify Citations'}
        </button>
      </div>

      {demoConfig.isDemo && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Citation verification is not available in demo mode
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {result.verifiedCount}
              </div>
              <div className="text-sm text-green-600">Verified</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                {result.unverifiedCount}
              </div>
              <div className="text-sm text-yellow-600">Unverified</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {result.citedByCount}
              </div>
              <div className="text-sm text-blue-600">Cited By</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {result.citationNetworkSize}
              </div>
              <div className="text-sm text-purple-600">Network Size</div>
            </div>
          </div>

          {result.verifiedCitations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Verified Citations
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {result.verifiedCitations.map((citation: any, index: number) => (
                  <div
                    key={index}
                    className="p-2 bg-green-50 rounded border border-green-200 text-sm"
                  >
                    <div className="font-medium">{citation.title || 'Untitled'}</div>
                    {citation.authors.length > 0 && (
                      <div className="text-gray-600">
                        {citation.authors.slice(0, 3).join(', ')}
                        {citation.authors.length > 3 && ' et al.'}
                      </div>
                    )}
                    {citation.doi && (
                      <a
                        href={`https://doi.org/${citation.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        DOI: {citation.doi}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}