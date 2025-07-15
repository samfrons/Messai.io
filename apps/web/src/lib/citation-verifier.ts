// Citation Verification System
export interface CitationData {
  id: string
  title: string
  authors: string[]
  journal: string
  year: number
  doi?: string
  pmid?: string
  url?: string
  verified: boolean
  verificationDate?: Date
  verificationSource?: string
}

export interface VerificationResult {
  isValid: boolean
  confidence: number // 0-100
  source: 'crossref' | 'pubmed' | 'manual' | 'cache'
  metadata?: Partial<CitationData>
  errors?: string[]
  warnings?: string[]
}

export interface VerificationRequest {
  citation: Partial<CitationData>
  sources?: ('crossref' | 'pubmed' | 'google_scholar')[]
  strictMode?: boolean
}

// Main verification function
export const verifyCitation = async (request: VerificationRequest): Promise<VerificationResult> => {
  const { citation, sources = ['crossref', 'pubmed'], strictMode = false } = request
  
  try {
    // Check cache first
    const cachedResult = await checkVerificationCache(citation)
    if (cachedResult) {
      return {
        ...cachedResult,
        source: 'cache'
      }
    }
    
    // Try each verification source
    for (const source of sources) {
      const result = await verifyWithSource(citation, source, strictMode)
      if (result.isValid) {
        // Cache the successful result
        await cacheVerificationResult(citation, result)
        return result
      }
    }
    
    // If no source verified, return failure
    return {
      isValid: false,
      confidence: 0,
      source: 'manual',
      errors: ['Citation could not be verified with any available source']
    }
    
  } catch (error) {
    return {
      isValid: false,
      confidence: 0,
      source: 'manual',
      errors: [`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

// Verify citation with specific source
const verifyWithSource = async (
  citation: Partial<CitationData>, 
  source: string, 
  strictMode: boolean
): Promise<VerificationResult> => {
  
  switch (source) {
    case 'crossref':
      return await verifyWithCrossRef(citation, strictMode)
    case 'pubmed':
      return await verifyWithPubMed(citation, strictMode)
    case 'google_scholar':
      return await verifyWithGoogleScholar(citation, strictMode)
    default:
      throw new Error(`Unsupported verification source: ${source}`)
  }
}

// CrossRef API verification
const verifyWithCrossRef = async (
  citation: Partial<CitationData>, 
  strictMode: boolean
): Promise<VerificationResult> => {
  
  // If DOI is available, use it directly
  if (citation.doi) {
    try {
      const response = await fetch(`https://api.crossref.org/works/${citation.doi}`)
      if (response.ok) {
        const data = await response.json()
        const work = data.message
        
        return {
          isValid: true,
          confidence: 95,
          source: 'crossref',
          metadata: {
            title: work.title?.[0],
            authors: work.author?.map((a: any) => `${a.given} ${a.family}`) || [],
            journal: work['container-title']?.[0],
            year: work.published?.['date-parts']?.[0]?.[0],
            doi: work.DOI
          }
        }
      }
    } catch (error) {
      // Continue to title-based search
    }
  }
  
  // Search by title if DOI not available or failed
  if (citation.title) {
    try {
      const query = encodeURIComponent(citation.title)
      const response = await fetch(`https://api.crossref.org/works?query.title=${query}&rows=5`)
      
      if (response.ok) {
        const data = await response.json()
        const works = data.message.items
        
        for (const work of works) {
          const similarity = calculateTitleSimilarity(citation.title, work.title?.[0] || '')
          
          if (similarity > (strictMode ? 0.9 : 0.8)) {
            // Check additional criteria if in strict mode
            if (strictMode && citation.authors && citation.authors.length > 0) {
              const authorMatch = checkAuthorMatch(citation.authors, work.author || [])
              if (authorMatch < 0.5) continue
            }
            
            return {
              isValid: true,
              confidence: Math.round(similarity * 100),
              source: 'crossref',
              metadata: {
                title: work.title?.[0],
                authors: work.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
                journal: work['container-title']?.[0],
                year: work.published?.['date-parts']?.[0]?.[0],
                doi: work.DOI
              }
            }
          }
        }
      }
    } catch (error) {
      return {
        isValid: false,
        confidence: 0,
        source: 'crossref',
        errors: [`CrossRef verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }
  
  return {
    isValid: false,
    confidence: 0,
    source: 'crossref',
    errors: ['No matching citation found in CrossRef']
  }
}

// PubMed verification
const verifyWithPubMed = async (
  citation: Partial<CitationData>, 
  strictMode: boolean
): Promise<VerificationResult> => {
  
  // Search by PMID if available
  if (citation.pmid) {
    try {
      const response = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${citation.pmid}&retmode=json`
      )
      
      if (response.ok) {
        const data = await response.json()
        const article = data.result[citation.pmid]
        
        if (article) {
          return {
            isValid: true,
            confidence: 95,
            source: 'pubmed',
            metadata: {
              title: article.title,
              authors: article.authors?.map((a: any) => a.name) || [],
              journal: article.source,
              year: parseInt(article.pubdate.split(' ')[0]),
              pmid: citation.pmid
            }
          }
        }
      }
    } catch (error) {
      // Continue to title-based search
    }
  }
  
  // Search by title
  if (citation.title) {
    try {
      const query = encodeURIComponent(citation.title)
      const searchResponse = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json&retmax=5`
      )
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        const pmids = searchData.esearchresult.idlist
        
        if (pmids && pmids.length > 0) {
          const summaryResponse = await fetch(
            `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`
          )
          
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json()
            
            for (const pmid of pmids) {
              const article = summaryData.result[pmid]
              if (!article) continue
              
              const similarity = calculateTitleSimilarity(citation.title, article.title || '')
              
              if (similarity > (strictMode ? 0.9 : 0.8)) {
                return {
                  isValid: true,
                  confidence: Math.round(similarity * 100),
                  source: 'pubmed',
                  metadata: {
                    title: article.title,
                    authors: article.authors?.map((a: any) => a.name) || [],
                    journal: article.source,
                    year: parseInt(article.pubdate.split(' ')[0]),
                    pmid: pmid
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      return {
        isValid: false,
        confidence: 0,
        source: 'pubmed',
        errors: [`PubMed verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }
  
  return {
    isValid: false,
    confidence: 0,
    source: 'pubmed',
    errors: ['No matching citation found in PubMed']
  }
}

// Google Scholar verification (simplified - would need actual API or scraping)
const verifyWithGoogleScholar = async (
  citation: Partial<CitationData>, 
  strictMode: boolean
): Promise<VerificationResult> => {
  
  // Note: Google Scholar doesn't have a public API, so this is a placeholder
  // In practice, you might use a service like Serpapi or implement web scraping
  
  return {
    isValid: false,
    confidence: 0,
    source: 'manual',
    warnings: ['Google Scholar verification not implemented - requires API key or web scraping']
  }
}

// Utility functions
const calculateTitleSimilarity = (title1: string, title2: string): number => {
  if (!title1 || !title2) return 0
  
  // Normalize titles
  const normalize = (text: string) => text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  const norm1 = normalize(title1)
  const norm2 = normalize(title2)
  
  // Simple Jaccard similarity
  const words1 = new Set(norm1.split(' '))
  const words2 = new Set(norm2.split(' '))
  
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  
  return intersection.size / union.size
}

const checkAuthorMatch = (citationAuthors: string[], apiAuthors: any[]): number => {
  if (!citationAuthors.length || !apiAuthors.length) return 0
  
  const normalizeAuthor = (author: string | any) => {
    if (typeof author === 'string') {
      return author.toLowerCase().replace(/[^\w\s]/g, '').trim()
    }
    return `${author.given || ''} ${author.family || ''}`.toLowerCase().replace(/[^\w\s]/g, '').trim()
  }
  
  const normCitationAuthors = citationAuthors.map(normalizeAuthor)
  const normApiAuthors = apiAuthors.map(normalizeAuthor)
  
  let matches = 0
  for (const citAuthor of normCitationAuthors) {
    for (const apiAuthor of normApiAuthors) {
      if (citAuthor.includes(apiAuthor) || apiAuthor.includes(citAuthor)) {
        matches++
        break
      }
    }
  }
  
  return matches / citationAuthors.length
}

// Cache management
const verificationCache = new Map<string, VerificationResult>()

const getCacheKey = (citation: Partial<CitationData>): string => {
  return `${citation.doi || citation.pmid || citation.title || 'unknown'}_${citation.year || ''}`
}

const checkVerificationCache = async (citation: Partial<CitationData>): Promise<VerificationResult | null> => {
  const key = getCacheKey(citation)
  return verificationCache.get(key) || null
}

const cacheVerificationResult = async (citation: Partial<CitationData>, result: VerificationResult): Promise<void> => {
  const key = getCacheKey(citation)
  verificationCache.set(key, result)
  
  // Optional: Implement persistent cache storage here
}

// Batch verification
export const verifyCitationsBatch = async (
  citations: Partial<CitationData>[],
  options: { maxConcurrent?: number; sources?: string[] } = {}
): Promise<VerificationResult[]> => {
  
  const { maxConcurrent = 5, sources = ['crossref', 'pubmed'] } = options
  const results: VerificationResult[] = []
  
  // Process in batches to avoid rate limiting
  for (let i = 0; i < citations.length; i += maxConcurrent) {
    const batch = citations.slice(i, i + maxConcurrent)
    const batchPromises = batch.map(citation => 
      verifyCitation({ citation, sources })
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Add delay between batches to respect API rate limits
    if (i + maxConcurrent < citations.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

// Manual verification helpers
export const markAsManuallyVerified = (citation: Partial<CitationData>): VerificationResult => {
  return {
    isValid: true,
    confidence: 100,
    source: 'manual',
    metadata: citation as CitationData,
    warnings: ['Citation was manually verified by user']
  }
}

export const validateCitationFormat = (citation: Partial<CitationData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!citation.title || citation.title.trim().length < 5) {
    errors.push('Title is required and must be at least 5 characters long')
  }
  
  if (!citation.authors || citation.authors.length === 0) {
    errors.push('At least one author is required')
  }
  
  if (!citation.year || citation.year < 1900 || citation.year > new Date().getFullYear() + 1) {
    errors.push('Valid publication year is required')
  }
  
  if (!citation.journal || citation.journal.trim().length < 2) {
    errors.push('Journal name is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Alias for plural form
export const verifyCitations = verifyCitationsBatch