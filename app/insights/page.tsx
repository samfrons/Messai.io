'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Insight {
  id: string
  type: 'performance' | 'material' | 'organism' | 'trend' | 'correlation'
  title: string
  description: string
  value: number | string
  confidence: 'high' | 'medium' | 'low'
  papers: Array<{
    id: string
    title: string
    powerOutput?: number
    efficiency?: number
    systemType?: string
  }>
  tags: string[]
}

interface InsightsSummary {
  totalPapers: number
  insightsGenerated: number
  coverageTypes: string[]
  lastUpdated: string
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [summary, setSummary] = useState<InsightsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/insights')
      const data = await response.json()
      
      if (response.ok) {
        setInsights(data.insights)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return '⚡'
      case 'material': return '🧪'
      case 'organism': return '🦠'
      case 'trend': return '📈'
      case 'correlation': return '🔗'
      default: return '💡'
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredInsights = selectedType === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === selectedType)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing research patterns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Research Insights</h1>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              🔬 Newly Discovered
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            AI-powered analysis revealing previously hidden patterns and breakthrough correlations from 2,800+ research papers on bioelectrochemical systems.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <span>🧬</span> Cross-paper pattern analysis
            </span>
            <span className="flex items-center gap-1">
              <span>⚡</span> Performance correlation discovery
            </span>
            <span className="flex items-center gap-1">
              <span>📊</span> Advanced statistical insights
            </span>
          </div>
          
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">{summary.totalPapers}</div>
                <div className="text-sm text-gray-600">Papers Analyzed</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-green-600">{summary.insightsGenerated}</div>
                <div className="text-sm text-gray-600">Insights Found</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-purple-600">{summary.coverageTypes.length}</div>
                <div className="text-sm text-gray-600">Analysis Types</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-orange-600">
                  {new Date(summary.lastUpdated).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Last Updated</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Insights
            </button>
            {['performance', 'material', 'organism', 'trend', 'correlation'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {getTypeIcon(type)} {type}
              </button>
            ))}
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-gray-200 overflow-hidden hover:shadow-lg hover:border-l-purple-500 transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(insight.type)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getConfidenceColor(insight.confidence)}`}>
                    {insight.confidence}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {insight.description}
                </p>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {typeof insight.value === 'number' 
                      ? insight.value.toLocaleString() 
                      : insight.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    Key Metric
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {insight.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Supporting Evidence ({insight.papers.length} papers)
                  </div>
                  <div className="space-y-1">
                    {insight.papers.slice(0, 2).map((paper) => (
                      <Link
                        key={paper.id}
                        href={`/literature/${paper.id}`}
                        className="block text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {paper.title.length > 60 
                          ? paper.title.substring(0, 60) + '...' 
                          : paper.title}
                        {paper.powerOutput && (
                          <span className="text-green-600 ml-1">
                            ({paper.powerOutput.toLocaleString()} mW/m²)
                          </span>
                        )}
                      </Link>
                    ))}
                    {insight.papers.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{insight.papers.length - 2} more papers
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights found</h3>
            <p className="text-gray-600">
              Try selecting a different insight type or check back later as we analyze more papers.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Insights are generated using AI analysis of research patterns and performance data.</p>
          <p className="mt-1">
            <Link href="/literature" className="text-blue-600 hover:underline">
              ← Back to Literature Database
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}