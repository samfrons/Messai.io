import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface CleanupReport {
  timestamp: string
  beforeCleanup: {
    totalPapers: number
    realPapers: number
    fakePapers: number
    sources: Array<{ source: string, count: number }>
  }
  afterCleanup: {
    totalPapers: number
    realPapers: number
    removedPapers: number
  }
  removedSources: string[]
  preservedSources: string[]
  recommendations: string[]
}

class PaperCleanupService {
  private readonly realSources = [
    'crossref_api',
    'arxiv_api', 
    'pubmed_api',
    'local_pdf',
    'web_search',
    'comprehensive_search',
    'advanced_electrode_biofacade_search',
    'extensive_electrode_biofacade_collection'
  ]

  private readonly fakeSources = [
    'ai_smart_literature',
    'ai_generated',
    'synthetic_data',
    'automated_content',
    'ai_enhanced_generation',
    'smart_ai_literature_engine'
  ]

  async analyzeDatabase(): Promise<CleanupReport['beforeCleanup']> {
    console.log('🔍 Analyzing current database state...')
    
    const totalPapers = await prisma.researchPaper.count()
    
    // Count real papers (by source or having verification identifiers)
    const realPapers = await prisma.researchPaper.count({
      where: {
        OR: [
          { source: { in: this.realSources } },
          { doi: { not: null } },
          { arxivId: { not: null } },
          { pubmedId: { not: null } },
          { ieeeId: { not: null } }
        ]
      }
    })

    const fakePapers = totalPapers - realPapers

    // Get source distribution
    const sourceDistribution = await prisma.researchPaper.groupBy({
      by: ['source'],
      _count: { source: true },
      orderBy: { _count: { source: 'desc' } }
    })

    const sources = sourceDistribution.map(s => ({
      source: s.source,
      count: s._count.source
    }))

    console.log(`📊 Current state:`)
    console.log(`  Total papers: ${totalPapers}`)
    console.log(`  Real papers: ${realPapers} (${((realPapers/totalPapers)*100).toFixed(1)}%)`)
    console.log(`  Fake papers: ${fakePapers} (${((fakePapers/totalPapers)*100).toFixed(1)}%)`)
    console.log(`\n📈 Source distribution:`)
    sources.forEach(s => console.log(`  ${s.source}: ${s.count}`))

    return { totalPapers, realPapers, fakePapers, sources }
  }

  async identifyFakePapers(): Promise<string[]> {
    console.log('\n🎯 Identifying fake papers to remove...')

    // Get papers that are clearly fake
    const fakePapers = await prisma.researchPaper.findMany({
      where: {
        AND: [
          // Must be from fake sources
          { source: { in: this.fakeSources } },
          // AND have no verification identifiers
          { doi: null },
          { arxivId: null },
          { pubmedId: null },
          { ieeeId: null }
        ]
      },
      select: { id: true, title: true, source: true }
    })

    // Also check for suspicious patterns in titles/authors
    const suspiciousPapers = await prisma.researchPaper.findMany({
      where: {
        OR: [
          { authors: { contains: 'AI Research Assistant' } },
          { authors: { contains: 'Automated Content Generator' } },
          { authors: { contains: 'AI Assistant' } },
          { title: { contains: 'AI-Generated' } },
          { title: { contains: 'Synthetic Data' } },
          { abstract: { contains: 'AI-generated research' } },
          { abstract: { contains: 'computer-generated analysis' } }
        ]
      },
      select: { id: true, title: true, source: true, authors: true }
    })

    const allFakeIds = new Set([
      ...fakePapers.map(p => p.id),
      ...suspiciousPapers.map(p => p.id)
    ])

    console.log(`🗑️ Found ${allFakeIds.size} fake papers to remove:`)
    console.log(`  From fake sources: ${fakePapers.length}`)
    console.log(`  Suspicious patterns: ${suspiciousPapers.length}`)

    return Array.from(allFakeIds)
  }

  async removeFakePapers(paperIds: string[]): Promise<number> {
    console.log(`\n🧹 Removing ${paperIds.length} fake papers...`)

    // Remove in batches to avoid overwhelming the database
    const batchSize = 100
    let removed = 0

    for (let i = 0; i < paperIds.length; i += batchSize) {
      const batch = paperIds.slice(i, i + batchSize)
      
      try {
        // First, remove any experiment-paper relationships
        await prisma.experimentPaper.deleteMany({
          where: { paperId: { in: batch } }
        })

        // Then remove the papers
        const result = await prisma.researchPaper.deleteMany({
          where: { id: { in: batch } }
        })

        removed += result.count
        console.log(`  Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(paperIds.length/batchSize)}: removed ${result.count} papers`)
      } catch (error) {
        console.error(`❌ Error removing batch:`, error)
      }
    }

    return removed
  }

  async auditRemainingPapers(): Promise<void> {
    console.log('\n🔍 Auditing remaining papers for quality...')

    // Check papers without meaningful external URLs
    const noExternalUrl = await prisma.researchPaper.count({
      where: { 
        externalUrl: ''
      }
    })

    // Check papers without abstracts
    const noAbstract = await prisma.researchPaper.count({
      where: { 
        OR: [
          { abstract: null },
          { abstract: '' }
        ]
      }
    })

    // Check papers without authors
    const noAuthors = await prisma.researchPaper.count({
      where: { 
        OR: [
          { authors: '' },
          { authors: '[]' }
        ]
      }
    })

    // Check papers without verification
    const noVerification = await prisma.researchPaper.count({
      where: {
        AND: [
          { doi: null },
          { arxivId: null },
          { pubmedId: null },
          { ieeeId: null }
        ]
      }
    })

    console.log(`📋 Quality audit results:`)
    console.log(`  Papers without external URLs: ${noExternalUrl}`)
    console.log(`  Papers without abstracts: ${noAbstract}`)
    console.log(`  Papers without authors: ${noAuthors}`)
    console.log(`  Papers without verification IDs: ${noVerification}`)
  }

  generateRecommendations(beforeState: CleanupReport['beforeCleanup'], afterState: CleanupReport['afterCleanup']): string[] {
    const recommendations: string[] = []

    const realPaperPercentage = (afterState.realPapers / afterState.totalPapers) * 100

    if (realPaperPercentage < 50) {
      recommendations.push('🎯 Continue adding more real research papers to reach >50% coverage')
    }

    if (afterState.totalPapers < 500) {
      recommendations.push('📈 Expand paper collection by searching specific journals and conferences')
    }

    recommendations.push('🔍 Implement periodic audits to prevent fake papers from entering the system')
    recommendations.push('✅ Add validation rules to require DOI/PubMed/arXiv IDs for new papers')
    recommendations.push('🤖 Create automated quality scoring for incoming papers')

    return recommendations
  }

  async performCleanup(): Promise<CleanupReport> {
    const beforeState = await this.analyzeDatabase()
    
    const fakeIds = await this.identifyFakePapers()
    const removedCount = await this.removeFakePapers(fakeIds)
    
    await this.auditRemainingPapers()
    
    const afterState = {
      totalPapers: await prisma.researchPaper.count(),
      realPapers: await prisma.researchPaper.count({
        where: {
          OR: [
            { source: { in: this.realSources } },
            { doi: { not: null } },
            { arxivId: { not: null } },
            { pubmedId: { not: null } },
            { ieeeId: { not: null } }
          ]
        }
      }),
      removedPapers: removedCount
    }

    const report: CleanupReport = {
      timestamp: new Date().toISOString(),
      beforeCleanup: beforeState,
      afterCleanup: afterState,
      removedSources: this.fakeSources,
      preservedSources: this.realSources,
      recommendations: this.generateRecommendations(beforeState, afterState)
    }

    console.log(`\n✅ Cleanup completed!`)
    console.log(`  Removed: ${removedCount} fake papers`)
    console.log(`  Remaining: ${afterState.totalPapers} papers (${((afterState.realPapers/afterState.totalPapers)*100).toFixed(1)}% real)`)

    return report
  }

  async saveReport(report: CleanupReport) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `paper-cleanup-${timestamp}.json`
    const filepath = path.join(process.cwd(), 'reports', filename)

    await fs.mkdir(path.dirname(filepath), { recursive: true })
    await fs.writeFile(filepath, JSON.stringify(report, null, 2))
    
    console.log(`\n📄 Cleanup report saved to: ${filepath}`)

    // Create summary for easy reading
    const summaryPath = path.join(process.cwd(), 'reports', `cleanup-summary-${timestamp}.md`)
    const summary = this.generateMarkdownSummary(report)
    await fs.writeFile(summaryPath, summary)
    console.log(`📝 Summary saved to: ${summaryPath}`)
  }

  private generateMarkdownSummary(report: CleanupReport): string {
    return `# Paper Cleanup Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}

## Summary

Successfully cleaned up fake and AI-generated papers from the literature database.

### Before Cleanup
- **Total Papers:** ${report.beforeCleanup.totalPapers.toLocaleString()}
- **Real Papers:** ${report.beforeCleanup.realPapers.toLocaleString()} (${((report.beforeCleanup.realPapers/report.beforeCleanup.totalPapers)*100).toFixed(1)}%)
- **Fake Papers:** ${report.beforeCleanup.fakePapers.toLocaleString()} (${((report.beforeCleanup.fakePapers/report.beforeCleanup.totalPapers)*100).toFixed(1)}%)

### After Cleanup
- **Total Papers:** ${report.afterCleanup.totalPapers.toLocaleString()}
- **Real Papers:** ${report.afterCleanup.realPapers.toLocaleString()} (${((report.afterCleanup.realPapers/report.afterCleanup.totalPapers)*100).toFixed(1)}%)
- **Removed Papers:** ${report.afterCleanup.removedPapers.toLocaleString()}

## Sources Removed
${report.removedSources.map(source => `- ${source}`).join('\n')}

## Sources Preserved
${report.preservedSources.map(source => `- ${source}`).join('\n')}

## Source Distribution (Before)
${report.beforeCleanup.sources.map(s => `- **${s.source}**: ${s.count.toLocaleString()} papers`).join('\n')}

## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Generated by MESSAi Paper Cleanup Service*
`
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  try {
    const cleanupService = new PaperCleanupService()

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No papers will be removed')
      const beforeState = await cleanupService.analyzeDatabase()
      const fakeIds = await cleanupService.identifyFakePapers()
      
      console.log(`\n📋 Would remove ${fakeIds.length} fake papers`)
      console.log('Run without --dry-run to actually perform cleanup')
      return
    }

    // Confirm with user
    console.log('⚠️  This will permanently remove AI-generated and fake papers from the database.')
    console.log('Make sure you have a backup before proceeding.')
    
    // In a production script, you might want to add a confirmation prompt
    // For now, we'll proceed automatically

    const report = await cleanupService.performCleanup()
    await cleanupService.saveReport(report)

    console.log('\n🎉 Database cleanup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Review the cleanup report')
    console.log('2. Run database integrity check: npm run db:integrity')
    console.log('3. Validate remaining external links: npm run db:validate-links')
    console.log('4. Enhance data extraction for remaining papers')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { PaperCleanupService }