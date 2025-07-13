'use client'

import { useState } from 'react'
import { PaperCard } from './PaperCard'

interface SearchResult {
  relevanceScore: number
  paper: any
  explanation: string
  relatedConcepts: string[]
  suggestedQueries: string[]
  source?: string
}

export function SemanticSearchInterface() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchMethod, setSearchMethod] = useState<string>('')
  const [queryIntent, setQueryIntent] = useState<string>('')
  const [entities, setEntities] = useState<string[]>([])

  const performSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          limit: 20,
          useAdvanced: true 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.results || [])
      setSearchMethod(data.searchMethod || 'unknown')
      setQueryIntent(data.queryIntent || '')
      setEntities(data.entities || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery)
    // Auto-search with suggested query
    setTimeout(() => performSearch(), 100)
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Semantic Research Search
        </h2>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              placeholder="Search for high performance MXene materials, engineered bacteria, building integrated systems..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-12 top-3.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={performSearch}
            disabled={loading || !query.trim()}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              loading || !query.trim()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>

          {/* Example queries */}
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'high performance graphene electrodes',
                'synthetic biology for MFC',
                'wastewater treatment efficiency',
                'quantum enhanced bioelectrochemistry'
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Metadata */}
      {results.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Search Method:</span>{' '}
              <span className="text-gray-900 capitalize">{searchMethod}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Query Intent:</span>{' '}
              <span className="text-gray-900">{queryIntent.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Entities Found:</span>{' '}
              <span className="text-gray-900">
                {entities.length > 0 ? entities.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Found {results.length} relevant papers
          </h3>

          {results.map((result, index) => (
            <div key={result.paper.id || index} className="space-y-2">
              <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 flex-1">
                    {result.paper.title}
                  </h4>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-gray-500">
                      {(result.relevanceScore * 100).toFixed(0)}% match
                    </span>
                    {result.source && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {result.source}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {result.paper.authors}
                </p>

                {result.paper.abstract && (
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                    {result.paper.abstract}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700">Why matched:</span>
                    <span className="text-gray-600">{result.explanation}</span>
                  </div>

                  {result.relatedConcepts.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-700">Related:</span>
                      <div className="flex flex-wrap gap-1">
                        {result.relatedConcepts.map((concept, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.paper.powerOutput && (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        Power: <strong>{result.paper.powerOutput} mW/m²</strong>
                      </span>
                      {result.paper.efficiency && (
                        <span className="text-gray-600">
                          Efficiency: <strong>{result.paper.efficiency}%</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {result.suggestedQueries.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">Suggested searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestedQueries.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestedQuery(suggestion)}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {suggestion} →
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

      {/* No results */}
      {!loading && query && results.length === 0 && !error && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">
            No papers found matching your search. Try different keywords or browse all papers.
          </p>
        </div>
      )}
    </div>
  )
}