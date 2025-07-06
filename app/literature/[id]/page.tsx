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

export default function PaperDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [paper, setPaper] = useState<PaperDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchPaper()
  }, [params.id])

  const fetchPaper = async () => {
    try {
      const response = await fetch(`/api/papers/${params.id}`)
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
    
    try {
      const response = await fetch(`/api/papers/${params.id}`, {
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
            {/* Title and Actions */}
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">
                {paper.title}
              </h1>
              {isOwner && (
                <div className="flex gap-2 ml-4">
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
                </div>
              )}
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

            {/* Identifiers */}
            <div className="flex flex-wrap gap-3 mb-6">
              {paper.doi && (
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  DOI: {paper.doi}
                </a>
              )}
              {paper.pubmedId && (
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  PubMed: {paper.pubmedId}
                </a>
              )}
              {paper.arxivId && (
                <a
                  href={`https://arxiv.org/abs/${paper.arxivId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  arXiv: {paper.arxivId}
                </a>
              )}
              <a
                href={paper.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                View Full Text →
              </a>
            </div>

            {/* Abstract */}
            {paper.abstract && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Abstract</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{paper.abstract}</p>
              </div>
            )}

            {/* MES-Specific Information */}
            {(paper.systemType || paper.powerOutput || paper.efficiency) && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">MES-Specific Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paper.systemType && (
                    <div>
                      <span className="font-semibold">System Type:</span> {paper.systemType}
                    </div>
                  )}
                  {paper.powerOutput && (
                    <div>
                      <span className="font-semibold">Power Output:</span> {paper.powerOutput} mW/m²
                    </div>
                  )}
                  {paper.efficiency && (
                    <div>
                      <span className="font-semibold">Efficiency:</span> {paper.efficiency}%
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