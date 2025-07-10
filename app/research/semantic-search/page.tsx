'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SemanticResult {
  relevanceScore: number
  paper: {
    id: string
    title: string
    authors: string
    abstract?: string
    systemType?: string
    powerOutput?: number
    efficiency?: number
  }
  explanation: string
  relatedConcepts: string[]
  suggestedQueries: string[]
}

export default function SemanticSearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SemanticResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 10 })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResults(data.results)
        setSearchHistory(prev => [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5))
      }
    } catch (error) {
      console.error('Error performing semantic search:', error)
    } finally {
      setLoading(false)
    }
  }

  const suggestedQueries = [
    "high performance MXene materials",
    "engineered bacteria for bioelectrochemical systems", 
    "building integrated microbial fuel cells",
    "quantum enhanced bioelectrochemistry",
    "wastewater treatment with high efficiency",
    "space applications for bioelectrochemical systems"
  ]

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🧠</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Semantic Search</h1>
              <p className="text-gray-600">Intelligent research discovery using natural language</p>
            </div>
            <Link
              href="/literature"
              className="ml-auto px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Literature
            </Link>
          </div>

          {/* AI Features Banner */}
          <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-xl p-6 border border-purple-200">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">AI</span>
                <div>
                  <div className="font-semibold text-purple-900">Semantic Understanding</div>
                  <div className="text-purple-700">Contextual meaning analysis</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">KG</span>
                <div>
                  <div className="font-semibold text-blue-900">Knowledge Graph</div>
                  <div className="text-blue-700">551 interconnected concepts</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">ML</span>
                <div>
                  <div className="font-semibold text-indigo-900">ML Discovery</div>
                  <div className="text-indigo-700">Pattern recognition engine</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="mb-6">
              <div className="relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything about bioelectrochemical systems... 
                  
Examples:
• What are the best performing electrode materials?
• Which organisms show highest power output?
• How do temperature and pH affect efficiency?
• What are emerging trends in MXene research?"
                  className="w-full h-32 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
                  rows={4}
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute bottom-4 right-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Search with AI'
                  )}
                </button>
              </div>
            </form>

            {/* Suggested Queries */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Suggested Queries:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((suggested, index) => (
                  <button
                    key={index}
                    onClick={() => { setQuery(suggested); handleSearch(suggested); }}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 text-sm transition-colors"
                  >
                    {suggested}
                  </button>
                ))}
              </div>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">🕒 Recent Searches:</h3>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((historyQuery, index) => (
                    <button
                      key={index}
                      onClick={() => { setQuery(historyQuery); handleSearch(historyQuery); }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      {historyQuery}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results ({results.length} papers found)
              </h2>
              <div className="text-sm text-gray-600">
                Ranked by semantic relevance
              </div>
            </div>

            {results.map((result, index) => (
              <div
                key={result.paper.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Relevance Score Header */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-purple-600">#{index + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Relevance:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-purple-500 rounded-full"
                              style={{ width: `${Math.min(100, result.relevanceScore * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-purple-600">
                            {(result.relevanceScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      AI Explanation: {result.explanation}
                    </div>
                  </div>
                </div>

                {/* Paper Content */}
                <div className="p-6">
                  <h3 
                    className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-700 cursor-pointer"
                    onClick={() => router.push(`/literature/${result.paper.id}`)}
                  >
                    {result.paper.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3">
                    {formatAuthors(result.paper.authors)}
                  </p>

                  {result.paper.abstract && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {result.paper.abstract}
                    </p>
                  )}

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {result.paper.systemType && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {result.paper.systemType}
                      </span>
                    )}
                    {result.paper.powerOutput && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {result.paper.powerOutput.toLocaleString()} mW/m²
                      </span>
                    )}
                    {result.paper.efficiency && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {result.paper.efficiency}% efficiency
                      </span>
                    )}
                  </div>

                  {/* Related Concepts */}
                  {result.relatedConcepts.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">🔗 Related Concepts:</h4>
                      <div className="flex flex-wrap gap-1">
                        {result.relatedConcepts.map((concept, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Queries */}
                  {result.suggestedQueries.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Explore Further:</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.suggestedQueries.map((suggested, i) => (
                          <button
                            key={i}
                            onClick={() => { setQuery(suggested); handleSearch(suggested); }}
                            className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
                          >
                            {suggested}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              Try rephrasing your query or using more general terms.
            </p>
            <button
              onClick={() => setQuery('')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}