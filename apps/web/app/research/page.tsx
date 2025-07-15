'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Paper {
  id: string
  title: string
  authors: string[] | string  // Can be array or string
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
  // Enhanced extraction fields
  anodeMaterials?: string[] | string
  cathodeMaterials?: string[] | string
  organismTypes?: string[] | string
  keywords?: string[] | string
  // AI fields
  aiSummary?: string
  aiKeyFindings?: string
  aiInsights?: string
  aiProcessingDate?: string
  aiConfidence?: number
  aiData?: any
  // Enhanced computed fields
  hasPerformanceData?: boolean
  isAiProcessed?: boolean
  processingMethod?: string
  confidenceScore?: number
  uploadedBy?: string
  createdAt?: string
  updatedAt?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ResearchStats {
  totalPapers: number
  aiProcessed: number
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

export default function ResearchPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<ResearchStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [showRealPapersOnly, setShowRealPapersOnly] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const response = await fetch('/api/research/stats')
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
        requireMicrobial: 'false', // Show all papers by default
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

  const formatAuthors = (authors: string[] | string) => {
    if (Array.isArray(authors)) {
      const cleanAuthors = authors.filter(author => author && author !== 'not specified')
      if (cleanAuthors.length === 0) return 'Authors not specified'
      return cleanAuthors.slice(0, 3).join(', ') + (cleanAuthors.length > 3 ? ' et al.' : '')
    }
    if (typeof authors === 'string') {
      try {
        const parsed = JSON.parse(authors)
        if (Array.isArray(parsed)) {
          const cleanAuthors = parsed.filter(author => author && author !== 'not specified')
          if (cleanAuthors.length === 0) return 'Authors not specified'
          return cleanAuthors.slice(0, 3).join(', ') + (cleanAuthors.length > 3 ? ' et al.' : '')
        }
        return parsed || 'Authors not specified'
      } catch {
        return authors || 'Authors not specified'
      }
    }
    return 'Authors not specified'
  }

  const formatMaterials = (materials: string[] | string | undefined, type: 'anode' | 'cathode') => {
    if (!materials) return null
    
    let materialList: string[] = []
    if (Array.isArray(materials)) {
      materialList = materials
    } else if (typeof materials === 'string') {
      try {
        const parsed = JSON.parse(materials)
        materialList = Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        materialList = [materials]
      }
    }
    
    // Filter out placeholder values and common pattern matching artifacts
    const cleanMaterials = materialList.filter(m => {
      if (!m || typeof m !== 'string') return false
      const lower = m.toLowerCase().trim()
      
      // Basic quality filters
      if (lower.length <= 2) return false
      if (['not specified', 'undefined', 'null', 'n/a', 'na'].includes(lower)) return false
      if (lower.includes('null') || lower.includes('undefined')) return false
      
      // Pattern matching artifacts
      const artifacts = ['the', 'and', 'with', 'using', 'while the', 'in the', 'of the', 'for the', 'to the', 'was', 'were', 'is', 'are', 'at', 'on', 'in', 'of', 'by', 'from', 'as']
      if (artifacts.includes(lower)) return false
      
      // Very short or common words
      if (lower.length < 4 && !['mxene', 'cnt', 'go', 'rgo'].includes(lower)) return false
      
      return true
    })
    
    if (cleanMaterials.length === 0) return null
    
    return cleanMaterials.slice(0, 3).join(', ') + (cleanMaterials.length > 3 ? '...' : '')
  }

  const formatOrganisms = (organisms: string[] | string | undefined) => {
    if (!organisms) return null
    
    let organismList: string[] = []
    if (Array.isArray(organisms)) {
      organismList = organisms
    } else if (typeof organisms === 'string') {
      try {
        const parsed = JSON.parse(organisms)
        organismList = Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        organismList = [organisms]
      }
    }
    
    const cleanOrganisms = organismList.filter(o => {
      if (!o || typeof o !== 'string') return false
      const lower = o.toLowerCase().trim()
      
      // Basic quality filters
      if (lower.length <= 2) return false
      if (['not specified', 'undefined', 'null', 'n/a', 'na'].includes(lower)) return false
      if (lower.includes('null') || lower.includes('undefined')) return false
      
      // Pattern matching artifacts for organisms
      const artifacts = ['the', 'and', 'with', 'using', 'while the', 'in the', 'of the', 'for the', 'to the', 'was', 'were', 'is', 'are', 'at', 'on', 'in', 'of', 'by', 'from', 'as', 'solution', 'medium', 'buffer']
      if (artifacts.includes(lower)) return false
      
      // Very short words (but allow some scientific abbreviations)
      if (lower.length < 4 && !['e. coli', 'dh5α'].some(abbrev => lower.includes(abbrev.split(' ')[0]))) return false
      
      return true
    })
    
    if (cleanOrganisms.length === 0) return null
    
    return cleanOrganisms.slice(0, 2).join(', ') + (cleanOrganisms.length > 2 ? '...' : '')
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
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-black">Research Database</h1>
          <p className="mt-2 text-black opacity-60">
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
                  className="w-full pl-10 pr-20 py-3 border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-black text-white hover:opacity-80 transition-opacity text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </form>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowRealPapersOnly(!showRealPapersOnly)}
                className={`px-4 py-3 ${showRealPapersOnly ? 'bg-black' : 'bg-white border border-gray-200'} ${showRealPapersOnly ? 'text-white' : 'text-black'} hover:opacity-80 transition-opacity text-sm font-medium`}
              >
                {showRealPapersOnly ? 'Real Papers' : 'All Papers'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 w-full"></div>
              </div>
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div className="bg-white p-8 border border-gray-200 text-center">
            <p className="text-black opacity-60">No papers found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white border border-gray-200 hover:border-black/20 transition-all duration-200 cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/research/${paper.id}`)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-serif text-black mb-2">
                    {paper.title}
                  </h3>
                  <p className="text-black opacity-60 mb-3 font-medium">
                    {formatAuthors(paper.authors)}
                  </p>
                  
                  {/* AI Summary Section */}
                  {paper.aiSummary && (
                    <div className="mb-4 p-3 bg-black/5 border border-gray-200">
                      <div className="flex items-start gap-2">
                        <span className="text-black font-semibold text-sm">🤖 AI Summary:</span>
                        <p className="text-sm text-black leading-relaxed flex-1">
                          {paper.aiSummary}
                        </p>
                      </div>
                      {paper.aiConfidence && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-black opacity-60">Confidence:</span>
                          <div className="flex-1 bg-black/10 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-black h-2 rounded-full"
                              style={{ width: `${paper.aiConfidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-black">{(paper.aiConfidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Original Abstract - shown when no AI summary */}
                  {!paper.aiSummary && paper.abstract && (
                    <p className="text-black opacity-60 text-sm leading-relaxed line-clamp-2 mb-4">
                      {paper.abstract}
                    </p>
                  )}
                  
                  {/* AI Insights if available */}
                  {paper.aiInsights && (
                    <div className="mb-4 p-2 bg-black/5 border border-gray-200">
                      <p className="text-xs text-black">
                        <span className="font-semibold">💡 Insight:</span> {paper.aiInsights}
                      </p>
                    </div>
                  )}

                  {/* Enhanced Data Section */}
                  {(paper.hasPerformanceData || formatMaterials(paper.anodeMaterials, 'anode') || formatOrganisms(paper.organismTypes)) && (
                    <div className="mb-4 p-3 bg-white border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {/* Performance Data */}
                        {paper.powerOutput && (
                          <div className="flex items-center gap-2">
                            <span className="text-black opacity-60">⚡ Power:</span>
                            <span className="font-medium text-black">{paper.powerOutput} mW/m²</span>
                          </div>
                        )}
                        {paper.efficiency && (
                          <div className="flex items-center gap-2">
                            <span className="text-black opacity-60">📊 Efficiency:</span>
                            <span className="font-medium text-black">{paper.efficiency}%</span>
                          </div>
                        )}
                        {paper.systemType && (
                          <div className="flex items-center gap-2">
                            <span className="text-black opacity-60">🔧 System:</span>
                            <span className="font-medium text-black">{paper.systemType}</span>
                          </div>
                        )}
                        
                        {/* Materials */}
                        {formatMaterials(paper.anodeMaterials, 'anode') && (
                          <div className="flex items-start gap-2">
                            <span className="text-black opacity-60">🔋 Anode:</span>
                            <span className="font-medium text-black text-xs leading-relaxed">
                              {formatMaterials(paper.anodeMaterials, 'anode')}
                            </span>
                          </div>
                        )}
                        {formatMaterials(paper.cathodeMaterials, 'cathode') && (
                          <div className="flex items-start gap-2">
                            <span className="text-black opacity-60">⚡ Cathode:</span>
                            <span className="font-medium text-black text-xs leading-relaxed">
                              {formatMaterials(paper.cathodeMaterials, 'cathode')}
                            </span>
                          </div>
                        )}
                        
                        {/* Organisms */}
                        {formatOrganisms(paper.organismTypes) && (
                          <div className="flex items-start gap-2 md:col-span-2">
                            <span className="text-black opacity-60">🦠 Organisms:</span>
                            <span className="font-medium text-black text-xs leading-relaxed">
                              {formatOrganisms(paper.organismTypes)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    {isRealPaper(paper) && (
                      <span className="px-2 py-1 bg-black/10 text-black text-xs font-medium">
                        {getPaperSourceLabel(paper)}
                      </span>
                    )}
                    {paper.isAiProcessed && (
                      <span className="px-2 py-1 bg-black/10 text-black text-xs font-medium flex items-center gap-1">
                        <span>🤖</span> {paper.processingMethod || 'AI Enhanced'}
                        {paper.confidenceScore && (
                          <span className="ml-1">({Math.round(paper.confidenceScore * 100)}%)</span>
                        )}
                      </span>
                    )}
                    {paper.hasPerformanceData && (
                      <span className="px-2 py-1 bg-black/5 text-black text-xs font-medium">
                        📊 Performance Data
                      </span>
                    )}
                    <span className="text-black opacity-60">
                      Source: {paper.source || 'Unknown'}
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
              className="px-4 py-2 border border-gray-200 hover:bg-black/5 text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-black">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-200 hover:bg-black/5 text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}