'use client'

import { useState, useEffect } from 'react'
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
  _count: {
    experiments: number
  }
  user: {
    id: string
    name?: string
    email: string
  }
}

export default function FixedLiteraturePage() {
  const router = useRouter()
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRealPapersOnly, setShowRealPapersOnly] = useState(false) // Start with false to see all papers
  
  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '20',
          ...(showRealPapersOnly && { realOnly: 'true' })
        })
        
        console.log('Fetching papers with params:', params.toString())
        const response = await fetch(`/api/papers?${params}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Received data:', data)
        
        if (data.papers && Array.isArray(data.papers)) {
          setPapers(data.papers)
        } else {
          console.error('Invalid data structure:', data)
          setError('Invalid data received from server')
        }
      } catch (err) {
        console.error('Error fetching papers:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch papers')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPapers()
  }, [showRealPapersOnly])
  
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
  
  const isRealPaper = (paper: Paper) => {
    const realSources = ['crossref_api', 'arxiv_api', 'pubmed_api', 'local_pdf', 'web_search', 
                        'comprehensive_search', 'advanced_electrode_biofacade_search', 
                        'extensive_electrode_biofacade_collection']
    return realSources.includes(paper.source || '') || paper.doi || paper.arxivId || paper.pubmedId
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Literature Database (Fixed)</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        <div className="mb-6">
          <button
            onClick={() => setShowRealPapersOnly(!showRealPapersOnly)}
            className={`px-4 py-2 rounded ${
              showRealPapersOnly 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {showRealPapersOnly ? '✅ Real Papers Only' : '📊 All Papers'}
          </button>
          <span className="ml-4 text-gray-600">
            Filter: {showRealPapersOnly ? 'Showing real papers only' : 'Showing all papers'}
          </span>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse bg-white p-6 rounded shadow">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : papers.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center">
            <p className="text-gray-500">No papers found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-600 font-semibold mb-4">
              Found {papers.length} papers
            </p>
            {papers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white p-6 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/literature/${paper.id}`)}
              >
                <h3 className="text-xl font-semibold mb-2">{paper.title}</h3>
                <p className="text-gray-600 mb-2">{formatAuthors(paper.authors)}</p>
                <div className="flex items-center gap-4 text-sm">
                  {isRealPaper(paper) && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      ✅ Real Paper
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}