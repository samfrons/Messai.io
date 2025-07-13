'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KnowledgeGraphVisualization } from '@/components/research/KnowledgeGraphVisualization'
import type { KnowledgeNode } from '@messai/ai'

export default function KnowledgeGraphPage() {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [graphStats, setGraphStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node)
  }

  const fetchGraphStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/knowledge-graph?action=summary')
      const data = await response.json()
      if (response.ok) {
        setGraphStats(data)
      }
    } catch (error) {
      console.error('Error fetching graph stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const rebuildGraph = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/knowledge-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'build' })
      })
      const data = await response.json()
      if (response.ok && data.summary) {
        setGraphStats(data.summary)
      }
    } catch (error) {
      console.error('Error rebuilding graph:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🕸️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Graph</h1>
                <p className="text-gray-600">Interactive visualization of research connections</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchGraphStats}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Get Stats
              </button>
              <button
                onClick={rebuildGraph}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Building...' : 'Rebuild Graph'}
              </button>
              <Link
                href="/research"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Research
              </Link>
            </div>
          </div>

          {/* Features Banner */}
          <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-xl p-6 border border-purple-200">
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">🔗</span>
                <div>
                  <div className="font-semibold text-purple-900">Connected Nodes</div>
                  <div className="text-purple-700">1,200+ research entities</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">🌐</span>
                <div>
                  <div className="font-semibold text-blue-900">Relationships</div>
                  <div className="text-blue-700">2,750+ connections</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">📊</span>
                <div>
                  <div className="font-semibold text-indigo-900">Entity Types</div>
                  <div className="text-indigo-700">6 categories</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">🧠</span>
                <div>
                  <div className="font-semibold text-green-900">AI-Powered</div>
                  <div className="text-green-700">Auto-generated insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Stats */}
        {graphStats && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Graph Statistics</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Nodes</p>
                <p className="text-2xl font-bold text-gray-900">{graphStats.totalNodes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Edges</p>
                <p className="text-2xl font-bold text-gray-900">{graphStats.totalEdges}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Node Types</p>
                <div className="mt-1">
                  {Object.entries(graphStats.nodeTypes || {}).map(([type, count]) => (
                    <p key={type} className="text-xs">
                      <span className="capitalize">{type}</span>: {count as number}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Nodes</p>
                <div className="mt-1">
                  {graphStats.topNodes?.slice(0, 3).map((node: any, i: number) => (
                    <p key={i} className="text-xs truncate">
                      {node.name} ({node.importance.toFixed(1)})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Graph Visualization */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <KnowledgeGraphVisualization 
            onNodeClick={handleNodeClick}
            width={1200}
            height={800}
          />
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Selected Node: {selectedNode.name}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Properties</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">Type</dt>
                    <dd className="text-sm font-medium capitalize">{selectedNode.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Importance Score</dt>
                    <dd className="text-sm font-medium">{selectedNode.importance.toFixed(3)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Connected Papers</dt>
                    <dd className="text-sm font-medium">{selectedNode.papers.length}</dd>
                  </div>
                  {selectedNode.properties && Object.entries(selectedNode.properties).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-sm font-medium">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Navigate to search with this entity
                      window.location.href = `/research/semantic-search?q=${encodeURIComponent(selectedNode.name)}`
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Search Papers
                  </button>
                  <button
                    onClick={() => {
                      // Find similar nodes
                      console.log('Finding similar to:', selectedNode)
                    }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Find Similar Nodes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Click on any node to see detailed information</li>
            <li>• Node size represents importance in the research network</li>
            <li>• Edge thickness shows relationship strength</li>
            <li>• Colors indicate different entity types (materials, organisms, systems, concepts)</li>
            <li>• Use the "Rebuild Graph" button to update with latest research data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}