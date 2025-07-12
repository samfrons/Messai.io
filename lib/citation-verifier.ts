/**
 * Citation Verification System
 * 
 * Verifies and extracts citation relationships between papers
 * using Zen MCP browser automation for accurate citation checking.
 */

import { zenBrowser, PaperData } from './zen-browser'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Citation {
  title: string
  authors: string[]
  year?: number
  doi?: string
  url?: string
}

export interface CitationVerificationResult {
  paperId: string
  title: string
  verifiedCitations: Citation[]
  unverifiedCitations: Citation[]
  citedByCount?: number
  citationNetworkSize?: number
}

/**
 * Extract citations from paper content
 */
export async function extractCitations(paperUrl: string): Promise<Citation[]> {
  const citations: Citation[] = []

  try {
    // Scrape paper page for citation data
    const data = await zenBrowser.scrape(paperUrl, {
      selectors: {
        // Common citation selectors
        references: '.references li, .bibliography li, .ref-list li',
        citationText: '.citation-text, .reference-text',
        citationDOI: 'a[href*="doi.org"]',
        
        // CrossRef specific
        crossrefCitations: '.item-citations a',
        
        // arXiv specific
        arxivCitations: '.references .bib',
        
        // PubMed specific
        pubmedCitations: '.ref-cit-blk'
      },
      extractText: true,
      extractLinks: true
    })

    // Parse references section
    if (data.references && Array.isArray(data.references)) {
      for (const ref of data.references) {
        const citation = parseCitationText(ref)
        if (citation) {
          citations.push(citation)
        }
      }
    }

    // Parse CrossRef citations
    if (data.crossrefCitations && Array.isArray(data.crossrefCitations)) {
      for (const link of data.crossrefCitations) {
        const doi = extractDOIFromLink(link)
        if (doi) {
          citations.push({
            title: '',
            authors: [],
            doi,
            url: `https://doi.org/${doi}`
          })
        }
      }
    }

  } catch (error) {
    console.error('Failed to extract citations:', error)
  }

  return citations
}

/**
 * Parse citation text into structured format
 */
function parseCitationText(text: string): Citation | null {
  if (!text || text.length < 10) return null

  const citation: Citation = {
    title: '',
    authors: []
  }

  // Extract DOI if present
  const doiMatch = text.match(/10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+/)
  if (doiMatch) {
    citation.doi = doiMatch[0]
    citation.url = `https://doi.org/${doiMatch[0]}`
  }

  // Extract year
  const yearMatch = text.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    citation.year = parseInt(yearMatch[0])
  }

  // Simple heuristic to extract title (text between quotes or after authors)
  const titleMatch = text.match(/"([^"]+)"/) || text.match(/['']([^'']+)['']/)
  if (titleMatch) {
    citation.title = titleMatch[1].trim()
  }

  // Extract authors (simplified - looks for patterns like "Smith, J.")
  const authorPattern = /([A-Z][a-z]+),?\s+([A-Z]\.?\s*)+/g
  const authorMatches = text.matchAll(authorPattern)
  for (const match of authorMatches) {
    citation.authors.push(match[0].trim())
  }

  // Only return if we have meaningful data
  if (citation.title || citation.doi || citation.authors.length > 0) {
    return citation
  }

  return null
}

/**
 * Extract DOI from a link
 */
function extractDOIFromLink(link: string): string | null {
  const doiMatch = link.match(/10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+/)
  return doiMatch ? doiMatch[0] : null
}

/**
 * Verify citations for a paper
 */
export async function verifyCitations(paperId: string): Promise<CitationVerificationResult> {
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
    include: {
      citations: true,
      citedBy: true
    }
  })

  if (!paper) {
    throw new Error('Paper not found')
  }

  const result: CitationVerificationResult = {
    paperId,
    title: paper.title,
    verifiedCitations: [],
    unverifiedCitations: [],
    citedByCount: paper.citedBy.length,
    citationNetworkSize: paper.citations.length + paper.citedBy.length
  }

  // Get paper URL
  const paperUrl = paper.externalUrl || (paper.doi ? `https://doi.org/${paper.doi}` : null)
  
  if (!paperUrl) {
    console.warn('No URL available for citation extraction')
    return result
  }

  // Extract citations from paper
  const extractedCitations = await extractCitations(paperUrl)

  // Verify each citation
  for (const citation of extractedCitations) {
    let verified = false

    // Try to find in database
    if (citation.doi) {
      const existingPaper = await prisma.paper.findFirst({
        where: { doi: citation.doi }
      })

      if (existingPaper) {
        // Add citation relationship if not exists
        const relationExists = await prisma.citation.findFirst({
          where: {
            citingPaperId: paperId,
            citedPaperId: existingPaper.id
          }
        })

        if (!relationExists) {
          await prisma.citation.create({
            data: {
              citingPaperId: paperId,
              citedPaperId: existingPaper.id
            }
          })
        }

        verified = true
      }
    }

    // Try to verify via URL
    if (!verified && citation.url) {
      try {
        const isValid = await zenBrowser.validateLink(citation.url)
        if (isValid) {
          verified = true
        }
      } catch {
        // Ignore validation errors
      }
    }

    if (verified) {
      result.verifiedCitations.push(citation)
    } else {
      result.unverifiedCitations.push(citation)
    }
  }

  return result
}

/**
 * Build citation network for a paper
 */
export async function buildCitationNetwork(
  paperId: string,
  depth: number = 1
): Promise<Map<string, Set<string>>> {
  const network = new Map<string, Set<string>>()
  const visited = new Set<string>()
  const queue: Array<{ id: string; level: number }> = [{ id: paperId, level: 0 }]

  while (queue.length > 0) {
    const { id, level } = queue.shift()!
    
    if (visited.has(id) || level > depth) continue
    visited.add(id)

    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        citations: {
          include: { citedPaper: true }
        },
        citedBy: {
          include: { citingPaper: true }
        }
      }
    })

    if (!paper) continue

    // Add to network
    if (!network.has(id)) {
      network.set(id, new Set())
    }

    // Add citations
    for (const citation of paper.citations) {
      network.get(id)!.add(citation.citedPaperId)
      
      if (level < depth) {
        queue.push({ id: citation.citedPaperId, level: level + 1 })
      }
    }

    // Add cited by (reverse citations)
    for (const citedBy of paper.citedBy) {
      if (!network.has(citedBy.citingPaperId)) {
        network.set(citedBy.citingPaperId, new Set())
      }
      network.get(citedBy.citingPaperId)!.add(id)
      
      if (level < depth) {
        queue.push({ id: citedBy.citingPaperId, level: level + 1 })
      }
    }
  }

  return network
}

/**
 * Find citation paths between two papers
 */
export async function findCitationPaths(
  fromPaperId: string,
  toPaperId: string,
  maxDepth: number = 3
): Promise<string[][]> {
  const paths: string[][] = []
  const visited = new Set<string>()

  async function dfs(currentId: string, path: string[], depth: number) {
    if (depth > maxDepth) return
    if (currentId === toPaperId) {
      paths.push([...path])
      return
    }

    visited.add(currentId)

    const paper = await prisma.paper.findUnique({
      where: { id: currentId },
      include: {
        citations: true
      }
    })

    if (paper) {
      for (const citation of paper.citations) {
        if (!visited.has(citation.citedPaperId)) {
          await dfs(
            citation.citedPaperId,
            [...path, citation.citedPaperId],
            depth + 1
          )
        }
      }
    }

    visited.delete(currentId)
  }

  await dfs(fromPaperId, [fromPaperId], 0)
  return paths
}

/**
 * Calculate citation-based similarity between papers
 */
export async function calculateCitationSimilarity(
  paperId1: string,
  paperId2: string
): Promise<number> {
  const [paper1, paper2] = await Promise.all([
    prisma.paper.findUnique({
      where: { id: paperId1 },
      include: { citations: true, citedBy: true }
    }),
    prisma.paper.findUnique({
      where: { id: paperId2 },
      include: { citations: true, citedBy: true }
    })
  ])

  if (!paper1 || !paper2) {
    throw new Error('One or both papers not found')
  }

  // Get citation sets
  const citations1 = new Set([
    ...paper1.citations.map(c => c.citedPaperId),
    ...paper1.citedBy.map(c => c.citingPaperId)
  ])
  
  const citations2 = new Set([
    ...paper2.citations.map(c => c.citedPaperId),
    ...paper2.citedBy.map(c => c.citingPaperId)
  ])

  // Calculate Jaccard similarity
  const intersection = new Set([...citations1].filter(x => citations2.has(x)))
  const union = new Set([...citations1, ...citations2])

  if (union.size === 0) return 0
  return intersection.size / union.size
}