/**
 * Zen MCP Quality Check Script
 * 
 * This script performs comprehensive quality checks on papers in the database
 * by fetching their actual content and verifying metadata accuracy.
 */

import { PrismaClient } from '@prisma/client'
import { zenBrowser } from '../../lib/zen-browser'
import { getDemoConfig } from '../../lib/demo-mode'

const prisma = new PrismaClient()

interface QualityCheckOptions {
  sample?: number
  source?: string
  updateMetadata?: boolean
  checkCitations?: boolean
}

interface QualityReport {
  paperId: string
  title: string
  issues: string[]
  suggestions: string[]
  score: number
  metadata?: {
    original: any
    updated: any
  }
}

async function performQualityChecks(options: QualityCheckOptions = {}) {
  const {
    sample = 20,
    source,
    updateMetadata = false,
    checkCitations = false
  } = options

  console.log('🔍 Starting quality checks...')
  console.log(`Sample size: ${sample}`)
  console.log(`Update metadata: ${updateMetadata}`)
  console.log(`Check citations: ${checkCitations}`)
  if (source) console.log(`Source filter: ${source}`)
  console.log('')

  // Check demo mode
  const demoConfig = getDemoConfig()
  if (demoConfig.isDemo) {
    console.error('❌ Cannot run quality checks in demo mode')
    console.log('💡 Set NODE_ENV=production to enable browser automation')
    process.exit(1)
  }

  const reports: QualityReport[] = []

  try {
    // Get sample of papers with external links
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
      take: sample,
      include: {
        citations: checkCitations,
        citedBy: checkCitations
      }
    })

    console.log(`Selected ${papers.length} papers for quality check\n`)

    for (const paper of papers) {
      console.log(`\n📄 Checking: ${paper.title.substring(0, 80)}...`)
      
      const report: QualityReport = {
        paperId: paper.id,
        title: paper.title,
        issues: [],
        suggestions: [],
        score: 100
      }

      try {
        // Fetch paper content
        const url = paper.externalUrl || (paper.doi ? `https://doi.org/${paper.doi}` : null)
        
        if (url) {
          const extractedData = await zenBrowser.extractPaper(url)
          
          // Check title accuracy
          if (extractedData.title && extractedData.title !== paper.title) {
            const similarity = calculateSimilarity(paper.title, extractedData.title)
            if (similarity < 0.9) {
              report.issues.push(`Title mismatch (${(similarity * 100).toFixed(0)}% similar)`)
              report.suggestions.push(`Update title to: "${extractedData.title}"`)
              report.score -= 10
            }
          }

          // Check authors
          if (extractedData.authors && extractedData.authors.length > 0) {
            try {
              const storedAuthors = JSON.parse(paper.authors)
              if (Array.isArray(storedAuthors)) {
                const authorMatch = compareAuthors(storedAuthors, extractedData.authors)
                if (authorMatch < 0.8) {
                  report.issues.push(`Author list incomplete or incorrect (${(authorMatch * 100).toFixed(0)}% match)`)
                  report.suggestions.push(`Update authors to: ${extractedData.authors.join(', ')}`)
                  report.score -= 15
                }
              }
            } catch {
              report.issues.push('Invalid author format in database')
              report.score -= 20
            }
          }

          // Check abstract
          if (!paper.abstract && extractedData.abstract) {
            report.issues.push('Missing abstract')
            report.suggestions.push('Add abstract from source')
            report.score -= 5
          }

          // Check performance data
          if (extractedData.powerOutput && !paper.powerOutput) {
            report.issues.push('Missing power output data')
            report.suggestions.push(`Add power output: ${extractedData.powerOutput} mW/m²`)
            report.score -= 10
          }

          if (extractedData.efficiency && !paper.efficiency) {
            report.issues.push('Missing efficiency data')
            report.suggestions.push(`Add efficiency: ${extractedData.efficiency}%`)
            report.score -= 10
          }

          // Update metadata if requested
          if (updateMetadata && report.suggestions.length > 0) {
            const updates: any = {}
            
            if (extractedData.title && report.issues.some(i => i.includes('Title mismatch'))) {
              updates.title = extractedData.title
            }
            
            if (extractedData.authors && report.issues.some(i => i.includes('Author list'))) {
              updates.authors = JSON.stringify(extractedData.authors)
            }
            
            if (extractedData.abstract && !paper.abstract) {
              updates.abstract = extractedData.abstract
            }
            
            if (extractedData.powerOutput && !paper.powerOutput) {
              updates.powerOutput = extractedData.powerOutput
            }
            
            if (extractedData.efficiency && !paper.efficiency) {
              updates.efficiency = extractedData.efficiency
            }

            if (Object.keys(updates).length > 0) {
              await prisma.paper.update({
                where: { id: paper.id },
                data: updates
              })
              
              report.metadata = {
                original: paper,
                updated: { ...paper, ...updates }
              }
              
              console.log(`   ✅ Updated ${Object.keys(updates).length} fields`)
            }
          }
        } else {
          report.issues.push('No external URL available')
          report.score -= 30
        }

        // Check data completeness
        if (!paper.journal) {
          report.issues.push('Missing journal information')
          report.score -= 5
        }

        if (!paper.publicationDate) {
          report.issues.push('Missing publication date')
          report.score -= 5
        }

        if (!paper.systemType) {
          report.issues.push('Missing system type classification')
          report.score -= 5
        }

        // Check citations if requested
        if (checkCitations) {
          if (paper.citations.length === 0 && paper.citedBy.length === 0) {
            report.issues.push('No citation network connections')
            report.suggestions.push('Consider adding citation relationships')
            report.score -= 5
          }
        }

        // Ensure score doesn't go below 0
        report.score = Math.max(0, report.score)

        // Display results
        console.log(`   Score: ${report.score}/100`)
        if (report.issues.length > 0) {
          console.log(`   Issues found: ${report.issues.length}`)
          report.issues.forEach(issue => console.log(`   - ${issue}`))
        }
        if (report.suggestions.length > 0) {
          console.log(`   Suggestions:`)
          report.suggestions.forEach(suggestion => console.log(`   → ${suggestion}`))
        }

        reports.push(report)

      } catch (error) {
        console.error(`   ❌ Check failed:`, error)
        report.issues.push(`Quality check failed: ${error}`)
        report.score = 0
        reports.push(report)
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Summary
    console.log('\n📊 Quality Check Summary:')
    const avgScore = reports.reduce((sum, r) => sum + r.score, 0) / reports.length
    console.log(`   Average quality score: ${avgScore.toFixed(1)}/100`)
    
    const scoreRanges = {
      excellent: reports.filter(r => r.score >= 90).length,
      good: reports.filter(r => r.score >= 70 && r.score < 90).length,
      fair: reports.filter(r => r.score >= 50 && r.score < 70).length,
      poor: reports.filter(r => r.score < 50).length
    }
    
    console.log(`   Distribution:`)
    console.log(`   - Excellent (90-100): ${scoreRanges.excellent}`)
    console.log(`   - Good (70-89): ${scoreRanges.good}`)
    console.log(`   - Fair (50-69): ${scoreRanges.fair}`)
    console.log(`   - Poor (<50): ${scoreRanges.poor}`)

    // Common issues
    const allIssues = reports.flatMap(r => r.issues)
    const issueCounts = allIssues.reduce((acc, issue) => {
      const key = issue.split('(')[0].trim() // Group similar issues
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('\n   Most common issues:')
    Object.entries(issueCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([issue, count]) => {
        console.log(`   - ${issue}: ${count} papers`)
      })

    if (updateMetadata) {
      const updatedCount = reports.filter(r => r.metadata).length
      console.log(`\n   Updated metadata for ${updatedCount} papers`)
    }

  } catch (error) {
    console.error('❌ Quality check process failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await zenBrowser.close()
  }
}

// Calculate string similarity (simple Levenshtein-based)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

// Levenshtein distance implementation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Compare author lists
function compareAuthors(authors1: string[], authors2: string[]): number {
  const set1 = new Set(authors1.map(a => a.toLowerCase().trim()))
  const set2 = new Set(authors2.map(a => a.toLowerCase().trim()))
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const options: QualityCheckOptions = {}

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--sample':
        options.sample = parseInt(args[++i])
        break
      case '--source':
        options.source = args[++i]
        break
      case '--update':
        options.updateMetadata = true
        break
      case '--citations':
        options.checkCitations = true
        break
      case '--help':
        console.log(`
Zen MCP Quality Check Script

Usage: npm run zen:quality [options]

Options:
  --sample <n>     Number of papers to check (default: 20)
  --source <name>  Only check papers from specific source
  --update         Update metadata with extracted data
  --citations      Include citation network analysis
  --help           Show this help message

Examples:
  npm run zen:quality
  npm run zen:quality --sample 50 --update
  npm run zen:quality --source crossref_api --citations
  npm run zen:quality --update --citations
        `)
        process.exit(0)
    }
  }

  performQualityChecks(options)
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}