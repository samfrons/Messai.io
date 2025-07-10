'use client'

import { useState } from 'react'
import { getDemoConfig } from '@/lib/demo-mode'

interface LinkValidatorProps {
  url: string
  onValidated?: (isValid: boolean) => void
  className?: string
}

export function LinkValidator({ url, onValidated, className = '' }: LinkValidatorProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    checkedAt: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const demoConfig = getDemoConfig()

  const validateLink = async () => {
    if (demoConfig.isDemo) {
      setError('Link validation not available in demo mode')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const response = await fetch('/api/papers/validate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed')
      }

      setValidationResult({
        isValid: data.isValid,
        checkedAt: data.checkedAt
      })

      onValidated?.(data.isValid)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate link')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={validateLink}
        disabled={isValidating || !url}
        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
          isValidating
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isValidating ? 'Checking...' : 'Validate Link'}
      </button>

      {validationResult && (
        <span
          className={`text-xs font-medium ${
            validationResult.isValid ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {validationResult.isValid ? '✅ Valid' : '❌ Invalid'}
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  )
}

interface BulkLinkValidatorProps {
  papers: Array<{
    id: string
    title: string
    url?: string | null
    doi?: string | null
  }>
  onComplete?: (results: Map<string, boolean>) => void
}

export function BulkLinkValidator({ papers, onComplete }: BulkLinkValidatorProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Map<string, boolean>>(new Map())
  const demoConfig = getDemoConfig()

  const validateAll = async () => {
    if (demoConfig.isDemo) {
      return
    }

    setIsValidating(true)
    setProgress(0)
    const newResults = new Map<string, boolean>()

    for (let i = 0; i < papers.length; i++) {
      const paper = papers[i]
      const url = paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : null)

      if (url) {
        try {
          const response = await fetch('/api/papers/validate-link', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
          })

          const data = await response.json()
          newResults.set(paper.id, response.ok && data.isValid)
        } catch {
          newResults.set(paper.id, false)
        }
      }

      setProgress(((i + 1) / papers.length) * 100)
      setResults(new Map(newResults))

      // Rate limiting delay
      if (i < papers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    setIsValidating(false)
    onComplete?.(newResults)
  }

  const validCount = Array.from(results.values()).filter(v => v).length
  const invalidCount = Array.from(results.values()).filter(v => !v).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Link Validation</h3>
        <button
          onClick={validateAll}
          disabled={isValidating || demoConfig.isDemo}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isValidating || demoConfig.isDemo
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isValidating ? 'Validating...' : 'Validate All Links'}
        </button>
      </div>

      {demoConfig.isDemo && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Link validation is not available in demo mode
        </div>
      )}

      {isValidating && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Validating {Math.ceil((progress / 100) * papers.length)} of {papers.length} papers...
          </p>
        </div>
      )}

      {results.size > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{validCount}</div>
            <div className="text-sm text-green-600">Valid Links</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{invalidCount}</div>
            <div className="text-sm text-red-600">Invalid Links</div>
          </div>
        </div>
      )}

      {results.size > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {papers.map(paper => {
            const isValid = results.get(paper.id)
            if (isValid === undefined) return null

            return (
              <div
                key={paper.id}
                className={`p-2 rounded border ${
                  isValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1">
                    {paper.title}
                  </span>
                  <span className={`text-xs ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isValid ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}