import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface IntegrityReport {
  timestamp: string
  totalPapers: number
  realPapers: number
  aiPapers: number
  papersWithDOI: number
  papersWithPubMedId: number
  papersWithArxivId: number
  papersWithExternalUrl: number
  papersWithPerformanceData: number
  papersWithMaterials: number
  duplicateDOIs: number
  duplicateTitles: number
  orphanedExperiments: number
  brokenExternalLinks: Array<{ id: string, title: string, url: string, error: string }>
  issues: Array<{ type: string, description: string, count: number, examples?: string[] }>
  recommendations: string[]
}

class DatabaseIntegrityChecker {
  private report: IntegrityReport

  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      totalPapers: 0,
      realPapers: 0,
      aiPapers: 0,
      papersWithDOI: 0,
      papersWithPubMedId: 0,
      papersWithArxivId: 0,
      papersWithExternalUrl: 0,
      papersWithPerformanceData: 0,
      papersWithMaterials: 0,
      duplicateDOIs: 0,
      duplicateTitles: 0,
      orphanedExperiments: 0,
      brokenExternalLinks: [],
      issues: [],
      recommendations: []
    }
  }

  async checkBasicCounts() {
    console.log('📊 Checking basic paper statistics...')
    
    const [
      totalPapers,
      papersWithDOI,
      papersWithPubMedId,
      papersWithArxivId,
      papersWithExternalUrl,
      papersWithPerformanceData,
      papersWithMaterials
    ] = await Promise.all([
      prisma.researchPaper.count(),
      prisma.researchPaper.count({ where: { doi: { not: null } } }),
      prisma.researchPaper.count({ where: { pubmedId: { not: null } } }),
      prisma.researchPaper.count({ where: { arxivId: { not: null } } }),
      prisma.researchPaper.count({ where: { NOT: { externalUrl: '' } } }),
      prisma.researchPaper.count({ 
        where: { 
          OR: [
            { powerOutput: { not: null } },
            { efficiency: { not: null } }
          ]
        } 
      }),
      prisma.researchPaper.count({ 
        where: { 
          OR: [
            { anodeMaterials: { not: null } },
            { cathodeMaterials: { not: null } },
            { organismTypes: { not: null } }
          ]
        } 
      })
    ])

    // Count real vs AI papers
    const realSources = ['crossref_api', 'arxiv_api', 'pubmed_api', 'local_pdf', 'web_search', 
                        'comprehensive_search', 'advanced_electrode_biofacade_search', 
                        'extensive_electrode_biofacade_collection']
    
    const realPapers = await prisma.researchPaper.count({
      where: {
        OR: [
          { source: { in: realSources } },
          { doi: { not: null } },
          { arxivId: { not: null } },
          { pubmedId: { not: null } }
        ]
      }
    })

    Object.assign(this.report, {
      totalPapers,
      realPapers,
      aiPapers: totalPapers - realPapers,
      papersWithDOI,
      papersWithPubMedId,
      papersWithArxivId,
      papersWithExternalUrl,
      papersWithPerformanceData,
      papersWithMaterials
    })

    console.log(`  ✓ Total papers: ${totalPapers}`)
    console.log(`  ✓ Real papers: ${realPapers} (${((realPapers/totalPapers)*100).toFixed(1)}%)`)
    console.log(`  ✓ AI papers: ${totalPapers - realPapers} (${(((totalPapers - realPapers)/totalPapers)*100).toFixed(1)}%)`)
  }

  async checkDuplicates() {
    console.log('🔍 Checking for duplicates...')
    
    // Check duplicate DOIs
    const duplicateDOIs = await prisma.researchPaper.groupBy({
      by: ['doi'],
      where: { doi: { not: null } },
      having: { doi: { _count: { gt: 1 } } },
      _count: { doi: true }
    })

    // Check duplicate titles (case-insensitive)
    const duplicateTitles = await prisma.$queryRaw<Array<{ title: string, count: number }>>`
      SELECT title, COUNT(*) as count
      FROM "ResearchPaper"
      GROUP BY LOWER(title)
      HAVING COUNT(*) > 1
    `

    this.report.duplicateDOIs = duplicateDOIs.length
    this.report.duplicateTitles = duplicateTitles.length

    if (duplicateDOIs.length > 0) {
      this.report.issues.push({
        type: 'duplicate_dois',
        description: 'Papers with duplicate DOIs found',
        count: duplicateDOIs.length,
        examples: duplicateDOIs.slice(0, 5).map(d => d.doi!).filter(Boolean)
      })
    }

    if (duplicateTitles.length > 0) {
      this.report.issues.push({
        type: 'duplicate_titles',
        description: 'Papers with duplicate titles found',
        count: duplicateTitles.length,
        examples: duplicateTitles.slice(0, 5).map(d => d.title)
      })
    }

    console.log(`  ✓ Duplicate DOIs: ${duplicateDOIs.length}`)
    console.log(`  ✓ Duplicate titles: ${duplicateTitles.length}`)
  }

  async checkDataQuality() {
    console.log('🔬 Checking data quality...')
    
    // Check papers without essential fields
    const papersWithoutAuthors = await prisma.researchPaper.count({
      where: { 
        OR: [
          { authors: null },
          { authors: '' },
          { authors: '[]' }
        ]
      }
    })

    const papersWithoutAbstract = await prisma.researchPaper.count({
      where: { 
        OR: [
          { abstract: null },
          { abstract: '' }
        ]
      }
    })

    const papersWithoutExternalUrl = await prisma.researchPaper.count({
      where: { 
        OR: [
          { externalUrl: null },
          { externalUrl: '' }
        ]
      }
    })

    if (papersWithoutAuthors > 0) {
      this.report.issues.push({
        type: 'missing_authors',
        description: 'Papers without author information',
        count: papersWithoutAuthors
      })
    }

    if (papersWithoutAbstract > (this.report.totalPapers * 0.1)) { // More than 10% missing abstracts
      this.report.issues.push({
        type: 'missing_abstracts',
        description: 'High number of papers without abstracts',
        count: papersWithoutAbstract
      })
    }

    if (papersWithoutExternalUrl > 0) {
      this.report.issues.push({
        type: 'missing_external_urls',
        description: 'Papers without external URLs',
        count: papersWithoutExternalUrl
      })
    }

    console.log(`  ✓ Papers without authors: ${papersWithoutAuthors}`)
    console.log(`  ✓ Papers without abstracts: ${papersWithoutAbstract}`)
    console.log(`  ✓ Papers without external URLs: ${papersWithoutExternalUrl}`)
  }

  async checkRelationalIntegrity() {
    console.log('🔗 Checking relational integrity...')
    
    // Check for orphaned experiment-paper relationships
    const orphanedExperiments = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count
      FROM "ExperimentPaper" ep
      LEFT JOIN "ResearchPaper" rp ON ep."paperId" = rp.id
      WHERE rp.id IS NULL
    `

    this.report.orphanedExperiments = Number(orphanedExperiments[0]?.count || 0)

    if (this.report.orphanedExperiments > 0) {
      this.report.issues.push({
        type: 'orphaned_experiments',
        description: 'Experiment-paper relationships pointing to non-existent papers',
        count: this.report.orphanedExperiments
      })
    }

    console.log(`  ✓ Orphaned experiment relationships: ${this.report.orphanedExperiments}`)
  }

  async checkExternalLinks() {
    console.log('🌐 Checking external link validity...')
    
    // Get a sample of papers with external URLs for testing
    const samplePapers = await prisma.researchPaper.findMany({
      where: { externalUrl: { not: null } },
      select: { id: true, title: true, externalUrl: true, doi: true },
      take: 20 // Test first 20 to avoid rate limiting
    })

    const brokenLinks: Array<{ id: string, title: string, url: string, error: string }> = []

    for (const paper of samplePapers) {
      if (!paper.externalUrl) continue

      try {
        // For DOI links, just validate format
        if (paper.externalUrl.includes('doi.org') && paper.doi) {
          const expectedUrl = `https://doi.org/${paper.doi}`
          if (paper.externalUrl !== expectedUrl) {
            brokenLinks.push({
              id: paper.id,
              title: paper.title,
              url: paper.externalUrl,
              error: `DOI URL mismatch. Expected: ${expectedUrl}`
            })
          }
        }
        
        // Basic URL validation
        try {
          new URL(paper.externalUrl)
        } catch {
          brokenLinks.push({
            id: paper.id,
            title: paper.title,
            url: paper.externalUrl,
            error: 'Invalid URL format'
          })
        }
      } catch (error) {
        brokenLinks.push({
          id: paper.id,
          title: paper.title,
          url: paper.externalUrl,
          error: `Validation error: ${error}`
        })
      }
    }

    this.report.brokenExternalLinks = brokenLinks

    if (brokenLinks.length > 0) {
      this.report.issues.push({
        type: 'broken_external_links',
        description: 'Papers with invalid or broken external URLs',
        count: brokenLinks.length,
        examples: brokenLinks.slice(0, 3).map(link => `${link.title}: ${link.error}`)
      })
    }

    console.log(`  ✓ Checked ${samplePapers.length} external links, found ${brokenLinks.length} issues`)
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...')
    
    const recommendations: string[] = []

    // Data quality recommendations
    const realPaperPercentage = (this.report.realPapers / this.report.totalPapers) * 100
    
    if (realPaperPercentage < 30) {
      recommendations.push('⚠️ Consider increasing the proportion of real research papers vs AI-generated content')
    }

    if (this.report.papersWithDOI / this.report.realPapers < 0.8) {
      recommendations.push('📝 Add DOI information to more real research papers for better verification')
    }

    if (this.report.papersWithPerformanceData / this.report.totalPapers < 0.5) {
      recommendations.push('📊 Extract more performance metrics (power output, efficiency) from papers')
    }

    if (this.report.duplicateDOIs > 0) {
      recommendations.push('🔍 Remove or merge papers with duplicate DOIs')
    }

    if (this.report.duplicateTitles > 0) {
      recommendations.push('📄 Review and consolidate papers with duplicate titles')
    }

    if (this.report.orphanedExperiments > 0) {
      recommendations.push('🧹 Clean up orphaned experiment-paper relationships')
    }

    if (this.report.brokenExternalLinks.length > 0) {
      recommendations.push('🔗 Fix or update broken external URLs')
    }

    // Performance recommendations
    if (this.report.totalPapers > 5000) {
      recommendations.push('⚡ Consider implementing database indexing optimization for large datasets')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Database integrity looks good! No major issues detected.')
    }

    this.report.recommendations = recommendations
  }

  async generateReport(): Promise<IntegrityReport> {
    console.log('🔍 Starting database integrity check...\n')

    await this.checkBasicCounts()
    await this.checkDuplicates()
    await this.checkDataQuality()
    await this.checkRelationalIntegrity()
    await this.checkExternalLinks()
    this.generateRecommendations()

    console.log('\n📋 Database Integrity Check Complete!')
    console.log(`   Total Issues Found: ${this.report.issues.length}`)
    console.log(`   Recommendations: ${this.report.recommendations.length}`)

    return this.report
  }

  async saveReport(report: IntegrityReport) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `database-integrity-${timestamp}.json`
    const filepath = path.join(process.cwd(), 'reports', filename)

    // Ensure reports directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true })

    await fs.writeFile(filepath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Report saved to: ${filepath}`)

    // Also create a human-readable summary
    const summaryPath = path.join(process.cwd(), 'reports', `integrity-summary-${timestamp}.md`)
    const summary = this.generateMarkdownSummary(report)
    await fs.writeFile(summaryPath, summary)
    console.log(`📝 Summary saved to: ${summaryPath}`)
  }

  private generateMarkdownSummary(report: IntegrityReport): string {
    return `# Database Integrity Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}

## Overview

- **Total Papers:** ${report.totalPapers.toLocaleString()}
- **Real Papers:** ${report.realPapers.toLocaleString()} (${((report.realPapers/report.totalPapers)*100).toFixed(1)}%)
- **AI-Generated Papers:** ${report.aiPapers.toLocaleString()} (${((report.aiPapers/report.totalPapers)*100).toFixed(1)}%)

## Data Quality Metrics

| Metric | Count | Percentage |
|--------|-------|------------|
| Papers with DOI | ${report.papersWithDOI.toLocaleString()} | ${((report.papersWithDOI/report.totalPapers)*100).toFixed(1)}% |
| Papers with PubMed ID | ${report.papersWithPubMedId.toLocaleString()} | ${((report.papersWithPubMedId/report.totalPapers)*100).toFixed(1)}% |
| Papers with arXiv ID | ${report.papersWithArxivId.toLocaleString()} | ${((report.papersWithArxivId/report.totalPapers)*100).toFixed(1)}% |
| Papers with External URLs | ${report.papersWithExternalUrl.toLocaleString()} | ${((report.papersWithExternalUrl/report.totalPapers)*100).toFixed(1)}% |
| Papers with Performance Data | ${report.papersWithPerformanceData.toLocaleString()} | ${((report.papersWithPerformanceData/report.totalPapers)*100).toFixed(1)}% |
| Papers with Materials Data | ${report.papersWithMaterials.toLocaleString()} | ${((report.papersWithMaterials/report.totalPapers)*100).toFixed(1)}% |

## Issues Found

${report.issues.length === 0 ? '✅ No issues detected!' : report.issues.map(issue => 
  `### ${issue.type.replace(/_/g, ' ').toUpperCase()}\n- **Description:** ${issue.description}\n- **Count:** ${issue.count}\n${issue.examples ? `- **Examples:** ${issue.examples.join(', ')}\n` : ''}`
).join('\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## External Link Issues

${report.brokenExternalLinks.length === 0 ? '✅ No broken external links detected in sample.' : 
  report.brokenExternalLinks.map(link => `- **${link.title}**: ${link.error}\n  - URL: ${link.url}`).join('\n')}

---
*Report generated by MESSAi Database Integrity Checker*
`
  }
}

async function main() {
  try {
    const checker = new DatabaseIntegrityChecker()
    const report = await checker.generateReport()
    await checker.saveReport(report)
    
    // Exit with non-zero code if critical issues found
    const criticalIssues = report.issues.filter(issue => 
      ['duplicate_dois', 'orphaned_experiments', 'broken_external_links'].includes(issue.type)
    )
    
    if (criticalIssues.length > 0) {
      console.log(`\n⚠️ Found ${criticalIssues.length} critical issues that need attention`)
      process.exit(1)
    }
    
    console.log('\n✅ Database integrity check passed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database integrity check failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { DatabaseIntegrityChecker, type IntegrityReport }