#!/usr/bin/env npx tsx

import prisma from '../../lib/db'
import { calculateRelevanceScore } from './microbial-relevance-validator'
import { writeFileSync } from 'fs'
import { join } from 'path'

interface CleanupOptions {
  dryRun?: boolean
  threshold?: number
  reviewThreshold?: number
  outputReport?: boolean
}

async function removeNonMicrobialPapers(options: CleanupOptions = {}) {
  const {
    dryRun = true,
    threshold = 10,
    reviewThreshold = 30,
    outputReport = true
  } = options

  console.log('=== Database Cleanup: Non-Microbial Papers ===')
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'} (set dryRun=false to actually remove papers)`)
  console.log(`Remove threshold: ${threshold}/100`)
  console.log(`Review threshold: ${reviewThreshold}/100`)
  console.log('')

  // Fetch all papers
  const papers = await prisma.researchPaper.findMany({
    select: {
      id: true,
      title: true,
      abstract: true,
      keywords: true,
      organismTypes: true,
      systemType: true,
      source: true,
      doi: true,
      createdAt: true
    }
  })

  console.log(`Total papers in database: ${papers.length}`)
  console.log('Analyzing papers...\n')

  const toRemove: any[] = []
  const toReview: any[] = []
  const toKeep: any[] = []
  const stats = {
    microbial: 0,
    algae: 0,
    bioelectrochemical: 0,
    nonBiological: 0,
    bySource: {} as Record<string, number>
  }

  // Process each paper
  for (const paper of papers) {
    const score = calculateRelevanceScore(
      paper.title,
      paper.abstract,
      paper.keywords,
      paper.organismTypes,
      paper.systemType
    )

    const paperInfo = {
      id: paper.id,
      title: paper.title,
      source: paper.source,
      doi: paper.doi,
      score: score.overall,
      categories: score.categories,
      matchedKeywords: score.matchedKeywords,
      excludedKeywords: score.excludedKeywords
    }

    if (score.overall < threshold) {
      toRemove.push(paperInfo)
    } else if (score.overall < reviewThreshold) {
      toReview.push(paperInfo)
    } else {
      toKeep.push(paperInfo)
    }

    // Update stats
    if (score.categories.isMicrobial) stats.microbial++
    if (score.categories.isAlgae) stats.algae++
    if (score.categories.isBioelectrochemical) stats.bioelectrochemical++
    if (score.categories.isPurelyNonBiological) stats.nonBiological++
    
    // Track by source
    if (paper.source) {
      stats.bySource[paper.source] = (stats.bySource[paper.source] || 0) + 1
    }
  }

  // Sort lists by score
  toRemove.sort((a, b) => a.score - b.score)
  toReview.sort((a, b) => a.score - b.score)

  // Display results
  console.log('=== Analysis Results ===')
  console.log(`Papers to keep: ${toKeep.length} (${(toKeep.length/papers.length*100).toFixed(1)}%)`)
  console.log(`Papers to remove: ${toRemove.length} (${(toRemove.length/papers.length*100).toFixed(1)}%)`)
  console.log(`Papers to review: ${toReview.length} (${(toReview.length/papers.length*100).toFixed(1)}%)`)
  console.log('')
  
  console.log('=== Category Breakdown ===')
  console.log(`Microbial papers: ${stats.microbial}`)
  console.log(`Algae papers: ${stats.algae}`)
  console.log(`Bioelectrochemical papers: ${stats.bioelectrochemical}`)
  console.log(`Non-biological papers: ${stats.nonBiological}`)
  console.log('')

  console.log('=== Papers by Source ===')
  Object.entries(stats.bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`${source}: ${count}`)
    })
  console.log('')

  // Show sample papers to remove
  console.log('=== Sample Papers to Remove (lowest scores) ===')
  toRemove.slice(0, 5).forEach(paper => {
    console.log(`Score: ${paper.score}/100 - ${paper.title}`)
    console.log(`  Source: ${paper.source}`)
    console.log(`  Excluded keywords: ${paper.excludedKeywords.join(', ') || 'none'}`)
    console.log('')
  })

  // Show sample papers to review
  console.log('=== Sample Papers to Review ===')
  toReview.slice(0, 5).forEach(paper => {
    console.log(`Score: ${paper.score}/100 - ${paper.title}`)
    console.log(`  Matched keywords: ${paper.matchedKeywords.join(', ')}`)
    console.log('')
  })

  // Generate report
  if (outputReport) {
    const report = {
      timestamp: new Date().toISOString(),
      mode: dryRun ? 'dry_run' : 'live',
      summary: {
        total: papers.length,
        keep: toKeep.length,
        remove: toRemove.length,
        review: toReview.length
      },
      categories: stats,
      thresholds: { remove: threshold, review: reviewThreshold },
      toRemove: toRemove,
      toReview: toReview
    }

    const reportPath = join(process.cwd(), 'reports', `cleanup-report-${Date.now()}.json`)
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\nReport saved to: ${reportPath}`)
  }

  // Actually remove papers if not dry run
  if (!dryRun && toRemove.length > 0) {
    console.log('\n=== Removing Papers ===')
    const confirm = process.argv.includes('--confirm')
    
    if (!confirm) {
      console.log('SAFETY CHECK: Add --confirm flag to actually delete papers')
      return
    }

    console.log(`Removing ${toRemove.length} papers...`)
    
    try {
      const result = await prisma.researchPaper.deleteMany({
        where: {
          id: {
            in: toRemove.map(p => p.id)
          }
        }
      })
      
      console.log(`Successfully removed ${result.count} papers`)
    } catch (error) {
      console.error('Error removing papers:', error)
    }
  }

  await prisma.$disconnect()
}

// Parse command line arguments
const args = process.argv.slice(2)
const options: CleanupOptions = {
  dryRun: !args.includes('--live'),
  threshold: parseInt(args.find(a => a.startsWith('--threshold='))?.split('=')[1] || '10'),
  reviewThreshold: parseInt(args.find(a => a.startsWith('--review='))?.split('=')[1] || '30'),
  outputReport: !args.includes('--no-report')
}

// Run cleanup
removeNonMicrobialPapers(options)
  .catch(console.error)