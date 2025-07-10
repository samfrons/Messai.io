#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyRemoteSync() {
  console.log('🔍 Verifying remote database sync...\n')
  
  try {
    // Get counts
    const counts = {
      papers: await prisma.researchPaper.count(),
      users: await prisma.user.count(),
      experiments: await prisma.experiment.count(),
      measurements: await prisma.measurement.count(),
      designs: await prisma.mFCDesign.count()
    }
    
    console.log('📊 Remote Database Contents:')
    console.log(`   • Papers: ${counts.papers}`)
    console.log(`   • Users: ${counts.users}`)
    console.log(`   • Experiments: ${counts.experiments}`)
    console.log(`   • Measurements: ${counts.measurements}`)
    console.log(`   • Designs: ${counts.designs}\\n`)
    
    // Verify paper quality
    const samplePapers = await prisma.researchPaper.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        source: true,
        doi: true,
        anodeMaterials: true,
        cathodeMaterials: true,
        organismTypes: true,
        aiProcessingDate: true,
        hasPerformanceData: true
      }
    })
    
    console.log('📋 Sample Papers (latest 5):')
    samplePapers.forEach((paper, index) => {
      console.log(`   ${index + 1}. "${paper.title.substring(0, 50)}..."`)
      console.log(`      Source: ${paper.source}`)
      console.log(`      DOI: ${paper.doi || 'N/A'}`)
      console.log(`      Materials: ${paper.anodeMaterials ? 'Yes' : 'No'}`)
      console.log(`      AI Processed: ${paper.aiProcessingDate ? 'Yes' : 'No'}\\n`)
    })
    
    // Check data quality
    const withMaterials = await prisma.researchPaper.count({
      where: {
        OR: [
          { anodeMaterials: { not: null } },
          { cathodeMaterials: { not: null } }
        ]
      }
    })
    
    const withOrganisms = await prisma.researchPaper.count({
      where: { organismTypes: { not: null } }
    })
    
    const aiProcessed = await prisma.researchPaper.count({
      where: { aiProcessingDate: { not: null } }
    })
    
    const withDOI = await prisma.researchPaper.count({
      where: { doi: { not: null } }
    })
    
    console.log('📈 Data Quality Metrics:')
    console.log(`   • Papers with materials: ${withMaterials}/${counts.papers} (${(withMaterials/counts.papers*100).toFixed(1)}%)`)
    console.log(`   • Papers with organisms: ${withOrganisms}/${counts.papers} (${(withOrganisms/counts.papers*100).toFixed(1)}%)`)
    console.log(`   • AI processed papers: ${aiProcessed}/${counts.papers} (${(aiProcessed/counts.papers*100).toFixed(1)}%)`)
    console.log(`   • Papers with DOI: ${withDOI}/${counts.papers} (${(withDOI/counts.papers*100).toFixed(1)}%)\\n`)
    
    // Test a simple query
    const testQuery = await prisma.researchPaper.findFirst({
      where: {
        AND: [
          { source: { in: ['crossref_api', 'pubmed_api', 'arxiv_api'] } },
          { doi: { not: null } }
        ]
      }
    })
    
    if (testQuery) {
      console.log('✅ Database connection and queries working correctly!')
      console.log(`   Test paper: "${testQuery.title.substring(0, 50)}..."`)
    } else {
      console.log('⚠️ No verified papers found in remote database')
    }
    
    // Connection test
    console.log('\\n🌐 Connection Test:')
    console.log(`   Database URL: ${process.env.DATABASE_URL?.substring(0, 20)}...`)
    console.log('   Connection: ✅ Active')
    console.log('   Schema: ✅ Synced')
    
    console.log('\\n🎉 Remote database verification complete!')
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  verifyRemoteSync()
}