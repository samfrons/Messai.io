/**
 * Zen MCP Browser Integration for MESSAi
 * 
 * This module provides a secure wrapper around the Zen MCP server
 * for browser automation, web scraping, and research discovery.
 */

import { getDemoConfig } from './demo-mode'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30
const REQUEST_TIMEOUT = 30000 // 30 seconds

// Track requests for rate limiting
const requestTracker = new Map<string, { count: number; resetTime: number }>()

export interface ZenBrowserConfig {
  endpoint?: string
  apiKey?: string
  maxRetries?: number
  retryDelay?: number
  timeout?: number
  demo?: boolean
}

export interface PageOptions {
  waitForSelector?: string
  timeout?: number
  screenshot?: boolean
  fullPage?: boolean
}

export interface ScrapeOptions extends PageOptions {
  selectors?: Record<string, string>
  extractText?: boolean
  extractLinks?: boolean
  extractImages?: boolean
}

export interface PaperData {
  title?: string
  authors?: string[]
  abstract?: string
  doi?: string
  journal?: string
  publicationDate?: string
  keywords?: string[]
  powerOutput?: number
  efficiency?: number
  systemType?: string
  url?: string
}

export class ZenBrowserError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ZenBrowserError'
  }
}

export class ZenBrowser {
  private config: Required<ZenBrowserConfig>
  
  constructor(config: ZenBrowserConfig = {}) {
    const demoConfig = getDemoConfig()
    
    this.config = {
      endpoint: config.endpoint || process.env.ZEN_MCP_ENDPOINT || 'http://localhost:3001',
      apiKey: config.apiKey || process.env.ZEN_MCP_API_KEY || '',
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      timeout: config.timeout || REQUEST_TIMEOUT,
      demo: config.demo ?? demoConfig.isDemo
    }
  }

  /**
   * Check if rate limit is exceeded
   */
  private checkRateLimit(identifier: string): void {
    const now = Date.now()
    const tracker = requestTracker.get(identifier)
    
    if (tracker) {
      if (now < tracker.resetTime) {
        if (tracker.count >= RATE_LIMIT_MAX_REQUESTS) {
          throw new ZenBrowserError(
            'Rate limit exceeded',
            'RATE_LIMIT_EXCEEDED',
            { resetTime: tracker.resetTime }
          )
        }
        tracker.count++
      } else {
        // Reset window
        requestTracker.set(identifier, {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW
        })
      }
    } else {
      requestTracker.set(identifier, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      })
    }
  }

  /**
   * Make a request to Zen MCP server with retries
   */
  private async request<T>(
    action: string,
    params: any,
    identifier: string = 'global'
  ): Promise<T> {
    // Check demo mode
    if (this.config.demo) {
      throw new ZenBrowserError(
        'Browser automation not available in demo mode',
        'DEMO_MODE',
        { action }
      )
    }

    // Check rate limit
    this.checkRateLimit(identifier)

    let lastError: Error | null = null
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)
        
        const response = await fetch(`${this.config.endpoint}/api/${action}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify(params),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }))
          throw new ZenBrowserError(
            error.message || `Request failed: ${response.status}`,
            'REQUEST_FAILED',
            { status: response.status, error }
          )
        }
        
        return await response.json()
      } catch (error) {
        lastError = error as Error
        
        if (error instanceof ZenBrowserError && error.code === 'RATE_LIMIT_EXCEEDED') {
          throw error // Don't retry rate limit errors
        }
        
        if (attempt < this.config.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (attempt + 1)))
        }
      }
    }
    
    throw lastError || new ZenBrowserError(
      'Request failed after retries',
      'MAX_RETRIES_EXCEEDED',
      { action, attempts: this.config.maxRetries }
    )
  }

  /**
   * Navigate to a URL and wait for page load
   */
  async navigate(url: string, options: PageOptions = {}): Promise<void> {
    await this.request('navigate', { url, ...options })
  }

  /**
   * Scrape data from a webpage
   */
  async scrape(url: string, options: ScrapeOptions = {}): Promise<any> {
    return await this.request('scrape', { url, ...options })
  }

  /**
   * Extract paper data from research websites
   */
  async extractPaper(url: string): Promise<PaperData> {
    const selectors = {
      // CrossRef/DOI selectors
      title: 'h1.title, .article-title, .citation__title',
      authors: '.authors, .contributor, .citation__authors',
      abstract: '.abstract, .article-abstract, .citation__abstract',
      doi: '.doi, .citation__doi, a[href*="doi.org"]',
      journal: '.journal-title, .citation__journal',
      date: '.published-date, .citation__date, time',
      
      // arXiv selectors
      arxivTitle: '.title.mathjax',
      arxivAuthors: '.authors',
      arxivAbstract: '.abstract.mathjax',
      arxivId: '.arxivid',
      
      // PubMed selectors
      pubmedTitle: '.article-title',
      pubmedAuthors: '.authors-list',
      pubmedAbstract: '.abstract-content',
      pubmedId: '.pmid',
      
      // Performance data selectors (common patterns)
      powerOutput: '[data-power], .power-output, .power-density',
      efficiency: '[data-efficiency], .efficiency, .coulombic-efficiency',
      systemType: '[data-system], .system-type, .fuel-cell-type'
    }
    
    const data = await this.scrape(url, {
      selectors,
      extractText: true,
      waitForSelector: 'body'
    })
    
    return this.parsePaperData(data, url)
  }

  /**
   * Parse scraped data into structured paper format
   */
  private parsePaperData(data: any, url: string): PaperData {
    const paper: PaperData = { url }
    
    // Extract title
    paper.title = data.title || data.arxivTitle || data.pubmedTitle || ''
    
    // Extract authors
    const authorsText = data.authors || data.arxivAuthors || data.pubmedAuthors || ''
    paper.authors = this.parseAuthors(authorsText)
    
    // Extract abstract
    paper.abstract = data.abstract || data.arxivAbstract || data.pubmedAbstract || ''
    
    // Extract identifiers
    if (data.doi) {
      paper.doi = this.extractDOI(data.doi)
    }
    
    // Extract journal and date
    paper.journal = data.journal || ''
    paper.publicationDate = data.date || ''
    
    // Extract performance metrics
    if (data.powerOutput) {
      paper.powerOutput = this.parseNumber(data.powerOutput)
    }
    
    if (data.efficiency) {
      paper.efficiency = this.parseNumber(data.efficiency)
    }
    
    paper.systemType = data.systemType || ''
    
    return paper
  }

  /**
   * Parse authors string into array
   */
  private parseAuthors(authorsText: string): string[] {
    if (!authorsText) return []
    
    // Common author separators
    const separators = [';', ',', ' and ', ' AND ', '&']
    let authors = [authorsText]
    
    for (const sep of separators) {
      if (authorsText.includes(sep)) {
        authors = authorsText.split(sep)
        break
      }
    }
    
    return authors
      .map(a => a.trim())
      .filter(a => a.length > 0)
  }

  /**
   * Extract DOI from various formats
   */
  private extractDOI(doiText: string): string {
    const doiRegex = /10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+/
    const match = doiText.match(doiRegex)
    return match ? match[0] : doiText
  }

  /**
   * Parse numeric values from text
   */
  private parseNumber(text: string): number | undefined {
    const numRegex = /[\d.]+/
    const match = text.match(numRegex)
    return match ? parseFloat(match[0]) : undefined
  }

  /**
   * Validate a URL is accessible
   */
  async validateLink(url: string): Promise<boolean> {
    try {
      const result = await this.request<{ status: number }>('check-link', { url })
      return result.status >= 200 && result.status < 400
    } catch {
      return false
    }
  }

  /**
   * Take a screenshot of a webpage
   */
  async screenshot(url: string, options: PageOptions = {}): Promise<Buffer> {
    const result = await this.request<{ screenshot: string }>('screenshot', {
      url,
      fullPage: options.fullPage ?? true,
      ...options
    })
    
    return Buffer.from(result.screenshot, 'base64')
  }

  /**
   * Search for papers on research databases
   */
  async searchPapers(query: string, source: 'crossref' | 'arxiv' | 'pubmed' = 'crossref'): Promise<string[]> {
    const searchUrls: Record<string, string> = {
      crossref: `https://search.crossref.org/?q=${encodeURIComponent(query)}`,
      arxiv: `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all`,
      pubmed: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`
    }
    
    const url = searchUrls[source]
    const selectors = {
      crossref: 'a.item-title',
      arxiv: '.list-title a',
      pubmed: '.docsum-title'
    }
    
    const data = await this.scrape(url, {
      selectors: { results: selectors[source] },
      extractLinks: true,
      waitForSelector: selectors[source]
    })
    
    return data.results || []
  }

  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    // Clear rate limit tracking
    requestTracker.clear()
    
    try {
      await this.request('close', {})
    } catch {
      // Ignore errors on close
    }
  }
}

// Export singleton instance
export const zenBrowser = new ZenBrowser()

// Export utility functions
export async function discoverPapers(
  query: string,
  options: {
    sources?: ('crossref' | 'arxiv' | 'pubmed')[]
    limit?: number
  } = {}
): Promise<PaperData[]> {
  const sources = options.sources || ['crossref', 'arxiv', 'pubmed']
  const limit = options.limit || 10
  const papers: PaperData[] = []
  
  for (const source of sources) {
    try {
      const urls = await zenBrowser.searchPapers(query, source)
      
      for (const url of urls.slice(0, limit)) {
        try {
          const paper = await zenBrowser.extractPaper(url)
          if (paper.title) {
            papers.push(paper)
          }
        } catch (error) {
          console.error(`Failed to extract paper from ${url}:`, error)
        }
      }
    } catch (error) {
      console.error(`Failed to search ${source}:`, error)
    }
  }
  
  return papers
}

export async function validatePaperLinks(papers: Array<{ url?: string; doi?: string }>): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>()
  
  for (const paper of papers) {
    const url = paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : null)
    
    if (url) {
      try {
        const isValid = await zenBrowser.validateLink(url)
        results.set(url, isValid)
      } catch {
        results.set(url, false)
      }
    }
  }
  
  return results
}