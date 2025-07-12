/**
 * Zen MCP Link Validation Script
 * 
 * This script validates external links in the literature database
 * using Zen MCP browser automation for accurate link checking.
 */

import { PrismaClient } from '@prisma/client'
import { zenBrowser, validatePaperLinks } from '../../lib/zen-browser'
import { getDemoConfig } from '../../lib/demo-mode'

const prisma = new PrismaClient()

interface ValidationOptions {
  batchSize?: number
  maxPapers?: number
  fix?: boolean
  source?: string
}

async function validateDatabaseLinks(options: ValidationOptions = {}) {
  const {
    batchSize = 10,
    maxPapers = 100,
    fix = false,
    source
  } = options

  console.log('🔗 Starting link validation...')
  console.log(`Batch size: ${batchSize}`)
  console.log(`Max papers: ${maxPapers}`)
  console.log(`Auto-fix broken links: ${fix}`)
  if (source) console.log(`Source filter: ${source}`)
  console.log('')

  // Check demo mode
  const demoConfig = getDemoConfig()
  if (demoConfig.isDemo) {
    console.error('❌ Cannot run link validation in demo mode')
    console.log('💡 Set NODE_ENV=production to enable browser automation')
    process.exit(1)
  }

  try {
    // Get papers with external links
    const whereClause: any = {
      OR: [
        { externalUrl: { not: null } },
        { doi: { not: null } }
      ]
    }

    if (source) {
      whereClause.source = source
    }

    const papers = await prisma.paper.findMany({
      where: whereClause,
      take: maxPapers,
      select: {
        id: true,
        title: true,
        externalUrl: true,
        doi: true,
        source: true,
        arxivId: true,
        pubmedId: true
      }
    })

    console.log(`Found ${papers.length} papers to validate\n`)

    const results = {
      total: papers.length,
      valid: 0,
      invalid: 0,
      fixed: 0,
      errors: 0
    }

    // Process in batches
    for (let i = 0; i < papers.length; i += batchSize) {
      const batch = papers.slice(i, i + batchSize)
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(papers.length / batchSize)}`)

      try {
        // Validate batch
        const validationResults = await validatePaperLinks(batch)

        // Process results
        for (const paper of batch) {
          const url = paper.externalUrl || (paper.doi ? `https://doi.org/${paper.doi}` : null)
          
          if (!url) continue

          const isValid = validationResults.get(url) || false
          
          if (isValid) {
            results.valid++
            console.log(`   ✅ Valid: ${paper.title.substring(0, 60)}...`)
          } else {
            results.invalid++
            console.log(`   ❌ Invalid: ${paper.title.substring(0, 60)}...`)
            console.log(`      URL: ${url}`)

            // Try to fix broken links
            if (fix) {
              let fixedUrl: string | null = null

              // Try alternative URLs
              if (paper.doi && !paper.externalUrl?.includes('doi.org')) {
                // Try DOI URL
                const doiUrl = `https://doi.org/${paper.doi}`
                if (await zenBrowser.validateLink(doiUrl)) {
                  fixedUrl = doiUrl
                }
              } else if (paper.arxivId) {
                // Try arXiv URL
                const arxivUrl = `https://arxiv.org/abs/${paper.arxivId}`
                if (await zenBrowser.validateLink(arxivUrl)) {
                  fixedUrl = arxivUrl
                }
              } else if (paper.pubmedId) {
                // Try PubMed URL
                const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}/`
                if (await zenBrowser.validateLink(pubmedUrl)) {
                  fixedUrl = pubmedUrl
                }
              }

              if (fixedUrl) {
                await prisma.paper.update({
                  where: { id: paper.id },
                  data: { externalUrl: fixedUrl }
                })
                results.fixed++
                console.log(`      🔧 Fixed with: ${fixedUrl}`)
              }
            }
          }
        }
      } catch (error) {
        console.error(`   ❌ Batch failed:`, error)
        results.errors += batch.length
      }

      // Rate limiting delay between batches
      if (i + batchSize < papers.length) {
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    // Summary
    console.log('\n📊 Validation Summary:')
    console.log(`   Total papers checked: ${results.total}`)
    console.log(`   Valid links: ${results.valid} (${((results.valid / results.total) * 100).toFixed(1)}%)`)
    console.log(`   Invalid links: ${results.invalid} (${((results.invalid / results.total) * 100).toFixed(1)}%)`)
    if (fix) {
      console.log(`   Fixed links: ${results.fixed}`)
    }
    if (results.errors > 0) {
      console.log(`   Errors: ${results.errors}`)
    }

    // Data quality report
    if (results.invalid > 0) {
      console.log('\n📈 Data Quality Report:')
      const brokenBySource = await prisma.paper.groupBy({
        by: ['source'],
        where: {
          id: {
            in: papers
              .filter(p => {
                const url = p.externalUrl || (p.doi ? `https://doi.org/${p.doi}` : null)
                return url && !validationResults.get(url)
              })
              .map(p => p.id)
          }
        },
        _count: true
      })

      console.log('   Broken links by source:')
      brokenBySource.forEach(group => {
        console.log(`   - ${group.source || 'unknown'}: ${group._count}`)
      })
    }

  } catch (error) {
    console.error('❌ Validation process failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await zenBrowser.close()
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ValidationOptions = {}

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--batch-size':
        options.batchSize = parseInt(args[++i])
        break
      case '--max':
        options.maxPapers = parseInt(args[++i])
        break
      case '--fix':
        options.fix = true
        break
      case '--source':
        options.source = args[++i]
        break
      case '--help':
        console.log(`
Zen MCP Link Validation Script

Usage: npm run zen:validate [options]

Options:
  --batch-size <n>  Number of links to validate per batch (default: 10)
  --max <n>         Maximum number of papers to check (default: 100)
  --fix             Automatically fix broken links when possible
  --source <name>   Only validate papers from specific source
  --help            Show this help message

Examples:
  npm run zen:validate
  npm run zen:validate --fix
  npm run zen:validate --max 50 --batch-size 5
  npm run zen:validate --source crossref_api --fix
        `)
        process.exit(0)
    }
  }

  validateDatabaseLinks(options)
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}