'use client'

import { useState, useEffect } from 'react'
// Authentication removed for research-only version
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PaperDetails {
  id: string
  title: string
  authors: string[] | string
  abstract?: string
  doi?: string
  pubmedId?: string
  arxivId?: string
  ieeeId?: string
  publicationDate?: string
  journal?: string
  volume?: string
  issue?: string
  pages?: string
  keywords: string[] | string
  externalUrl: string
  organismTypes?: string[] | string
  anodeMaterials?: string[] | string
  cathodeMaterials?: string[] | string
  powerOutput?: number
  efficiency?: number
  systemType?: string
  source: string
  isPublic: boolean
  createdAt: string
  // AI fields
  aiSummary?: string
  aiKeyFindings?: string
  aiMethodology?: string
  aiImplications?: string
  aiDataExtraction?: string
  aiData?: any
  aiInsights?: string
  aiProcessingDate?: string
  aiModelVersion?: string
  aiConfidence?: number
  // Enhanced computed fields
  hasPerformanceData?: boolean
  isAiProcessed?: boolean
  processingMethod?: string
  confidenceScore?: number
  // Comprehensive parameter fields
  experimentalConditions?: string
  reactorConfiguration?: string
  electrodeSpecifications?: string
  biologicalParameters?: string
  performanceMetrics?: string
  operationalParameters?: string
  electrochemicalData?: string
  timeSeriesData?: string
  economicMetrics?: string
  user?: {
    id: string
    name?: string
    email: string
    institution?: string
  }
  experiments: Array<{
    id: string
    notes?: string
    citationType?: string
    experiment: {
      id: string
      name: string
      status: string
    }
  }>
  _count: {
    experiments: number
  }
}

export default function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // No authentication in research-only version
  const session = null
  const router = useRouter()
  const [paper, setPaper] = useState<PaperDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [activeTab, setActiveTab] = useState<string>('experimental')

  useEffect(() => {
    params.then(p => setResolvedParams(p))
  }, [params])

  useEffect(() => {
    if (resolvedParams) {
      fetchPaper()
    }
  }, [resolvedParams])

  // Set default tab when paper loads
  useEffect(() => {
    if (paper) {
      // Set first available tab as default
      if (paper.experimentalConditions) setActiveTab('experimental')
      else if (paper.reactorConfiguration) setActiveTab('reactor')
      else if (paper.electrodeSpecifications) setActiveTab('electrode')
      else if (paper.biologicalParameters) setActiveTab('biological')
      else if (paper.performanceMetrics) setActiveTab('performance')
      else if (paper.operationalParameters) setActiveTab('operational')
      else if (paper.electrochemicalData) setActiveTab('electrochemical')
    }
  }, [paper])

  const fetchPaper = async () => {
    if (!resolvedParams) return
    try {
      const response = await fetch(`/api/papers/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setPaper(data)
      } else if (response.status === 404) {
        router.push('/literature')
      }
    } catch (error) {
      console.error('Error fetching paper:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this paper?')) return
    if (!resolvedParams) return
    
    try {
      const response = await fetch(`/api/papers/${resolvedParams.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        router.push('/literature')
      }
    } catch (error) {
      console.error('Error deleting paper:', error)
    }
  }

  const formatAuthors = (authors: string[] | string) => {
    if (Array.isArray(authors)) {
      const cleanAuthors = authors.filter(author => author && author !== 'not specified')
      if (cleanAuthors.length === 0) return 'Authors not specified'
      return cleanAuthors.join(', ')
    }
    if (typeof authors === 'string') {
      try {
        const parsed = JSON.parse(authors)
        if (Array.isArray(parsed)) {
          const cleanAuthors = parsed.filter(author => author && author !== 'not specified')
          if (cleanAuthors.length === 0) return 'Authors not specified'
          return cleanAuthors.join(', ')
        }
        return parsed || 'Authors not specified'
      } catch {
        return authors || 'Authors not specified'
      }
    }
    return 'Authors not specified'
  }

  const formatArrayField = (field: string[] | string | undefined, fieldName: string) => {
    if (!field) return `${fieldName} not specified`
    
    let itemList: string[] = []
    if (Array.isArray(field)) {
      itemList = field
    } else if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        itemList = Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        itemList = [field]
      }
    }
    
    const cleanItems = itemList.filter(item => {
      if (!item || typeof item !== 'string') return false
      const lower = item.toLowerCase().trim()
      
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
    
    if (cleanItems.length === 0) return `${fieldName} not specified`
    
    return cleanItems.join(', ')
  }

  const formatMaterialsList = (materials: string[] | string | undefined): string[] => {
    if (!materials) return []
    
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
    
    return cleanMaterials
  }

  const formatKeywords = (keywords: string[] | string): string[] => {
    if (Array.isArray(keywords)) {
      return keywords.filter(k => k && k !== 'not specified')
    }
    if (typeof keywords === 'string') {
      try {
        const parsed = JSON.parse(keywords)
        if (Array.isArray(parsed)) {
          return parsed.filter(k => k && k !== 'not specified')
        }
        return [parsed].filter(k => k && k !== 'not specified')
      } catch {
        return [keywords].filter(k => k && k !== 'not specified')
      }
    }
    return []
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isRealPaper = (paper: PaperDetails) => {
    const realSources = ['crossref_api', 'arxiv_api', 'pubmed_api', 'local_pdf', 'web_search', 
                        'comprehensive_search', 'advanced_electrode_biofacade_search', 
                        'extensive_electrode_biofacade_collection']
    return realSources.includes(paper.source) || paper.doi || paper.arxivId || paper.pubmedId
  }

  const getPaperSourceLabel = (paper: PaperDetails) => {
    if (paper.doi) return 'DOI Verified Research Paper'
    if (paper.arxivId) return 'arXiv Preprint'
    if (paper.pubmedId) return 'PubMed Indexed Publication'
    if (paper.source === 'crossref_api') return 'CrossRef Database'
    if (paper.source === 'local_pdf') return 'PDF Extracted Data'
    return 'User Contributed Content'
  }

  const formatMaterials = (materialsJson?: string) => {
    if (!materialsJson) return []
    try {
      const materials = JSON.parse(materialsJson)
      return Array.isArray(materials) ? materials : []
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!paper) return null

  const isOwner = false // No ownership in research-only version

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/literature"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back to Literature
        </Link>

        {/* Paper Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Paper Quality Badge */}
            <div className="mb-4">
              {isRealPaper(paper) ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
                  <span className="text-lg">✅</span>
                  <span className="font-semibold">{getPaperSourceLabel(paper)}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg border border-purple-200">
                  <span className="text-lg">🤖</span>
                  <span className="font-semibold">AI-Enhanced Content</span>
                </div>
              )}
            </div>

            {/* Title and Actions */}
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">
                {paper.title}
              </h1>
              <div className="flex gap-2 ml-4">
                {/* External Link - Prominent Button */}
                {(paper.externalUrl || paper.doi) && (
                  <a
                    href={paper.doi ? `https://doi.org/${paper.doi}` : paper.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <span>🔗</span>
                    Read Full Paper
                  </a>
                )}
                {isOwner && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Authors */}
            <p className="text-lg text-gray-700 mb-4">
              {formatAuthors(paper.authors)}
            </p>

            {/* Publication Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="font-semibold">Journal:</span> {paper.journal || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Date:</span> {formatDate(paper.publicationDate)}
              </div>
              {paper.volume && (
                <div>
                  <span className="font-semibold">Volume:</span> {paper.volume}
                  {paper.issue && `, Issue ${paper.issue}`}
                  {paper.pages && `, pp. ${paper.pages}`}
                </div>
              )}
              <div>
                <span className="font-semibold">Source:</span> {paper.source}
              </div>
            </div>

            {/* Enhanced Identifiers & Links */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">📚 Access Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {paper.doi && (
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <span className="text-lg">🔗</span>
                    <div>
                      <div className="font-medium">DOI Link</div>
                      <div className="text-xs opacity-75">{paper.doi}</div>
                    </div>
                  </a>
                )}
                {paper.pubmedId && (
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <span className="text-lg">🏥</span>
                    <div>
                      <div className="font-medium">PubMed</div>
                      <div className="text-xs opacity-75">ID: {paper.pubmedId}</div>
                    </div>
                  </a>
                )}
                {paper.arxivId && (
                  <a
                    href={`https://arxiv.org/abs/${paper.arxivId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <span className="text-lg">📄</span>
                    <div>
                      <div className="font-medium">arXiv</div>
                      <div className="text-xs opacity-75">{paper.arxivId}</div>
                    </div>
                  </a>
                )}
                {paper.externalUrl && (
                  <a
                    href={paper.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-lg">🌐</span>
                    <div>
                      <div className="font-medium">Full Text</div>
                      <div className="text-xs opacity-75">External Link</div>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* AI Analysis Section */}
            {paper.aiProcessingDate && (
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🤖</span>
                  <h2 className="text-2xl font-bold text-gray-900">AI Analysis</h2>
                  {paper.aiConfidence && (
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${paper.aiConfidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{(paper.aiConfidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* AI Summary */}
                {paper.aiSummary && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span>📝</span> Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg">
                      {paper.aiSummary}
                    </p>
                  </div>
                )}
                
                {/* Key Findings */}
                {paper.aiKeyFindings && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span>🔍</span> Key Findings
                    </h3>
                    <div className="bg-white p-4 rounded-lg">
                      {(() => {
                        try {
                          const findings = JSON.parse(paper.aiKeyFindings);
                          if (Array.isArray(findings)) {
                            return (
                              <ul className="space-y-2">
                                {findings.map((finding, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-purple-500 mt-0.5">•</span>
                                    <span className="text-gray-700">{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return <p className="text-gray-700">{paper.aiKeyFindings}</p>;
                        } catch {
                          return <p className="text-gray-700">{paper.aiKeyFindings}</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Methodology Summary */}
                {paper.aiMethodology && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span>🔬</span> Methodology
                    </h3>
                    <p className="text-gray-700 bg-white p-4 rounded-lg">
                      {paper.aiMethodology}
                    </p>
                  </div>
                )}
                
                {/* Research Implications */}
                {paper.aiImplications && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span>🚀</span> Research Implications
                    </h3>
                    <p className="text-gray-700 bg-white p-4 rounded-lg">
                      {paper.aiImplications}
                    </p>
                  </div>
                )}
                
                {/* AI Insights */}
                {paper.aiInsights && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span>💡</span> AI Insights
                    </h3>
                    <p className="text-purple-700 font-medium bg-purple-50 p-4 rounded-lg border border-purple-200">
                      {paper.aiInsights}
                    </p>
                  </div>
                )}
                
                {/* Data Extraction */}
                {paper.aiDataExtraction && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span>📊</span> Extracted Data
                    </h3>
                    <div className="bg-white p-4 rounded-lg">
                      {(() => {
                        try {
                          const data = JSON.parse(paper.aiDataExtraction);
                          return (
                            <div className="space-y-3">
                              {Object.entries(data).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-start border-b pb-2 last:border-0">
                                  <span className="font-medium text-gray-700 capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-gray-600 text-right max-w-[60%]">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        } catch {
                          return <pre className="text-gray-700 text-sm whitespace-pre-wrap">{paper.aiDataExtraction}</pre>;
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                {/* AI Processing Info */}
                <div className="mt-4 pt-4 border-t border-blue-200 text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>
                      AI Analysis performed on {formatDate(paper.aiProcessingDate)}
                    </span>
                    {paper.aiModelVersion && (
                      <span className="text-gray-500">
                        Model: {paper.aiModelVersion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Abstract */}
            {paper.abstract && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Abstract</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{paper.abstract}</p>
              </div>
            )}

            {/* Performance Metrics - Enhanced */}
            {(paper.systemType || paper.powerOutput || paper.efficiency) && (
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">⚡</span>
                  <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
                  {isRealPaper(paper) && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      ✅ Verified Data
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {paper.systemType && (
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{paper.systemType}</div>
                      <div className="text-sm text-gray-600 mt-1">System Type</div>
                    </div>
                  )}
                  {paper.powerOutput && (
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        {paper.powerOutput.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">mW/m² Power Density</div>
                      {paper.powerOutput > 20000 && (
                        <div className="text-xs text-green-600 font-medium mt-1">🚀 High Performance</div>
                      )}
                    </div>
                  )}
                  {paper.efficiency && (
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        {paper.efficiency.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Coulombic Efficiency</div>
                      {paper.efficiency > 80 && (
                        <div className="text-xs text-purple-600 font-medium mt-1">🎯 Excellent</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Materials Information */}
            {(formatMaterialsList(paper.anodeMaterials).length > 0 || formatMaterialsList(paper.cathodeMaterials).length > 0 || formatMaterialsList(paper.organismTypes).length > 0) && (
              <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔬</span>
                  <h2 className="text-xl font-semibold text-gray-900">Materials & Organisms</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {formatMaterialsList(paper.anodeMaterials).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Anode Materials</h4>
                      <div className="flex flex-wrap gap-1">
                        {formatMaterialsList(paper.anodeMaterials).map((material, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formatMaterialsList(paper.cathodeMaterials).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Cathode Materials</h4>
                      <div className="flex flex-wrap gap-1">
                        {formatMaterialsList(paper.cathodeMaterials).map((material, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formatMaterialsList(paper.organismTypes).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Microorganisms</h4>
                      <div className="flex flex-wrap gap-1">
                        {formatMaterialsList(paper.organismTypes).map((organism, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {organism}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comprehensive Parameters Section */}
            {(paper.experimentalConditions || paper.reactorConfiguration || paper.electrodeSpecifications || 
              paper.biologicalParameters || paper.performanceMetrics || paper.operationalParameters || 
              paper.electrochemicalData || paper.timeSeriesData || paper.economicMetrics) && (
              <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📊</span>
                  <h2 className="text-2xl font-bold text-gray-900">Comprehensive Parameters</h2>
                  <span className="ml-auto px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                    Extracted Data
                  </span>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-4 border-b border-indigo-200">
                  {paper.experimentalConditions && (
                    <button
                      onClick={() => setActiveTab('experimental')}
                      className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'experimental' 
                          ? 'bg-white text-indigo-700 border-l border-t border-r border-indigo-200 -mb-px' 
                          : 'text-gray-600 hover:text-indigo-700'
                      }`}
                    >
                      🧪 Experimental
                    </button>
                  )}
                  {paper.reactorConfiguration && (
                    <button
                      onClick={() => setActiveTab('reactor')}
                      className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'reactor' 
                          ? 'bg-white text-indigo-700 border-l border-t border-r border-indigo-200 -mb-px' 
                          : 'text-gray-600 hover:text-indigo-700'
                      }`}
                    >
                      ⚙️ Reactor
                    </button>
                  )}
                  {paper.electrodeSpecifications && (
                    <button
                      onClick={() => setActiveTab('electrode')}
                      className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'electrode' 
                          ? 'bg-white text-indigo-700 border-l border-t border-r border-indigo-200 -mb-px' 
                          : 'text-gray-600 hover:text-indigo-700'
                      }`}
                    >
                      🔌 Electrodes
                    </button>
                  )}
                  {paper.biologicalParameters && (
                    <button
                      onClick={() => setActiveTab('biological')}
                      className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'biological' 
                          ? 'bg-white text-indigo-700 border-l border-t border-r border-indigo-200 -mb-px' 
                          : 'text-gray-600 hover:text-indigo-700'
                      }`}
                    >
                      🦠 Biological
                    </button>
                  )}
                  {paper.performanceMetrics && (
                    <button
                      onClick={() => setActiveTab('performance')}
                      className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'performance' 
                          ? 'bg-white text-indigo-700 border-l border-t border-r border-indigo-200 -mb-px' 
                          : 'text-gray-600 hover:text-indigo-700'
                      }`}
                    >
                      ⚡ Performance
                    </button>
                  )}
                  {paper.operationalParameters && (
                    <button
                      onClick={() => setActiveTab('operational')}
                      className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'operational' 
                          ? 'bg-white text-indigo-700 border-l border-t border-r border-indigo-200 -mb-px' 
                          : 'text-gray-600 hover:text-indigo-700'
                      }`}
                    >
                      🎛️ Operational
                    </button>
                  )}
                  {paper.electrochemicalData && (
                    <button
                      onClick={() => setActiveTab('electrochemical')}
                      className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'electrochemical' 
                          ? 'bg-white text-indigo-700 border-l border-t border-r border-indigo-200 -mb-px' 
                          : 'text-gray-600 hover:text-indigo-700'
                      }`}
                    >
                      📈 Electrochemical
                    </button>
                  )}
                </div>
                
                {/* Tab Content */}
                <div className="bg-white p-6 rounded-b-lg">
                  {activeTab === 'experimental' && paper.experimentalConditions && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span>🧪</span> Experimental Conditions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          try {
                            const data = JSON.parse(paper.experimentalConditions);
                            return Object.entries(data).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium text-gray-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="ml-2 text-gray-900">
                                  {typeof value === 'object' 
                                    ? `${value.value} ${value.unit || ''}`.trim()
                                    : String(value)
                                  }
                                </span>
                              </div>
                            ));
                          } catch {
                            return <p className="text-gray-700">{paper.experimentalConditions}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'reactor' && paper.reactorConfiguration && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span>⚙️</span> Reactor Configuration
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          try {
                            const data = JSON.parse(paper.reactorConfiguration);
                            return Object.entries(data).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium text-gray-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="ml-2 text-gray-900">
                                  {typeof value === 'object' 
                                    ? `${value.value} ${value.unit || ''}`.trim()
                                    : String(value)
                                  }
                                </span>
                              </div>
                            ));
                          } catch {
                            return <p className="text-gray-700">{paper.reactorConfiguration}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'electrode' && paper.electrodeSpecifications && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span>🔌</span> Electrode Specifications
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          try {
                            const data = JSON.parse(paper.electrodeSpecifications);
                            return Object.entries(data).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium text-gray-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="ml-2 text-gray-900">
                                  {Array.isArray(value) 
                                    ? value.join(', ')
                                    : typeof value === 'object' 
                                      ? `${value.value} ${value.unit || ''}`.trim()
                                      : String(value)
                                  }
                                </span>
                              </div>
                            ));
                          } catch {
                            return <p className="text-gray-700">{paper.electrodeSpecifications}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'biological' && paper.biologicalParameters && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span>🦠</span> Biological Parameters
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          try {
                            const data = JSON.parse(paper.biologicalParameters);
                            return Object.entries(data).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium text-gray-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="ml-2 text-gray-900">
                                  {Array.isArray(value) 
                                    ? value.join(', ')
                                    : String(value)
                                  }
                                </span>
                              </div>
                            ));
                          } catch {
                            return <p className="text-gray-700">{paper.biologicalParameters}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'performance' && paper.performanceMetrics && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span>⚡</span> Performance Metrics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(() => {
                          try {
                            const data = JSON.parse(paper.performanceMetrics);
                            return Object.entries(data).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                <div className="font-medium text-gray-700 capitalize mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="text-xl font-bold text-blue-700">
                                  {typeof value === 'object' 
                                    ? `${value.value} ${value.unit || ''}`.trim()
                                    : typeof value === 'number'
                                      ? value.toLocaleString()
                                      : String(value)
                                  }
                                </div>
                                {typeof value === 'object' && value.conditions && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {value.conditions}
                                  </div>
                                )}
                              </div>
                            ));
                          } catch {
                            return <p className="text-gray-700">{paper.performanceMetrics}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'operational' && paper.operationalParameters && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span>🎛️</span> Operational Parameters
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          try {
                            const data = JSON.parse(paper.operationalParameters);
                            return Object.entries(data).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium text-gray-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="ml-2 text-gray-900">
                                  {typeof value === 'object' 
                                    ? `${value.value} ${value.unit || ''}`.trim()
                                    : String(value)
                                  }
                                </span>
                              </div>
                            ));
                          } catch {
                            return <p className="text-gray-700">{paper.operationalParameters}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'electrochemical' && paper.electrochemicalData && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span>📈</span> Electrochemical Characterization
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          try {
                            const data = JSON.parse(paper.electrochemicalData);
                            return Object.entries(data).map(([key, value]: [string, any]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium text-gray-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="ml-2 text-gray-900">
                                  {Array.isArray(value) 
                                    ? value.join(', ')
                                    : typeof value === 'object' 
                                      ? `${value.value} ${value.unit || ''}`.trim()
                                      : String(value)
                                  }
                                </span>
                              </div>
                            ));
                          } catch {
                            return <p className="text-gray-700">{paper.electrochemicalData}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Keywords */}
            {formatKeywords(paper.keywords).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {formatKeywords(paper.keywords).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Experiments */}
            {paper.experiments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Cited in Experiments</h2>
                <div className="space-y-2">
                  {paper.experiments.map((link) => (
                    <Link
                      key={link.id}
                      href={`/experiment/${link.experiment.id}`}
                      className="block p-3 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      <div className="font-medium">{link.experiment.name}</div>
                      <div className="text-sm text-gray-600">
                        Status: {link.experiment.status}
                        {link.citationType && ` • Citation type: ${link.citationType}`}
                      </div>
                      {link.notes && (
                        <div className="text-sm text-gray-500 mt-1">{link.notes}</div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-sm text-gray-500 pt-6 border-t">
              {paper.user && (
                <>
                  <p>Uploaded by {paper.user.name || paper.user.email}</p>
                  {paper.user.institution && <p>Institution: {paper.user.institution}</p>}
                </>
              )}
              <p>Added on {formatDate(paper.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}