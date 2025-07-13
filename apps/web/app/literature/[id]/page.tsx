'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PaperDetails {
  id: string
  title: string
  authors: string
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
  keywords: string
  externalUrl: string
  organismTypes?: string
  anodeMaterials?: string
  cathodeMaterials?: string
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
  aiInsights?: string
  aiProcessingDate?: string
  aiModelVersion?: string
  aiConfidence?: number
  user: {
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
  const { data: session } = useSession()
  const router = useRouter()
  const [paper, setPaper] = useState<PaperDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(p => setResolvedParams(p))
  }, [params])

  useEffect(() => {
    if (resolvedParams) {
      fetchPaper()
    }
  }, [resolvedParams])

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

  const formatAuthors = (authorsJson: string) => {
    try {
      const authors = JSON.parse(authorsJson)
      if (Array.isArray(authors)) {
        return authors.join(', ')
      }
      return authorsJson
    } catch {
      return authorsJson
    }
  }

  const formatKeywords = (keywordsJson: string) => {
    try {
      const keywords = JSON.parse(keywordsJson)
      if (Array.isArray(keywords)) {
        return keywords
      }
      return []
    } catch {
      return []
    }
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

  const isOwner = session?.user?.id === paper.user.id

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
            {(formatMaterials(paper.anodeMaterials).length > 0 || formatMaterials(paper.cathodeMaterials).length > 0 || formatMaterials(paper.organismTypes).length > 0) && (
              <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔬</span>
                  <h2 className="text-xl font-semibold text-gray-900">Materials & Organisms</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {formatMaterials(paper.anodeMaterials).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Anode Materials</h4>
                      <div className="flex flex-wrap gap-1">
                        {formatMaterials(paper.anodeMaterials).map((material, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formatMaterials(paper.cathodeMaterials).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Cathode Materials</h4>
                      <div className="flex flex-wrap gap-1">
                        {formatMaterials(paper.cathodeMaterials).map((material, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formatMaterials(paper.organismTypes).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Microorganisms</h4>
                      <div className="flex flex-wrap gap-1">
                        {formatMaterials(paper.organismTypes).map((organism, index) => (
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
              <p>Uploaded by {paper.user.name || paper.user.email}</p>
              {paper.user.institution && <p>Institution: {paper.user.institution}</p>}
              <p>Added on {formatDate(paper.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}