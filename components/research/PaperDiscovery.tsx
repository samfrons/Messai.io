'use client'

import { useState } from 'react'
import { getDemoConfig } from '@/lib/demo-mode'

interface DiscoveredPaper {
  title: string
  authors: string[]
  abstract: string | null
  journal: string | null
  publicationDate: string | null
  doi: string | null
  url: string | null
  powerOutput: number | null
  efficiency: number | null
  systemType: string | null
  keywords: string[]
}

export function PaperDiscovery() {
  const [query, setQuery] = useState('')
  const [sources, setSources] = useState({
    crossref: true,
    arxiv: true,
    pubmed: true
  })
  const [limit, setLimit] = useState(5)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [discoveredPapers, setDiscoveredPapers] = useState<DiscoveredPaper[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const demoConfig = getDemoConfig()

  const discoverPapers = async () => {
    if (!query.trim() || query.length < 3) {
      setError('Query must be at least 3 characters')
      return
    }

    if (demoConfig.isDemo) {
      setError('Paper discovery not available in demo mode')
      return
    }

    setIsDiscovering(true)
    setError(null)
    setDiscoveredPapers([])

    try {
      const selectedSources = Object.entries(sources)
        .filter(([, enabled]) => enabled)
        .map(([source]) => source as 'crossref' | 'arxiv' | 'pubmed')

      const response = await fetch('/api/papers/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          sources: selectedSources,
          limit
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Discovery failed')
      }

      setDiscoveredPapers(data.papers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover papers')
    } finally {
      setIsDiscovering(false)
    }
  }

  const savePaper = async (paper: DiscoveredPaper) => {
    if (!paper.url) {
      setError('Cannot save paper without URL')
      return
    }

    try {
      const response = await fetch('/api/papers/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: paper.url,
          save: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError('Paper already exists in database')
        } else {
          throw new Error(data.error || 'Save failed')
        }
        return
      }

      // Remove saved paper from list
      setDiscoveredPapers(prev => prev.filter(p => p.url !== paper.url))
      
      // Show success message (you might want to use a toast notification here)
      alert(`Paper saved successfully! ID: ${data.paperId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save paper')
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔍 Discover New Papers
        </h3>

        {demoConfig.isDemo && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">
            Paper discovery is not available in demo mode. Use the existing database of 4,380+ papers.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., MXene electrode, microbial fuel cell optimization"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={demoConfig.isDemo}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sources
            </label>
            <div className="flex gap-4">
              {Object.entries(sources).map(([source, enabled]) => (
                <label key={source} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setSources(prev => ({
                      ...prev,
                      [source]: e.target.checked
                    }))}
                    disabled={demoConfig.isDemo}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">{source}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Results per source
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={demoConfig.isDemo}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          <button
            onClick={discoverPapers}
            disabled={isDiscovering || demoConfig.isDemo || !query.trim()}
            className={`w-full py-2 px-4 font-medium rounded-lg transition-colors ${
              isDiscovering || demoConfig.isDemo || !query.trim()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isDiscovering ? 'Discovering...' : 'Discover Papers'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {discoveredPapers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Found {discoveredPapers.length} Papers
          </h3>

          {discoveredPapers.map((paper, index) => (
            <div
              key={`${paper.doi || paper.url || index}`}
              className="bg-white p-4 rounded-lg shadow-sm border hover:border-blue-300 transition-colors"
            >
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">
                  {paper.title}
                </h4>
                
                <p className="text-sm text-gray-600">
                  {paper.authors.slice(0, 3).join(', ')}
                  {paper.authors.length > 3 && ' et al.'}
                </p>

                {paper.abstract && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {paper.abstract}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {paper.journal && (
                    <span>📚 {paper.journal}</span>
                  )}
                  {paper.publicationDate && (
                    <span>📅 {new Date(paper.publicationDate).getFullYear()}</span>
                  )}
                  {paper.doi && (
                    <span>🔗 DOI: {paper.doi}</span>
                  )}
                  {paper.powerOutput && (
                    <span className="text-green-600">
                      ⚡ {paper.powerOutput} mW/m²
                    </span>
                  )}
                  {paper.efficiency && (
                    <span className="text-blue-600">
                      🎯 {paper.efficiency}% efficiency
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Original →
                    </a>
                  )}
                  
                  <button
                    onClick={() => savePaper(paper)}
                    className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save to Database
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}