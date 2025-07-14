'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { KnowledgeGraph } from '@/components/research/knowledge-graph'

interface Paper {
  id: string
  title: string
  authors: string[] | string
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
  anodeMaterials?: string[] | string
  cathodeMaterials?: string[] | string
  organismTypes?: string[] | string
  keywords?: string[] | string
  aiSummary?: string
  aiKeyFindings?: string
  aiInsights?: string
  aiProcessingDate?: string
  aiConfidence?: number
  hasPerformanceData?: boolean
  isAiProcessed?: boolean
}

interface SearchInsights {
  totalMatches: number
  queryAnalysis: {
    intent: string
    entities: {
      materials: string[]
      organisms: string[]
      metrics: string[]
      methods: string[]
    }
    concepts: string[]
    expandedTerms: string[]
  }
  topMaterials: string[]
  topOrganisms: string[]
  performanceRange: {
    min: number
    max: number
    avg: number
  } | null
  suggestedQueries: string[]
}

export default function EnhancedResearchPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchInsights, setSearchInsights] = useState<SearchInsights | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list')
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Fetch all papers for knowledge graph
  const fetchAllPapers = async () => {
    try {
      const response = await fetch('/api/papers?limit=100')
      if (response.ok) {
        const data = await response.json()
        setPapers(data.papers || [])
      }
    } catch (error) {
      console.error('Error fetching papers:', error)
    }
  }

  // Perform semantic search
  const performSemanticSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchInsights(null)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/papers/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 30 })
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
        setSearchInsights(data.searchInsights || null)
      }
    } catch (error) {
      console.error('Error performing semantic search:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch search suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/papers/semantic-search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  useEffect(() => {
    fetchAllPapers()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    performSemanticSearch()
  }

  const handleNodeClick = (node: any) => {
    if (node.type === 'paper') {
      const paperId = node.id.replace('paper_', '')
      const paper = papers.find(p => p.id === paperId)
      if (paper) {
        setSelectedPaper(paper)
      }
    }
  }

  const formatAuthors = (authors: string[] | string) => {
    if (Array.isArray(authors)) {
      return authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' et al.' : '')
    }
    if (typeof authors === 'string') {
      try {
        const parsed = JSON.parse(authors)
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 3).join(', ') + (parsed.length > 3 ? ' et al.' : '')
        }
        return parsed
      } catch {
        return authors
      }
    }
    return 'Unknown authors'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Research Intelligence</h1>
          <p className="mt-2 text-gray-600">
            AI-powered semantic search and knowledge graph visualization
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for materials, organisms, performance metrics, or research topics..."
              className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion)
                      setShowSuggestions(false)
                      performSemanticSearch()
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Suggested Queries */}
          {searchInsights?.suggestedQueries && searchInsights.suggestedQueries.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {searchInsights.suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(query)
                      performSemanticSearch()
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'graph'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Knowledge Graph
            </button>
          </div>

          {searchInsights && (
            <div className="text-sm text-gray-600">
              Found {searchInsights.totalMatches} relevant papers
            </div>
          )}
        </div>

        {/* Search Insights */}
        {searchInsights && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-3">Search Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Query Analysis */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Query Analysis</h4>
                <p className="text-sm text-gray-600">
                  Intent: <span className="font-medium capitalize">{searchInsights.queryAnalysis.intent}</span>
                </p>
                {searchInsights.queryAnalysis.entities.materials.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Materials: {searchInsights.queryAnalysis.entities.materials.join(', ')}
                  </p>
                )}
                {searchInsights.queryAnalysis.entities.organisms.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Organisms: {searchInsights.queryAnalysis.entities.organisms.join(', ')}
                  </p>
                )}
              </div>

              {/* Top Findings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Findings</h4>
                {searchInsights.topMaterials.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Materials: {searchInsights.topMaterials.slice(0, 3).join(', ')}
                  </p>
                )}
                {searchInsights.topOrganisms.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Organisms: {searchInsights.topOrganisms.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>

              {/* Performance Range */}
              {searchInsights.performanceRange && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Range</h4>
                  <p className="text-sm text-gray-600">
                    Min: {searchInsights.performanceRange.min.toFixed(2)} mW/m²
                  </p>
                  <p className="text-sm text-gray-600">
                    Max: {searchInsights.performanceRange.max.toFixed(2)} mW/m²
                  </p>
                  <p className="text-sm text-gray-600">
                    Avg: {searchInsights.performanceRange.avg.toFixed(2)} mW/m²
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Searching papers...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={result.paper.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/research/${result.paper.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {result.paper.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {formatAuthors(result.paper.authors)}
                      </p>
                      
                      {/* Relevance explanation */}
                      <div className="mb-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Relevance: {result.relevanceScore.toFixed(1)}
                        </span>
                        <span className="ml-2 text-gray-600">{result.explanation}</span>
                      </div>
                      
                      {/* Abstract or AI Summary */}
                      {result.paper.aiSummary ? (
                        <div className="mb-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">{result.paper.aiSummary}</p>
                        </div>
                      ) : result.paper.abstract ? (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {result.paper.abstract}
                        </p>
                      ) : null}
                      
                      {/* Related concepts */}
                      {result.relatedConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {result.relatedConcepts.map((concept: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Performance metrics */}
                    {result.paper.powerOutput && (
                      <div className="ml-4 text-right">
                        <p className="text-sm text-gray-600">Power Output</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {result.paper.powerOutput} mW/m²
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : searchQuery && !loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No papers found matching your search.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Enter a search query to find relevant papers.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <KnowledgeGraph
              papers={searchResults.length > 0 ? searchResults.map(r => r.paper) : papers}
              onNodeClick={handleNodeClick}
              height={600}
            />
            
            {/* Selected Paper Details */}
            {selectedPaper && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-2">{selectedPaper.title}</h3>
                <p className="text-gray-600 mb-4">{formatAuthors(selectedPaper.authors)}</p>
                <button
                  onClick={() => router.push(`/research/${selectedPaper.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Full Paper
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}