/**
 * Zen MCP Paper Discovery Script
 * 
 * This script uses the Zen MCP browser automation to discover new papers
 * from research databases and add them to the MESSAi literature database.
 */

import { PrismaClient } from '@prisma/client'
import { zenBrowser, discoverPapers, PaperData } from '../../lib/zen-browser'
import { getDemoConfig } from '../../lib/demo-mode'

const prisma = new PrismaClient()

// Research queries for electrochemical systems
const RESEARCH_QUERIES = [
  // Microbial Fuel Cells
  'microbial fuel cell power density',
  'MFC electrode materials optimization',
  'bioelectrochemical systems performance',
  'microbial electrochemical technologies',
  
  // Specific Materials
  'MXene bioelectrochemical electrode',
  'graphene oxide microbial fuel cell',
  'carbon nanotube MFC anode',
  'titanium carbide electrochemical cell',
  
  // Advanced Topics
  'microbial electrolysis cell hydrogen',
  'microbial desalination cell efficiency',
  'bioelectrochemical metal recovery',
  'microbial electrosynthesis acetate',
  
  // Recent Developments
  'machine learning microbial fuel cell prediction',
  'AI optimization bioelectrochemical systems',
  'deep learning MFC performance',
  'neural network electrode design'
]

// Sources to search
const SOURCES: ('crossref' | 'arxiv' | 'pubmed')[] = ['crossref', 'arxiv', 'pubmed']

interface DiscoveryOptions {
  queries?: string[]
  sources?: ('crossref' | 'arxiv' | 'pubmed')[]
  limit?: number
  dryRun?: boolean
}

async function discoverAndSavePapers(options: DiscoveryOptions = {}) {
  const { 
    queries = RESEARCH_QUERIES, 
    sources = SOURCES, 
    limit = 5,
    dryRun = false 
  } = options

  console.log('🔍 Starting paper discovery...')
  console.log(`Queries: ${queries.length}`)
  console.log(`Sources: ${sources.join(', ')}`)
  console.log(`Limit per query: ${limit}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('')

  const discoveredPapers: PaperData[] = []
  const errors: string[] = []

  // Check demo mode
  const demoConfig = getDemoConfig()
  if (demoConfig.isDemo) {
    console.error('❌ Cannot run paper discovery in demo mode')
    console.log('💡 Set NODE_ENV=production to enable browser automation')
    process.exit(1)
  }

  try {
    // Process each query
    for (const query of queries) {
      console.log(`\n📚 Searching for: "${query}"`)
      
      try {
        const papers = await discoverPapers(query, { sources, limit })
        console.log(`   Found ${papers.length} papers`)
        
        for (const paper of papers) {
          // Skip papers without essential data
          if (!paper.title || !paper.authors || paper.authors.length === 0) {
            console.log(`   ⚠️  Skipping paper without title/authors`)
            continue
          }

          // Check if paper already exists
          const existing = await prisma.paper.findFirst({
            where: {
              OR: [
                { title: paper.title },
                ...(paper.doi ? [{ doi: paper.doi }] : []),
                ...(paper.url ? [{ externalUrl: paper.url }] : [])
              ]
            }
          })

          if (existing) {
            console.log(`   ⏭️  Paper already exists: ${paper.title.substring(0, 60)}...`)
            continue
          }

          discoveredPapers.push(paper)
          console.log(`   ✅ New paper discovered: ${paper.title.substring(0, 60)}...`)

          if (!dryRun) {
            try {
              // Find or create a default user for automated imports
              let systemUser = await prisma.user.findFirst({
                where: { email: 'automation@messai.io' }
              })

              if (!systemUser) {
                // Create the automation user automatically
                systemUser = await prisma.user.create({
                  data: {
                    email: 'automation@messai.io',
                    name: 'MESSAi Automation',
                    emailVerified: new Date()
                  }
                })
                console.log('   📤 Created automation user')
              }

              // Save paper to database
              const savedPaper = await prisma.paper.create({
                data: {
                  title: paper.title,
                  authors: JSON.stringify(paper.authors),
                  abstract: paper.abstract || null,
                  journal: paper.journal || null,
                  publicationDate: paper.publicationDate ? new Date(paper.publicationDate) : null,
                  doi: paper.doi || null,
                  externalUrl: paper.url || null,
                  powerOutput: paper.powerOutput || null,
                  efficiency: paper.efficiency || null,
                  systemType: paper.systemType || 'MFC',
                  source: 'zen_discovery',
                  dataQuality: 'HIGH',
                  isRealPaper: true,
                  userId: systemUser.id
                }
              })

              console.log(`   💾 Saved to database with ID: ${savedPaper.id}`)
            } catch (error) {
              console.error(`   ❌ Failed to save paper:`, error)
              errors.push(`Failed to save "${paper.title}": ${error}`)
            }
          }
        }
      } catch (error) {
        console.error(`   ❌ Search failed:`, error)
        errors.push(`Search failed for "${query}": ${error}`)
      }

      // Rate limiting delay between queries
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Summary
    console.log('\n📊 Discovery Summary:')
    console.log(`   Total papers discovered: ${discoveredPapers.length}`)
    console.log(`   Errors encountered: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n⚠️  Errors:')
      errors.forEach(error => console.log(`   - ${error}`))
    }

    if (dryRun) {
      console.log('\n🔍 DRY RUN - Discovered papers:')
      discoveredPapers.forEach((paper, i) => {
        console.log(`\n${i + 1}. ${paper.title}`)
        console.log(`   Authors: ${paper.authors?.join(', ')}`)
        console.log(`   Source: ${paper.url}`)
        if (paper.doi) console.log(`   DOI: ${paper.doi}`)
        if (paper.powerOutput) console.log(`   Power Output: ${paper.powerOutput} mW/m²`)
        if (paper.efficiency) console.log(`   Efficiency: ${paper.efficiency}%`)
      })
    }

  } catch (error) {
    console.error('❌ Discovery process failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await zenBrowser.close()
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const options: DiscoveryOptions = {}

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--query':
        options.queries = [args[++i]]
        break
      case '--source':
        options.sources = [args[++i] as 'crossref' | 'arxiv' | 'pubmed']
        break
      case '--limit':
        options.limit = parseInt(args[++i])
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
        console.log(`
Zen MCP Paper Discovery Script

Usage: npm run zen:discover [options]

Options:
  --query <query>    Single query to search (default: uses predefined queries)
  --source <source>  Single source to search: crossref, arxiv, or pubmed
  --limit <number>   Maximum papers per query (default: 5)
  --dry-run         Preview results without saving to database
  --help           Show this help message

Examples:
  npm run zen:discover
  npm run zen:discover --dry-run
  npm run zen:discover --query "MXene electrode" --limit 10
  npm run zen:discover --source arxiv --limit 3
        `)
        process.exit(0)
    }
  }

  discoverAndSavePapers(options)
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}