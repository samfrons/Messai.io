'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Paper {
  id: string
  title: string
  authors: string
  abstract?: string
  journal?: string
  publicationDate?: string
  systemType?: string
  powerOutput?: number
  _count: {
    experiments: number
  }
  user: {
    id: string
    name?: string
    email: string
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function LiteraturePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  useEffect(() => {
    fetchPapers()
  }, [pagination.page, searchTerm])

  const fetchPapers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/papers?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setPapers(data.papers)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching papers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatAuthors = (authorsJson: string) => {
    try {
      const authors = JSON.parse(authorsJson)
      if (Array.isArray(authors)) {
        return authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' et al.' : '')
      }
      return authorsJson
    } catch {
      return authorsJson
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Research Literature</h1>
          <p className="mt-2 text-gray-600">
            Browse and search scientific papers on microbial electrochemical systems
          </p>
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">🧠 AI-Powered Research Intelligence</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Discover breakthrough findings and hidden patterns from 2,800+ research papers
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-purple-600">
                  <span>🔗 Citation Networks</span>
                  <span>🎯 Smart Recommendations</span>
                  <span>🔬 Research Lineages</span>
                  <span>📊 ML Discovery Engine</span>
                </div>
              </div>
              <Link
                href="/insights"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>🧠</span>
                View Insights
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="mb-8">
          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search 2,800+ papers by title, authors, materials, organisms..."
                  className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </form>
            
            <div className="flex gap-2">
              <Link
                href="/literature/semantic-search"
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span>🧠</span>
                AI Search
              </Link>
              {session && (
                <Link
                  href="/literature/upload"
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <span>📤</span>
                  Upload
                </Link>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-lg font-bold text-blue-600">2,800</div>
              <div className="text-xs text-gray-600">Total Papers</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-lg font-bold text-green-600">2,788</div>
              <div className="text-xs text-gray-600">AI-Enhanced</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-lg font-bold text-purple-600">1,200+</div>
              <div className="text-xs text-gray-600">Knowledge Nodes</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-lg font-bold text-orange-600">2,750+</div>
              <div className="text-xs text-gray-600">Smart Connections</div>
            </div>
          </div>
        </div>

        {/* Papers List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No papers found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/literature/${paper.id}`)}
              >
                {/* Paper Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                      {paper.title}
                    </h3>
                    <div className="flex items-center gap-2 ml-4">
                      {paper.powerOutput && paper.powerOutput > 50000 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          ⚡ High Performance
                        </span>
                      )}
                      {paper.systemType?.includes('MFC') && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          🔋 Energy Generation
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3 font-medium">
                    {formatAuthors(paper.authors)}
                  </p>
                  
                  {paper.abstract && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {paper.abstract}
                    </p>
                  )}
                </div>

                {/* Paper Metadata */}
                <div className="px-6 pb-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {paper.journal && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <span className="text-gray-400">📚</span>
                        {paper.journal}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-600">
                      <span className="text-gray-400">📅</span>
                      {formatDate(paper.publicationDate)}
                    </span>
                    {paper.systemType && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        {paper.systemType}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-600">
                      <span className="text-gray-400">🔬</span>
                      {paper._count.experiments} experiments
                    </span>
                  </div>
                </div>

                {/* Performance Metrics Bar */}
                {paper.powerOutput && (
                  <div className="px-6 pb-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-lg font-bold text-green-700">
                              {paper.powerOutput.toLocaleString()} mW/m²
                            </div>
                            <div className="text-xs text-green-600">Power Density</div>
                          </div>
                          {paper.powerOutput > 20000 && (
                            <div className="text-xs text-green-600 font-medium">
                              🚀 Above Average Performance
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">AI Insight Available</div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-600">Cross-referenced</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Enhancement Indicator */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Enhanced with AI analysis</span>
                    </div>
                    <div className="text-blue-600 group-hover:text-blue-700 font-medium">
                      View Details →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}