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
  doi?: string
  externalUrl?: string
  source?: string
  arxivId?: string
  pubmedId?: string
  efficiency?: number
  // AI fields
  aiSummary?: string
  aiKeyFindings?: string
  aiInsights?: string
  aiProcessingDate?: string
  aiConfidence?: number
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

interface LiteratureStats {
  totalPapers: number
  aiEnhanced: number
  uniqueMaterials: number
  uniqueOrganisms: number
  withPowerOutput: number
  withEfficiency: number
  papers2024: number
  knowledgeNodes: number
  smartConnections: number
  systemTypes: Array<{ type: string; count: number }>
  sources: Array<{ source: string; count: number }>
}

export default function LiteraturePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<LiteratureStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [showRealPapersOnly, setShowRealPapersOnly] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const response = await fetch('/api/literature/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchPapers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(showRealPapersOnly && { realOnly: 'true' })
      })
      
      const response = await fetch(`/api/papers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPapers(data.papers || [])
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
      }
    } catch (error) {
      console.error('Error fetching papers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchPapers()
  }, [pagination.page, searchTerm, showRealPapersOnly])

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

  const isRealPaper = (paper: Paper) => {
    const realSources = ['crossref_api', 'arxiv_api', 'pubmed_api', 'local_pdf', 'web_search', 
                        'comprehensive_search', 'advanced_electrode_biofacade_search', 
                        'extensive_electrode_biofacade_collection']
    return realSources.includes(paper.source || '') || paper.doi || paper.arxivId || paper.pubmedId
  }

  const getPaperSourceLabel = (paper: Paper) => {
    if (paper.doi) return 'DOI Verified'
    if (paper.arxivId) return 'arXiv Paper'
    if (paper.pubmedId) return 'PubMed Indexed'
    if (paper.source === 'crossref_api') return 'CrossRef Database'
    if (paper.source === 'local_pdf') return 'PDF Extracted'
    return 'User Contributed'
  }

  const getPaperLink = (paper: Paper) => {
    if (paper.externalUrl) return paper.externalUrl
    if (paper.doi) return `https://doi.org/${paper.doi}`
    if (paper.pubmedId) return `https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}/`
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Research Literature</h1>
          <p className="mt-2 text-gray-600">
            Browse and search scientific papers on microbial electrochemical systems
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search papers by title, authors, materials, organisms..."
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
              <button
                onClick={() => setShowRealPapersOnly(!showRealPapersOnly)}
                className={`px-4 py-3 ${showRealPapersOnly ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg transition-colors text-sm font-medium`}
              >
                {showRealPapersOnly ? 'Real Papers' : 'All Papers'}
              </button>
            </div>
          </div>
        </div>

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
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                    {paper.title}
                  </h3>
                  <p className="text-gray-600 mb-3 font-medium">
                    {formatAuthors(paper.authors)}
                  </p>
                  
                  {/* AI Summary Section */}
                  {paper.aiSummary && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-semibold text-sm">🤖 AI Summary:</span>
                        <p className="text-sm text-blue-800 leading-relaxed flex-1">
                          {paper.aiSummary}
                        </p>
                      </div>
                      {paper.aiConfidence && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-blue-600">Confidence:</span>
                          <div className="flex-1 bg-blue-100 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${paper.aiConfidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-blue-600">{(paper.aiConfidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Original Abstract - shown when no AI summary */}
                  {!paper.aiSummary && paper.abstract && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {paper.abstract}
                    </p>
                  )}
                  
                  {/* AI Insights if available */}
                  {paper.aiInsights && (
                    <div className="mb-4 p-2 bg-purple-50 rounded border border-purple-200">
                      <p className="text-xs text-purple-700">
                        <span className="font-semibold">💡 Insight:</span> {paper.aiInsights}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    {isRealPaper(paper) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {getPaperSourceLabel(paper)}
                      </span>
                    )}
                    {paper.aiProcessingDate && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <span>🤖</span> AI Enhanced
                      </span>
                    )}
                    {paper.powerOutput && (
                      <span className="text-gray-600">
                        Power: {paper.powerOutput} mW/m²
                      </span>
                    )}
                    <span className="text-gray-600">
                      {paper._count.experiments} experiments
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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