#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

interface ScholarPaper {
  title: string
  authors: string[]
  abstract?: string
  year?: number
  journal?: string
  citations?: number
  url?: string
  pdfUrl?: string
}

class GoogleScholarScraper {
  private readonly baseDelay = 2000 // 2 second delay between requests
  private readonly maxRetries = 3
  
  // Target URLs provided by user
  private readonly targetUrls = [
    'https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=algae+fuel+cells+bioelectrochemical+systems&btnG=',
    'https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=waste+to+energy+microbial+fuel+cells+wastewater+treatment&btnG=',
    'https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=algae+carbon+capture+bioelectrochemical+hydrogen+production&btnG='
  ]
  
  private readonly userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
  }

  private async delay(ms: number = this.baseDelay): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms))
  }

  private async makeRequest(url: string, retryCount: number = 0): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000
      })
      
      return response.data
    } catch (error) {
      console.error(`Request failed for ${url}:`, error.message)
      
      if (retryCount < this.maxRetries) {
        console.log(`Retrying in ${this.baseDelay * (retryCount + 1)}ms...`)
        await this.delay(this.baseDelay * (retryCount + 1))
        return this.makeRequest(url, retryCount + 1)
      }
      
      return null
    }
  }

  private parseScholarResults(html: string): ScholarPaper[] {
    const $ = cheerio.load(html)
    const papers: ScholarPaper[] = []

    $('.gs_r.gs_or.gs_scl').each((index, element) => {
      try {
        const $element = $(element)
        
        // Extract title
        const titleElement = $element.find('.gs_rt a')
        const title = titleElement.text().trim()
        if (!title) return

        // Extract authors and publication info
        const authorsElement = $element.find('.gs_a')
        const authorsText = authorsElement.text().trim()
        
        // Parse authors, year, and journal from the citation line
        let authors: string[] = []
        let year: number | undefined
        let journal: string | undefined
        
        if (authorsText) {
          const parts = authorsText.split(' - ')
          if (parts.length > 0) {
            authors = parts[0].split(',').map(a => a.trim()).filter(a => a.length > 0)
          }
          
          // Extract year (look for 4-digit number)
          const yearMatch = authorsText.match(/\b(19|20)\d{2}\b/)
          if (yearMatch) {
            year = parseInt(yearMatch[0])
          }
          
          // Extract journal (usually after the year)
          if (parts.length > 1) {
            journal = parts[parts.length - 1].trim()
          }
        }

        // Extract abstract/snippet
        const abstractElement = $element.find('.gs_rs')
        const abstract = abstractElement.text().trim()

        // Extract URL
        const url = titleElement.attr('href')

        // Extract PDF URL if available
        const pdfElement = $element.find('.gs_or_ggsm a')
        const pdfUrl = pdfElement.attr('href')

        // Extract citation count
        let citations: number | undefined
        const citationElement = $element.find('.gs_fl a').filter((i, el) => {
          return $(el).text().includes('Cited by')
        })
        if (citationElement.length > 0) {
          const citationText = citationElement.text()
          const citationMatch = citationText.match(/Cited by (\d+)/)
          if (citationMatch) {
            citations = parseInt(citationMatch[1])
          }
        }

        papers.push({
          title,
          authors,
          abstract: abstract || undefined,
          year,
          journal,
          citations,
          url: url || undefined,
          pdfUrl: pdfUrl || undefined
        })

      } catch (error) {
        console.error('Error parsing paper element:', error)
      }
    })

    return papers
  }

  private async checkDuplicate(title: string): Promise<boolean> {
    const existing = await prisma.researchPaper.findFirst({
      where: {
        title: title
      }
    })
    
    return !!existing
  }

  private async savePaper(paper: ScholarPaper, searchTopic: string): Promise<boolean> {
    try {
      // Check for duplicates
      if (await this.checkDuplicate(paper.title)) {
        console.log(`  📋 Duplicate: ${paper.title.substring(0, 50)}...`)
        return false
      }

      // Save to database
      await prisma.researchPaper.create({
        data: {
          title: paper.title,
          authors: JSON.stringify(paper.authors),
          abstract: paper.abstract,
          year: paper.year,
          journal: paper.journal || 'Google Scholar',
          url: paper.url,
          pdfUrl: paper.pdfUrl,
          externalUrl: paper.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`,
          source: 'google_scholar',
          keywords: JSON.stringify([searchTopic, 'google_scholar_scraped']),
          citationCount: paper.citations,
          addedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log(`  ✅ Added: ${paper.title.substring(0, 50)}...`)
      return true
    } catch (error) {
      console.error(`  ❌ Error saving paper: ${error.message}`)
      return false
    }
  }

  async scrapeTargetUrls(): Promise<void> {
    console.log('🔍 Starting Google Scholar scraping for target topics...')
    
    const searchTopics = [
      'algae_fuel_cells',
      'waste_to_energy_mfc',
      'algae_carbon_capture'
    ]

    let totalAdded = 0
    let totalProcessed = 0

    for (let i = 0; i < this.targetUrls.length; i++) {
      const url = this.targetUrls[i]
      const topic = searchTopics[i]
      
      console.log(`\n📖 Scraping topic: ${topic}`)
      console.log(`URL: ${url}`)
      
      try {
        // Make request to Google Scholar
        const html = await this.makeRequest(url)
        
        if (!html) {
          console.log(`❌ Failed to fetch results for ${topic}`)
          continue
        }

        // Parse results
        const papers = this.parseScholarResults(html)
        console.log(`📄 Found ${papers.length} papers for ${topic}`)

        // Save papers
        let addedCount = 0
        for (const paper of papers) {
          totalProcessed++
          
          if (await this.savePaper(paper, topic)) {
            addedCount++
            totalAdded++
          }
          
          // Rate limiting between saves
          await this.delay(1000)
        }

        console.log(`✅ Added ${addedCount}/${papers.length} new papers for ${topic}`)
        
        // Longer delay between topics to avoid rate limiting
        if (i < this.targetUrls.length - 1) {
          console.log('⏸️ Waiting 10s before next topic...')
          await this.delay(10000)
        }

      } catch (error) {
        console.error(`❌ Error processing ${topic}:`, error.message)
      }
    }

    console.log(`\n📊 Scraping Summary:`)
    console.log(`  Total papers processed: ${totalProcessed}`)
    console.log(`  New papers added: ${totalAdded}`)
    console.log(`  Duplicate rate: ${totalProcessed > 0 ? (((totalProcessed - totalAdded)/totalProcessed)*100).toFixed(1) : 0}%`)
  }

  async scrapeWithPagination(baseUrl: string, maxPages: number = 3): Promise<ScholarPaper[]> {
    const allPapers: ScholarPaper[] = []
    
    for (let page = 0; page < maxPages; page++) {
      const startIndex = page * 10
      const url = `${baseUrl}&start=${startIndex}`
      
      console.log(`  📄 Scraping page ${page + 1}/${maxPages}...`)
      
      const html = await this.makeRequest(url)
      if (!html) {
        console.log(`    ❌ Failed to fetch page ${page + 1}`)
        break
      }
      
      const papers = this.parseScholarResults(html)
      if (papers.length === 0) {
        console.log(`    📭 No more results on page ${page + 1}`)
        break
      }
      
      allPapers.push(...papers)
      console.log(`    ✅ Found ${papers.length} papers on page ${page + 1}`)
      
      // Delay between pages
      await this.delay(this.baseDelay + Math.random() * 2000)
    }
    
    return allPapers
  }
}

async function main() {
  const scraper = new GoogleScholarScraper()
  
  try {
    await scraper.scrapeTargetUrls()
    
    // Generate updated report
    console.log('\n📊 Generating updated database report...')
    
    const totalPapers = await prisma.researchPaper.count()
    const scholarPapers = await prisma.researchPaper.count({
      where: { source: 'google_scholar' }
    })
    
    console.log(`\n📚 Database Status After Scraping:`)
    console.log(`  Total papers: ${totalPapers}`)
    console.log(`  Google Scholar papers: ${scholarPapers}`)
    
  } catch (error) {
    console.error('Error during scraping:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()