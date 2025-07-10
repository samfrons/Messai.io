import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

interface LinkValidationResult {
  id: string
  title: string
  url: string
  status: 'valid' | 'invalid' | 'broken' | 'timeout' | 'redirect'
  httpStatus?: number
  redirectUrl?: string
  error?: string
  responseTime?: number
  lastChecked: string
}

interface ValidationReport {
  timestamp: string
  totalChecked: number
  validLinks: number
  brokenLinks: number
  timeouts: number
  redirects: number
  results: LinkValidationResult[]
  summary: {
    averageResponseTime: number
    slowestLinks: Array<{ url: string, responseTime: number }>
    mostCommonErrors: Array<{ error: string, count: number }>
  }
}

class ExternalLinkValidator {
  private readonly timeout = 10000 // 10 seconds
  private readonly delay = 1000 // 1 second between requests
  private readonly maxRetries = 2

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async validateUrl(url: string): Promise<Omit<LinkValidationResult, 'id' | 'title'>> {
    const startTime = Date.now()
    
    try {
      // Basic URL validation
      let validUrl: URL
      try {
        validUrl = new URL(url)
      } catch {
        return {
          url,
          status: 'invalid',
          error: 'Invalid URL format',
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString()
        }
      }

      // Special handling for different URL types
      if (validUrl.hostname === 'doi.org') {
        return this.validateDoiUrl(url, startTime)
      }

      if (validUrl.hostname.includes('pubmed.ncbi.nlm.nih.gov')) {
        return this.validatePubMedUrl(url, startTime)
      }

      if (validUrl.hostname.includes('arxiv.org')) {
        return this.validateArxivUrl(url, startTime)
      }

      // General HTTP validation
      return this.validateHttpUrl(url, startTime)

    } catch (error) {
      return {
        url,
        status: 'broken',
        error: `Validation error: ${error}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      }
    }
  }

  private async validateDoiUrl(url: string, startTime: number): Promise<Omit<LinkValidationResult, 'id' | 'title'>> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: this.timeout,
        redirect: 'manual' // Don't follow redirects automatically
      })

      const responseTime = Date.now() - startTime

      // DOI URLs typically redirect to publisher sites
      if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.get('location')
        return {
          url,
          status: 'redirect',
          httpStatus: response.status,
          redirectUrl: redirectUrl || undefined,
          responseTime,
          lastChecked: new Date().toISOString()
        }
      }

      if (response.status >= 200 && response.status < 300) {
        return {
          url,
          status: 'valid',
          httpStatus: response.status,
          responseTime,
          lastChecked: new Date().toISOString()
        }
      }

      return {
        url,
        status: 'broken',
        httpStatus: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        lastChecked: new Date().toISOString()
      }

    } catch (error: any) {
      return {
        url,
        status: error.code === 'TIMEOUT' ? 'timeout' : 'broken',
        error: error.message,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      }
    }
  }

  private async validatePubMedUrl(url: string, startTime: number): Promise<Omit<LinkValidationResult, 'id' | 'title'>> {
    try {
      // PubMed URLs should follow pattern: https://pubmed.ncbi.nlm.nih.gov/PMID/
      const pmidMatch = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/)
      if (!pmidMatch) {
        return {
          url,
          status: 'invalid',
          error: 'Invalid PubMed URL format',
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString()
        }
      }

      const response = await fetch(url, {
        method: 'HEAD',
        timeout: this.timeout
      })

      const responseTime = Date.now() - startTime

      if (response.status >= 200 && response.status < 300) {
        return {
          url,
          status: 'valid',
          httpStatus: response.status,
          responseTime,
          lastChecked: new Date().toISOString()
        }
      }

      return {
        url,
        status: 'broken',
        httpStatus: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        lastChecked: new Date().toISOString()
      }

    } catch (error: any) {
      return {
        url,
        status: error.code === 'TIMEOUT' ? 'timeout' : 'broken',
        error: error.message,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      }
    }
  }

  private async validateArxivUrl(url: string, startTime: number): Promise<Omit<LinkValidationResult, 'id' | 'title'>> {
    try {
      // arXiv URLs should follow pattern: https://arxiv.org/abs/ID
      const arxivMatch = url.match(/arxiv\.org\/abs\/(.+)/)
      if (!arxivMatch) {
        return {
          url,
          status: 'invalid',
          error: 'Invalid arXiv URL format',
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString()
        }
      }

      const response = await fetch(url, {
        method: 'HEAD',
        timeout: this.timeout
      })

      const responseTime = Date.now() - startTime

      if (response.status >= 200 && response.status < 300) {
        return {
          url,
          status: 'valid',
          httpStatus: response.status,
          responseTime,
          lastChecked: new Date().toISOString()
        }
      }

      return {
        url,
        status: 'broken',
        httpStatus: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        lastChecked: new Date().toISOString()
      }

    } catch (error: any) {
      return {
        url,
        status: error.code === 'TIMEOUT' ? 'timeout' : 'broken',
        error: error.message,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      }
    }
  }

  private async validateHttpUrl(url: string, startTime: number): Promise<Omit<LinkValidationResult, 'id' | 'title'>> {
    let retries = 0
    
    while (retries <= this.maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          timeout: this.timeout,
          headers: {
            'User-Agent': 'MESSAi Link Validator (mailto:admin@messai.io)'
          }
        })

        const responseTime = Date.now() - startTime

        if (response.status >= 200 && response.status < 300) {
          return {
            url,
            status: 'valid',
            httpStatus: response.status,
            responseTime,
            lastChecked: new Date().toISOString()
          }
        }

        if (response.status >= 300 && response.status < 400) {
          const redirectUrl = response.headers.get('location')
          return {
            url,
            status: 'redirect',
            httpStatus: response.status,
            redirectUrl: redirectUrl || undefined,
            responseTime,
            lastChecked: new Date().toISOString()
          }
        }

        return {
          url,
          status: 'broken',
          httpStatus: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
          lastChecked: new Date().toISOString()
        }

      } catch (error: any) {
        retries++
        
        if (retries > this.maxRetries) {
          return {
            url,
            status: error.code === 'TIMEOUT' ? 'timeout' : 'broken',
            error: error.message,
            responseTime: Date.now() - startTime,
            lastChecked: new Date().toISOString()
          }
        }

        // Wait before retry
        await this.sleep(this.delay)
      }
    }

    // Should never reach here, but TypeScript needs this
    return {
      url,
      status: 'broken',
      error: 'Maximum retries exceeded',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString()
    }
  }

  async validateAllLinks(limit?: number): Promise<ValidationReport> {
    console.log('🔗 Starting external link validation...')
    
    // Get papers with external URLs
    const papers = await prisma.researchPaper.findMany({
      where: { 
        externalUrl: { not: null },
        externalUrl: { not: '' }
      },
      select: { 
        id: true, 
        title: true, 
        externalUrl: true 
      },
      take: limit,
      orderBy: { createdAt: 'desc' } // Check newest first
    })

    console.log(`Found ${papers.length} papers with external URLs to validate`)

    const results: LinkValidationResult[] = []
    let progress = 0

    for (const paper of papers) {
      if (!paper.externalUrl) continue

      progress++
      console.log(`Validating ${progress}/${papers.length}: ${paper.title.substring(0, 50)}...`)

      const validation = await this.validateUrl(paper.externalUrl)
      
      results.push({
        id: paper.id,
        title: paper.title,
        ...validation
      })

      // Rate limiting
      await this.sleep(this.delay)
    }

    // Generate summary statistics
    const validLinks = results.filter(r => r.status === 'valid').length
    const brokenLinks = results.filter(r => r.status === 'broken').length
    const timeouts = results.filter(r => r.status === 'timeout').length
    const redirects = results.filter(r => r.status === 'redirect').length

    const responseTimes = results
      .filter(r => r.responseTime !== undefined)
      .map(r => r.responseTime!)

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0

    const slowestLinks = results
      .filter(r => r.responseTime !== undefined)
      .sort((a, b) => (b.responseTime || 0) - (a.responseTime || 0))
      .slice(0, 5)
      .map(r => ({ url: r.url, responseTime: r.responseTime! }))

    const errorCounts = new Map<string, number>()
    results.forEach(r => {
      if (r.error) {
        const count = errorCounts.get(r.error) || 0
        errorCounts.set(r.error, count + 1)
      }
    })

    const mostCommonErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }))

    const report: ValidationReport = {
      timestamp: new Date().toISOString(),
      totalChecked: results.length,
      validLinks,
      brokenLinks,
      timeouts,
      redirects,
      results,
      summary: {
        averageResponseTime,
        slowestLinks,
        mostCommonErrors
      }
    }

    console.log('\n📊 Link Validation Summary:')
    console.log(`  Total checked: ${results.length}`)
    console.log(`  Valid: ${validLinks} (${((validLinks/results.length)*100).toFixed(1)}%)`)
    console.log(`  Broken: ${brokenLinks} (${((brokenLinks/results.length)*100).toFixed(1)}%)`)
    console.log(`  Timeouts: ${timeouts} (${((timeouts/results.length)*100).toFixed(1)}%)`)
    console.log(`  Redirects: ${redirects} (${((redirects/results.length)*100).toFixed(1)}%)`)
    console.log(`  Average response time: ${averageResponseTime.toFixed(0)}ms`)

    return report
  }

  async updateDatabase(results: LinkValidationResult[]) {
    console.log('💾 Updating database with validation results...')
    
    for (const result of results) {
      try {
        // For now, we'll store validation results in a custom field
        // In a production system, you might want a separate table for link validation history
        await prisma.researchPaper.update({
          where: { id: result.id },
          data: {
            // Store validation result in keywords field as JSON for now
            // This is a temporary solution - ideally create a separate validation table
            keywords: JSON.stringify({
              ...(await this.getExistingKeywords(result.id)),
              _linkValidation: {
                status: result.status,
                lastChecked: result.lastChecked,
                httpStatus: result.httpStatus,
                responseTime: result.responseTime
              }
            })
          }
        })
      } catch (error) {
        console.warn(`Failed to update validation result for paper ${result.id}:`, error)
      }
    }
  }

  private async getExistingKeywords(paperId: string): Promise<any> {
    try {
      const paper = await prisma.researchPaper.findUnique({
        where: { id: paperId },
        select: { keywords: true }
      })
      
      if (paper?.keywords) {
        return JSON.parse(paper.keywords)
      }
    } catch {
      // Ignore parsing errors
    }
    
    return []
  }
}

async function main() {
  const args = process.argv.slice(2)
  const limit = args[0] ? parseInt(args[0]) : 50 // Default to checking 50 links

  try {
    const validator = new ExternalLinkValidator()
    const report = await validator.validateAllLinks(limit)
    
    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const reportsDir = path.join(process.cwd(), 'reports')
    await fs.mkdir(reportsDir, { recursive: true })
    
    const reportPath = path.join(reportsDir, `link-validation-${timestamp}.json`)
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`\n📄 Report saved to: ${reportPath}`)
    
    // Update database with results
    await validator.updateDatabase(report.results)
    
    // Exit with error code if too many broken links
    const brokenPercentage = (report.brokenLinks / report.totalChecked) * 100
    if (brokenPercentage > 20) { // More than 20% broken
      console.log(`\n⚠️ High percentage of broken links: ${brokenPercentage.toFixed(1)}%`)
      process.exit(1)
    }
    
    console.log('\n✅ Link validation completed successfully!')
    
  } catch (error) {
    console.error('❌ Link validation failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { ExternalLinkValidator, type LinkValidationResult, type ValidationReport }