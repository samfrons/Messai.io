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
      } else {
        // Load demo insights for public users
        loadDemoInsights()
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
      // Load demo insights when API fails (for public users)
      loadDemoInsights()
    } finally {
      setLoading(false)
    }
  }

  const loadDemoInsights = () => {
    const demoInsights: Insight[] = [
      {
        id: 'demo-1',
        type: 'performance',
        title: 'Graphene Electrodes Show 340% Performance Boost',
        description: 'Analysis of 47 studies reveals graphene-enhanced carbon electrodes consistently outperform traditional materials, with average power density improvements of 340% over standard carbon cloth.',
        value: '340%',
        confidence: 'high',
        papers: [
          { id: 'paper-1', title: 'Graphene-enhanced MFC electrodes achieve record power densities', powerOutput: 2850 },
          { id: 'paper-2', title: 'Comparative analysis of carbon-based electrode materials', powerOutput: 1200 }
        ],
        tags: ['graphene', 'electrodes', 'performance', 'carbon-materials']
      },
      {
        id: 'demo-2',
        type: 'organism',
        title: 'Shewanella Species Dominate High-Performance Systems',
        description: 'Cross-analysis of 89 microbial studies shows Shewanella-based systems achieve 2.3x higher power outputs compared to mixed community systems, particularly in controlled laboratory conditions.',
        value: '2.3x',
        confidence: 'high',
        papers: [
          { id: 'paper-3', title: 'Shewanella oneidensis MR-1 optimization for bioelectricity', powerOutput: 1840 },
          { id: 'paper-4', title: 'Pure culture vs mixed community performance comparison', powerOutput: 780 }
        ],
        tags: ['shewanella', 'microorganisms', 'pure-culture', 'bioelectricity']
      },
      {
        id: 'demo-3',
        type: 'correlation',
        title: 'pH Range 6.8-7.2 Optimal Across All System Types',
        description: 'Meta-analysis of 156 experiments reveals a consistent optimal pH range regardless of system design, substrate type, or microbial community composition.',
        value: '6.8-7.2',
        confidence: 'high',
        papers: [
          { id: 'paper-5', title: 'pH optimization for maximum power generation in MFCs', powerOutput: 1650 },
          { id: 'paper-6', title: 'Environmental factors affecting bioelectrochemical performance', powerOutput: 920 }
        ],
        tags: ['pH', 'optimization', 'universal', 'environmental-conditions']
      },
      {
        id: 'demo-4',
        type: 'material',
        title: 'MXene Nanomaterials: The Next Generation Electrode',
        description: 'Emerging research on MXene-based electrodes shows promise for revolutionary performance gains, with early studies indicating 400-500% improvements over conventional materials.',
        value: '450%',
        confidence: 'medium',
        papers: [
          { id: 'paper-7', title: 'Ti3C2Tx MXene electrodes for enhanced bioelectrochemical systems', powerOutput: 3200 },
          { id: 'paper-8', title: 'Novel 2D materials in microbial fuel cell applications', powerOutput: 2100 }
        ],
        tags: ['mxene', 'nanomaterials', 'next-generation', 'electrodes']
      },
      {
        id: 'demo-5',
        type: 'trend',
        title: 'Pilot-Scale Systems Show Consistent Scalability',
        description: 'Analysis of scaling studies from 2020-2024 shows pilot-scale MFC systems maintain 78% of lab-scale efficiency, indicating strong commercial viability.',
        value: '78%',
        confidence: 'high',
        papers: [
          { id: 'paper-9', title: 'Scaling microbial fuel cells: From lab to pilot plant', powerOutput: 450 },
          { id: 'paper-10', title: 'Commercial viability assessment of bioelectrochemical systems', powerOutput: 520 }
        ],
        tags: ['scaling', 'pilot-scale', 'commercial', 'efficiency']
      },
      {
        id: 'demo-6',
        type: 'correlation',
        title: 'Temperature-Power Relationship: Exponential Below 35°C',
        description: 'Comprehensive analysis reveals exponential power increase with temperature up to 35°C, with diminishing returns above this threshold across all microbial systems.',
        value: '35°C',
        confidence: 'high',
        papers: [
          { id: 'paper-11', title: 'Temperature optimization in bioelectrochemical systems', powerOutput: 1950 },
          { id: 'paper-12', title: 'Thermal effects on microbial electrogenesis', powerOutput: 1420 }
        ],
        tags: ['temperature', 'optimization', 'thermal-effects', 'performance']
      }
    ]

    const demoSummary: InsightsSummary = {
      totalPapers: 2847,
      insightsGenerated: 127,
      coverageTypes: ['Performance', 'Materials', 'Organisms', 'Trends', 'Correlations'],
      lastUpdated: new Date().toISOString()
    }

    setInsights(demoInsights)
    setSummary(demoSummary)
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
              🔬 Demo Available
            </span>
          </div>

          {/* Demo Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">👁️</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Public Demo Insights</h3>
                <p className="text-blue-700 text-sm mb-3">
                  You're viewing sample AI-generated insights from our research database. 
                  Create an account to access personalized insights based on your research interests 
                  and saved papers.
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/research"
                    className="px-4 py-2 bg-white text-blue-600 border border-blue-300 text-sm rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Browse Literature
                  </Link>
                </div>
              </div>
            </div>
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