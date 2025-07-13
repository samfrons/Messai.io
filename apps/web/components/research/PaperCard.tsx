'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PaperCardProps {
  paper: {
    id: string
    title: string
    authors: string
    abstract?: string
    journal?: string
    publicationDate?: string
    systemType?: string
    powerOutput?: number
    efficiency?: number
    externalUrl: string
    _count?: {
      experiments: number
    }
    user?: {
      name?: string
      email: string
    }
  }
  onSelect?: (paperId: string) => void
  showActions?: boolean
}

export default function PaperCard({ paper, onSelect, showActions = false }: PaperCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatAuthors = (authorsJson: string) => {
    try {
      const authors = JSON.parse(authorsJson)
      if (Array.isArray(authors)) {
        const displayAuthors = authors.slice(0, 3).join(', ')
        return authors.length > 3 ? `${displayAuthors} et al.` : displayAuthors
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

  const handleClick = () => {
    if (onSelect) {
      onSelect(paper.id)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {onSelect ? (
            <button
              onClick={handleClick}
              className="text-left hover:text-blue-600 transition-colors"
            >
              {paper.title}
            </button>
          ) : (
            <Link
              href={`/research/${paper.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {paper.title}
            </Link>
          )}
        </h3>

        {/* Authors */}
        <p className="text-sm text-gray-600">
          {formatAuthors(paper.authors)}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-sm">
          {paper.journal && (
            <span className="text-gray-500">
              📚 {paper.journal}
            </span>
          )}
          <span className="text-gray-500">
            📅 {formatDate(paper.publicationDate)}
          </span>
          {paper._count && (
            <span className="text-gray-500">
              🔬 {paper._count.experiments} experiments
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {paper.systemType && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {paper.systemType}
            </span>
          )}
          {paper.powerOutput && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {paper.powerOutput} mW/m²
            </span>
          )}
          {paper.efficiency && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {paper.efficiency}% efficiency
            </span>
          )}
        </div>

        {/* Abstract */}
        {paper.abstract && (
          <div className="text-sm text-gray-600">
            <p className={isExpanded ? '' : 'line-clamp-2'}>
              {paper.abstract}
            </p>
            {paper.abstract.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-800 mt-1 text-sm"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-3">
          <div className="flex gap-3">
            <a
              href={paper.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              View Full Text →
            </a>
            {!onSelect && (
              <Link
                href={`/research/${paper.id}`}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Details
              </Link>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2">
              {onSelect && (
                <button
                  onClick={handleClick}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Select
                </button>
              )}
            </div>
          )}
        </div>

        {/* Uploader info */}
        {paper.user && (
          <div className="text-xs text-gray-400 pt-2 border-t">
            Uploaded by {paper.user.name || paper.user.email}
          </div>
        )}
      </div>
    </div>
  )
}