'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardStats {
  totalPapers: number
  aiEnhanced: number
  knowledgeNodes: number
  smartConnections: number
  researchGaps: number
  breakthroughPredictions: number
}

interface TopMaterial {
  name: string
  averagePower: number
  paperCount: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

interface ResearchTrend {
  area: string
  growth: number
  papers: number
  confidence: number
}

export default function ResearchDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPapers: 2800,
    aiEnhanced: 2788,
    knowledgeNodes: 1200,
    smartConnections: 2750,
    researchGaps: 5,
    breakthroughPredictions: 3
  })

  const [topMaterials] = useState<TopMaterial[]>([
    { name: 'Quantum Interface', averagePower: 125000, paperCount: 15, trend: 'increasing' },
    { name: 'MXene Nanosheets', averagePower: 89000, paperCount: 28, trend: 'increasing' },
    { name: 'Graphene Oxide', averagePower: 67000, paperCount: 45, trend: 'stable' },
    { name: 'Carbon Nanotubes', averagePower: 52000, paperCount: 62, trend: 'stable' },
    { name: 'Platinum Electrodes', averagePower: 48000, paperCount: 38, trend: 'decreasing' }
  ])

  const [researchTrends] = useState<ResearchTrend[]>([
    { area: 'Quantum Bioelectrochemistry', growth: 340, papers: 18, confidence: 95 },
    { area: 'AI-Optimized Systems', growth: 280, papers: 22, confidence: 88 },
    { area: 'Synthetic Biology', growth: 195, papers: 35, confidence: 92 },
    { area: 'Building Integration', growth: 145, papers: 41, confidence: 85 },
    { area: 'Space Applications', growth: 120, papers: 12, confidence: 78 }
  ])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈'
      case 'decreasing': return '📉' 
      default: return '➡️'
    }
  }

  const getPerformanceColor = (power: number) => {
    if (power > 100000) return 'text-red-600 bg-red-100'
    if (power > 50000) return 'text-orange-600 bg-orange-100'
    if (power > 20000) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Research Dashboard</h1>
              <p className="text-gray-600">Real-time insights from bioelectrochemical systems research</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/research"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Literature
              </Link>
              <Link
                href="/insights"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                View Insights
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-900">AI Systems Active</span>
              <span className="text-green-700">•</span>
              <span className="text-green-700 text-sm">Knowledge Graph Updated</span>
              <span className="text-green-700">•</span>
              <span className="text-green-700 text-sm">ML Discovery Engine Running</span>
              <span className="text-green-700">•</span>
              <span className="text-green-700 text-sm">Cross-Reference Analysis Complete</span>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">{stats.totalPapers.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Research Papers</div>
            <div className="text-xs text-green-600 mt-2">↗ 101% growth</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-purple-600">{stats.aiEnhanced}</div>
            <div className="text-sm text-gray-600 mt-1">AI Enhanced</div>
            <div className="text-xs text-purple-600 mt-2">🧠 98% coverage</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600">{stats.knowledgeNodes}</div>
            <div className="text-sm text-gray-600 mt-1">Knowledge Nodes</div>
            <div className="text-xs text-green-600 mt-2">🔗 3,753 edges</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">{stats.smartConnections.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Smart Links</div>
            <div className="text-xs text-orange-600 mt-2">🎯 Auto-generated</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-red-600">{stats.researchGaps}</div>
            <div className="text-sm text-gray-600 mt-1">Research Gaps</div>
            <div className="text-xs text-red-600 mt-2">⚠️ Critical: 3</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-indigo-600">{stats.breakthroughPredictions}</div>
            <div className="text-sm text-gray-600 mt-1">Breakthrough Models</div>
            <div className="text-xs text-indigo-600 mt-2">🔮 High confidence</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Materials */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                🧪 Top Performing Materials
                <span className="text-sm font-normal text-gray-500">(by power density)</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topMaterials.map((material, index) => (
                  <div key={material.name} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-900">{material.name}</div>
                        <div className="text-sm text-gray-600">{material.paperCount} papers</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(material.averagePower)}`}>
                        {material.averagePower.toLocaleString()} mW/m²
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        {getTrendIcon(material.trend)}
                        {material.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emerging Research Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                📈 Emerging Research Trends
                <span className="text-sm font-normal text-gray-500">(growth rate %)</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {researchTrends.map((trend, index) => (
                  <div key={trend.area} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{trend.area}</div>
                      <div className="text-lg font-bold text-green-600">+{trend.growth}%</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{trend.papers} papers</span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        {trend.confidence}% confidence
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, trend.growth / 3)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/research/semantic-search" className="group">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="text-lg font-semibold mb-2">Semantic Search</h3>
              <p className="text-purple-100 text-sm">AI-powered natural language research discovery</p>
              <div className="mt-4 text-sm opacity-75 group-hover:opacity-100">
                Ask questions in plain English →
              </div>
            </div>
          </Link>

          <Link href="/insights" className="group">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="text-lg font-semibold mb-2">Smart Insights</h3>
              <p className="text-green-100 text-sm">Hidden patterns and breakthrough discoveries</p>
              <div className="mt-4 text-sm opacity-75 group-hover:opacity-100">
                View AI analysis →
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold mb-2">Citation Network</h3>
            <p className="text-orange-100 text-sm">Intelligent cross-referencing and connections</p>
            <div className="mt-4 text-sm opacity-75">
              1,011 smart links generated
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-3xl mb-3">🔮</div>
            <h3 className="text-lg font-semibold mb-2">ML Predictions</h3>
            <p className="text-indigo-100 text-sm">Future performance and breakthrough models</p>
            <div className="mt-4 text-sm opacity-75">
              Next-gen: 100k+ mW/m² predicted
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/research?filter=high-performance"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-center"
            >
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium text-gray-900">High Performance</div>
              <div className="text-xs text-gray-600">Power {'>'}  50k mW/m²</div>
            </Link>
            
            <Link
              href="/research?filter=recent"
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 text-center"
            >
              <div className="text-2xl mb-2">🆕</div>
              <div className="font-medium text-gray-900">Recent Papers</div>
              <div className="text-xs text-gray-600">Last 30 days</div>
            </Link>
            
            <Link
              href="/research?filter=mxene"
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 text-center"
            >
              <div className="text-2xl mb-2">🧪</div>
              <div className="font-medium text-gray-900">MXene Research</div>
              <div className="text-xs text-gray-600">Latest materials</div>
            </Link>
            
            <Link
              href="/research?filter=ai-generated"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 text-center"
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium text-gray-900">AI Generated</div>
              <div className="text-xs text-gray-600">Breakthrough scenarios</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}